import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /** Clases extra, por ejemplo para acomodar lo que va adentro. */
  className?: string;
}

/** Caja blanca con borde y sombra suave. */
function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default Card;
