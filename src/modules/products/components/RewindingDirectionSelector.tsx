import { useState } from "react";

type RewindingDirectionSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

type RewindingDirectionOption = {
  value: string;
  label: string;
  image: string;
};

const REWINDING_DIRECTION_OPTIONS: RewindingDirectionOption[] = [
  { value: "Sentido 1", label: "Sentido 1", image: "/assets/Bobinado/sentido-1.png" },
  { value: "Sentido 2", label: "Sentido 2", image: "/assets/Bobinado/sentido-2.png" },
  { value: "Sentido 3", label: "Sentido 3", image: "/assets/Bobinado/sentido-3.png" },
  { value: "Sentido 4", label: "Sentido 4", image: "/assets/Bobinado/sentido-4.png" },
  { value: "Sentido 5", label: "Sentido 5", image: "/assets/Bobinado/sentido-5.png" },
  { value: "Sentido 6", label: "Sentido 6", image: "/assets/Bobinado/sentido-6.png" },
  { value: "Sentido 7", label: "Sentido 7", image: "/assets/Bobinado/sentido-7.png" },
  { value: "Sentido 8", label: "Sentido 8", image: "/assets/Bobinado/sentido-8.png" },
];

function RewindingImage({
  option,
}: {
  option: RewindingDirectionOption;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded bg-slate-100 text-slate-400">
        <svg
          className="h-16 w-24"
          viewBox="0 0 100 80"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect width="100" height="80" fill="#f1f5f9" />
          <circle
            cx="50"
            cy="40"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="10"
            x2="50"
            y2="70"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="20"
            y1="40"
            x2="80"
            y2="40"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <span className="mt-1 text-[10px] font-medium">
          Imagen no encontrada
        </span>
      </div>
    );
  }

  return (
    <img
      src={option.image}
      alt={option.label}
      className="h-full w-full object-contain"
      draggable={false}
      onLoad={() => {
        console.log("[Bobinado] Imagen cargada:", option.image);
      }}
      onError={() => {
        console.error("[Bobinado] No se encontró imagen:", option.image);
        setHasError(true);
      }}
    />
  );
}

export default function RewindingDirectionSelector({
  value,
  onChange,
  disabled = false,
  error,
}: RewindingDirectionSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-900">
          Sentido de Embobinado
        </label>

        <p className="mb-4 text-xs text-slate-500">
          Selecciona la dirección de embobinado del rollo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {REWINDING_DIRECTION_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (disabled) return;
                onChange(option.value);
              }}
              disabled={disabled}
              className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              } ${
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>

              <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded bg-white p-2">
                <RewindingImage option={option} />
              </div>

              <span
                className={`text-xs font-semibold ${
                  isSelected ? "text-blue-600" : "text-slate-600"
                }`}
              >
                {option.label}
              </span>

              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {value && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <p className="text-xs text-blue-600">
            <span className="font-semibold">Seleccionado:</span> {value}
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}