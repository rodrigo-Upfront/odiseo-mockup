import { useState } from "react";
import { FINAL_USE_CATALOG } from "../../data/mockDatabase";

type FinalUseCatalogModalProps = {
  selectedId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export default function FinalUseCatalogModal({
  selectedId,
  onClose,
  onSelect,
}: FinalUseCatalogModalProps) {
  const [sectorFilter, setSectorFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [subSegmentFilter, setSubSegmentFilter] = useState("");
  const [search, setSearch] = useState("");

  const sectors = Array.from(
    new Set(FINAL_USE_CATALOG.map((item) => item.sector))
  );

  const segments = Array.from(
    new Set(
      FINAL_USE_CATALOG.filter((item) =>
        sectorFilter ? item.sector === sectorFilter : true
      ).map((item) => item.segment)
    )
  );

  const subSegments = Array.from(
    new Set(
      FINAL_USE_CATALOG.filter((item) =>
        segmentFilter ? item.segment === segmentFilter : true
      ).map((item) => item.subSegment)
    )
  );

  const filteredItems = FINAL_USE_CATALOG.filter((item) => {
    const matchesSector = !sectorFilter || item.sector === sectorFilter;
    const matchesSegment = !segmentFilter || item.segment === segmentFilter;
    const matchesSubSegment =
      !subSegmentFilter || item.subSegment === subSegmentFilter;

    const searchableText = [
      item.afMarketId,
      item.sector,
      item.segment,
      item.subSegment,
      item.useFinal,
      item.code,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !search.trim() || searchableText.includes(search.trim().toLowerCase());

    return matchesSector && matchesSegment && matchesSubSegment && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-[#0d4c5c] px-5 py-4 text-white">
          <div>
            <h2 className="text-lg font-bold">
              Seleccionar Uso Final / AFMarket
            </h2>

            <p className="text-xs text-white/75">
              Selecciona el registro correspondiente para autocompletar sector,
              segmento, sub-segmento y AFMarketID.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white/10 px-3 py-1 text-sm font-bold hover:bg-white/20"
          >
            Cerrar
          </button>
        </div>

        <div className="border-b bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <CatalogFilter
              label="Nivel 1: Sector"
              value={sectorFilter}
              onChange={(value) => {
                setSectorFilter(value);
                setSegmentFilter("");
                setSubSegmentFilter("");
              }}
              options={sectors}
            />

            <CatalogFilter
              label="Nivel 2: Segmento"
              value={segmentFilter}
              onChange={(value) => {
                setSegmentFilter(value);
                setSubSegmentFilter("");
              }}
              options={segments}
            />

            <CatalogFilter
              label="Nivel 3: Sub-segmento"
              value={subSegmentFilter}
              onChange={setSubSegmentFilter}
              options={subSegments}
            />

            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                Buscar
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por texto o AFMarketID"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0d4c5c] focus:ring-2 focus:ring-[#0d4c5c]/20"
              />
            </label>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-200 text-xs uppercase tracking-wide text-slate-700">
                <th className="border border-slate-300 px-3 py-2 text-left">
                  AFMarketID
                </th>

                <th className="border border-slate-300 px-3 py-2 text-left text-red-600">
                  Nivel 1: Sector
                </th>

                <th className="border border-slate-300 px-3 py-2 text-left text-blue-700">
                  Nivel 2: Segmento
                </th>

                <th className="border border-slate-300 px-3 py-2 text-left text-green-700">
                  Nivel 3: Sub-segmento
                </th>

                <th className="border border-slate-300 px-3 py-2 text-left">
                  Nivel 4: Uso Final
                </th>

                <th className="border border-slate-300 px-3 py-2 text-center">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => {
                const isSelected = String(item.id) === selectedId;

                return (
                  <tr
                    key={item.id}
                    onDoubleClick={() => onSelect(String(item.id))}
                    className={`cursor-pointer hover:bg-brand-secondary-soft ${
                      isSelected ? "bg-amber-50" : "bg-white"
                    }`}
                  >
                    <td className="border border-slate-200 px-3 py-2 font-mono font-semibold text-slate-700">
                      {item.afMarketId}
                    </td>

                    <td className="border border-slate-200 px-3 py-2 font-semibold text-red-600">
                      {item.sector}
                    </td>

                    <td className="border border-slate-200 px-3 py-2 font-semibold text-blue-700">
                      {item.segment}
                    </td>

                    <td className="border border-slate-200 px-3 py-2 font-semibold text-green-700">
                      {item.subSegment}
                    </td>

                    <td className="border border-slate-200 px-3 py-2">
                      {item.useFinal}
                    </td>

                    <td className="border border-slate-200 px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onSelect(String(item.id))}
                        className="rounded-md bg-[#0d4c5c] px-3 py-1 text-xs font-bold text-white hover:bg-[#093a48]"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="border border-slate-200 px-4 py-6 text-center text-slate-500"
                  >
                    No se encontraron registros con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t bg-slate-50 px-5 py-3 text-xs text-slate-500">
          <span>
            Mostrando {filteredItems.length} de {FINAL_USE_CATALOG.length}{" "}
            registros.
          </span>

          <span>Doble clic sobre una fila también selecciona el Uso Final.</span>
        </div>
      </div>
    </div>
  );
}

function CatalogFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0d4c5c] focus:ring-2 focus:ring-[#0d4c5c]/20"
      >
        <option value="">Todos</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}