import type { ProjectEditFormData } from "../pages/ProductEditPage";
import { PRODUCT_CATALOGS } from "../../../shared/data/productCatalogs";
import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import CommercialExecutiveMultiSearch from "../../../shared/components/forms/CommercialExecutiveMultiSearch";
import PreviewRow from "../../../shared/components/display/PreviewRow";
import LayerComboInputs from "./LayerComboInputs";

type StepProps = {
  form: ProjectEditFormData;
  updateField: (field: keyof ProjectEditFormData, value: string | string[]) => void;
  markFieldAsTouched: (field: keyof ProjectEditFormData) => void;
  getError: (field: keyof ProjectEditFormData) => string;
  inheritedWrapping: string;
  inheritedClient: string;
  inheritedPlant: string;
  inheritedUseFinal: string;
  inheritedMachine: string;
  inheritedSubSegment: string;
  inheritedSegment: string;
  inheritedSector: string;
  inheritedAfMarketId: string;
  classificationOptions: Array<{ value: string; label: string }>;
  modificationReasonOptions: Array<{ value: string; label: string }>;
  shouldShowFieldError: (field: keyof ProjectEditFormData) => boolean;
};

export default function ProductStep0General({
  form,
  updateField,
  markFieldAsTouched,
  getError,
  inheritedWrapping,
  inheritedClient,
  inheritedPlant,
  inheritedUseFinal,
  inheritedMachine,
  inheritedSubSegment,
  inheritedSegment,
  inheritedSector,
  inheritedAfMarketId,
  classificationOptions,
  modificationReasonOptions,
  shouldShowFieldError,
}: StepProps) {
  return (
    <div className="space-y-6">
      {/* Información General */}
      <FormCard title="Información General" icon="📋" color="#2c5aa0">
        <div className="space-y-4">
          {/* Status + Code */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PreviewRow
              label="Estado"
              value={form.status}
            />
            <PreviewRow
              label="Código"
              value={form.code}
            />
          </div>

          {/* Planta, Cliente, Ejecutivo */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PreviewRow label="Planta" value={inheritedPlant} />
            <PreviewRow label="Cliente" value={inheritedClient} />
            <div>
              <CommercialExecutiveMultiSearch
                value={form.executiveId || []}
                onChange={(value) => updateField("executiveId", value as any)}
              />
              {shouldShowFieldError("executiveId") && (
                <p className="text-sm text-red-600 mt-1">{getError("executiveId")}</p>
              )}
            </div>
          </div>

          {/* Clasificación, Motivo Modificación */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSelect
              label="Clasificación"
              value={form.classification}
              onChange={(value) => {
                updateField("classification", value);
                markFieldAsTouched("classification");
              }}
              onBlur={() => markFieldAsTouched("classification")}
              options={classificationOptions}
              placeholder="-- Seleccione Clasificación --"
              disabled={false}
              error={shouldShowFieldError("classification") ? getError("classification") : ""}
            />
            <FormSelect
              label="Motivo/Modificación"
              value={form.motivoModificacion}
              onChange={(value) => {
                updateField("motivoModificacion", value);
                markFieldAsTouched("motivoModificacion");
              }}
              onBlur={() => markFieldAsTouched("motivoModificacion")}
              options={modificationReasonOptions}
              placeholder="-- Seleccione Motivo --"
              disabled={false}
            />
          </div>

          {/* Producto Referencia SKU, Nombre Comercial */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Producto Referencia SKU"
              value={form.approvedProductCode}
              onChange={(value) => {
                updateField("approvedProductCode", value);
                markFieldAsTouched("approvedProductCode");
              }}
              onBlur={() => markFieldAsTouched("approvedProductCode")}
              placeholder="Ej. SKU-001"
              error={shouldShowFieldError("approvedProductCode") ? getError("approvedProductCode") : ""}
            />
            <FormInput
              label="Nombre Producto Comercial"
              value={form.projectName}
              onChange={(value) => {
                updateField("projectName", value);
                markFieldAsTouched("projectName");
              }}
              onBlur={() => markFieldAsTouched("projectName")}
              placeholder="Nombre comercial del producto"
              error={shouldShowFieldError("projectName") ? getError("projectName") : ""}
            />
          </div>

          {/* Descripción breve */}
          <FormTextarea
            label="Descripción breve"
            value={form.projectDescription}
            onChange={(value) => {
              updateField("projectDescription", value);
              markFieldAsTouched("projectDescription");
            }}
            onBlur={() => markFieldAsTouched("projectDescription")}
            placeholder="Breve descripción del producto"
            rows={3}
          />

          {/* Volumen + Unidad */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Volumen/Cantidad"
              value={form.estimatedVolume}
              onChange={(value) => {
                updateField("estimatedVolume", value);
                markFieldAsTouched("estimatedVolume");
              }}
              onBlur={() => markFieldAsTouched("estimatedVolume")}
              placeholder="Ej. 500"
              error={shouldShowFieldError("estimatedVolume") ? getError("estimatedVolume") : ""}
            />
            <FormInput
              label="Unidad de Medida"
              value={form.unitOfMeasure}
              onChange={(value) => {
                updateField("unitOfMeasure", value);
                markFieldAsTouched("unitOfMeasure");
              }}
              onBlur={() => markFieldAsTouched("unitOfMeasure")}
              placeholder="Ej. KG"
            />
          </div>

          {/* Envoltura, Uso Final, Máquina */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PreviewRow label="Envoltura" value={inheritedWrapping} />
            <PreviewRow label="Uso Final" value={inheritedUseFinal} />
            <PreviewRow label="Máquina" value={inheritedMachine} />
          </div>

          {/* Capas Material + Micron */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Estructura de Capas
            </label>
            <LayerComboInputs
              form={form}
              updateField={updateField}
              markFieldAsTouched={markFieldAsTouched}
              shouldShowFieldError={shouldShowFieldError}
              getError={getError}
            />
          </div>

          {/* Estructura calculada, Nombre calculado */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PreviewRow label="Estructura Calculada" value={form.structureType} />
            <PreviewRow label="Nombre Calculado" value={form.projectName} />
          </div>

          {/* Acción Salesforce */}
          <FormInput
            label="Acción Salesforce"
            value={form.salesforceAction}
            onChange={(value) => {
              updateField("salesforceAction", value);
              markFieldAsTouched("salesforceAction");
            }}
            onBlur={() => markFieldAsTouched("salesforceAction")}
            placeholder="Ej. Nueva oportunidad"
          />

          {/* Información adicional cliente */}
          <FormTextarea
            label="Información adicional cliente"
            value={form.customerAdditionalInfo}
            onChange={(value) => {
              updateField("customerAdditionalInfo", value);
              markFieldAsTouched("customerAdditionalInfo");
            }}
            onBlur={() => markFieldAsTouched("customerAdditionalInfo")}
            placeholder="Información adicional del cliente"
            rows={3}
          />
        </div>
      </FormCard>

      {/* Datos de Producto Comercial */}
      <FormCard title="Datos de Producto Comercial" icon="🛍️" color="#7c3aed">
        <div className="space-y-4">
          {/* Campos generales */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSelect
              label="Formato de Plano"
              value={form.blueprintFormat}
              onChange={(value) => {
                updateField("blueprintFormat", value);
                markFieldAsTouched("blueprintFormat");
              }}
              onBlur={() => markFieldAsTouched("blueprintFormat")}
              options={PRODUCT_CATALOGS.formatoDePlano.values.map((val) => ({
                value: val,
                label: val,
              }))}
              placeholder="-- Seleccione Formato --"
            />
            <FormInput
              label="Aplicación Técnica"
              value={form.technicalApplication}
              onChange={(value) => {
                updateField("technicalApplication", value);
                markFieldAsTouched("technicalApplication");
              }}
              onBlur={() => markFieldAsTouched("technicalApplication")}
              placeholder="Ej. Pastoso/Ketchup"
            />
          </div>

          {/* Readonly fields from portfolio */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PreviewRow label="Sub-segmento" value={inheritedSubSegment} />
            <PreviewRow label="Segmento" value={inheritedSegment} />
            <PreviewRow label="Sector" value={inheritedSector} />
            <PreviewRow label="AF Market ID" value={inheritedAfMarketId} />
          </div>

          {/* Editable: Portafolio Estándar, Código Empaque Cliente */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Portafolio Estándar"
              value={form.portafolioEstandar}
              onChange={(value) => {
                updateField("portafolioEstandar", value);
                markFieldAsTouched("portafolioEstandar");
              }}
              onBlur={() => markFieldAsTouched("portafolioEstandar")}
              placeholder="Nombre portafolio"
            />
            <FormInput
              label="Código Empaque Cliente"
              value={form.customerPackingCode}
              onChange={(value) => {
                updateField("customerPackingCode", value);
                markFieldAsTouched("customerPackingCode");
              }}
              onBlur={() => markFieldAsTouched("customerPackingCode")}
              placeholder="Ej. PKG-001"
            />
          </div>

          {/* POUCH fields (show if envoltura === POUCH) */}
          {inheritedWrapping === "POUCH" && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-slate-700 mb-3">Especificaciones POUCH</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSelect
                  label="Familia POUCH"
                  value={form.tipoFamiliaPouch}
                  onChange={(value) => updateField("tipoFamiliaPouch", value)}
                  options={[
                    { value: "Stand Up", label: "Stand Up" },
                    { value: "Flat", label: "Flat" },
                    { value: "Gusseted", label: "Gusseted" },
                  ]}
                  placeholder="-- Seleccione Familia --"
                />
                <FormSelect
                  label="Tipo Stand Up"
                  value={form.tipoStandUpPouch}
                  onChange={(value) => updateField("tipoStandUpPouch", value)}
                  options={[
                    { value: "Clásico", label: "Clásico" },
                    { value: "Ziplock", label: "Ziplock" },
                    { value: "Otro", label: "Otro" },
                  ]}
                  placeholder="-- Seleccione Tipo --"
                />
                <FormSelect
                  label="Forma DoyPack"
                  value={form.formaDoyPackPouch}
                  onChange={(value) => updateField("formaDoyPackPouch", value)}
                  options={[
                    { value: "Rectangular", label: "Rectangular" },
                    { value: "Redondeada", label: "Redondeada" },
                  ]}
                  placeholder="-- Seleccione Forma --"
                />
                <FormSelect
                  label="Tipo Fuelle Stand Up"
                  value={form.tipoFuelleStandUpPouch}
                  onChange={(value) => updateField("tipoFuelleStandUpPouch", value)}
                  options={[
                    { value: "Abierto", label: "Abierto" },
                    { value: "Cerrado", label: "Cerrado" },
                  ]}
                  placeholder="-- Seleccione Tipo --"
                />
                <FormInput
                  label="Cantidad Sellos Pouch Plano"
                  value={form.cantidadSellosPouchPlano}
                  onChange={(value) => updateField("cantidadSellosPouchPlano", value)}
                  placeholder="Ej. 2"
                />
                <FormSelect
                  label="Tendrá Fuelle Sello Central"
                  value={form.tieneFuelleSelloCentralPouch}
                  onChange={(value) => updateField("tieneFuelleSelloCentralPouch", value)}
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  placeholder="-- Seleccione --"
                />
                <FormInput
                  label="Material Sello Central"
                  value={form.materialSelloCentralPouch}
                  onChange={(value) => updateField("materialSelloCentralPouch", value)}
                  placeholder="Ej. PE"
                />
                <FormSelect
                  label="Tipo Sello Fuelle"
                  value={form.tipoSelloEnFuellePouch}
                  onChange={(value) => updateField("tipoSelloEnFuellePouch", value)}
                  options={[
                    { value: "T-Seal", label: "T-Seal" },
                    { value: "C-Seal", label: "C-Seal" },
                    { value: "Otro", label: "Otro" },
                  ]}
                  placeholder="-- Seleccione Tipo --"
                />
              </div>
            </div>
          )}

          {/* BOLSA fields (show if envoltura === BOLSA) */}
          {inheritedWrapping === "BOLSA" && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-slate-700 mb-3">Especificaciones BOLSA</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSelect
                  label="Tipo Presentación"
                  value={form.tipoPresentacionBolsa}
                  onChange={(value) => updateField("tipoPresentacionBolsa", value)}
                  options={[
                    { value: "Bolsa Plana", label: "Bolsa Plana" },
                    { value: "Bolsa con Fuelle", label: "Bolsa con Fuelle" },
                  ]}
                  placeholder="-- Seleccione --"
                />
                <FormSelect
                  label="Tipo Sello"
                  value={form.tipoSelloBolsa}
                  onChange={(value) => updateField("tipoSelloBolsa", value)}
                  options={[
                    { value: "Sello Simple", label: "Sello Simple" },
                    { value: "Sello Doble", label: "Sello Doble" },
                  ]}
                  placeholder="-- Seleccione --"
                />
                <FormSelect
                  label="Acabado"
                  value={form.acabadoBolsa}
                  onChange={(value) => updateField("acabadoBolsa", value)}
                  options={[
                    { value: "Mate", label: "Mate" },
                    { value: "Brillante", label: "Brillante" },
                  ]}
                  placeholder="-- Seleccione --"
                />
                <FormSelect
                  label="Tendrá Fuelle"
                  value={form.tieneFuelleBolsa}
                  onChange={(value) => updateField("tieneFuelleBolsa", value)}
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  placeholder="-- Seleccione --"
                />
                {form.tieneFuelleBolsa === "Sí" && (
                  <FormSelect
                    label="Tipo Fuelle"
                    value={form.tipoFuelleBolsa}
                    onChange={(value) => updateField("tipoFuelleBolsa", value)}
                    options={[
                      { value: "Lateral", label: "Lateral" },
                      { value: "Inferior", label: "Inferior" },
                    ]}
                    placeholder="-- Seleccione --"
                  />
                )}
              </div>
            </div>
          )}

          {/* LÁMINA fields (show if envoltura === LAMINA) */}
          {inheritedWrapping === "LAMINA" && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-slate-700 mb-3">Especificaciones LÁMINA</h4>
              <FormSelect
                label="Tipo Formato Lámina"
                value={form.tipoFormatoLamina}
                onChange={(value) => updateField("tipoFormatoLamina", value)}
                options={[
                  { value: "Pliego", label: "Pliego" },
                  { value: "Rollo", label: "Rollo" },
                ]}
                placeholder="-- Seleccione --"
              />
            </div>
          )}
        </div>
      </FormCard>
    </div>
  );
}
