import { useEffect, useId, useRef } from 'react';
import Button from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  /** Texto del botón que confirma, por ejemplo "Eliminar". */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Ventana en el centro de la pantalla que pide confirmar una acción que no se puede deshacer.
 * Usa la etiqueta <dialog> de HTML5: bloquea el resto de la página y se cierra con Escape.
 */
function ConfirmDialog({
  title, message, confirmLabel, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Se abre apenas aparece en pantalla.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onCancel}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/50"
    >
      <h2 id={titleId} className="text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-slate-600">{message}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Volver
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
