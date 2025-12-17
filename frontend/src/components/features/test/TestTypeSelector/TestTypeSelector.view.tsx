/**
 * TestTypeSelector View - презентационный компонент
 */

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { TestTypeSelectorViewProps, TestTypeOption } from './TestTypeSelector.types';

/**
 * Карточка выбора типа теста
 */
function TestTypeOptionCard({
  option,
  index,
  onSelect,
}: {
  option: TestTypeOption;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card
        interactive
        padding="lg"
        onClick={onSelect}
        className="group relative overflow-hidden"
      >
        {/* Background gradient */}
        <div
          className={cn(
            'absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-30',
            option.type === 'quiz' && 'bg-primary-500',
            option.type === 'personality' && 'bg-accent-violet',
            option.type === 'branching' && 'bg-accent-emerald'
          )}
        />

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110',
              option.bgColor
            )}
          >
            <span className={option.color}>{option.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-lg font-semibold text-tg-text">
                {option.title}
              </h3>
              <ChevronRight className="h-5 w-5 text-tg-hint transition-transform group-hover:translate-x-1" />
            </div>

            <p className="text-sm text-tg-hint mb-3">
              {option.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {option.features.map((feature) => (
                <span
                  key={feature}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full',
                    option.bgColor,
                    option.color
                  )}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function TestTypeSelectorView({ options, onSelect }: TestTypeSelectorViewProps) {
  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <TestTypeOptionCard
          key={option.type}
          option={option}
          index={index}
          onSelect={() => onSelect(option.type)}
        />
      ))}
    </div>
  );
}
