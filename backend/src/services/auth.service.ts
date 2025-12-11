/**
 * Сервис аутентификации
 */

import type { PrismaClient, User } from '@prisma/client';
import type { TelegramUser, RequestUser } from '../types/index.js';
import { validateTelegramInitData } from '../utils/telegram.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * Результат аутентификации
 */
export interface AuthResult {
  user: RequestUser;
  isNewUser: boolean;
}

/**
 * Сервис для работы с аутентификацией
 */
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private botToken: string
  ) {}

  /**
   * Аутентификация через Telegram initData
   * @param initData - строка initData от Telegram Mini App
   * @returns результат аутентификации
   */
  async authenticateWithTelegram(initData: string): Promise<AuthResult> {
    // Валидируем initData
    const validation = validateTelegramInitData(initData, this.botToken);

    if (!validation.valid || !validation.user) {
      throw new UnauthorizedError(validation.error ?? 'Invalid initData');
    }

    const telegramUser = validation.user;

    // Ищем или создаём пользователя
    const { user, isNewUser } = await this.findOrCreateUser(telegramUser);

    return {
      user: this.toRequestUser(user),
      isNewUser,
    };
  }

  /**
   * Находит или создаёт пользователя по данным Telegram
   * @param telegramUser - данные пользователя из Telegram
   */
  private async findOrCreateUser(
    telegramUser: TelegramUser
  ): Promise<{ user: User; isNewUser: boolean }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramUser.id) },
    });

    if (existingUser) {
      // Обновляем данные пользователя если изменились
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username: telegramUser.username ?? null,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name ?? null,
          languageCode: telegramUser.language_code ?? null,
        },
      });

      return { user: updatedUser, isNewUser: false };
    }

    // Создаём нового пользователя
    const newUser = await this.prisma.user.create({
      data: {
        telegramId: BigInt(telegramUser.id),
        username: telegramUser.username ?? null,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        languageCode: telegramUser.language_code ?? null,
      },
    });

    return { user: newUser, isNewUser: true };
  }

  /**
   * Получает пользователя по ID
   * @param userId - ID пользователя
   */
  async getUserById(userId: string): Promise<RequestUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.toRequestUser(user) : null;
  }

  /**
   * Получает пользователя по Telegram ID
   * @param telegramId - Telegram ID пользователя
   */
  async getUserByTelegramId(telegramId: bigint): Promise<RequestUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    return user ? this.toRequestUser(user) : null;
  }

  /**
   * Преобразует User в RequestUser
   */
  private toRequestUser(user: User): RequestUser {
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
