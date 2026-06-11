import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateResetToken, markAsUsed } from "../../../shared/data/passwordResetStorage";
import { getUserById, updateUser } from "../../../shared/data/userStorage";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("El enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo.");
      setValidating(false);
      return;
    }

    const validation = validateResetToken(token);
    if (validation.valid && validation.request) {
      setTokenValid(true);
    } else {
      setError(validation.message);
    }
    setValidating(false);
  }, [token]);

  const validatePasswords = (): boolean => {
    if (!newPassword.trim()) {
      setError("Ingresa tu nueva contraseña.");
      return false;
    }

    if (!confirmPassword.trim()) {
      setError("Confirma tu nueva contraseña.");
      return false;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("La contraseña debe contener al menos una mayúscula.");
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("La contraseña debe contener al menos una minúscula.");
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("La contraseña debe contener al menos un número.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords() || !token) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const validation = validateResetToken(token);

      if (!validation.valid || !validation.request) {
        setError(validation.message);
        setLoading(false);
        return;
      }

      const user = getUserById(validation.request.userId);
      if (!user) {
        setError("El enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo.");
        setLoading(false);
        return;
      }

      updateUser(user.id, {
        password: newPassword,
      });

      markAsUsed(token);

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    }, 800);
  };

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] p-8">
        <div className="max-w-md w-full text-center">
          <svg
            className="animate-spin h-12 w-12 text-brand-primary mx-auto mb-4"
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
          <p className="text-slate-600">Validando enlace...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] p-8">
        <div className="max-w-md w-full rounded-2xl bg-white shadow-lg p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-2 border-red-200 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Enlace no válido
          </h1>

          <p className="text-sm text-slate-600 mb-6">{error}</p>

          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/30 transition-all duration-200"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] p-8">
        <div className="max-w-md w-full rounded-2xl bg-white shadow-lg p-8 text-center animate-fade-in">
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

          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Contraseña actualizada
          </h1>

          <p className="text-sm text-slate-600 mb-6">
            Tu contraseña fue actualizada correctamente. Ya puedes iniciar
            sesión.
          </p>

          <p className="text-xs text-slate-500">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] p-8">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa tu nueva contraseña para completar el restablecimiento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nueva contraseña *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              className={`block w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-brand-primary focus:ring-brand-primary/10"
              }`}
              placeholder="••••••••"
              disabled={loading}
              autoFocus
            />
            <p className="mt-2 text-xs text-slate-500">
              Mínimo 8 caracteres, incluir mayúscula, minúscula y número
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirmar contraseña *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              className={`block w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-brand-primary focus:ring-brand-primary/10"
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-primary px-4 py-3.5 text-sm font-bold text-white hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/30 disabled:opacity-70 disabled:cursor-wait transition-all duration-200"
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
                Actualizando...
              </span>
            ) : (
              "Guardar nueva contraseña"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors py-2"
          >
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
}
