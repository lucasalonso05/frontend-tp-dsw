import { CircleAlert, CircleCheck } from 'lucide-react';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './ToastContext';
import type { ToastTone } from './ToastContext';

interface Toast {
  message: string;
  tone: ToastTone;
}

interface ToastProviderProps {
  children: ReactNode;
}

/** Muestra un aviso por vez, abajo de la pantalla, y lo saca solo a los 4 segundos. */
function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return undefined;
    // Cada aviso nuevo reinicia la cuenta de 4 segundos.
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    setToast({ message, tone });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* La región está siempre, así los lectores de pantalla leen cada aviso nuevo. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-4"
      >
        {toast && (
          <div className="pointer-events-auto flex max-w-sm items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-lg">
            {toast.tone === 'success' ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-700" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />
            )}
            <p>{toast.message}</p>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
