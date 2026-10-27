import { createContext } from 'react';

export type ToastTone = 'success' | 'error';

export interface ToastContextValue {
  /** Muestra un aviso flotante que desaparece solo a los 4 segundos. */
  showToast: (message: string, tone?: ToastTone) => void;
}

/** Los avisos flotantes, compartidos con toda la aplicación. */
export const ToastContext = createContext<ToastContextValue | null>(null);
