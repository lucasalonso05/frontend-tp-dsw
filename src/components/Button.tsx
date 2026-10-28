import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerOutline';
type ButtonSize = 'md' | 'sm';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-800 text-white hover:bg-blue-900',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  dangerOutline: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2',
  sm: 'px-3 py-1.5 text-sm',
};

interface ButtonProps {
  children: ReactNode;
  /** Si se indica, el botón es un enlace a esa pantalla. */
  to?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** Ocupa todo el ancho disponible. */
  fullWidth?: boolean;
}

/** Botón en forma de píldora, con los colores de la guía visual. */
function Button({
  children,
  to,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const className = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''}`;

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
}

export default Button;
