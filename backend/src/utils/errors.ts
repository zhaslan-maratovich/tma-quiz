/**
 * Кастомные ошибки приложения
 */

/**
 * Базовый класс для ошибок приложения
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Поддержка стек-трейса в V8
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка валидации (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Ошибка авторизации (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Ошибка доступа (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * Ресурс не найден (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Конфликт данных (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Превышен лимит (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

/**
 * Превышен лимит ресурсов (422)
 */
export class LimitExceededError extends AppError {
  constructor(resource: string, limit: number) {
    super(`${resource} limit exceeded (max: ${limit})`, 422, 'LIMIT_EXCEEDED', { limit });
    this.name = 'LimitExceededError';
  }
}

/**
 * Недопустимое состояние (422)
 */
export class InvalidStateError extends AppError {
  constructor(message: string) {
    super(message, 422, 'INVALID_STATE');
    this.name = 'InvalidStateError';
  }
}
