import { fieldClasses } from '../utils/styles';

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'datetime-local' | 'date';
  error?: string;
  required?: boolean;
}

function TextField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  error,
  required = false,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={fieldClasses(error !== undefined)}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
