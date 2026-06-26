import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useLayout } from "../../components/layout/LayoutContext";
import { getCurrentUser } from "../data/userStorage";

export default function AuditPage() {
  const { setHeader, resetHeader } = useLayout();
  const currentUser = getCurrentUser();

  if (currentUser?.role !== "administrator") {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    setHeader({
      title: "Auditoría y Trazabilidad",
      breadcrumbs: [{ label: "Auditoría" }],
    });
    return () => resetHeader();
  }, [setHeader, resetHeader]);

  return (
    <div className="w-full max-w-none bg-[#f6f8fb] min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900">Auditoría y Trazabilidad</p>
        <p className="text-slate-500 mt-2">Módulo en construcción</p>
        <p className="text-sm text-slate-400 mt-4">Registro de actividad del sistema ODISEO</p>
      </div>
    </div>
  );
}
