import type { ReactNode } from 'react';

export type BadgeTone = 'green' | 'amber' | 'red' | 'slate';

const toneClasses: Record<BadgeTone, string> = {
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  slate: 'bg-slate-100 text-slate-700',
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

/** Etiqueta chica en forma de píldora, para estados y roles. */
function Badge({ children, tone = 'slate' }: BadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
