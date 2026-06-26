type FormInputProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  helper?: string;
  error?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  /** Color de acento para focus (default: #0d4c5c) */
  accentColor?: string;
};

export default function FormInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  helper,
  error,
  type = "text",
  id,
  name,
  required = false,
  autoFocus = false,
  className = "",
  inputClassName = "",
  accentColor = "#0d4c5c",
}: FormInputProps) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, "-");

  const baseInputStyles = `
    w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors
    ${error
      ? "border-red-500 bg-white text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : disabled
        ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
        : "border-slate-300 bg-white focus:ring-2"
    }
  `;

  const focusStyles = !error && !disabled
    ? { focusBorderColor: accentColor, focusRingColor: `${accentColor}33` }
    : {};

  return (
    <div className={`block ${className}`}>
      <label htmlFor={inputId} className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      </label>

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        required={required}
        onBlur={onBlur}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className={`${baseInputStyles} ${inputClassName}`}
        style={{
          outline: "none",
          ...(focusStyles && {
            borderColor: error ? undefined : accentColor,
            boxShadow: `0 0 0 3px ${focusStyles.focusRingColor}`,
          }),
        }}
        onFocus={(e) => {
          if (!error && !disabled) {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}33`;
          }
        }}
      />

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
