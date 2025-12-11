/**
 * Роуты загрузки файлов
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import multipart from '@fastify/multipart';
import { UploadService } from '../services/upload.service.js';

/**
 * Роуты загрузки файлов
 */
const uploadRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Регистрируем multipart plugin
  await fastify.register(multipart, {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
      files: 1,
    },
  });

  const uploadService = new UploadService();

  /**
   * POST /api/upload/image
   * Загрузить изображение
   */
  fastify.post(
    '/image',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;

      // Получаем файл
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
      }

      // Читаем файл в буфер
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Загружаем
      const result = await uploadService.uploadImage(
        buffer,
        data.mimetype,
        userId
      );

      return reply.send({
        success: true,
        data: {
          url: result.url,
          size: result.size,
          width: result.width,
          height: result.height,
        },
      });
    }
  );
};

export default uploadRoutes;
