import { useState } from "react";
import { saveProjectObservation } from "../../data/observationStorage";
import { registerProjectStatusChange } from "../../data/slaStorage";

interface ProjectValidationPanelProps {
  projectCode: string;
  currentStatus: string;
  onUpdate: () => void;
}

export default function ProjectValidationPanel({ projectCode, currentStatus, onUpdate }: ProjectValidationPanelProps) {
  const [mode, setMode] = useState<"view" | "observation" | "status">("view");
  const [observationText, setObservationText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [responsibleArea, setResponsibleArea] = useState("");

  const STATUS_OPTIONS = [
    "En evaluación",
    "Observada",
    "Lista para RFQ",
    "En desarrollo",
    "Pendiente de alta",
    "Dado de alta",
    "Desestimada"
  ];

  const AREAS = ["Comercial", "R&D", "Técnica", "Pre-prensa", "Aseguramiento de Calidad"];

  const handleAddObservation = () => {
    if (!observationText.trim()) return;

    saveProjectObservation({
      projectCode,
      description: observationText,
      area: responsibleArea || "",
      observationType: "Observación",
      isBlocking: false,
      createdBy: "Usuario actual"
    });

    setObservationText("");
    setMode("view");
    onUpdate();
  };

  const handleStatusChange = () => {
    if (!newStatus || !responsibleArea) return;

    registerProjectStatusChange({
      projectCode,
      fromStatus: currentStatus,
      toStatus: newStatus,
      responsibleArea,
      changedBy: "Usuario actual"
    });
    
    setNewStatus("");
    setResponsibleArea("");
    setMode("view");
    onUpdate();
  };

  if (mode === "observation") {
    return (
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
        <h3 className="font-bold text-amber-800 mb-3">Registrar Observación</h3>
        <textarea
          className="w-full p-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3 bg-white"
          rows={3}
          placeholder="Describa la observación técnica o comercial..."
          value={observationText}
          onChange={e => setObservationText(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => setMode("view")}
            className="px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200"
          >
            Cancelar
          </button>
          <button 
            onClick={handleAddObservation}
            className="px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700"
          >
            Guardar Observación
          </button>
        </div>
      </div>
    );
  }

  if (mode === "status") {
    return (
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3">Cambiar Estado del Proyecto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Nuevo Estado</label>
            <select
              className="w-full p-2.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
            >
              <option value="">-- Seleccione --</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt} disabled={opt === currentStatus}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Área Responsable</label>
            <select
              className="w-full p-2.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={responsibleArea}
              onChange={e => setResponsibleArea(e.target.value)}
            >
              <option value="">-- Seleccione --</option>
              {AREAS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => setMode("view")}
            className="px-4 py-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-lg hover:bg-blue-200"
          >
            Cancelar
          </button>
          <button 
            onClick={handleStatusChange}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Confirmar Cambio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button 
        onClick={() => setMode("observation")}
        className="flex-1 py-3 px-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold hover:bg-amber-100 transition-colors"
      >
        + Registrar Observación
      </button>
      <button 
        onClick={() => setMode("status")}
        className="flex-1 py-3 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 transition-colors"
      >
        ⇄ Cambiar Estado / Asignar Área
      </button>
    </div>
  );
}
