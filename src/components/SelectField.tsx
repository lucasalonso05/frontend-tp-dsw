interface SelectFieldProps {
  label: string
  name: string
  value: string
  options: { value: string; label: string }[]
  onChange: (name: string, value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
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
        {required && <span className="text-red-600"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        aria-invalid={error !== undefined}
        className={`mt-1 w-full rounded border bg-white px-3 py-2 ${error ? 'border-red-500' : 'border-slate-300'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default SelectField