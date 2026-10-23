import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

interface RegisterValues {
  name: string;
  surname: string;
  doc_type: string;
  doc_number: string;
  email: string;
  telephone: string;
  password: string;
  password_confirm: string;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

interface FieldConfig {
  name: keyof RegisterValues;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  options?: { value: string; label: string }[];
}

const docTypeOptions = ['DNI', 'Pasaporte', 'LC', 'LE'].map((type) => ({
  value: type,
  label: type,
}));

const fields: FieldConfig[] = [
  { name: 'name', label: 'Nombre' },
  { name: 'surname', label: 'Apellido' },
  { name: 'doc_type', label: 'Tipo de documento', options: docTypeOptions },
  { name: 'doc_number', label: 'Número de documento' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'telephone', label: 'Teléfono', type: 'tel' },
  { name: 'password', label: 'Contraseña', type: 'password' },
  { name: 'password_confirm', label: 'Repetí la contraseña', type: 'password' },
];

const emptyValues: RegisterValues = {
  name: '',
  surname: '',
  doc_type: 'DNI',
  doc_number: '',
  email: '',
  telephone: '',
  password: '',
  password_confirm: '',
};

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const requiredFields: (keyof RegisterValues)[] = [
    'name',
    'surname',
    'doc_number',
    'email',
    'telephone',
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
  if (values.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres';
  if (values.password_confirm !== values.password) {
    errors.password_confirm = 'Las contraseñas no coinciden';
  }

  return errors;
}

function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState<RegisterValues>(emptyValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value });
  };

  const submit = async () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSending(true);
    setApiError(null);
    try {
      // El rol no se envía: el backend crea siempre una cuenta de asistente.
      await userService.create({
        name: values.name.trim(),
        surname: values.surname.trim(),
        doc_type: values.doc_type,
        doc_number: values.doc_number.trim(),
        email: values.email.trim(),
        telephone: values.telephone.trim(),
        password: values.password,
      });
      // Con la cuenta creada, inicia sesión directamente.
      await login(values.email.trim(), values.password);
      navigate('/', { replace: true });
    } catch (err) {
      setApiError((err as Error).message);
      setSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold md:text-3xl">Crear cuenta</h1>
      <p className="mt-1 text-slate-600">Con tu cuenta vas a poder comprar entradas.</p>

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
          submit();
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
            required
            onChange={handleChange}
          />
        )))}

        <div className="flex flex-col gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={sending}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
          <p className="text-center text-sm text-slate-600">
            ¿Ya tenés cuenta?{' '}
            <Link to="/ingresar" className="text-blue-600 hover:underline">
              Ingresá
            </Link>
          </p>
        </div>
      </form>
    </section>
  );
}

export default RegisterPage;
