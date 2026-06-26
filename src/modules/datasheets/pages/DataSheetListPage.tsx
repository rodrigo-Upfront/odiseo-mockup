import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import { useLayout } from "../../../components/layout/LayoutContext"
import RowActionButtons from "../../../shared/components/table/RowActionButtons"

interface DataSheet {
  id: string
  code: string
  name: string
  category: string
  material: string
  dimensions: string
  status: "Activo" | "Inactivo"
  updatedAt: string
}

const MOCK_DATASHEETS: DataSheet[] = [
  { 
    id: "1", 
    code: "DS-000001", 
    name: "Doy Pack 250ml Mayonesa", 
    category: "Empaque Flexible", 
    material: "PET/PE",
    dimensions: "120x180mm",
    status: "Activo",
    updatedAt: "2026-01-15"
  },
  { 
    id: "2", 
    code: "DS-000002", 
    name: "Bolsa 500g Café", 
    category: "Empaque Flexible", 
    material: "Aluminio/PET",
    dimensions: "150x250mm",
    status: "Activo",
    updatedAt: "2026-02-20"
  },
  { 
    id: "3", 
    code: "DS-000003", 
    name: "Etiqueta 1L Shampoo", 
    category: "Etiquetas", 
    material: "BOPP",
    dimensions: "80x120mm",
    status: "Activo",
    updatedAt: "2026-03-10"
  },
]

export default function DataSheetListPage() {
  const navigate = useNavigate()
  const { setHeader, resetHeader } = useLayout()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return MOCK_DATASHEETS
    return MOCK_DATASHEETS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    )
  }, [search])

  const stats = useMemo(
    () => ({
      total: MOCK_DATASHEETS.length,
      activos: MOCK_DATASHEETS.filter((d) => d.status === "Activo").length,
    }),
    []
  )

  const actions = useMemo(
    () => (
      <button
        onClick={() => navigate("/datasheets/new")}
        className="h-10 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2"
      >
        <Plus size={16} />
        Nueva Ficha
      </button>
    ),
    [navigate]
  )

  useEffect(() => {
    setHeader({
      title: "Fichas de Producto",
      subtitle: "Consulta y administración de fichas técnicas",
      actions,
    })
    return () => resetHeader()
  }, [setHeader, resetHeader, actions])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500">Total Fichas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-state-success">Activas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activos}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ficha..."
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Material</th>
                <th className="px-4 py-3 font-medium">Dimensiones</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-brand-primary">
                    {d.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-4 py-3 text-gray-700">{d.category}</td>
                  <td className="px-4 py-3 text-gray-700">{d.material}</td>
                  <td className="px-4 py-3 text-gray-700">{d.dimensions}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.status === "Activo"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActionButtons
                      viewPath={`/datasheets/${d.code}`}
                      editPath={`/datasheets/${d.code}/edit`}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">No se encontraron fichas.</p>
          </div>
        )}
      </div>
    </div>
  )
}
