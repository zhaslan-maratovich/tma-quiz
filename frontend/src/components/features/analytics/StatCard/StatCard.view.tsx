/**
 * StatCard View - презентационный компонент карточки статистики
 */

import { Card } from '@/components/ui/Card';
import type { StatCardViewProps, StatCardColor } from './StatCard.types';

/**
 * Маппинг цветов на CSS классы
 */
const colorClasses: Record<StatCardColor, string> = {
  primary: 'bg-primary-500/10',
  emerald: 'bg-accent-emerald/10',
  violet: 'bg-accent-violet/10',
  amber: 'bg-accent-amber/10',
};

export function StatCardView({ icon, value, label, color }: StatCardViewProps) {
  return (
    <Card padding="md">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-tg-text">{value}</p>
      <p className="text-xs text-tg-hint">{label}</p>
    </Card>
  );
}
