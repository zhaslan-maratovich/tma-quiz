/**
 * Роуты шеринга результатов
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ShareService } from '../services/share.service.js';

interface SessionParams {
  id: string;
}

/**
 * Роуты шеринга
 */
const shareRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const shareService = new ShareService(fastify.prisma);

  /**
   * POST /api/sessions/:id/share
   * Сгенерировать share-картинку
   */
  fastify.post<{ Params: SessionParams }>(
    '/:id/share',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const result = await shareService.generateShareImage(
        request.params.id,
        userId
      );

      return reply.send({
        success: true,
        data: result,
      });
    }
  );
};

export default shareRoutes;
