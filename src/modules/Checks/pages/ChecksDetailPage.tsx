import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import { getProjectByCode, updateProjectRecord, type AreaValidation, type ValidationState, type ValidationStatus } from "../../../shared/data/projectStorage";
import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import PreviewRow from "../../../shared/components/display/PreviewRow";
import { getCurrentUser } from "../../../shared/data/userStorage";
import ActionButton from "../../../shared/components/buttons/ActionButton";

export default function ValidationDetailPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { id: projectCode } = useParams<{ id: string }>();
  const currentUser = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState<AreaValidation | null>(null);
  const [newComment, setNewComment] = useState("");
  const [campoObservado, setCampoObservado] = useState("");
  const [accionRequerida, setAccionRequerida] = useState("");

  const project = useMemo(() => {
    if (!projectCode) return null;
    return getProjectByCode(projectCode);
  }, [projectCode]);

  useEffect(() => {
    setLoading(false);
    if (projectCode && project) {
      setHeader({
        title: "Detalle de Validación",
        subtitle: `Validación del proyecto ${projectCode}`,
        breadcrumbs: [
          { label: "Validaciones", href: "/validaciones" },
          { label: projectCode },
        ],
      });
      if (project.validaciones.length > 0) {
        setActiveArea(project.validaciones[0].area);
      }
    }
    return () => resetHeader();
  }, [projectCode, project, setHeader, resetHeader]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Cargando...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">Proyecto no encontrado</div>
        <ActionButton
          label="Volver a Validaciones"
          onClick={() => navigate("/validaciones")}
          variant="primary"
        />
      </div>
    );
  }

  const activeValidation = project.validaciones.find((v) => v.area === activeArea);

  const handleAddComment = () => {
    if (!newComment.trim() || !activeArea) return;

    const updated = {
      ...project,
      validaciones: project.validaciones.map((v) =>
        v.area === activeArea
          ? {
            ...v,
            comentarios: [
              ...v.comentarios,
              {
                id: `COM-${Date.now()}`,
                comentario: newComment,
                campo: campoObservado || undefined,
                accionRequerida: accionRequerida || undefined,
                fecha: new Date().toISOString(),
                autor: currentUser?.fullName || "Sistema",
              },
            ],
          }
          : v
      ),
    };

    updateProjectRecord(projectCode!, updated);
    setNewComment("");
    setCampoObservado("");
    setAccionRequerida("");
  };

  const handleChangeStatus = (newStatus: ValidationState) => {
    if (!activeArea) return;

    const updated = {
      ...project,
      validaciones: project.validaciones.map((v) =>
        v.area === activeArea
          ? {
            ...v,
            estado: newStatus,
            validador: currentUser?.fullName || "Sistema",
            fechaValidacion: new Date().toISOString(),
          }
          : v
      ),
    };

    updateProjectRecord(projectCode!, updated);
  };

  const getStatusColor = (status: ValidationState): string => {
    switch (status) {
      case "Aprobada":
        return "bg-green-100 text-green-700";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "Observada":
        return "bg-orange-100 text-orange-700";
      case "Rechazada":
        return "bg-red-100 text-red-700";
    }
  };

  const hasObservations = project.validaciones.some((v) => v.estado === "Observada");
  const hasRejections = project.validaciones.some((v) => v.estado === "Rechazada");

  return (
    <div className="w-full max-w-none bg-[#f6f8fb] pb-12">
      <button
        type="button"
        onClick={() => navigate("/checks")}
        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>
      <div className="space-y-5 p-5">
        {/* Informaci�n del Proyecto */}
        <FormCard title="Información del Proyecto" icon="?" color="#00395A">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <PreviewRow label="Código" value={project.code} />
            <PreviewRow label="Proyecto" value={project.projectName} />
            <PreviewRow label="Cliente" value={project.clientName} />
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Estado General</div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                project.estadoValidacionGeneral === "Validada por áreas"
                  ? "bg-green-100 text-green-700"
                  : project.estadoValidacionGeneral === "En validación"
                    ? "bg-amber-100 text-amber-700"
                    : project.estadoValidacionGeneral === "Observada"
                      ? "bg-orange-100 text-orange-700"
                      : project.estadoValidacionGeneral === "Rechazada"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                }`}>
                {project.estadoValidacionGeneral}
              </span>
            </div>
          </div>

          {hasObservations && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-sm font-medium text-orange-800">
                ?? Este proyecto tiene observaciones que requieren corrección del Ejecutivo
              </div>
            </div>
          )}

          {hasRejections && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800">
                ? Este proyecto ha sido RECHAZADO y no puede continuar al RFQ
              </div>
            </div>
          )}
        </FormCard>

        {/* �reas de Validaci�n */}
        {project.validaciones.length > 0 ? (
          <div className="space-y-4">
            {/* Tabs de �reas */}
            <div className="flex gap-2 border-b border-slate-300 overflow-x-auto">
              {project.validaciones.map((v) => (
                <button
                  key={v.area}
                  onClick={() => setActiveArea(v.area)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${activeArea === v.area
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-800"
                    }`}
                >
                  {v.area}
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(v.estado)}`}
                  >
                    {v.estado}
                  </span>
                </button>
              ))}
            </div>

            {/* Contenido del �rea activa */}
            {activeValidation && (
              <FormCard title={`Validaci�n - ${activeValidation.area}`} icon="?" color="#00395A">
                <div className="space-y-5">
                  {/* Estado y Validador */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Estado *
                      </label>
                      <select
                        value={activeValidation.estado}
                        onChange={(e) => handleChangeStatus(e.target.value as ValidationState)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Observada">Observada</option>
                        <option value="Rechazada">Rechazada</option>
                      </select>
                    </div>
                    <PreviewRow
                      label="Validador"
                      value={activeValidation.validador || currentUser?.fullName || "Sin asignar"}
                    />
                    <PreviewRow
                      label="Fecha validación"
                      value={activeValidation.fechaValidacion ? new Date(activeValidation.fechaValidacion).toLocaleDateString() : "�"}
                    />
                  </div>

                  {/* Mostrar campo observado si existe */}
                  {activeValidation.campoObservado && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-xs font-bold text-amber-800 mb-1">CAMPO OBSERVADO</div>
                      <div className="text-sm text-amber-900">{activeValidation.campoObservado}</div>
                    </div>
                  )}

                  {/* Mostrar acci�n requerida si existe */}
                  {activeValidation.accionRequerida && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs font-bold text-blue-800 mb-1">ACCIÓN REQUERIDA</div>
                      <div className="text-sm text-blue-900">{activeValidation.accionRequerida}</div>
                    </div>
                  )}

                  {/* Hist�rico de comentarios */}
                  {activeValidation.comentarios.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-3">Historial de comentarios:</div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {activeValidation.comentarios.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-lg bg-slate-50 p-3 border border-slate-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-xs text-slate-600">
                                {new Date(comment.fecha).toLocaleString()}
                              </div>
                              {comment.autor && (
                                <div className="text-xs font-medium text-slate-700">
                                  {comment.autor}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-slate-800 mb-2">
                              {comment.comentario}
                            </div>
                            {comment.campo && (
                              <div className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded inline-block mb-1">
                                Campo: {comment.campo}
                              </div>
                            )}
                            {comment.accionRequerida && (
                              <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block ml-2">
                                Acci�n: {comment.accionRequerida}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agregar nuevo comentario */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-sm font-semibold text-slate-700 mb-3">Agregar comentario:</div>
                    <div className="space-y-3">
                      <FormInput
                        label="Campo observado (opcional)"
                        value={campoObservado}
                        onChange={setCampoObservado}
                        placeholder="ej: Gramaje, Archivo de arte, Estructura..."
                      />
                      <FormTextarea
                        label="Comentario *"
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Describa la observaci�n o el motivo del rechazo..."
                        rows={3}
                      />
                      <FormInput
                        label="Acci�n requerida (opcional)"
                        value={accionRequerida}
                        onChange={setAccionRequerida}
                        placeholder="ej: Adjuntar archivo, Confirmar tolerancia, Corregir formato..."
                      />
                      <ActionButton
                        label="Registrar comentario"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        variant="primary"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </FormCard>
            )}
          </div>
        ) : (
          <FormCard title="Validaciones" icon="?" color="#00395A">
            <div className="text-slate-500 text-center py-8">
              No hay �reas de validaci�n registradas para este proyecto
            </div>
          </FormCard>
        )}

        {/* Botones de acci�n */}
        <div className="flex gap-3">
          <ActionButton
            label="Volver"
            onClick={() => navigate("/validaciones")}
            variant="outline"
          />
          <ActionButton
            label="Ver Proyecto"
            onClick={() => navigate(`/products/${projectCode}`)}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
