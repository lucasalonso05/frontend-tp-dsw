import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { TICKET_STATUS_LABELS } from '../types/digitalTicket';
import type { DigitalTicket } from '../types/digitalTicket';
import Badge from './Badge';
import Button from './Button';

interface TicketQrProps {
  ticket: DigitalTicket;
  /** Cómo se nombra el ticket en pantalla, por ejemplo "General · 1 de 2". */
  label: string;
}

/**
 * Un ticket con su botón para generar el QR. Cada ticket guarda su propio estado:
 * abrir el QR de uno no abre los demás.
 */
function TicketQr({ ticket, label }: TicketQrProps) {
  const [shown, setShown] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <Badge tone={ticket.status === 'SCANNED' ? 'slate' : 'green'}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShown(!shown)}>
          <QrCode className="size-4" />
          {shown ? 'Ocultar QR' : 'Generar QR'}
        </Button>
      </div>

      {shown && (
        <figure className="mt-3 flex flex-col items-center gap-2">
          {/* Se dibuja en el navegador: el código, que es la entrada, no viaja a otro servidor. */}
          <QRCodeSVG value={ticket.qr_code} size={192} marginSize={2} title={`QR de ${label}`} />
          <figcaption className="break-all text-center font-mono text-xs text-slate-500">
            {ticket.qr_code}
          </figcaption>
        </figure>
      )}
    </div>
  );
}

export default TicketQr;
