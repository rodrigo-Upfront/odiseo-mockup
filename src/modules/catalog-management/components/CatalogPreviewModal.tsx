import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { getCatalogValues, getCatalogByCode } from "../../../shared/catalogs";
import type { CatalogValue } from "../../../shared/catalogs";

interface CatalogPreviewModalProps {
  isOpen: boolean;
  catalogCode: string;
  onClose: () => void;
}

export default function CatalogPreviewModal({
  isOpen,
  catalogCode,
  onClose,
}: CatalogPreviewModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const catalogData = useMemo(() => {
    if (!catalogCode) return null;
    return getCatalogByCode(catalogCode);
  }, [catalogCode]);

  const catalogValues = useMemo(() => {
    if (!catalogCode) return [];
    return getCatalogValues(catalogCode);
  }, [catalogCode]);

  const filteredValues = useMemo(() => {
    if (!searchTerm.trim()) return catalogValues;
    const term = searchTerm.toLowerCase();
    return catalogValues.filter(
      (v) =>
        v.item.toLowerCase().includes(term) ||
        v.name.toLowerCase().includes(term)
    );
  }, [catalogValues, searchTerm]);

  const statusCounts = useMemo(() => {
    return {
      total: catalogValues.length,
      active: catalogValues.filter((v) => v.status === "Activo").length,
      inactive: catalogValues.filter((v) => v.status === "Inactivo").length,
      blocked: catalogValues.filter((v) => v.status === "Bloqueado").length,
    };
  }, [catalogValues]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Vista previa: {catalogData?.name || "Catálogo"}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {catalogData?.description || ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="border-b border-slate-100 bg-white px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">
                {statusCounts.total}
              </p>
              <p className="text-xs text-slate-600 uppercase tracking-wide">
                Total
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-700">
                {statusCounts.active}
              </p>
              <p className="text-xs text-green-600 uppercase tracking-wide">
                Activos
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-700">
                {statusCounts.inactive}
              </p>
              <p className="text-xs text-slate-600 uppercase tracking-wide">
                Inactivos
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50">
              <p className="text-2xl font-bold text-red-700">
                {statusCounts.blocked}
              </p>
              <p className="text-xs text-red-600 uppercase tracking-wide">
                Bloqueados
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-slate-100 px-6 py-4">
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredValues.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredValues.map((value) => (
                  <tr
                    key={value.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-mono text-slate-700">
                      {value.item}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{value.name}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          value.status === "Activo"
                            ? "bg-green-100 text-green-700"
                            : value.status === "Inactivo"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {value.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-slate-500">
                No se encontraron registros.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
