import { createPortal } from "react-dom";
import { X, Download, FileText } from "lucide-react";
import Button from "../ui/Button";

interface ComplianceDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComplianceDocumentModal({
  isOpen,
  onClose,
}: ComplianceDocumentModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const element = document.getElementById("compliance-document");
    if (!element) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(element.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-brand-primary" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Declaración de Cumplimiento Normativo
              </h2>
              <p className="text-xs text-slate-500">Amcor - Sistema de Gestión de Productos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          <div id="compliance-document" className="space-y-6 p-8">
            {/* Header */}
            <div className="border-b-2 border-brand-primary pb-6">
              <h1 className="text-3xl font-bold text-brand-primary">AMCOR</h1>
              <p className="text-sm font-semibold text-slate-600">
                DECLARACIÓN DE CUMPLIMIENTO NORMATIVO
              </p>
              <p className="text-xs text-slate-500">
                Sistema Integrado de Gestión de Productos - ODISEO
              </p>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-semibold text-slate-700">Fecha de Generación</p>
                <p className="text-slate-900">{new Date().toLocaleDateString("es-PE")}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-semibold text-slate-700">Documento ID</p>
                <p className="text-slate-900">DOC-COMP-{Date.now()}</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. Propósito</h2>
                <p className="text-slate-700">
                  Esta declaración certifica el cumplimiento de los requisitos normativos,
                  regulatorios y de calidad aplicables para el registro de productos en el
                  sistema Amcor. El solicitante declara que el producto cumple con todas las
                  normas y estándares internacionales vigentes.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  2. Normativas Aplicables
                </h2>
                <ul className="ml-4 space-y-2 text-slate-700">
                  <li className="list-disc">
                    <strong>FDA (Administración de Alimentos y Medicamentos):</strong> Cumplimiento
                    con regulaciones de seguridad alimentaria (21 CFR)
                  </li>
                  <li className="list-disc">
                    <strong>ISO 9001:2015:</strong> Sistema de gestión de calidad
                  </li>
                  <li className="list-disc">
                    <strong>ISO 22000:2018:</strong> Seguridad de alimentos
                  </li>
                  <li className="list-disc">
                    <strong>REGULACIÓN (CE) Nº 1935/2004:</strong> Materiales en contacto con
                    alimentos
                  </li>
                  <li className="list-disc">
                    <strong>NORMA TÉCNICA PERUANA:</strong> Requisitos de etiquetado y
                    información del producto
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">3. Requisitos de Cumplimiento</h2>
                <div className="space-y-3">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-semibold text-green-900">✓ Seguridad Alimentaria</p>
                    <p className="text-sm text-green-700">
                      El producto ha sido sometido a análisis de seguridad y cumple con límites
                      máximos de contaminantes permitidos.
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-semibold text-green-900">✓ Etiquetado y Declaración</p>
                    <p className="text-sm text-green-700">
                      La información nutricional y de ingredientes se ajusta a las normas
                      internacionales vigentes.
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-semibold text-green-900">✓ Materialidad del Empaque</p>
                    <p className="text-sm text-green-700">
                      Los materiales de empaque han sido aprobados para contacto alimentario
                      según regulaciones internacionales.
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-semibold text-green-900">✓ Especificaciones Técnicas</p>
                    <p className="text-sm text-green-700">
                      Las dimensiones, capacidad y especificaciones técnicas cumplen con los
                      requerimientos del cliente.
                    </p>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-semibold text-green-900">✓ Alérgenos y Contaminación Cruzada</p>
                    <p className="text-sm text-green-700">
                      Se han identificado y comunicado todos los alérgenos presentes. Se han
                      implementado controles para prevenir contaminación cruzada.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Responsabilidades del Solicitante</h2>
                <p className="text-slate-700">
                  Al marcar esta declaración, el solicitante confirma que:
                </p>
                <ul className="ml-4 mt-2 space-y-1 text-sm text-slate-700">
                  <li className="list-disc">Ha revisado toda la información técnica del producto</li>
                  <li className="list-disc">Garantiza la exactitud y veracidad de los datos proporcionados</li>
                  <li className="list-disc">Asume responsabilidad por el cumplimiento normativo</li>
                  <li className="list-disc">Se compromete a mantener la documentación de soporte disponible</li>
                  <li className="list-disc">Notificará cualquier cambio relevante en el producto</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">5. Validez del Documento</h2>
                <p className="text-slate-700">
                  Esta declaración es válida por 12 meses a partir de su generación o hasta que se
                  realice una modificación significativa en las especificaciones del producto. El
                  cumplimiento debe ser verificado periódicamente según los procedimientos establecidos
                  en el Sistema de Gestión de Amcor.
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Nota Legal:</strong> Este documento es un comprobante digital de cumplimiento
                  normativo generado por el sistema ODISEO. Tiene el mismo valor legal que un documento
                  impreso firmado electrónicamente de conformidad con la Ley de Firma Digital vigente.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-slate-200 pt-6 text-center">
              <p className="text-sm font-semibold text-slate-600">
                DOCUMENTO GENERADO AUTOMÁTICAMENTE POR ODISEO
              </p>
              <p className="text-xs text-slate-500">
                Amcor © 2024 - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download size={18} />
            Descargar / Imprimir
          </Button>
          <Button variant="primary" onClick={onClose} className="ml-auto">
            Entendido
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
