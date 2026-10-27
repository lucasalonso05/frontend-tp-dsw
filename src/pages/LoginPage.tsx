import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import TextField from '../components/TextField';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Si llegó acá porque quiso entrar a una página que pide sesión, después vuelve a esa página.
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues({ ...values, [name]: value });
  };

  const submit = async () => {
    if (values.email.trim() === '' || values.password === '') {
      setError('Completá el email y la contraseña');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await login(values.email.trim(), values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-md md:mt-8">
      <Card className="space-y-6 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-slate-600">Ingresá para comprar entradas o gestionar tus eventos.</p>
        </div>

        {error && <Alert>{error}</Alert>}

        <form
          noValidate
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <TextField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
          />
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
          />
          <Button type="submit" disabled={sending} fullWidth>
            {sending ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          ¿No tenés cuenta?{' '}
          <Link to="/registrarse" className="font-medium text-blue-800 underline hover:text-blue-900">
            Registrate
          </Link>
        </p>
      </Card>
    </section>
  );
}

export default LoginPage;
