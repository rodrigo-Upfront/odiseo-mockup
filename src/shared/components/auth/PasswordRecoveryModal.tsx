import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getUserByEmail } from "../../data/userStorage";
import { createResetRequest } from "../../data/passwordResetStorage";

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetRequested: (token: string, email: string) => void;
}

export default function PasswordRecoveryModal({
  isOpen,
  onClose,
  onResetRequested,
}: PasswordRecoveryModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError("Ingresa tu correo corporativo.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setValidationError("Ingresa un correo corporativo válido.");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const user = getUserByEmail(email);

      if (user && user.status !== "blocked") {
        const resetRequest = createResetRequest(email, user.id);

        // TODO: Integrar envío real de correo cuando el backend/servicio SMTP esté disponible.
        console.log(
          `[DEV] Reset token para ${email}: ${resetRequest.token}`
        );
        console.log(`[DEV] Link: /reset-password?token=${resetRequest.token}`);

        onResetRequested(resetRequest.token, email);
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }

      setLoading(false);
    }, 800);
  };

  const handleBackClick = () => {
    setEmail("");
    setValidationError("");
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl p-8 space-y-6 animate-fade-in">
        {submitted ? (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border-2 border-green-200 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Solicitud enviada
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Si el correo está registrado en ODISEO, recibirás las
                instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <button
              onClick={handleBackClick}
              className="w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/30 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver al inicio de sesión
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Restablecer contraseña
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Ingresa tu correo corporativo para enviarte las instrucciones de
                restablecimiento.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Correo corporativo *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationError("");
                  }}
                  className={`block w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    validationError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-300 focus:border-brand-primary focus:ring-brand-primary/10"
                  }`}
                  placeholder="usuario@amcor.com"
                  disabled={loading}
                  autoFocus
                />
                {validationError && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {validationError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-primary px-4 py-3.5 text-sm font-bold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/30 disabled:opacity-70 disabled:cursor-wait transition-all duration-200 ease-in-out"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  "Enviar instrucciones"
                )}
              </button>
            </form>

            <button
              onClick={handleBackClick}
              className="w-full text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors py-2"
            >
              Volver al inicio de sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
