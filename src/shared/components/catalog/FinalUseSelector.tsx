type FinalUseSelectorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onOpenTable: () => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
};

export default function FinalUseSelector({
  label,
  value,
  onChange,
  onBlur,
  onOpenTable,
  options,
  placeholder,
  error,
}: FinalUseSelectorProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </span>

      <div className="flex gap-2">
        <select
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none ${
            error
              ? "border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-300 focus:border-[#0d4c5c] focus:ring-2 focus:ring-[#0d4c5c]/20"
          }`}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onOpenTable}
          className="rounded-md border border-[#0d4c5c] bg-white px-3 py-2 text-xs font-bold text-[#0d4c5c] hover:bg-brand-secondary-soft"
        >
          Ver tabla
        </button>
      </div>

      {error && (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}