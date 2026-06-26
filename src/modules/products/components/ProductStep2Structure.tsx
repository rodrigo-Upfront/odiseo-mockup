import type { ProjectEditFormData } from "../pages/ProductEditPage";
import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import SegmentedControl from "../../../shared/components/forms/SegmentedControl";
import CollapsibleSection from "../../../shared/components/forms/CollapsibleSection";
import PreviewRow from "../../../shared/components/display/PreviewRow";
import ProjectDocumentsSection from "./ProjectDocumentsSection";
import { PRODUCT_CATALOGS } from "../../../shared/data/productCatalogs";

type StepProps = {
  form: ProjectEditFormData;
  updateField: (field: keyof ProjectEditFormData, value: string | string[]) => void;
  markFieldAsTouched: (field: keyof ProjectEditFormData) => void;
  getError: (field: keyof ProjectEditFormData) => string;
  shouldShowFieldError: (field: keyof ProjectEditFormData) => boolean;
  inheritedWrapping: string;
};

export default function ProductStep2Structure({
  form,
  updateField,
  markFieldAsTouched,
  getError,
  shouldShowFieldError,
  inheritedWrapping,
}: StepProps) {
  return (
    <div className="space-y-6">
      {/* Especificaciones de Estructura */}
      <CollapsibleSection title="Especificaciones de Estructura" icon="🏗️" defaultOpen={true}>
        <div className="space-y-4">
          {/* Referencia EM, Tipo estructura */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Referencia EM"
              value={form.referenceEmCode}
              onChange={(value) => {
                updateField("referenceEmCode", value);
                markFieldAsTouched("referenceEmCode");
              }}
              onBlur={() => markFieldAsTouched("referenceEmCode")}
              placeholder="Ej. EM-001"
            />
            <FormSelect
              label="Tipo Estructura"
              value={form.structureType}
              onChange={(value) => {
                updateField("structureType", value);
                markFieldAsTouched("structureType");
              }}
              onBlur={() => markFieldAsTouched("structureType")}
              options={PRODUCT_CATALOGS.tipoDeEstructura.values.map((val) => ({
                value: val,
                label: val,
              }))}
              placeholder="-- Seleccione Tipo --"
            />
          </div>

          {/* Gramaje, Tolerancia */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PreviewRow label="Gramaje Calculado" value={form.grammage} />
            <FormInput
              label="Tolerancia Gramaje"
              value={form.grammageTolerance}
              onChange={(value) => {
                updateField("grammageTolerance", value);
                markFieldAsTouched("grammageTolerance");
              }}
              onBlur={() => markFieldAsTouched("grammageTolerance")}
              placeholder="Ej. ±5%"
            />
          </div>

          {/* ¿Solicitud de Muestra? */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ¿Solicitud de Muestra?
            </label>
            <SegmentedControl
              options={[
                { value: "Sí", label: "Sí" },
                { value: "No", label: "No" },
              ]}
              value={form.sampleRequest || ""}
              onChange={(value) => {
                updateField("sampleRequest", value);
                markFieldAsTouched("sampleRequest");
              }}
            />
          </div>

          {/* Comentarios estructura */}
          <FormTextarea
            label="Comentarios Estructura"
            value={form.specialStructureSpecs}
            onChange={(value) => {
              updateField("specialStructureSpecs", value);
              markFieldAsTouched("specialStructureSpecs");
            }}
            onBlur={() => markFieldAsTouched("specialStructureSpecs")}
            placeholder="Comentarios sobre la estructura"
            rows={3}
          />
        </div>
      </CollapsibleSection>

      {/* Dimensiones y Accesorios */}
      <CollapsibleSection title="Dimensiones y Accesorios" icon="📏" defaultOpen={true}>
        <div className="space-y-4">
          {/* Dimensiones básicas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormInput
              label="Ancho (mm)"
              value={form.width}
              onChange={(value) => {
                updateField("width", value);
                markFieldAsTouched("width");
              }}
              onBlur={() => markFieldAsTouched("width")}
              placeholder="Ancho"
              type="number"
            />
            <FormInput
              label="Largo (mm)"
              value={form.length}
              onChange={(value) => {
                updateField("length", value);
                markFieldAsTouched("length");
              }}
              onBlur={() => markFieldAsTouched("length")}
              placeholder="Largo"
              type="number"
            />
            <FormInput
              label="Repetición"
              value={form.repetition}
              onChange={(value) => {
                updateField("repetition", value);
                markFieldAsTouched("repetition");
              }}
              onBlur={() => markFieldAsTouched("repetition")}
              placeholder="Repetición"
            />
          </div>

          {/* POUCH DoyPack */}
          {inheritedWrapping === "POUCH" && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-slate-700 mb-3">DoyPack POUCH</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput
                  label="Base DoyPack (mm)"
                  value={form.doyPackBase}
                  onChange={(value) => updateField("doyPackBase", value)}
                  placeholder="Base"
                  type="number"
                />
                <FormInput
                  label="Repetición Exacta DoyPack"
                  value={form.doyPackRepeticionExacta}
                  onChange={(value) => updateField("doyPackRepeticionExacta", value)}
                  placeholder="Ej. 500"
                />
                <FormInput
                  label="Tolerancia Rep Exacta"
                  value={form.toleranciaRepExactaDoyPack}
                  onChange={(value) => updateField("toleranciaRepExactaDoyPack", value)}
                  placeholder="Ej. ±2%"
                />
                <FormInput
                  label="Tolerancia Repetición"
                  value={form.toleranciaRepDoyPack}
                  onChange={(value) => updateField("toleranciaRepDoyPack", value)}
                  placeholder="Ej. ±3%"
                />
                <FormInput
                  label="Ancho Fuelle (mm)"
                  value={form.gussetWidth}
                  onChange={(value) => updateField("gussetWidth", value)}
                  placeholder="Ancho fuelle"
                  type="number"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fuelle Cerrado
                  </label>
                  <SegmentedControl
                    options={[
                      { value: "Sí", label: "Sí" },
                      { value: "No", label: "No" },
                    ]}
                    value={form.fuelleCerrado || ""}
                    onChange={(value) => updateField("fuelleCerrado", value)}
                  />
                </div>
                <FormInput
                  label="Sello Ancho Lateral (mm)"
                  value={form.selloAnchoLateral}
                  onChange={(value) => updateField("selloAnchoLateral", value)}
                  placeholder="Ancho lateral"
                  type="number"
                />
              </div>
            </div>
          )}

          {/* Microperforado */}
          <div className="border-t pt-4 mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Microperforado?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasMicroperforado || ""}
                onChange={(value) => {
                  updateField("hasMicroperforado", value);
                  markFieldAsTouched("hasMicroperforado");
                }}
              />
            </div>
            {form.hasMicroperforado === "Sí" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSelect
                  label="Lado Microperforado"
                  value={form.ladoMicroperforado}
                  onChange={(value) => updateField("ladoMicroperforado", value)}
                  options={[
                    { value: "Izquierdo", label: "Izquierdo" },
                    { value: "Derecho", label: "Derecho" },
                    { value: "Ambos", label: "Ambos" },
                  ]}
                  placeholder="-- Seleccione Lado --"
                />
                <FormInput
                  label="Separación Púas (mm)"
                  value={form.separacionPuas}
                  onChange={(value) => updateField("separacionPuas", value)}
                  placeholder="Separación"
                  type="number"
                />
                {inheritedWrapping === "POUCH" && (
                  <FormInput
                    label="Dist. Lado Pouch (mm)"
                    value={form.distanciaLadoPouch}
                    onChange={(value) => updateField("distanciaLadoPouch", value)}
                    placeholder="Distancia"
                    type="number"
                  />
                )}
              </div>
            )}
          </div>

          {/* Accesorios Consumibles Básicos */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-slate-700 mb-3">Accesorios Consumibles</h4>

            {/* Zipper */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Zipper?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasZipper || ""}
                onChange={(value) => {
                  updateField("hasZipper", value);
                  markFieldAsTouched("hasZipper");
                }}
              />
            </div>
            {form.hasZipper === "Sí" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4 pl-4 border-l-4 border-blue-300">
                <FormSelect
                  label="Tipo Zipper"
                  value={form.zipperType}
                  onChange={(value) => updateField("zipperType", value)}
                  options={[
                    { value: "Standard", label: "Standard" },
                    { value: "Slider", label: "Slider" },
                  ]}
                  placeholder="-- Seleccione Tipo --"
                />
                <FormInput
                  label="Dist. Boca a Zipper (mm)"
                  value={form.distanciaAbocaZipper}
                  onChange={(value) => updateField("distanciaAbocaZipper", value)}
                  placeholder="Distancia"
                  type="number"
                />
              </div>
            )}

            {/* Válvula */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Válvula?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasValve || ""}
                onChange={(value) => {
                  updateField("hasValve", value);
                  markFieldAsTouched("hasValve");
                }}
              />
            </div>
            {form.hasValve === "Sí" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4 pl-4 border-l-4 border-blue-300">
                <FormSelect
                  label="Tipo Válvula"
                  value={form.valveType}
                  onChange={(value) => updateField("valveType", value)}
                  options={[
                    { value: "Valve 1", label: "Valve 1" },
                    { value: "Valve 2", label: "Valve 2" },
                  ]}
                  placeholder="-- Seleccione Tipo --"
                />
                <FormInput
                  label="Dist. Boca a Válvula (mm)"
                  value={form.distanciaAbocaValvula}
                  onChange={(value) => updateField("distanciaAbocaValvula", value)}
                  placeholder="Distancia"
                  type="number"
                />
              </div>
            )}

            {/* Riñonera */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Riñonera?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasRiñonera || ""}
                onChange={(value) => updateField("hasRiñonera", value)}
              />
            </div>
          </div>

          {/* BOLSA — Wicket */}
          {inheritedWrapping === "BOLSA" && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-slate-700 mb-3">Especificaciones BOLSA - Wicket</h4>

              {/* Wicket */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Wicket?
                </label>
                <SegmentedControl
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  value={form.hasWicket || ""}
                  onChange={(value) => {
                    updateField("hasWicket", value);
                    markFieldAsTouched("hasWicket");
                  }}
                />
              </div>
              {form.hasWicket === "Sí" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4 pl-4 border-l-4 border-purple-300">
                  <FormInput
                    label="Diámetro Wicket (mm)"
                    value={form.wicketDiameter}
                    onChange={(value) => updateField("wicketDiameter", value)}
                    placeholder="Diámetro"
                    type="number"
                  />
                  <FormInput
                    label="Dist. Superior (mm)"
                    value={form.wicketDistSuperior}
                    onChange={(value) => updateField("wicketDistSuperior", value)}
                    placeholder="Superior"
                    type="number"
                  />
                  <FormInput
                    label="Dist. Derecho (mm)"
                    value={form.wicketDistDerecho}
                    onChange={(value) => updateField("wicketDistDerecho", value)}
                    placeholder="Derecho"
                    type="number"
                  />
                </div>
              )}

              {/* Wicket Control */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Wicket Control?
                </label>
                <SegmentedControl
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  value={form.hasWicketControl || ""}
                  onChange={(value) => updateField("hasWicketControl", value)}
                />
              </div>
              {form.hasWicketControl === "Sí" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4 pl-4 border-l-4 border-purple-300">
                  <FormInput
                    label="Diámetro Control (mm)"
                    value={form.wicketControlDiameter}
                    onChange={(value) => updateField("wicketControlDiameter", value)}
                    placeholder="Diámetro"
                    type="number"
                  />
                  <FormSelect
                    label="Ubicación Control"
                    value={form.wicketControlUbicacion}
                    onChange={(value) => updateField("wicketControlUbicacion", value)}
                    options={[
                      { value: "Superior", label: "Superior" },
                      { value: "Inferior", label: "Inferior" },
                      { value: "Lateral", label: "Lateral" },
                    ]}
                    placeholder="-- Seleccione --"
                  />
                  <FormInput
                    label="Dist. Superior (mm)"
                    value={form.wicketControlDistSuperior}
                    onChange={(value) => updateField("wicketControlDistSuperior", value)}
                    placeholder="Superior"
                    type="number"
                  />
                </div>
              )}

              {/* Ancho Solapa */}
              <div className="mb-4">
                <FormInput
                  label="Ancho Solapa (mm)"
                  value={form.anchoSolapa}
                  onChange={(value) => updateField("anchoSolapa", value)}
                  placeholder="Ancho"
                  type="number"
                />
              </div>

              {/* Corte Aliviador */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Corte Aliviador?
                </label>
                <SegmentedControl
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  value={form.hasCortaAliviador || ""}
                  onChange={(value) => updateField("hasCortaAliviador", value)}
                />
              </div>
              {form.hasCortaAliviador === "Sí" && (
                <div className="mb-4 pl-4 border-l-4 border-purple-300">
                  <FormInput
                    label="Dist. Derecho (mm)"
                    value={form.cortaAliviadorDistDerecho}
                    onChange={(value) => updateField("cortaAliviadorDistDerecho", value)}
                    placeholder="Distancia"
                    type="number"
                  />
                </div>
              )}

              {/* Dispensador */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Dispensador?
                </label>
                <SegmentedControl
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  value={form.hasDispensador || ""}
                  onChange={(value) => updateField("hasDispensador", value)}
                />
              </div>
              {form.hasDispensador === "Sí" && (
                <div className="mb-4 pl-4 border-l-4 border-purple-300">
                  <FormInput
                    label="Dist. Izquierdo (mm)"
                    value={form.dispensadorDistIzquierdo}
                    onChange={(value) => updateField("dispensadorDistIzquierdo", value)}
                    placeholder="Distancia"
                    type="number"
                  />
                </div>
              )}

              {/* Fotocélula Bolsa Wicket */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Fotocélula Bolsa Wicket?
                </label>
                <SegmentedControl
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  value={form.hasFotocelulaBolsaWicket || ""}
                  onChange={(value) => updateField("hasFotocelulaBolsaWicket", value)}
                />
              </div>

              {/* Precorte Wicket */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Precorte Wicket?
                </label>
                <SegmentedControl
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                  value={form.hasPrecorteWicket || ""}
                  onChange={(value) => updateField("hasPrecorteWicket", value)}
                />
              </div>
              {form.hasPrecorteWicket === "Sí" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pl-4 border-l-4 border-purple-300">
                  <FormInput
                    label="Largo Precorte (mm)"
                    value={form.precorteWicketLargo}
                    onChange={(value) => updateField("precorteWicketLargo", value)}
                    placeholder="Largo"
                    type="number"
                  />
                  <FormSelect
                    label="Ubicación"
                    value={form.precorteWicketUbicacion}
                    onChange={(value) => updateField("precorteWicketUbicacion", value)}
                    options={[
                      { value: "Superior", label: "Superior" },
                      { value: "Inferior", label: "Inferior" },
                    ]}
                    placeholder="-- Seleccione --"
                  />
                  <FormInput
                    label="Dist. Derecho (mm)"
                    value={form.precorteWicketDistDerecho}
                    onChange={(value) => updateField("precorteWicketDistDerecho", value)}
                    placeholder="Distancia"
                    type="number"
                  />
                </div>
              )}
            </div>
          )}

          {/* Accesorios Internos */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-slate-700 mb-3">Accesorios Internos</h4>

            {/* Corte Angular */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Corte Angular?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasAngularCut || ""}
                onChange={(value) => updateField("hasAngularCut", value)}
              />
            </div>
            {form.hasAngularCut === "Sí" && (
              <div className="mb-4 pl-4 border-l-4 border-green-300">
                <FormSelect
                  label="Lado Corte Angular"
                  value={form.ladoCorteAngular}
                  onChange={(value) => updateField("ladoCorteAngular", value)}
                  options={[
                    { value: "Izquierdo", label: "Izquierdo" },
                    { value: "Derecho", label: "Derecho" },
                    { value: "Ambos", label: "Ambos" },
                  ]}
                  placeholder="-- Seleccione Lado --"
                />
              </div>
            )}

            {/* Esquinas Redondas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Esquinas Redondas?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasRoundedCorners || ""}
                onChange={(value) => updateField("hasRoundedCorners", value)}
              />
            </div>
            {form.hasRoundedCorners === "Sí" && (
              <div className="mb-4 pl-4 border-l-4 border-green-300">
                <FormSelect
                  label="Tipo Esquinas Redondas"
                  value={form.roundedCornersType}
                  onChange={(value) => updateField("roundedCornersType", value)}
                  options={[
                    { value: "Radio pequeño", label: "Radio pequeño" },
                    { value: "Radio estándar", label: "Radio estándar" },
                    { value: "Radio grande", label: "Radio grande" },
                  ]}
                  placeholder="-- Seleccione Tipo --"
                />
              </div>
            )}

            {/* Muesca */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Muesca?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasNotch || ""}
                onChange={(value) => updateField("hasNotch", value)}
              />
            </div>
            {form.hasNotch === "Sí" && (
              <div className="mb-4 pl-4 border-l-4 border-green-300">
                <FormInput
                  label="Dist. Boca a Muesca (mm)"
                  value={form.distanciaAbocaMuesca}
                  onChange={(value) => updateField("distanciaAbocaMuesca", value)}
                  placeholder="Distancia"
                  type="number"
                />
              </div>
            )}

            {/* Perforación */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Perforación?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasPerforation || ""}
                onChange={(value) => updateField("hasPerforation", value)}
              />
            </div>
            {form.hasPerforation === "Sí" && (
              <div className="pl-4 border-l-4 border-green-300 mb-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormInput
                    label="Dist. Boca a Perforación (mm)"
                    value={form.distanciaAbocaPerforacion}
                    onChange={(value) => updateField("distanciaAbocaPerforacion", value)}
                    placeholder="Distancia"
                    type="number"
                  />

                  {inheritedWrapping === "POUCH" && (
                    <>
                      <FormSelect
                        label="Tipo Perf Pouch Sello Central"
                        value={form.tipoPerfPouchSelloCentral}
                        onChange={(value) => updateField("tipoPerfPouchSelloCentral", value)}
                        options={[
                          { value: "Ojal", label: "Ojal" },
                          { value: "Circular", label: "Circular" },
                          { value: "Europunch", label: "Europunch" },
                        ]}
                        placeholder="-- Seleccione Tipo --"
                      />
                    </>
                  )}

                  {inheritedWrapping === "BOLSA" && (
                    <>
                      <FormSelect
                        label="Tipo Perf Fuelle Bolsa"
                        value={form.tipoPerfFuelleBolsaWicket}
                        onChange={(value) => updateField("tipoPerfFuelleBolsaWicket", value)}
                        options={[
                          { value: "Cruz", label: "Cruz" },
                          { value: "Media luna", label: "Media luna" },
                        ]}
                        placeholder="-- Seleccione Tipo --"
                      />
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Perforación para aire
                    </label>
                    <SegmentedControl
                      options={[
                        { value: "Sí", label: "Sí" },
                        { value: "No", label: "No" },
                      ]}
                      value={form.perforacionParaAire || ""}
                      onChange={(value) => updateField("perforacionParaAire", value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Perforación fuga aire
                    </label>
                    <SegmentedControl
                      options={[
                        { value: "Sí", label: "Sí" },
                        { value: "No", label: "No" },
                      ]}
                      value={form.perforacionFugaAire || ""}
                      onChange={(value) => updateField("perforacionFugaAire", value)}
                    />
                  </div>

                  <FormInput
                    label="Dist. Margen Superior Perf. (mm)"
                    value={form.distMargenSuperiorPerforacion}
                    onChange={(value) => updateField("distMargenSuperiorPerforacion", value)}
                    placeholder="Distancia"
                    type="number"
                  />

                  {(form.gussetWidth || form.tieneFuelleBolsa === "Sí") && (
                    <FormInput
                      label="Dist. Fuelle Perf. (mm)"
                      value={form.distFuellePerforacion}
                      onChange={(value) => updateField("distFuellePerforacion", value)}
                      placeholder="Distancia"
                      type="number"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Pre-Corte */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Pre-Corte?
              </label>
              <SegmentedControl
                options={[
                  { value: "Sí", label: "Sí" },
                  { value: "No", label: "No" },
                ]}
                value={form.hasPreCut || ""}
                onChange={(value) => updateField("hasPreCut", value)}
              />
            </div>
            {form.hasPreCut === "Sí" && (
              <div className="pl-4 border-l-4 border-green-300">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
                  <FormSelect
                    label="Tipo Pre-Corte"
                    value={form.preCutType}
                    onChange={(value) => updateField("preCutType", value)}
                    options={[
                      { value: "Type A", label: "Type A" },
                      { value: "Type B", label: "Type B" },
                    ]}
                    placeholder="-- Seleccione Tipo --"
                  />
                  <FormInput
                    label="Dist. Boca a Precorte (mm)"
                    value={form.distanciaAbocaPrecorte}
                    onChange={(value) => updateField("distanciaAbocaPrecorte", value)}
                    placeholder="Distancia"
                    type="number"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Precorte/Abre Fácil en Fuelle
                  </label>
                  <SegmentedControl
                    options={[
                      { value: "Sí", label: "Sí" },
                      { value: "No", label: "No" },
                    ]}
                    value={form.precutFuelleAbreFacil || ""}
                    onChange={(value) => updateField("precutFuelleAbreFacil", value)}
                  />
                </div>

                {form.precutFuelleAbreFacil === "Sí" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Precorte/Abre Fácil en Fuelle a 10mm
                    </label>
                    <SegmentedControl
                      options={[
                        { value: "Sí", label: "Sí" },
                        { value: "No", label: "No" },
                      ]}
                      value={form.precutFuelleA10mm || ""}
                      onChange={(value) => updateField("precutFuelleA10mm", value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* TUCO/CORE (solo LAMINA) */}
      {inheritedWrapping === "LAMINA" && (
        <CollapsibleSection title="Tuco/Core" icon="🔄" defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormSelect
                label="Material Core"
                value={form.coreMaterial}
                onChange={(value) => updateField("coreMaterial", value)}
                options={[
                  { value: "Cartón", label: "Cartón" },
                  { value: "Plástico", label: "Plástico" },
                  { value: "Acero", label: "Acero" },
                ]}
                placeholder="-- Seleccione Material --"
              />
              <FormInput
                label="Diámetro Core (mm)"
                value={form.coreDiameter}
                onChange={(value) => updateField("coreDiameter", value)}
                placeholder="Diámetro"
                type="number"
              />
              <FormInput
                label="Diámetro Externo (mm)"
                value={form.externalDiameter}
                onChange={(value) => updateField("externalDiameter", value)}
                placeholder="Diámetro externo"
                type="number"
              />
              <FormInput
                label="Variaciones (+/-)"
                value={form.externalVariationPlus}
                onChange={(value) => updateField("externalVariationPlus", value)}
                placeholder="Variación"
              />
              <FormInput
                label="Peso Máx Rollo (kg)"
                value={form.maxRollWeight}
                onChange={(value) => updateField("maxRollWeight", value)}
                placeholder="Peso máximo"
              />
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Especificación Técnica del Cliente */}
      <CollapsibleSection title="Especificación Técnica del Cliente" icon="📄" defaultOpen={true}>
        <ProjectDocumentsSection
          form={form}
          updateField={updateField}
          markFieldAsTouched={markFieldAsTouched}
        />
      </CollapsibleSection>

      {/* Embalaje y Empalmes */}
      <CollapsibleSection title="Embalaje y Empalmes" icon="📦" defaultOpen={false}>
        <div className="space-y-4">
          {/* Embalaje de Material */}
          <FormSelect
            label="Embalaje de material"
            value={form.materialPackaging}
            onChange={(value) => {
              updateField("materialPackaging", value);
              markFieldAsTouched("materialPackaging");
            }}
            onBlur={() => markFieldAsTouched("materialPackaging")}
            options={[
              { value: "Caja de cartón", label: "Caja de cartón" },
              { value: "Bolsa de polietileno", label: "Bolsa de polietileno" },
              { value: "Film retráctil", label: "Film retráctil" },
              { value: "Pallet", label: "Pallet" },
            ]}
            placeholder="-- Seleccione Embalaje de material --"
          />

          {/* Embalaje de Material Especial */}
          <FormTextarea
            label="Embalaje de material especial"
            value={form.specialMaterialPackaging}
            onChange={(value) => {
              updateField("specialMaterialPackaging", value);
              markFieldAsTouched("specialMaterialPackaging");
            }}
            onBlur={() => markFieldAsTouched("specialMaterialPackaging")}
            placeholder="Especifique condiciones especiales de embalaje"
            rows={3}
          />

          {/* Embalaje de Productos de Exportación */}
          <FormSelect
            label="Embalaje de Productos de Exportación"
            value={form.exportProductPackaging}
            onChange={(value) => {
              updateField("exportProductPackaging", value);
              markFieldAsTouched("exportProductPackaging");
            }}
            onBlur={() => markFieldAsTouched("exportProductPackaging")}
            options={[
              { value: "Caja de exportación", label: "Caja de exportación" },
              { value: "Contenedor hermético", label: "Contenedor hermético" },
              { value: "Film protector", label: "Film protector" },
              { value: "No aplica", label: "No aplica" },
            ]}
            placeholder="-- Seleccione Embalaje de Exportación --"
          />

          {/* Empalmes */}
          <FormSelect
            label="Empalmes"
            value={form.splices}
            onChange={(value) => {
              updateField("splices", value);
              markFieldAsTouched("splices");
            }}
            onBlur={() => markFieldAsTouched("splices")}
            options={[
              { value: "Sin empalmes", label: "Sin empalmes" },
              { value: "Empalme simple", label: "Empalme simple" },
              { value: "Empalme reforzado", label: "Empalme reforzado" },
              { value: "Empalme adhesivo", label: "Empalme adhesivo" },
            ]}
            placeholder="-- Seleccione Tipo de Empalmes --"
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
