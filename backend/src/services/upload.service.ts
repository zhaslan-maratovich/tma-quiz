/**
 * Сервис загрузки изображений
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { config } from '../config/index.js';
import { ValidationError } from '../utils/errors.js';
import { LIMITS } from '../types/index.js';

/**
 * Допустимые MIME типы изображений
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * Результат загрузки
 */
export interface UploadResult {
  url: string;
  key: string;
  size: number;
  width: number;
  height: number;
}

/**
 * Сервис загрузки изображений
 */
export class UploadService {
  private s3Client: S3Client | null = null;

  constructor() {
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
   * Загружает изображение
   * @param fileBuffer - буфер файла
   * @param mimeType - MIME тип файла
   * @param userId - ID пользователя
   */
  async uploadImage(
    fileBuffer: Buffer,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    // Проверяем MIME тип
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // Проверяем размер
    if (fileBuffer.length > LIMITS.MAX_IMAGE_SIZE) {
      throw new ValidationError(
        `File too large. Max size: ${LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB`
      );
    }

    // Обрабатываем изображение через Sharp
    const processedImage = await this.processImage(fileBuffer);

    // Генерируем ключ файла
    const key = this.generateFileKey(userId);

    // Если S3 не настроен, возвращаем mock URL
    if (!this.s3Client) {
      return {
        url: `https://example.com/images/${key}`,
        key,
        size: processedImage.buffer.length,
        width: processedImage.width,
        height: processedImage.height,
      };
    }

    // Загружаем в S3
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: key,
        Body: processedImage.buffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000',
      })
    );

    const url = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;

    return {
      url,
      key,
      size: processedImage.buffer.length,
      width: processedImage.width,
      height: processedImage.height,
    };
  }

  /**
   * Обрабатывает изображение: resize + конвертация в WebP
   */
  private async processImage(
    buffer: Buffer
  ): Promise<{ buffer: Buffer; width: number; height: number }> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    let width = metadata.width ?? 800;
    let height = metadata.height ?? 600;

    // Ограничиваем размер
    const MAX_DIMENSION = 1920;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height / width) * MAX_DIMENSION);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width / height) * MAX_DIMENSION);
        height = MAX_DIMENSION;
      }
    }

    // Конвертируем в WebP
    const processedBuffer = await image
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return {
      buffer: processedBuffer,
      width,
      height,
    };
  }

  /**
   * Генерирует ключ файла
   */
  private generateFileKey(userId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const fileId = nanoid(16);

    return `uploads/${year}/${month}/${userId}/${fileId}.webp`;
  }
}
