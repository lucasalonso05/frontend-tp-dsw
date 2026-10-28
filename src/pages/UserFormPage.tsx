import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/userService';
import { USER_ROLE_LABELS } from '../types/user';
import type { CreateUserDTO, UserRole } from '../types/user';

interface UserFormValues {
  name: string;
  surname: string;
  doc_type: string;
  doc_number: string;
  email: string;
  telephone: string;
  role: string;
  cuit: string;
  password: string;
}

type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

interface FieldConfig {
  name: keyof UserFormValues;
  label: string;
  type?: 'text' | 'email' | 'tel';
  options?: { value: string; label: string }[];
  optional?: boolean;
}

const docTypeOptions = ['DNI', 'Pasaporte', 'LC', 'LE'].map((type) => ({
  value: type,
  label: type,
}));

const roleOptions = Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({ value, label }));

const fields: FieldConfig[] = [
  { name: 'name', label: 'Nombre' },
  { name: 'surname', label: 'Apellido' },
  { name: 'doc_type', label: 'Tipo de documento', options: docTypeOptions },
  { name: 'doc_number', label: 'Número de documento' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'telephone', label: 'Teléfono', type: 'tel' },
  { name: 'role', label: 'Rol', options: roleOptions },
  { name: 'cuit', label: 'CUIT (solo organizadores)', optional: true },
];

const emptyValues: UserFormValues = {
  name: '',
  surname: '',
  doc_type: 'DNI',
  doc_number: '',
  email: '',
  telephone: '',
  role: 'ASSISTANT',
  cuit: '',
  password: '',
};

function validate(values: UserFormValues, isEdit: boolean): UserFormErrors {
  const errors: UserFormErrors = {};
  const requiredFields: (keyof UserFormValues)[] = [
    'name',
    'surname',
    'doc_type',
    'doc_number',
    'email',
    'telephone',
    'role',
  ];

  requiredFields.forEach((field) => {
    if (values[field].trim() === '') errors[field] = 'Este campo es obligatorio';
  });

  const docLength = values.doc_number.trim().length;
  if (!errors.doc_number && (docLength < 7 || docLength > 10)) {
    errors.doc_number = 'Debe tener entre 7 y 10 caracteres';
  }

  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Ingresá un email válido';
  }

  if (values.telephone.trim().length > 15) errors.telephone = 'Máximo 15 caracteres';
  if (values.cuit.trim().length > 12) errors.cuit = 'Máximo 12 caracteres';

  const passwordRequired = !isEdit || values.password !== '';
  if (passwordRequired && values.password.length < 8) {
    errors.password = 'Debe tener al menos 8 caracteres';
  }

  return errors;
}

function toDTO(values: UserFormValues): Omit<CreateUserDTO, 'password'> {
  const dto: Omit<CreateUserDTO, 'password'> = {
    role: values.role as UserRole,
    name: values.name.trim(),
    surname: values.surname.trim(),
    doc_type: values.doc_type,
    doc_number: values.doc_number.trim(),
    email: values.email.trim(),
    telephone: values.telephone.trim(),
  };

  const cuit = values.cuit.trim();
  if (cuit !== '') dto.cuit = cuit;

  return dto;
}

function UserFormPage() {
  const { id } = useParams();
  const userId = id === undefined ? null : Number(id);
  const isEdit = userId !== null;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [values, setValues] = useState<UserFormValues>(emptyValues);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (userId === null) return undefined;

    let ignore = false;

    userService
      .getById(userId)
      .then((user) => {
        if (ignore) return;
        setValues({
          name: user.name,
          surname: user.surname,
          doc_type: user.doc_type,
          doc_number: user.doc_number,
          email: user.email,
          telephone: user.telephone,
          role: user.role,
          cuit: user.cuit ?? '',
          password: '',
        });
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
  }, [userId]);

  const handleChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value });
  };

  const save = async () => {
    const validationErrors = validate(values, isEdit);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setApiError(null);
    try {
      const dto = toDTO(values);
      if (userId === null) {
        await userService.create({ ...dto, password: values.password });
      } else {
        await userService.update(
          userId,
          values.password === '' ? dto : { ...dto, password: values.password },
        );
      }
      showToast(userId === null ? 'Persona creada' : 'Cambios guardados');
      navigate('/personas');
    } catch (err) {
      setApiError((err as Error).message);
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (

    <section className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={isEdit ? 'Editar persona' : 'Nueva persona'} />

      {apiError && <Alert>{apiError}</Alert>}

      <Card className="sm:p-6">
        <form
          noValidate
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          {fields.map((field) => (field.options ? (
            <SelectField
              key={field.name}
              label={field.label}
              name={field.name}
              value={values[field.name]}
              options={field.options}
              error={errors[field.name]}
              required
              onChange={handleChange}
            />
          ) : (
            <TextField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={values[field.name]}
              error={errors[field.name]}
              required={!field.optional}
              onChange={handleChange}
            />
          )))}

          <div className="sm:col-span-2">
            <TextField
              label={isEdit ? 'Nueva contraseña (dejala vacía para no cambiarla)' : 'Contraseña'}
              name="password"
              type="password"
              value={values.password}
              error={errors.password}
              required={!isEdit}
              onChange={handleChange}
            />
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button to="/personas" variant="secondary">
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

export default UserFormPage;
