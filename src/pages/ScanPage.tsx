import { Scanner } from '@yudiel/react-qr-scanner';
import type { IDetectedBarcode, IScannerError } from '@yudiel/react-qr-scanner';
import { CircleCheck, CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import TextField from '../components/TextField';
import { eventService } from '../services/eventService';
import { ticketService } from '../services/ticketService';
import type { ScannedTicket } from '../types/digitalTicket';
import type { EventModel } from '../types/event';

/** En qué momento está el escaneo. */
type ScanState = { step: 'scanning' } // la cámara está buscando un QR
  | { step: 'checking' } // el código se mandó al backend
  | { step: 'approved'; ticket: ScannedTicket } // el backend canjeó el ticket
  | { step: 'rejected'; message: string }; // el backend lo rechazó, con el motivo

/** Mensajes para cuando la cámara no puede arrancar. */
const CAMERA_ERRORS: Partial<Record<IScannerError['kind'], string>> = {
  'permission-denied': 'No diste permiso para usar la cámara. Habilitalo en la configuración del navegador.',
  'insecure-context': 'La cámara solo funciona si la app se abre con HTTPS.',
  'no-camera': 'No se encontró ninguna cámara en este dispositivo.',
  'in-use': 'La cámara está siendo usada por otra aplicación.',
};

function ScanPage() {
  const { id } = useParams();
  const eventId = Number(id);

  const [event, setEvent] = useState<EventModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ScanState>({ step: 'scanning' });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let ignore = false;

    eventService
      .getById(eventId)
      .then((data) => {
        if (!ignore) setEvent(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [eventId]);

  // Manda el código al backend. Solo el backend decide si el ticket habilita el ingreso.
  const validate = async (code: string) => {
    setState({ step: 'checking' });
    try {
      const ticket = await ticketService.scan(code.trim(), eventId);
      setState({ step: 'approved', ticket });
    } catch (err) {
      setState({ step: 'rejected', message: (err as Error).message });
    }
  };

  // La cámara puede detectar el mismo QR varias veces por segundo: se toma el primero y,
  // mientras se valida y se muestra el resultado, la cámara queda en pausa (prop `paused`).
  const handleScan = (codes: IDetectedBarcode[]) => {
    const code = codes[0]?.rawValue;
    if (state.step === 'scanning' && code) validate(code);
  };

  const handleCameraError = (scannerError: IScannerError) => {
    setCameraError(
      CAMERA_ERRORS[scannerError.kind] ?? 'No se pudo abrir la cámara. Podés escribir el código abajo.',
    );
  };

  // Respaldo: el código que figura debajo del QR, escrito o pegado a mano.
  const handleManualSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (manualCode.trim() === '') return;
    validate(manualCode);
    setManualCode('');
  };

  const scanNext = () => setState({ step: 'scanning' });

  if (loading) return <Loading label="Cargando evento…" />;

  if (!event) {
    return (
      <section className="space-y-6">
        <Alert>{error ?? 'No se pudo cargar el evento'}</Alert>
        <Button to="/eventos" variant="secondary">
          Volver a mis eventos
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Escanear entradas"
        description={event.title}
        back={{ to: '/eventos', label: 'Volver a mis eventos' }}
      />

      {state.step === 'scanning' && (
        <p className="text-center text-slate-600">Apuntá la cámara al QR de la entrada.</p>
      )}

      {state.step === 'checking' && <Loading label="Validando la entrada…" />}

      {state.step === 'approved' && (
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-xl border border-green-300 bg-green-50 p-6 text-center"
        >
          <CircleCheck className="size-20 text-green-700" aria-hidden="true" />
          <div>
            <p className="text-2xl font-semibold text-green-800">QR aprobado</p>
            <p className="font-medium text-green-800">Ingreso al evento habilitado</p>
          </div>
          <p className="text-slate-700">
            {state.ticket.FK_user.name} {state.ticket.FK_user.surname} ·{' '}
            {state.ticket.FK_order_item.FK_entry.entry_name}
          </p>
          <Button onClick={scanNext} fullWidth>
            Escanear siguiente
          </Button>
        </div>
      )}

      {state.step === 'rejected' && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-6 text-center"
        >
          <CircleX className="size-20 text-red-700" aria-hidden="true" />
          <div>
            <p className="text-2xl font-semibold text-red-800">QR rechazado</p>
            <p className="text-red-800">{state.message}</p>
          </div>
          <Button onClick={scanNext} fullWidth>
            Escanear siguiente
          </Button>
        </div>
      )}

      {cameraError && <Alert>{cameraError}</Alert>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
        <Scanner
          onScan={handleScan}
          onError={handleCameraError}
          paused={state.step !== 'scanning'}
          constraints={{ facingMode: 'environment' }}
          formats={['qr_code']}
          components={{ finder: true, torch: true }}
        />
      </div>

      <Card>
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <TextField
            label="¿No se puede leer el QR? Escribí el código"
            name="code"
            value={manualCode}
            onChange={(_name, value) => setManualCode(value)}
          />
          <Button type="submit" variant="secondary" fullWidth disabled={state.step === 'checking'}>
            Validar código
          </Button>
        </form>
      </Card>
    </section>
  );
}

export default ScanPage;
