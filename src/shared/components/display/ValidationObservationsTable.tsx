import { type AreaValidationRecord } from "../../data/projectStorage";

interface ValidationObservationsTableProps {
  validaciones: AreaValidationRecord[];
}

const getStatusColor = (estado: string): string => {
  switch (estado) {
    case "Aprobada":
      return "bg-green-100 text-green-700";
    case "Pendiente":
      return "bg-yellow-100 text-yellow-700";
    case "Observada":
      return "bg-orange-100 text-orange-700";
    case "Rechazada":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function ValidationObservationsTable({ validaciones }: ValidationObservationsTableProps) {
  if (validaciones.length === 0) {
    return (
      <div className="text-slate-500 text-center py-8">
        Sin validaciones aún
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Área</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Campo Observado</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Comentario</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Validador</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Acción Requerida</th>
          </tr>
        </thead>
        <tbody>
          {validaciones.map((validacion) => (
            <tr key={validacion.area} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">{validacion.area}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(validacion.estado)}`}
                >
                  {validacion.estado}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {validacion.campoObservado || "—"}
              </td>
              <td className="px-4 py-3 text-slate-600 max-w-xs">
                {validacion.comentarios.length > 0
                  ? validacion.comentarios[validacion.comentarios.length - 1].comentario
                  : "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {validacion.validador || "—"}
              </td>
              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                {validacion.fechaValidacion
                  ? new Date(validacion.fechaValidacion).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {validacion.accionRequerida || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
