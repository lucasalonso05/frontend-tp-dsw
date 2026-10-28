import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/** Devuelve la función para mostrar un aviso flotante. */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast tiene que usarse dentro de <ToastProvider>');
  }
  return context;
}
