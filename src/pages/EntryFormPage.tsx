import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { entryService } from '../services/entryService';
import { eventService } from '../services/eventService';
import type { CreateEntryDTO, Entry } from '../types/entry';
import type { EventModel } from '../types/event';
import { toDateTimeInput, toISO } from '../utils/dates';
import { canManage } from '../utils/permissions';
import ForbiddenPage from './ForbiddenPage';

interface EntryFormValues {
  entry_name: string;
  entry_description: string;
  unit_price: string;
  stock: string;
  date_time_start: string;
  date_time_end: string;
}

type EntryFormErrors = Partial<Record<keyof EntryFormValues, string>>;

interface FieldConfig {
  name: keyof EntryFormValues;
  label: string;
  type?: 'text' | 'number' | 'datetime-local';
  wide?: boolean;
  optional?: boolean;
}

const fields: FieldConfig[] = [
  { name: 'entry_name', label: 'Nombre (por ejemplo General o VIP)', wide: true },
  { name: 'unit_price', label: 'Precio', type: 'number' },
  { name: 'stock', label: 'Cantidad disponible', type: 'number' },
  { name: 'date_time_start', label: 'Válida desde', type: 'datetime-local' },
  { name: 'date_time_end', label: 'Válida hasta', type: 'datetime-local' },
  {
    name: 'entry_description', label: 'Descripción', wide: true, optional: true,
  },
];

const emptyValues: EntryFormValues = {
  entry_name: '',
  entry_description: '',
  unit_price: '',
  stock: '',
  date_time_start: '',
  date_time_end: '',
};

function toNumber(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

function validate(
  values: EntryFormValues,
  unassigned: number,
  otherEntries: Entry[],
  current: Entry | null,
): EntryFormErrors {
  const errors: EntryFormErrors = {};

  const name = values.entry_name.trim().toLowerCase();
  if (name === '') {
    errors.entry_name = 'Este campo es obligatorio';
  } else if (otherEntries.some((entry) => entry.entry_name.toLowerCase() === name)) {
    errors.entry_name = 'Ya existe una entrada con ese nombre en este evento';
  }

  const validPrice = /^\d+([.,]\d{1,2})?$/.test(values.unit_price.trim());
  if (!validPrice || toNumber(values.unit_price) <= 0) {
    errors.unit_price = 'Ingresá un precio mayor a 0, con hasta 2 decimales';
  }

  const stock = Number(values.stock);
  if (!Number.isInteger(stock) || stock <= 0) {
    errors.stock = 'Ingresá un número entero mayor a 0';
  } else if (stock > unassigned) {
    errors.stock = `El evento solo tiene ${Math.max(unassigned, 0)} lugares sin asignar`;
  } else if (current && stock < current.sold_stock) {
    errors.stock = `Ya se vendieron ${current.sold_stock}; el stock no puede ser menor`;
  }

  if (values.date_time_start === '') errors.date_time_start = 'Elegí fecha y hora de inicio';
  if (values.date_time_end === '') {
    errors.date_time_end = 'Elegí fecha y hora de fin';
  } else if (values.date_time_start !== '' && values.date_time_end <= values.date_time_start) {
    errors.date_time_end = 'El fin tiene que ser posterior al inicio';
  }

  return errors;
}

function toDTO(values: EntryFormValues, idEvent: number): CreateEntryDTO {
  return {
    entry_name: values.entry_name.trim(),
    entry_description: values.entry_description.trim(),
    unit_price: toNumber(values.unit_price),
    stock: Number(values.stock),
    date_time_start: toISO(values.date_time_start),
    date_time_end: toISO(values.date_time_end),
    id_event: idEvent,
  };
}

function EntryFormPage() {
  const params = useParams();
  const eventId = Number(params.id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const entryId = params.entryId === undefined ? null : Number(params.entryId);
  const navigate = useNavigate();
  const listPath = `/eventos/${eventId}/entradas`;

  const [values, setValues] = useState<EntryFormValues>(emptyValues);
  const [errors, setErrors] = useState<EntryFormErrors>({});
  const [event, setEvent] = useState<EventModel | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([eventService.getById(eventId), entryService.getByEvent(eventId)])
      .then(([eventData, entryList]) => {
        if (ignore) return;
        setEvent(eventData);
        setEntries(entryList);

        const entry = entryList.find((item) => item.id === entryId);
        if (entry) {
          setValues({
            entry_name: entry.entry_name,
            entry_description: entry.entry_description ?? '',
            unit_price: entry.unit_price,
            stock: String(entry.stock),
            date_time_start: toDateTimeInput(entry.date_time_start),
            date_time_end: toDateTimeInput(entry.date_time_end),
          });
        } else if (entryId === null) {
          setValues({
            ...emptyValues,
            date_time_start: toDateTimeInput(eventData.date_time_start),
            date_time_end: toDateTimeInput(eventData.date_time_end),
          });
        } else {
          setApiError('La entrada no existe');
        }
      })
      .catch((err: Error) => {
        if (!ignore) setApiError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [eventId, entryId]);

  const otherEntries = entries.filter((entry) => entry.id !== entryId);
  const current = entries.find((entry) => entry.id === entryId) ?? null;
  const unassigned = event
    ? event.total_stock - otherEntries.reduce((sum, entry) => sum + entry.stock, 0)
    : 0;

  const handleChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value });
  };

  const save = async () => {
    const validationErrors = validate(values, unassigned, otherEntries, current);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setApiError(null);
    try {
      const dto = toDTO(values, eventId);
      if (entryId === null) {
        await entryService.create(dto);
      } else {
        await entryService.update(entryId, dto);
      }
      showToast(entryId === null ? 'Entrada creada' : 'Cambios guardados');
      navigate(listPath);
    } catch (err) {
      setApiError((err as Error).message);
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  // Un organizador no puede gestionar las entradas del evento de otro.
  if (event && !canManage(user, event.id_user)) return <ForbiddenPage />;

  if (!event || (entryId !== null && !current)) {
    return (
      <section className="mx-auto max-w-2xl space-y-6">
        <Alert>{apiError ?? 'No se pudo cargar la entrada'}</Alert>
        <Button to="/eventos" variant="secondary">
          Volver a eventos
        </Button>
      </section>
    );
  }

  return (

    <section className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={entryId === null ? 'Nueva entrada' : 'Editar entrada'}
        description={`${event.title} · ${Math.max(unassigned, 0)} lugares sin asignar`}
      />

      {apiError && <Alert>{apiError}</Alert>}

      <Card className="sm:p-6">
        <form
          noValidate
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            save();
          }}
        >
          {fields.map((field) => (
            <div key={field.name} className={field.wide ? 'sm:col-span-2' : undefined}>
              <TextField
                label={field.label}
                name={field.name}
                type={field.type}
                value={values[field.name]}
                error={errors[field.name]}
                required={!field.optional}
                onChange={handleChange}
              />
            </div>
          ))}

          <div className="mt-2 flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button to={listPath} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}

export default EntryFormPage;
