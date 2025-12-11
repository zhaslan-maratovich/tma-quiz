/**
 * Тесты health endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestApp, closeTestApp } from './helpers.js';

describe('Health Endpoint', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /health should return status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.version).toBe('1.0.0');
    expect(body.database).toBeDefined();
    expect(body.redis).toBeDefined();
  });

  it('GET / should return app info', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.name).toBe('Quiz TMA Backend');
    expect(body.version).toBe('1.0.0');
  });
});
