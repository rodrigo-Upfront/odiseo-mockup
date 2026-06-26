import { tableStyles } from "../../../shared/ui/tableStyles";
import { getActionColor, getStatusColor } from "../utils/catalogRestrictionValidators";
import type { ManagementType, ChangePreviewRow, CatalogChangePreviewRow, RestrictionChangePreviewRow } from "../types/catalogRestriction.types";

interface ChangePreviewTableProps {
  type: ManagementType;
  rows: ChangePreviewRow[];
}

export default function ChangePreviewTable({ type, rows }: ChangePreviewTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">No hay cambios para mostrar</p>
      </div>
    );
  }

  if (type === "catalog") {
    const catalogRows = rows as CatalogChangePreviewRow[];
    return (
      <div className={tableStyles.wrapper}>
        <div className={tableStyles.scroll}>
          <table className={tableStyles.table}>
            <thead>
              <tr className={tableStyles.headerRow}>
                <th className={tableStyles.headerCell}>Item</th>
                <th className={tableStyles.headerCell}>Nombre actual</th>
                <th className={tableStyles.headerCell}>Nombre nuevo</th>
                <th className={tableStyles.headerCell}>Estado actual</th>
                <th className={tableStyles.headerCell}>Estado nuevo</th>
                <th className={tableStyles.headerCell}>Acción detectada</th>
                <th className={tableStyles.headerCell}>Estado</th>
                <th className={tableStyles.headerCell}>Observación</th>
              </tr>
            </thead>
            <tbody>
              {catalogRows.map((row, idx) => (
                <tr key={`${row.item}-${idx}`} className={idx % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}>
                  <td className={tableStyles.cellCode}>{row.item}</td>
                  <td className={tableStyles.cell}>{row.currentName || "—"}</td>
                  <td className={tableStyles.cell}>{row.newName || "—"}</td>
                  <td className={tableStyles.cell}>{row.currentStatus || "—"}</td>
                  <td className={tableStyles.cell}>{row.newStatus || "—"}</td>
                  <td className={tableStyles.cell}>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getActionColor(row.detectedAction)}`}>
                      {row.detectedAction === "new"
                        ? "Nuevo"
                        : row.detectedAction === "modified"
                        ? "Modificado"
                        : row.detectedAction === "status_changed"
                        ? "Cambio de estado"
                        : row.detectedAction === "inactive"
                        ? "Inactivado"
                        : row.detectedAction === "blocked"
                        ? "Bloqueado"
                        : row.detectedAction === "unchanged"
                        ? "Sin cambio"
                        : "Error"}
                    </span>
                  </td>
                  <td className={tableStyles.cell}>
                    <span
                      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusColor(row.status)}`}
                    >
                      {row.status === "valid" ? "✓ Válido" : row.status === "error" ? "✗ Error" : "⚠ Aviso"}
                    </span>
                  </td>
                  <td className={tableStyles.cell}>
                    {row.observation ? (
                      <span className="text-xs text-red-600 font-semibold">{row.observation}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const restrictionRows = rows as RestrictionChangePreviewRow[];
  return (
    <div className={tableStyles.wrapper}>
      <div className={tableStyles.scroll}>
        <table className={tableStyles.table}>
          <thead>
            <tr className={tableStyles.headerRow}>
              <th className={tableStyles.headerCell}>Código regla</th>
              <th className={tableStyles.headerCell}>Campo origen</th>
              <th className={tableStyles.headerCell}>Valor origen</th>
              <th className={tableStyles.headerCell}>Campo dependiente</th>
              <th className={tableStyles.headerCell}>Valor permitido</th>
              <th className={tableStyles.headerCell}>Estado actual</th>
              <th className={tableStyles.headerCell}>Estado nuevo</th>
              <th className={tableStyles.headerCell}>Acción detectada</th>
              <th className={tableStyles.headerCell}>Estado</th>
              <th className={tableStyles.headerCell}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {restrictionRows.map((row, idx) => (
              <tr key={`${row.ruleCode}-${idx}`} className={idx % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}>
                <td className={tableStyles.cellCode}>{row.ruleCode}</td>
                <td className={tableStyles.cell}>{row.sourceField}</td>
                <td className={tableStyles.cell}>{row.sourceValue}</td>
                <td className={tableStyles.cell}>{row.dependentField}</td>
                <td className={tableStyles.cell}>{row.allowedValue}</td>
                <td className={tableStyles.cell}>{row.currentStatus || "—"}</td>
                <td className={tableStyles.cell}>{row.newStatus || "—"}</td>
                <td className={tableStyles.cell}>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getActionColor(row.detectedAction)}`}>
                    {row.detectedAction === "new"
                      ? "Nuevo"
                      : row.detectedAction === "modified"
                      ? "Modificado"
                      : row.detectedAction === "status_changed"
                      ? "Cambio de estado"
                      : row.detectedAction === "inactive"
                      ? "Inactivado"
                      : row.detectedAction === "blocked"
                      ? "Bloqueado"
                      : row.detectedAction === "unchanged"
                      ? "Sin cambio"
                      : "Error"}
                  </span>
                </td>
                <td className={tableStyles.cell}>
                  <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusColor(row.status)}`}
                  >
                    {row.status === "valid" ? "✓ Válido" : row.status === "error" ? "✗ Error" : "⚠ Aviso"}
                  </span>
                </td>
                <td className={tableStyles.cell}>
                  {row.observation ? (
                    <span className="text-xs text-red-600 font-semibold">{row.observation}</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
