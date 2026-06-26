type FormActionButtonsProps = {
  onCancel?: () => void | Promise<void>;
  onSubmit?: () => void | Promise<void>;

  validationErrorList?: string[];
  submitAttempted?: boolean;
  validationTitle?: string;

  submitLabel?: string;
  cancelLabel?: string;

  /**
   * Compatibilidad:
   * - isLoading: usado por varias páginas actuales.
   * - isSubmitting: se mantiene por si alguna página antigua lo usa.
   */
  isLoading?: boolean;
  isSubmitting?: boolean;
};

export default function FormActionButtons({
  onCancel,
  onSubmit,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  validationErrorList = [],
  submitAttempted = false,
  validationTitle = "Faltan campos obligatorios.",
  isLoading = false,
  isSubmitting = false,
}: FormActionButtonsProps) {
  const submitting = isLoading || isSubmitting;
  const hasValidationErrors = validationErrorList.length > 0;

  /**
   * Regla funcional:
   * - Si hay campos obligatorios pendientes, el botón se ve gris.
   * - Pero NO se deshabilita, porque debe permitir click para mostrar alertas.
   * - Solo se deshabilita cuando realmente está guardando/procesando.
   */
  const buttonLooksIncomplete = hasValidationErrors && !submitting;

  return (
    <div className="flex flex-col items-end gap-3">
      {submitAttempted && hasValidationErrors && (
        <div className="w-full max-w-md rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <p className="mb-2 font-bold">{validationTitle}</p>

          <ul className="list-disc space-y-1 pl-5">
            {validationErrorList.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className={`rounded-lg border border-[#00395A] bg-white px-5 py-2 text-sm font-semibold text-[#00395A] transition-colors ${
            submitting
              ? "cursor-not-allowed opacity-60"
              : "hover:bg-[#00395A] hover:text-white"
          }`}
        >
          {cancelLabel}
        </button>

        <button
          type={onSubmit ? "button" : "submit"}
          onClick={onSubmit}
          disabled={submitting}
          className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors ${
            submitting
              ? "cursor-not-allowed bg-slate-400"
              : buttonLooksIncomplete
                ? "cursor-pointer bg-slate-400 hover:bg-slate-500"
                : "cursor-pointer bg-[#00395A] hover:bg-[#002b43]"
          }`}
        >
          {submitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </div>
  );
}