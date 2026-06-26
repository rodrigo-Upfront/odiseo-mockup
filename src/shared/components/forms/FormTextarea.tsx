type FormTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  textareaClassName?: string;
  resizable?: boolean;
};

export default function FormTextarea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  helper,
  error,
  disabled = false,
  rows = 3,
  maxLength,
  id,
  name,
  required = false,
  autoFocus = false,
  className = "",
  textareaClassName = "",
  resizable = false,
}: FormTextareaProps) {
  const textareaId = id || name || label.toLowerCase().replace(/\s+/g, "-");
  const currentLength = value.length;

  return (
    <div className={`block ${className}`}>
      <label htmlFor={textareaId} className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      </label>

      <textarea
        id={textareaId}
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        rows={rows}
        maxLength={maxLength}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`
          w-full rounded-md border px-3 py-2 text-sm outline-none
          transition-colors
          ${resizable ? "resize-y" : "resize-none"}
          ${error
            ? "border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : disabled
              ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-300 bg-white focus:border-[#0d4c5c] focus:ring-2 focus:ring-[#0d4c5c]/20"
          }
          ${textareaClassName}
        `}
      />

      <div className="mt-1 flex items-center justify-between">
        {error ? (
          <span className="text-xs font-normal text-red-600">
            {error}
          </span>
        ) : helper ? (
          <span className="text-[11px] text-slate-400">
            {helper}
          </span>
        ) : (
          <span />
        )}

        {maxLength && (
          <span className={`text-[11px] ${currentLength >= maxLength ? "text-red-500 font-semibold" : "text-slate-400"}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
