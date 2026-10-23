import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { placeService } from '../services/placeService';
import { userService } from '../services/userService';
import type { CreatePlaceDTO } from '../types/place';
import type { User } from '../types/user';
import { canManage } from '../utils/permissions';
import ForbiddenPage from './ForbiddenPage';

interface PlaceFormValues {
  name: string;
  capacity: string;
  description: string;
  province: string;
  city: string;
  street: string;
  street_number: string;
  zip_code: string;
  id_user: string;
}

type PlaceFormErrors = Partial<Record<keyof PlaceFormValues, string>>;

interface FieldConfig {
  name: keyof PlaceFormValues;
  label: string;
  type?: 'text' | 'number';
  wide?: boolean;
  optional?: boolean;
}

const fields: FieldConfig[] = [
  { name: 'name', label: 'Nombre', wide: true },
  { name: 'street', label: 'Calle' },
  { name: 'street_number', label: 'Número' },
  { name: 'city', label: 'Ciudad' },
  { name: 'province', label: 'Provincia' },
  { name: 'zip_code', label: 'Código postal' },
  { name: 'capacity', label: 'Capacidad máxima', type: 'number' },
  {
    name: 'description', label: 'Descripción', wide: true, optional: true,
  },
];

const emptyValues: PlaceFormValues = {
  name: '',
  capacity: '',
  description: '',
  province: '',
  city: '',
  street: '',
  street_number: '',
  zip_code: '',
  id_user: '',
};

function validate(values: PlaceFormValues, isAdmin: boolean): PlaceFormErrors {
  const errors: PlaceFormErrors = {};
  const requiredFields: (keyof PlaceFormValues)[] = [
    'name',
    'street',
    'street_number',
    'city',
    'province',
    'zip_code',
  ];

  requiredFields.forEach((field) => {
    if (values[field].trim() === '') errors[field] = 'Este campo es obligatorio';
  });

  const capacity = Number(values.capacity);
  if (!Number.isInteger(capacity) || capacity <= 0) {
    errors.capacity = 'Ingresá un número entero mayor a 0';
  }

  // Solo el admin elige organizador; para un organizador, es él mismo.
  if (isAdmin && values.id_user === '') errors.id_user = 'Elegí un organizador';

  return errors;
}

function toDTO(values: PlaceFormValues, isAdmin: boolean): CreatePlaceDTO {
  const dto: CreatePlaceDTO = {
    name: values.name.trim(),
    capacity: Number(values.capacity),
    description: values.description.trim(),
    province: values.province.trim(),
    city: values.city.trim(),
    street: values.street.trim(),
    street_number: values.street_number.trim(),
    zip_code: values.zip_code.trim(),
  };

  // El dueño lo elige solo un admin; si no, el backend usa a quien inició sesión.
  if (isAdmin) dto.id_user = Number(values.id_user);

  return dto;
}

function PlaceFormPage() {
  const { id } = useParams();
  const placeId = id === undefined ? null : Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [values, setValues] = useState<PlaceFormValues>(emptyValues);
  const [errors, setErrors] = useState<PlaceFormErrors>({});
  const [organisers, setOrganisers] = useState<User[]>([]);
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      // La lista de usuarios solo la puede pedir un admin, y solo él la necesita.
      isAdmin ? userService.getAll() : null,
      placeId === null ? null : placeService.getById(placeId),
    ])
      .then(([users, place]) => {
        if (ignore) return;
        setOrganisers((users ?? []).filter((item) => item.role === 'ORGANISER'));
        if (place) {
          setOwnerId(place.id_user);
          setValues({
            name: place.name,
            capacity: String(place.capacity),
            description: place.description ?? '',
            province: place.province,
            city: place.city,
            street: place.street,
            street_number: place.street_number,
            zip_code: place.zip_code,
            id_user: String(place.id_user),
          });
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
  }, [placeId, isAdmin]);

  const handleChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value });
  };

  const save = async () => {
    const validationErrors = validate(values, isAdmin);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setApiError(null);
    try {
      if (placeId === null) {
        await placeService.create(toDTO(values, isAdmin));
      } else {
        await placeService.update(placeId, toDTO(values, isAdmin));
      }
      navigate('/lugares');
    } catch (err) {
      setApiError((err as Error).message);
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-600">Cargando…</p>;

  // Un organizador no puede editar el lugar de otro.
  if (ownerId !== null && !canManage(user, ownerId)) return <ForbiddenPage />;

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold md:text-3xl">
        {placeId === null ? 'Nuevo lugar' : 'Editar lugar'}
      </h1>

      {apiError && (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {apiError}
        </p>
      )}

      <form
        noValidate
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
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

        {isAdmin && (
          <div className="sm:col-span-2">
            <SelectField
              label="Organizador"
              name="id_user"
              value={values.id_user}
              placeholder="Elegí un organizador"
              options={organisers.map((item) => ({
                value: String(item.id),
                label: `${item.name} ${item.surname}`,
              }))}
              error={errors.id_user}
              required
              onChange={handleChange}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <Link to="/lugares" className="rounded border border-slate-300 px-4 py-2 text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default PlaceFormPage;
