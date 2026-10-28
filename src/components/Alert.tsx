import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
}

/** Mensaje de error destacado. Los lectores de pantalla lo leen apenas aparece. */
function Alert({ children }: AlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export default Alert;
