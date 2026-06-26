import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser, ROLE_LABELS, getCurrentUser } from "../../../shared/data/userStorage";
import PasswordRecoveryModal from "../../../shared/components/auth/PasswordRecoveryModal";

interface LoginPageProps {
  onLogin?: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = authenticateUser(email, password);
      if (user) {
        onLogin?.();
        navigate("/dashboard", { replace: true });
      } else {
        setError("Correo o contraseña incorrectos");
      }
      setLoading(false);
    }, 800);
  };

  if (getCurrentUser()) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const demoAccounts = [
    { email: "admin@amcor.com", password: "123456", role: "Administrador" },
    { email: "comercial@amcor.com", password: "123456", role: "Comercial" },
    { email: "customerservice@amcor.com", password: "123456", role: "Customer Service" },
    { email: "masterdata@amcor.com", password: "123456", role: "Master Data" },
  ];

  const fillDemo = (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const handleResetRequested = (token: string, email: string) => {
    setShowRecovery(false);
    navigate(`/reset-password?token=${token}`);
  };

  return (
    <>
      <PasswordRecoveryModal
        isOpen={showRecovery}
        onClose={() => setShowRecovery(false)}
        onResetRequested={handleResetRequested}
      />

      <div className="flex min-h-screen font-sans bg-[#f4f7f9]">
      {/* Left section: Branding/Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary via-[#002a42] to-[#001b2a] flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="z-10 px-12 text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 mb-8">
            <span className="text-5xl font-extrabold tracking-tighter text-white">A</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">ODISEO Portal</h1>
          <p className="text-lg text-blue-100 max-w-md mx-auto leading-relaxed">
            Plataforma centralizada para la gestión de oportunidades comerciales, tracking de proyectos y aprobación técnica.
          </p>
        </div>
      </div>

      {/* Right section: Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Inicia sesión con tu cuenta corporativa para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                  placeholder="usuario@amcor.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100 animate-fade-in">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-brand-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/30 disabled:opacity-70 disabled:cursor-wait transition-all duration-200 ease-in-out hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando credenciales...
                </span>
              ) : (
                "Ingresar al Portal"
              )}
            </button>
          </form>

          {/* Demo Accounts Panel */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Cuentas de Acceso Rápido (Demo)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => fillDemo(demo)}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:border-brand-primary hover:bg-brand-primary/5 hover:shadow-sm transition-all duration-200 text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-primary">
                      {ROLE_LABELS[demo.role]}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">{demo.email}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-brand-primary transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}