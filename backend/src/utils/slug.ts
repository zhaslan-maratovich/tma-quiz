/**
 * Утилиты для генерации slug
 */

import { nanoid } from 'nanoid';

/**
 * Длина slug по умолчанию
 */
const SLUG_LENGTH = 8;

/**
 * Генерирует уникальный slug
 * @param length - длина slug (по умолчанию 8)
 * @returns сгенерированный slug
 */
export function generateSlug(length: number = SLUG_LENGTH): string {
  return nanoid(length);
}

/**
 * Проверяет валидность slug
 * @param slug - slug для проверки
 * @returns true если slug валиден
 */
export function isValidSlug(slug: string): boolean {
  // Slug должен содержать только буквы, цифры, дефисы и подчёркивания
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}
