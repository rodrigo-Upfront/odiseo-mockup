import { type ProjectStatus } from "../../data/projectStorage";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const styles: Record<ProjectStatus, string> = {
    "Registrado": "bg-blue-100 text-blue-700",
    "En Preparación": "bg-blue-100 text-blue-700",
    "Ficha Completa": "bg-green-100 text-green-700",
    "En validación": "bg-amber-100 text-amber-700",
    "Observado": "bg-orange-100 text-orange-700",
    "Validado": "bg-green-100 text-green-700",
    "Productos preliminares": "bg-blue-100 text-blue-700",
    "En Cotización": "bg-yellow-100 text-yellow-700",
    "Cotización Completa": "bg-yellow-200 text-yellow-800",
    "Aprobado por Cliente": "bg-green-200 text-green-800",
    "Validación Tesorería": "bg-yellow-200 text-yellow-800",
    "Alta Producto": "bg-purple-100 text-purple-800",
    "Desestimado": "bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
