/**
 * Сервис генерации share-картинок
 */

import type { PrismaClient } from '@prisma/client';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { config } from '../config/index.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Результат генерации share-картинки
 */
export interface ShareResult {
  imageUrl: string;
  isNew: boolean;
}

/**
 * Сервис генерации share-картинок
 */
export class ShareService {
  private s3Client: S3Client | null = null;

  constructor(private prisma: PrismaClient) {
    if (config.S3_ACCESS_KEY && config.S3_SECRET_KEY) {
      this.s3Client = new S3Client({
        endpoint: config.S3_ENDPOINT,
        region: config.S3_REGION,
        credentials: {
          accessKeyId: config.S3_ACCESS_KEY,
          secretAccessKey: config.S3_SECRET_KEY,
        },
        forcePathStyle: true,
      });
    }
  }

  /**
   * Генерирует или возвращает существующую share-картинку
   * @param sessionId - ID сессии
   * @param userId - ID пользователя
   */
  async generateShareImage(sessionId: string, userId: string): Promise<ShareResult> {
    // Получаем сессию
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: {
        test: {
          include: {
            welcomeScreen: true,
          },
        },
        result: true,
        user: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Session');
    }

    // Проверяем, что сессия принадлежит пользователю
    if (session.userId !== userId) {
      throw new NotFoundError('Session');
    }

    // Проверяем, что сессия завершена
    if (!session.completedAt) {
      throw new NotFoundError('Session not completed');
    }

    // Проверяем существующую картинку
    const existingShare = await this.prisma.sharedResult.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingShare) {
      return {
        imageUrl: existingShare.imageUrl,
        isNew: false,
      };
    }

    // Генерируем картинку
    const imageBuffer = await this.renderShareImage(session);

    // Загружаем в S3
    const imageUrl = await this.uploadImage(imageBuffer, sessionId);

    // Сохраняем в БД
    await this.prisma.sharedResult.create({
      data: {
        sessionId,
        imageUrl,
      },
    });

    return {
      imageUrl,
      isNew: true,
    };
  }

  /**
   * Рендерит share-картинку с помощью Satori
   */
  private async renderShareImage(session: any): Promise<Buffer> {
    const testTitle = session.test.welcomeScreen?.title ?? 'Quiz Result';
    const resultTitle = session.result?.title ?? null;
    const score = session.score;
    const maxScore = session.maxScore;
    const userName = session.user.firstName ?? session.user.username ?? 'Player';

    // Определяем текст результата
    let resultText = '';
    if (session.test.type === 'quiz' && score !== null && maxScore !== null) {
      resultText = `${score} из ${maxScore} правильно`;
    } else if (resultTitle) {
      resultText = resultTitle;
    }

    // Создаём SVG с помощью Satori
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'sans-serif',
            color: 'white',
            padding: '40px',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '32px',
                  opacity: 0.8,
                  marginBottom: '20px',
                },
                children: testTitle,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '64px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '30px',
                },
                children: resultText,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '24px',
                  opacity: 0.7,
                },
                children: `Результат ${userName}`,
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [],
      }
    );

    // Конвертируем SVG в PNG
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });

    const pngData = resvg.render();
    return pngData.asPng();
  }

  /**
   * Загружает картинку в S3
   */
  private async uploadImage(buffer: Buffer, sessionId: string): Promise<string> {
    const key = `share/${sessionId}/${nanoid(8)}.png`;

    // Если S3 не настроен, возвращаем mock URL
    if (!this.s3Client) {
      return `https://example.com/share/${key}`;
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=31536000',
      })
    );

    return `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;
  }
}
