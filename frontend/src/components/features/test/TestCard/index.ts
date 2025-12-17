/**
 * TestCard - карточка теста в списке
 *
 * Экспортируем Container как основной компонент,
 * а также View для случаев, когда нужен чистый UI без логики.
 */

export { TestCard } from './TestCard.container';
export { TestCardView } from './TestCard.view';
export type { TestCardViewProps, TestCardContainerProps } from './TestCard.types';
