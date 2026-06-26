type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

type FormSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  selectClassName?: string;
  labelAction?: React.ReactNode;
};

export default function FormSelect({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  error,
  helper,
  disabled = false,
  id,
  name,
  required = false,
  className = "",
  selectClassName = "",
  labelAction,
}: FormSelectProps) {
  const selectId = id || name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`block ${className}`}>
      <div className="mb-1 flex items-center gap-2">
        <label htmlFor={selectId} className="inline-flex items-baseline gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
        {labelAction && <div className="flex-shrink-0">{labelAction}</div>}
      </div>

      <select
        id={selectId}
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className={`
          w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors appearance-none
          ${error
            ? "border-red-500 bg-white text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : disabled
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:ring-2"
          }
          ${selectClassName}
        `}
        style={{
          backgroundImage: disabled
            ? "none"
            : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 0.5rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      ) : helper ? (
        <span className="mt-1 block text-[11px] text-slate-400">
          {helper}
        </span>
      ) : null}
    </div>
  );
}
