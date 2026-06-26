import { useNavigate } from "react-router-dom";

export default function ComplianceDocumentPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    // Intenta cerrar la pestaña si fue abierta con window.open
    if (window.opener) {
      window.close();
    } else {
      // Si no, redirige al dashboard
      navigate("/dashboard");
    }
  };

  const handleDownload = () => {
    const element = document.getElementById("compliance-document");
    if (!element) return;

    const printWindow = window.open("", "", "width=900,height=700");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Declaración de Cumplimiento Normativo</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
            h1 { color: #003366; font-size: 24px; margin-bottom: 5px; }
            .subtitle { color: #666; font-size: 12px; margin-bottom: 20px; }
            .date-info { color: #666; font-size: 11px; margin-top: 10px; }
            h2 { color: #003366; font-size: 14px; margin-top: 20px; margin-bottom: 10px; font-weight: 600; }
            p { margin: 8px 0; font-size: 12px; text-align: justify; }
            ul { margin: 8px 0 8px 20px; font-size: 12px; }
            li { margin: 4px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 10px; color: #666; }
            .content { max-width: 700px; }
          </style>
        </head>
        <body>
          <div class="content">
            <h1>AMCOR</h1>
            <p class="subtitle">DECLARACIÓN DE CUMPLIMIENTO NORMATIVO</p>
            <p class="date-info">Generado: ${new Date().toLocaleDateString("es-PE")} | ID: DOC-COMP-${Date.now()}</p>

            <h2>1. Propósito</h2>
            <p>Esta declaración certifica que el producto registrado cumple con todos los requisitos normativos y regulatorios aplicables en materia de seguridad alimentaria, calidad y especificaciones técnicas.</p>

            <h2>2. Normativas de Cumplimiento</h2>
            <ul>
              <li>FDA - Regulaciones de Seguridad Alimentaria (21 CFR)</li>
              <li>ISO 9001:2015 - Gestión de Calidad</li>
              <li>ISO 22000:2018 - Seguridad de Alimentos</li>
              <li>Regulación CE Nº 1935/2004 - Materiales en Contacto con Alimentos</li>
              <li>Normas Técnicas Peruanas de Etiquetado y Rotulación</li>
            </ul>

            <h2>3. Declaraciones del Solicitante</h2>
            <p>El solicitante declara bajo su responsabilidad que:</p>
            <ul>
              <li>Ha revisado y verifica la exactitud de toda la información técnica del producto</li>
              <li>El producto cumple con todos los requisitos de seguridad alimentaria aplicables</li>
              <li>Los materiales de empaque cumplen con regulaciones para contacto alimentario</li>
              <li>La información nutricional y de ingredientes es precisa y completa</li>
              <li>Se notificará de cualquier cambio significativo en las especificaciones</li>
            </ul>

            <h2>4. Vigencia</h2>
            <p>Esta declaración es válida por 12 meses a partir de su generación o hasta que se realice una modificación significativa en las especificaciones del producto.</p>

            <div class="footer">
              <p>Documento generado automáticamente por ODISEO<br/>Amcor © 2024 - Todos los derechos reservados</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-300 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-900">Declaración de Cumplimiento Normativo</h1>
              <p className="text-xs text-slate-600 mt-1">Amcor - Sistema ODISEO</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-sm font-medium transition-colors"
              >
                Imprimir
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div id="compliance-document" className="space-y-6 text-slate-800">

          {/* Info */}
          <div className="text-xs text-slate-600 border-b border-slate-200 pb-4">
            <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString("es-PE")}</p>
            <p><strong>Documento ID:</strong> DOC-COMP-{Date.now()}</p>
          </div>

          {/* Propósito */}
          <section>
            <h2 className="text-base font-bold text-blue-900 mb-3">1. Propósito</h2>
            <p className="text-sm leading-relaxed">
              Esta declaración certifica que el producto registrado cumple con todos los requisitos normativos y regulatorios aplicables en materia de seguridad alimentaria, calidad y especificaciones técnicas.
            </p>
          </section>

          {/* Normativas */}
          <section>
            <h2 className="text-base font-bold text-blue-900 mb-3">2. Normativas de Cumplimiento</h2>
            <ul className="text-sm space-y-2 ml-4">
              <li className="list-disc">FDA - Regulaciones de Seguridad Alimentaria (21 CFR)</li>
              <li className="list-disc">ISO 9001:2015 - Gestión de Calidad</li>
              <li className="list-disc">ISO 22000:2018 - Seguridad de Alimentos</li>
              <li className="list-disc">Regulación CE Nº 1935/2004 - Materiales en Contacto con Alimentos</li>
              <li className="list-disc">Normas Técnicas Peruanas de Etiquetado y Rotulación</li>
            </ul>
          </section>

          {/* Declaraciones */}
          <section>
            <h2 className="text-base font-bold text-blue-900 mb-3">3. Declaraciones del Solicitante</h2>
            <p className="text-sm mb-3">El solicitante declara bajo su responsabilidad que:</p>
            <ul className="text-sm space-y-2 ml-4">
              <li className="list-disc">Ha revisado y verifica la exactitud de toda la información técnica del producto</li>
              <li className="list-disc">El producto cumple con todos los requisitos de seguridad alimentaria aplicables</li>
              <li className="list-disc">Los materiales de empaque cumplen con regulaciones para contacto alimentario</li>
              <li className="list-disc">La información nutricional y de ingredientes es precisa y completa</li>
              <li className="list-disc">Se notificará de cualquier cambio significativo en las especificaciones</li>
            </ul>
          </section>

          {/* Vigencia */}
          <section>
            <h2 className="text-base font-bold text-blue-900 mb-3">4. Vigencia</h2>
            <p className="text-sm leading-relaxed">
              Esta declaración es válida por 12 meses a partir de su generación o hasta que se realice una modificación significativa en las especificaciones del producto.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-300 pt-6 text-center text-xs text-slate-600">
            <p className="font-semibold">Documento generado automáticamente por ODISEO</p>
            <p>Amcor © 2024</p>
          </div>

        </div>
      </div>
    </div>
  );
}
