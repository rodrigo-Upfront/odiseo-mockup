import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import { getProjectByCode, getProjectRecords, updateProjectRecord, type ProjectRecord } from "../../../shared/data/projectStorage";
import { getPortfolioByCode, type PortfolioRecord } from "../../../shared/data/portfolioStorage";
import { getProjectSlaSummary, getProjectStatusHistory } from "../../../shared/data/slaStorage";
import { getProjectObservations } from "../../../shared/data/observationStorage";
import { getProjectTrackingState, advanceProjectStage, initializeProjectTracking } from "../../../shared/data/projectTrackingStorage";
import { getStageConfig, isPortalStage, type ProjectStage } from "../../../shared/data/projectStageConfig";
import { PHASE_CONFIGS } from "../../../shared/data/projectPhaseConfig";
import { type ProjectStatus, resolveProjectStage, normalizeProjectWorkflow } from "../../../shared/data/projectWorkflow";
import { exportProjectToExcelMock } from "../services/productExportService";

import PreviewRow from "../../../shared/components/display/PreviewRow";
import FormCard from "../../../shared/components/forms/FormCard";
import Button from "../../../shared/components/ui/Button";

import ProjectStageStepper from "../../../shared/components/projectTracking/ProjectStageStepper";
import ProjectStatusPanel from "../components/ProjectStatusPanel";
import ProjectActionPanel from "../components/ProjectActionPanel";
import ProjectFieldImpactList from "../components/ProjectFieldImpactList";
import ProjectObservationPanel from "../../../shared/components/projectTracking/ProjectObservationPanel";
import ProjectSlaPanel from "../../../shared/components/projectTracking/ProjectSlaPanel";
import ProjectProductsPanel from "../components/ProjectProductsPanel";
import UnifiedProjectHistory from "../components/UnifiedProjectHistory";

const findProductByRouteParam = (products: ProjectRecord[], routeParam: string): any => {
  const normalizedParam = String(routeParam || "").trim().toLowerCase();
  if (!normalizedParam) return undefined;

  const product = products.find((product) => {
    const identifiers = [
      product.code,
      (product as any).projectCode,
      (product as any).productRequestCode,
      product.id,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

    return identifiers.includes(normalizedParam);
  });

  return product ? normalizeProjectWorkflow(product) : undefined;
};

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { productCode } = useParams<{ productCode: string }>();
  const projectCode = productCode;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioRecord | null>(null);
  const [trackingState, setTrackingState] = useState<any | null>(null);
  const [slaSummary, setSlaSummary] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedTestStatus, setSelectedTestStatus] = useState<ProjectStatus | "">(
    project?.status as ProjectStatus || ""
  );

  const fetchProjectData = () => {
    if (projectCode) {
      const allProjects = getProjectRecords();
      const p = findProductByRouteParam(allProjects, projectCode) || getProjectByCode(projectCode);
      setProject(p || null);
      if (p) {
        // Load portfolio
        if (p.portfolioCode) {
          const pf = getPortfolioByCode(p.portfolioCode);
          setPortfolio(pf);
        }

        let ts = getProjectTrackingState(projectCode);
        if (!ts) {
          // Initialize for mock purposes if it doesn't exist
          initializeProjectTracking(projectCode, "Sistema");
          ts = getProjectTrackingState(projectCode);
        }
        setTrackingState(ts);

        const slas = getProjectSlaSummary(projectCode);
        // Find the active SLA
        const activeSla = slas.find(s => !s.completedAt) || slas[0];
        setSlaSummary(activeSla || null);

        setHistory(getProjectStatusHistory().filter(h => h.projectCode === projectCode));
        setObservations(getProjectObservations().filter(o => o.projectCode === projectCode));
      }
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectCode, refreshTrigger]);

  useEffect(() => {
    if (projectCode && project) {
      setHeader({
        title: "Tracking de Producto",
        breadcrumbs: [
          { label: "Productos", href: "/products" },
          { label: projectCode },
          { label: "Tracking" },
        ],
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/products/${projectCode}/edit`)}>
              Editar Producto
            </Button>
            <Button variant="primary" onClick={() => exportProjectToExcelMock(projectCode as string)}>
              Exportar Ficha
            </Button>
          </div>
        )
      });
    }
    return () => resetHeader();
  }, [projectCode, project, setHeader, resetHeader, navigate]);

  if (!project || !trackingState) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">Producto no encontrado o sin inicializar tracking</div>
        <Button variant="ghost" onClick={() => navigate("/products")}>Volver a Productos</Button>
      </div>
    );
  }

  const currentStage: ProjectStage = trackingState.currentStage;
  const isPortal = isPortalStage(currentStage);
  const openBlockingObs = observations.some(o => o.status === "Abierta" && o.isBlocking);

  const handleAdvanceStage = (nextStage: ProjectStage) => {
    advanceProjectStage(projectCode as string, nextStage, "Usuario Actual", `Transición a ${getStageConfig(nextStage)?.name}`);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTestStatusChange = (newStatus: ProjectStatus) => {
    if (!project || !projectCode) return;

    const updatedProject: ProjectRecord = {
      ...project,
      status: newStatus,
      stage: resolveProjectStage(newStatus),
      statusUpdatedAt: new Date().toISOString(),
    };

    updateProjectRecord(projectCode, updatedProject);
    setSelectedTestStatus(newStatus);
    setRefreshTrigger(prev => prev + 1);
  };

  const determineNextStage = (current: ProjectStage): ProjectStage => {
    const sequence: ProjectStage[] = ["P1", "P2", "P3", "P4", "P5", "P6"];
    const idx = sequence.indexOf(current);
    if (idx === -1 || idx === sequence.length - 1) return current;
    
    // Simulate conditional jumping (e.g. skip P2 if no design)
    if (current === "P1" && project?.designRoute === "Sin diseño") {
      return "P3";
    }
    
    return sequence[idx + 1];
  };

  const handleAdvance = () => {
    handleAdvanceStage(determineNextStage(currentStage));
  };

  const phaseConfig = PHASE_CONFIGS[currentStage as keyof typeof PHASE_CONFIGS];

  return (
    <div className="w-full max-w-none bg-[#f6f8fb] space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate("/products")}
        className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

      {/* 1. Stepper Global */}
      <ProjectStageStepper currentStage={currentStage} />

      {/* 2. Productos Solicitados a Cotizar */}
      <ProjectProductsPanel
        project={project}
        portfolio={portfolio}
        onProjectUpdated={() => setRefreshTrigger(prev => prev + 1)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo: Ficha Única del Producto */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
              <div className="text-xs font-bold uppercase tracking-wide text-white/75 mb-1">
                Producto {project.code}
              </div>
              <h2 className="text-2xl font-bold">{project.projectName}</h2>
              <p className="text-sm opacity-90 mt-1">{project.projectDescription || "Sin descripción"}</p>
            </div>
          </div>

          {/* 1. INFORMACIÓN GENERAL */}
          <FormCard title="Información General" icon="▦" color="#00395A">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <PreviewRow label="Código" value={project.code} />
              <PreviewRow label="Portafolio" value={project.portfolioCode} />
              <PreviewRow label="Planta de Origen" value={project.plantaName} />
              <PreviewRow label="Cliente" value={project.clientName} />
              <PreviewRow label="Ejecutivo Comercial" value={project.ejecutivoName} />
              <PreviewRow label="Nombre del Producto" value={project.projectName} />
              <PreviewRow label="Clasificación" value={project.classification} />
              <PreviewRow label="Sub-clasificación" value={project.subClassification} />
              <PreviewRow label="Tipo de Producto" value={project.projectType} />
              <PreviewRow label="Acción Salesforce" value={project.salesforceAction} />

              <PreviewRow label="Fecha Registro" value={new Date(project.createdAt).toLocaleDateString()} />
            </div>
          </FormCard>

          {/* 2. DATOS DE PRODUCTO COMERCIAL */}
          <FormCard title="2. Datos de Producto Comercial" icon="◈" color="#27ae60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <PreviewRow label="Formato de Plano" value={project.blueprintFormat} />
              <PreviewRow label="Aplicación Técnica" value={project.technicalApplication} />
              <PreviewRow label="Uso Final" value={project.useFinalName || project.usoFinal} />
              <PreviewRow label="Sub-segmento" value={project.subSegment} />
              <PreviewRow label="Segmento" value={project.segment} />
              <PreviewRow label="Sector" value={project.sector} />
              <PreviewRow label="AFMarketID" value={project.afMarketId} />
              <PreviewRow label="Volumen Estimado" value={project.estimatedVolume} />
              <PreviewRow label="Unidad de Medida" value={project.unitOfMeasure} />
              <PreviewRow label="Código de Empaque Cliente" value={project.customerPackingCode} />
            </div>
          </FormCard>

          {/* 3. ESPECIFICACIONES DE DISEÑO */}
          <FormCard title="3. Especificaciones de Diseño" icon="🎨" color="#7E3FB2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <PreviewRow label="Clase de Impresión" value={project.printClass} />
              <PreviewRow label="Tipo de Impresión" value={project.printType} />
              <PreviewRow label="¿Tiene diseño trabajado?" value={String(project.isPreviousDesign)} />
              <PreviewRow label="Código EDAG" value={project.previousEdagCode} />
              <PreviewRow label="Versión EDAG" value={project.previousEdagVersion} />
              <PreviewRow label="Especificaciones Especiales" value={project.specialDesignSpecs} />
              <PreviewRow label="Comentarios de Diseño" value={project.specialDesignComments} />
              <PreviewRow label="¿Archivos digitales?" value={typeof project.hasDigitalFiles === 'boolean' ? (project.hasDigitalFiles ? "Sí" : "No") : String(project.hasDigitalFiles)} />
              <PreviewRow label="Tipo de Archivo de Arte" value={project.artworkFileType} />
              <PreviewRow label="Adjuntos de Arte" value={project.artworkAttachments} />
              <PreviewRow label="¿Requiere trabajo de diseño?" value={project.requiresDesignWork ? "Sí" : "No"} />
            </div>
          </FormCard>

          {/* 4. ESPECIFICACIONES DE ESTRUCTURA */}
          <FormCard title="4. Especificaciones de Estructura" icon="⚙" color="#00A1DE">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <PreviewRow label="¿Estructura de referencia?" value={typeof project.hasReferenceStructure === 'boolean' ? (project.hasReferenceStructure ? "Sí" : "No") : String(project.hasReferenceStructure)} />
              <PreviewRow label="Código EM Referencia" value={project.referenceEmCode} />
              <PreviewRow label="Versión EM Referencia" value={project.referenceEmVersion} />
              <PreviewRow label="Tipo de Estructura" value={project.structureType} />
              <PreviewRow label="¿Especificación técnica cliente?" value={typeof project.hasCustomerTechnicalSpec === 'boolean' ? (project.hasCustomerTechnicalSpec ? "Sí" : "No") : String(project.hasCustomerTechnicalSpec)} />
              <PreviewRow label="Adjunto especificación técnica" value={project.customerTechnicalSpecAttachment} />
              
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <h4 className="font-semibold text-slate-700 mb-3">Capas</h4>
              </div>
              
              <PreviewRow label="Material Capa 1" value={project.layer1Material} />
              <PreviewRow label="Micraje Capa 1" value={project.layer1Micron} />
              <PreviewRow label="Gramaje Capa 1" value={project.layer1Grammage} />
              <PreviewRow label="Material Capa 2" value={project.layer2Material} />
              <PreviewRow label="Micraje Capa 2" value={project.layer2Micron} />
              <PreviewRow label="Gramaje Capa 2" value={project.layer2Grammage} />
              <PreviewRow label="Material Capa 3" value={project.layer3Material} />
              <PreviewRow label="Micraje Capa 3" value={project.layer3Micron} />
              <PreviewRow label="Gramaje Capa 3" value={project.layer3Grammage} />
              <PreviewRow label="Material Capa 4" value={project.layer4Material} />
              <PreviewRow label="Micraje Capa 4" value={project.layer4Micron} />
              <PreviewRow label="Gramaje Capa 4" value={project.layer4Grammage} />
              
              <PreviewRow label="Gramaje Total" value={project.grammage} />
              <PreviewRow label="Tolerancia de Gramaje" value={project.grammageTolerance} />
              <PreviewRow label="Máquina de Envasado" value={project.packingMachineName || project.maquinaCliente} />
              <PreviewRow label="Solicitud de Muestra" value={project.sampleRequest ? "Sí" : "No"} />
            </div>
          </FormCard>

          {/* 5. DIMENSIONES Y ACCESORIOS */}
          <FormCard title="5. Dimensiones y Accesorios" icon="📐" color="#f39c12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="md:col-span-2">
                <h4 className="font-semibold text-slate-700 mb-3">Dimensiones (mm)</h4>
              </div>
              <PreviewRow label="Ancho" value={project.width} />
              <PreviewRow label="Largo" value={project.length} />
              <PreviewRow label="Repetición" value={project.repetition} />
              <PreviewRow label="Base Doy Pack" value={project.doyPackBase} />
              <PreviewRow label="Ancho de Fuelle" value={project.gussetWidth} />
              
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <h4 className="font-semibold text-slate-700 mb-3">Accesorios</h4>
              </div>
              
              <PreviewRow label="Zipper" value={project.hasZipper ? (project.zipperType || "Sí") : "No"} />
              <PreviewRow label="Tin Tie" value={project.hasTinTie ? "Sí" : "No"} />
              <PreviewRow label="Válvula" value={project.hasValve ? (project.valveType || "Sí") : "No"} />
              <PreviewRow label="Troquel Asa" value={project.hasDieCutHandle ? "Sí" : "No"} />
              <PreviewRow label="Refuerzo" value={project.hasReinforcement ? `Sí (${project.reinforcementThickness}x${project.reinforcementWidth})` : "No"} />
              <PreviewRow label="Corte Angular" value={project.hasAngularCut ? "Sí" : "No"} />
              <PreviewRow label="Esquinas Redondeadas" value={project.hasRoundedCorners ? (project.roundedCornersType || "Sí") : "No"} />
              <PreviewRow label="Muesca" value={project.hasNotch ? "Sí" : "No"} />
              <PreviewRow label="Perforación" value={project.hasPerforation ? `${project.pouchPerforationType || ""} ${project.bagPerforationType || ""}` : "No"} />
              <PreviewRow label="Pre-Corte" value={project.hasPreCut ? (project.preCutType || "Sí") : "No"} />
              <PreviewRow label="Otros Accesorios" value={project.otherAccessories} />
              
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <h4 className="font-semibold text-slate-700 mb-3">Datos de Tuco / Core</h4>
              </div>
              
              <PreviewRow label="Material de Tuco" value={project.coreMaterial} />
              <PreviewRow label="Diámetro de Tuco" value={project.coreDiameter} />
              <PreviewRow label="Diámetro Exterior" value={project.externalDiameter} />
              <PreviewRow label="Variación Exterior (+)" value={project.externalVariationPlus} />
              <PreviewRow label="Variación Exterior (-)" value={project.externalVariationMinus} />
              <PreviewRow label="Peso Máximo Bobina" value={project.maxRollWeight} />
            </div>
          </FormCard>

          {/* 6. ESPECIFICACIONES FINANCIERAS */}
          <FormCard title="6. Especificaciones Financieras / Comerciales" icon="💰" color="#16a085">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <PreviewRow label="Tipo de Venta" value={project.saleType} />
              <PreviewRow label="Incoterm" value={project.incoterm} />
              <PreviewRow label="País de Destino" value={project.destinationCountry} />
              <PreviewRow label="Precio Objetivo" value={project.targetPrice} />
              <PreviewRow label="Precio de Venta" value={project.salePrice} />
              <PreviewRow label="Tipo de Moneda" value={project.currencyType} />
              <PreviewRow label="Condiciones de Pago" value={project.paymentTerms} />
              <PreviewRow label="Logo Producto Peruano" value={project.peruvianProductLogo} />
              <PreviewRow label="Pie de Imprenta" value={project.printingFooter} />
              <PreviewRow label="Información Adicional" value={project.customerAdditionalInfo} />
            </div>
          </FormCard>
        </div>

        {/* Lado Derecho: Estado, Acciones y Observaciones */}
        <div className="space-y-6">

          {/* Estado del Producto - Nueva vista centralizada */}
          <ProjectStatusPanel project={project} />

          {/* TEST CONTROLS: Manual State Transition (Dev/Testing Only) */}
          <FormCard title="🧪 Controles de Prueba" icon="⚙" color="#e74c3c">
            <div className="space-y-3">
              <div className="text-xs text-slate-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                Cambiar manualmente el estado del producto para pruebas de flujo.
              </div>
              <select
                value={project?.status || ""}
                onChange={(e) => handleTestStatusChange(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
              >
                <option value="">Seleccionar estado...</option>
                <option value="Registrado">Registrado</option>
                <option value="En Preparación">En Preparación</option>
                <option value="Ficha Completa">Ficha Completa</option>
                <option value="En validación">En validación</option>
                <option value="Observado">Observado</option>
                <option value="Validado">Validado</option>
                <option value="En Cotización">En Cotización</option>
                <option value="Cotización Completa">Cotización Completa</option>
                <option value="Aprobado por Cliente">Aprobado por Cliente</option>
                <option value="Desestimado">Desestimado</option>
              </select>
              <div className="text-xs text-slate-500 mt-2">
                Estado actual: <span className="font-semibold text-slate-700">{project?.status || "—"}</span>
              </div>
            </div>
          </FormCard>

          <ProjectFieldImpactList 
            projectData={project} 
            area={currentStage === "P1" ? "P1 - Comercial" : 
                  currentStage === "P2" ? "P2 - Artes Gráficas" :
                  currentStage === "P3" ? "P3 - R&D" :
                  currentStage === "P4" ? "P4 - Commercial Finance" :
                  currentStage === "P5" ? "P5 - Crédito / Cierre" : "P1 - Comercial"}
          />

          {isPortal && (
            <ProjectActionPanel
              projectCode={projectCode as string}
              projectStatus={project.status}
              stageCode={currentStage}
              isCompleted={!isPortal}
              openObservationsCount={observations.filter(o => o.status === "Abierta" && o.isBlocking).length}
              hasBlockingObservations={openBlockingObs}
              onAdvance={handleAdvance}
              onObserve={() => alert("Usa el panel de observaciones para añadir una nueva.")}
              onExportExcel={() => exportProjectToExcelMock(projectCode as string)}
              onSendOffer={() => handleAdvance()}
              onRequestCreditEvaluation={() => alert("Solicitando evaluación a Crédito...")}
              onApproveManufacturing={() => handleAdvance()}
              onApproveSample={() => handleAdvance()}
              onReject={() => alert("Producto desestimado.")}
            />
          )}

          <ProjectSlaPanel sla={slaSummary} isPortalStage={isPortal} />

          {/* Historial Unificado: Estados y Observaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Historial Completo</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Estados, Validaciones, Observaciones</span>
            </div>
            <UnifiedProjectHistory projectCode={project.code} statusHistory={history} />
          </div>

        </div>
      </div>
    </div>
  );
}
