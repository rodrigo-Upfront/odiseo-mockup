import type { ProjectEditFormData } from "../pages/ProductEditPage";
import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import SegmentedControl from "../../../shared/components/forms/SegmentedControl";
import { PRODUCT_CATALOGS } from "../../../shared/data/productCatalogs";

type StepProps = {
  form: ProjectEditFormData;
  updateField: (field: keyof ProjectEditFormData, value: string | string[]) => void;
  markFieldAsTouched: (field: keyof ProjectEditFormData) => void;
  getError: (field: keyof ProjectEditFormData) => string;
  shouldShowFieldError: (field: keyof ProjectEditFormData) => boolean;
  isDisenoNuevo?: boolean;
  isCambioDiseno?: boolean;
};

export default function ProductStep1Design({
  form,
  updateField,
  markFieldAsTouched,
  getError,
  shouldShowFieldError,
  isDisenoNuevo,
  isCambioDiseno,
}: StepProps) {
  return (
    <div className="space-y-6">
      {/* Especificaciones de Diseño */}
      <FormCard title="Especificaciones de Diseño" icon="🎨" color="#d97706">
        <div className="space-y-4">
          {/* Impresión, Tipo Impresión, Forma Impresión */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormSelect
              label="Clase de Impresión"
              value={form.printClass}
              onChange={(value) => {
                updateField("printClass", value);
                markFieldAsTouched("printClass");
              }}
              onBlur={() => markFieldAsTouched("printClass")}
              options={PRODUCT_CATALOGS.claseDeImpresion.values.map((val) => ({
                value: val,
                label: val,
              }))}
              placeholder="-- Seleccione Clase --"
            />
            <FormSelect
              label="Tipo de Impresión"
              value={form.printType}
              onChange={(value) => {
                updateField("printType", value);
                markFieldAsTouched("printType");
              }}
              onBlur={() => markFieldAsTouched("printType")}
              options={PRODUCT_CATALOGS.tipoDeImpresion.values.map((val) => ({
                value: val,
                label: val,
              }))}
              placeholder="-- Seleccione Tipo --"
            />
            <FormSelect
              label="Forma de Impresión"
              value={form.printForm}
              onChange={(value) => {
                updateField("printForm", value);
                markFieldAsTouched("printForm");
              }}
              onBlur={() => markFieldAsTouched("printForm")}
              options={PRODUCT_CATALOGS.formaDeImpresion.values.map((val) => ({
                value: val,
                label: val,
              }))}
              placeholder="-- Seleccione Forma --"
            />
          </div>

          {/* Especificaciones Especiales, Comentarios */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormTextarea
              label="Especificaciones Especiales"
              value={form.specialDesignSpecs}
              onChange={(value) => {
                updateField("specialDesignSpecs", value);
                markFieldAsTouched("specialDesignSpecs");
              }}
              onBlur={() => markFieldAsTouched("specialDesignSpecs")}
              placeholder="Especificaciones especiales de diseño"
              rows={3}
            />
            <FormTextarea
              label="Comentarios"
              value={form.specialDesignComments}
              onChange={(value) => {
                updateField("specialDesignComments", value);
                markFieldAsTouched("specialDesignComments");
              }}
              onBlur={() => markFieldAsTouched("specialDesignComments")}
              placeholder="Comentarios adicionales"
              rows={3}
            />
          </div>

          {/* Ancho/Altura área de diseño */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Ancho Área de Diseño (mm)"
              value={form.designAreaWidth}
              onChange={(value) => {
                updateField("designAreaWidth", value);
                markFieldAsTouched("designAreaWidth");
              }}
              onBlur={() => markFieldAsTouched("designAreaWidth")}
              placeholder="Ej. 150"
              type="number"
            />
            <FormInput
              label="Altura Área de Diseño (mm)"
              value={form.designAreaHeight}
              onChange={(value) => {
                updateField("designAreaHeight", value);
                markFieldAsTouched("designAreaHeight");
              }}
              onBlur={() => markFieldAsTouched("designAreaHeight")}
              placeholder="Ej. 200"
              type="number"
            />
          </div>

          {/* Co-printing */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Co-printing?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.coPrinting || ""}
                onChange={(value) => {
                  updateField("coPrinting", value);
                  markFieldAsTouched("coPrinting");
                }}
              />
            </div>
            {form.coPrinting === "Sí" && (
              <FormInput
                label="Códigos a Imprimir"
                value={form.codesToPrint}
                onChange={(value) => {
                  updateField("codesToPrint", value);
                  markFieldAsTouched("codesToPrint");
                }}
                onBlur={() => markFieldAsTouched("codesToPrint")}
                placeholder="Ej. QR, Barcode"
              />
            )}
          </div>

          {/* Sentido de embobinado */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSelect
              label="Sentido de Embobinado"
              value={form.rewindingDirection}
              onChange={(value) => {
                updateField("rewindingDirection", value);
                markFieldAsTouched("rewindingDirection");
              }}
              onBlur={() => markFieldAsTouched("rewindingDirection")}
              options={[
                { value: "Derecha-abajo", label: "Derecha-abajo" },
                { value: "Izquierda-abajo", label: "Izquierda-abajo" },
                { value: "Derecha-arriba", label: "Derecha-arriba" },
                { value: "Izquierda-arriba", label: "Izquierda-arriba" },
              ]}
              placeholder="-- Seleccione Sentido --"
            />
            <FormInput
              label="Referencia Sentido"
              value={form.rewindingDirectionRef}
              onChange={(value) => {
                updateField("rewindingDirectionRef", value);
                markFieldAsTouched("rewindingDirectionRef");
              }}
              onBlur={() => markFieldAsTouched("rewindingDirectionRef")}
              placeholder="Referencia de sentido"
            />
          </div>

          {/* Fotocélula */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Lleva Fotocélula?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasPhotocell || ""}
                onChange={(value) => {
                  updateField("hasPhotocell", value);
                  markFieldAsTouched("hasPhotocell");
                }}
              />
            </div>
            {form.hasPhotocell === "Sí" && (
              <FormSelect
                label="Ubicación Fotocélula"
                value={form.photocellLocation}
                onChange={(value) => {
                  updateField("photocellLocation", value);
                  markFieldAsTouched("photocellLocation");
                }}
                onBlur={() => markFieldAsTouched("photocellLocation")}
                options={[
                  { value: "Superior", label: "Superior" },
                  { value: "Inferior", label: "Inferior" },
                  { value: "Lateral izquierdo", label: "Lateral izquierdo" },
                  { value: "Lateral derecho", label: "Lateral derecho" },
                ]}
                placeholder="-- Seleccione Ubicación --"
              />
            )}
          </div>

          {/* Fotoregistro 1 */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-slate-700 mb-3">Fotoregistro 1</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <FormInput
                label="Ancho (mm)"
                value={form.fr1Width}
                onChange={(value) => updateField("fr1Width", value)}
                placeholder="Ancho"
                type="number"
              />
              <FormInput
                label="Alto (mm)"
                value={form.fr1Height}
                onChange={(value) => updateField("fr1Height", value)}
                placeholder="Alto"
                type="number"
              />
              <FormInput
                label="Margen Derecho (mm)"
                value={form.fr1MarginRight}
                onChange={(value) => updateField("fr1MarginRight", value)}
                placeholder="Derecha"
                type="number"
              />
              <FormInput
                label="Margen Inferior (mm)"
                value={form.fr1MarginBottom}
                onChange={(value) => updateField("fr1MarginBottom", value)}
                placeholder="Inferior"
                type="number"
              />
              <FormInput
                label="Margen Izquierdo (mm)"
                value={form.fr1MarginLeft}
                onChange={(value) => updateField("fr1MarginLeft", value)}
                placeholder="Izquierda"
                type="number"
              />
              <FormInput
                label="Margen Superior (mm)"
                value={form.fr1MarginTop}
                onChange={(value) => updateField("fr1MarginTop", value)}
                placeholder="Superior"
                type="number"
              />
            </div>
          </div>

          {/* Fotoregistro 2 */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-slate-700 mb-3">Fotoregistro 2</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <FormInput
                label="Ancho (mm)"
                value={form.fr2Width}
                onChange={(value) => updateField("fr2Width", value)}
                placeholder="Ancho"
                type="number"
              />
              <FormInput
                label="Alto (mm)"
                value={form.fr2Height}
                onChange={(value) => updateField("fr2Height", value)}
                placeholder="Alto"
                type="number"
              />
              <FormInput
                label="Margen Derecho (mm)"
                value={form.fr2MarginRight}
                onChange={(value) => updateField("fr2MarginRight", value)}
                placeholder="Derecha"
                type="number"
              />
              <FormInput
                label="Margen Inferior (mm)"
                value={form.fr2MarginBottom}
                onChange={(value) => updateField("fr2MarginBottom", value)}
                placeholder="Inferior"
                type="number"
              />
              <FormInput
                label="Margen Izquierdo (mm)"
                value={form.fr2MarginLeft}
                onChange={(value) => updateField("fr2MarginLeft", value)}
                placeholder="Izquierda"
                type="number"
              />
              <FormInput
                label="Margen Superior (mm)"
                value={form.fr2MarginTop}
                onChange={(value) => updateField("fr2MarginTop", value)}
                placeholder="Superior"
                type="number"
              />
            </div>
          </div>
        </div>
      </FormCard>

      {/* Diseño */}
      <FormCard title="Plano de Diseño" icon="📐" color="#0891b2">
        <div className="space-y-4">
          {/* ¿Tiene plano de diseño? */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Tiene plano de diseño?
            </label>
            <SegmentedControl
              options={[
                { value: "Sí", label: "Sí" },
                { value: "No", label: "No" },
              ]}
              value={form.hasDesignPlan || ""}
              onChange={(value) => {
                updateField("hasDesignPlan", value);
                markFieldAsTouched("hasDesignPlan");
              }}
            />
          </div>

        </div>
      </FormCard>
    </div>
  );
}
