import { fieldClasses } from '../utils/styles';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  error,
  required = false,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={fieldClasses(error !== undefined)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default SelectField;
