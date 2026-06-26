interface ProgressStep {
  label: string;
  completed: boolean;
  hasError?: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
}

export default function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2 whitespace-nowrap">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              step.hasError
                ? "bg-red-100 text-red-700"
                : step.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {step.completed ? "✓" : index + 1}
          </div>
          <span
            className={`text-sm font-medium ${
              step.hasError
                ? "text-red-700"
                : step.completed
                  ? "text-green-700"
                  : "text-slate-600"
            }`}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className="h-0.5 w-4 bg-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}
