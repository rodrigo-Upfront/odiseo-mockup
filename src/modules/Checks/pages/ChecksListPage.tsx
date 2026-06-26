import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectRecords } from "../../../shared/data/projectStorage";
import { getProjectsForUser, getLastValidationDate, getStatusOrder } from "../data/checksFilters";
import { type CurrentUser } from "../types/checks";
import PageLayout from "../../../shared/components/layout/PageLayout";
import PageHeader from "../../../shared/components/layout/PageHeader";
import SectionCard from "../../../shared/components/cards/SectionCard";
import ActionButton from "../../../shared/components/buttons/ActionButton";
import StatusBadge from "../../../shared/components/display/StatusBadge";
import EmptyState from "../../../shared/components/display/EmptyState";
import FormInput from "../../../shared/components/forms/FormInput";

const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-001",
  fullName: "Ana Pérez",
  role: "Artes Gráficas",
  area: "Artes Gráficas",
  departamento: "Calidad",
};

export default function ChecksListPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");

  const currentUser = MOCK_CURRENT_USER;

  const allProjects = useMemo(() => {
    return getProjectRecords();
  }, []);

  const userProjects = useMemo(() => {
    return getProjectsForUser(allProjects, currentUser);
  }, [allProjects, currentUser]);

  const filteredProjects = useMemo(() => {
    let filtered = userProjects;

    if (searchText) {
      filtered = filtered.filter((p) =>
        p.code.toLowerCase().includes(searchText.toLowerCase()) ||
        p.projectName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (sortBy === "date") {
      filtered = filtered.sort((a, b) => {
        const dateA = getLastValidationDate(a)?.getTime() ?? 0;
        const dateB = getLastValidationDate(b)?.getTime() ?? 0;
        return dateB - dateA;
      });
    } else {
      filtered = filtered.sort((a, b) => {
        const orderA = getStatusOrder(a.estadoValidacionGeneral);
        const orderB = getStatusOrder(b.estadoValidacionGeneral);
        return orderA - orderB;
      });
    }

    return filtered;
  }, [userProjects, searchText, sortBy]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Observada":
        return "bg-orange-100 text-orange-700";
      case "Rechazada":
        return "bg-red-100 text-red-700";
      case "En validación":
        return "bg-blue-100 text-blue-700";
      case "Validada por áreas":
        return "bg-green-100 text-green-700";
      case "Lista para RFQ":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const pendingCount = filteredProjects.filter(
    (p) => p.estadoValidacionGeneral === "En validación" || p.estadoValidacionGeneral === "Observada"
  ).length;

  return (
    <PageLayout>
      <PageHeader
        title="Bandeja de Validaciones"
        subtitle={`Proyectos pendientes de validación para ${currentUser.role}`}
        showBackButton
      />
      <div className="space-y-6 p-6">
        <SectionCard title="Responsable" subtitle="Información del validador">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">{currentUser.fullName}</h3>
              <p className="text-sm text-slate-600">{currentUser.role}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
              <p className="text-xs text-slate-600">pendientes de revisar</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Filtros y búsqueda">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Buscar por código o nombre"
              type="text"
              value={searchText}
              onChange={setSearchText}
              placeholder="PR-000001, Nombre proyecto..."
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "status")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="date">Más reciente primero</option>
                <option value="status">Por estado</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {filteredProjects.length === 0 ? (
          <EmptyState
            type="no-data"
            title="No hay proyectos pendientes"
            description={searchText ? "Intenta limpiar la búsqueda o cambiar los filtros" : undefined}
            action={
              searchText ? (
                <ActionButton
                  label="Limpiar búsqueda"
                  onClick={() => setSearchText("")}
                  variant="primary"
                  size="sm"
                />
              ) : undefined
            }
          />
        ) : (
          <SectionCard title={`Proyectos (${filteredProjects.length})`}>
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.code}
                onClick={() => navigate(`/validaciones/${project.code}`)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-500 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800">{project.code}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.estadoValidacionGeneral)}`}>
                        {project.estadoValidacionGeneral}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{project.projectName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Cliente</p>
                    <p className="text-sm text-slate-700">{project.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Ejecutivo</p>
                    <p className="text-sm text-slate-700">{project.ejecutivoName}</p>
                  </div>
                </div>

                {project.validaciones.length > 0 && (
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-xs font-medium text-slate-600 mb-2">Estado de validaciones:</p>
                    <div className="flex gap-2 flex-wrap">
                      {project.validaciones.map((v) => (
                        <div key={v.area} className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600">{v.area}:</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            {v.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
            Mostrando {filteredProjects.length} de {userProjects.length} proyectos
          </div>
        </SectionCard>
        )}
      </div>
    </PageLayout>
  );
}
