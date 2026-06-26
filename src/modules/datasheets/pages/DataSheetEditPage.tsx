import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageModuleHeader from "../../../shared/components/layout/PageModuleHeader";
import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import FormActionButtons from "../../../shared/components/forms/FormActionButtons";

interface DataSheet {
  id: string;
  code: string;
  name: string;
  category: string;
  material: string;
  dimensions: string;
  description?: string;
  specifications?: string;
  status: "Activo" | "Inactivo";
}

const MOCK_DATASHEETS: DataSheet[] = [
  {
    id: "1",
    code: "DS-000001",
    name: "Doy Pack 250ml Mayonesa",
    category: "Empaque Flexible",
    material: "PET/PE",
    dimensions: "120x180mm",
    description: "Doy pack para mayonesa de 250ml con sello doy pack",
    specifications: "Espesor: 120 micras, Impresión: 8 colores",
    status: "Activo",
  },
  {
    id: "2",
    code: "DS-000002",
    name: "Bolsa 500g Café",
    category: "Empaque Flexible",
    material: "Aluminio/PET",
    dimensions: "150x250mm",
    description: "Bolsa trilaminada para café molido",
    specifications: "Barrera alta de oxígeno, Válvula desgasificadora",
    status: "Activo",
  },
  {
    id: "3",
    code: "DS-000003",
    name: "Etiqueta 1L Shampoo",
    category: "Etiquetas",
    material: "BOPP",
    dimensions: "80x120mm",
    description: "Etiqueta autoadhesiva para botella de shampoo",
    specifications: "Adhesivo permanente, Resistente al agua",
    status: "Activo",
  },
];

const CATEGORIES = [
  "Empaque Flexible",
  "Empaque Rígido",
  "Etiquetas",
  "Film Termoencogible",
  "Láminas",
];

const MATERIALS = [
  "PET/PE",
  "Aluminio/PET",
  "BOPP",
  "PE",
  "PVC",
  "PET",
  "PP",
  "Compuesto",
];

type DataSheetFormData = {
  name: string;
  category: string;
  material: string;
  dimensions: string;
  description: string;
  specifications: string;
  status: "Activo" | "Inactivo";
};

export default function DataSheetEditPage() {
  const navigate = useNavigate();
  const { datasheetId } = useParams<{ datasheetId: string }>();

  const [form, setForm] = useState<DataSheetFormData | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof DataSheetFormData, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasheetId) {
      setError("Código de ficha no válido");
      setLoading(false);
      return;
    }

    const sheet = MOCK_DATASHEETS.find((d) => d.code === datasheetId);
    if (!sheet) {
      setError(`Ficha con código ${datasheetId} no encontrada`);
      setLoading(false);
      return;
    }

    setForm({
      name: sheet.name,
      category: sheet.category,
      material: sheet.material,
      dimensions: sheet.dimensions,
      description: sheet.description || "",
      specifications: sheet.specifications || "",
      status: sheet.status,
    });
    setLoading(false);
  }, [datasheetId]);

  const validationErrors = (() => {
    if (!form) return {};
    const errors: Partial<Record<keyof DataSheetFormData, string>> = {};

    if (!form.name.trim()) errors.name = "Ingresa el nombre de la ficha.";
    if (!form.category) errors.category = "Selecciona una categoría.";
    if (!form.material) errors.material = "Selecciona un material.";
    if (!form.dimensions.trim()) errors.dimensions = "Ingresa las dimensiones.";

    return errors;
  })();

  const validationErrorList = Object.values(validationErrors).filter(Boolean) as string[];

  const updateField = (field: keyof DataSheetFormData, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const markFieldAsTouched = (field: keyof DataSheetFormData) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const shouldShowFieldError = (field: keyof DataSheetFormData) => {
    return Boolean(validationErrors[field] && (submitAttempted || touchedFields[field]));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(validationErrors).length > 0) {
      setTouchedFields({
        name: true,
        category: true,
        material: true,
        dimensions: true,
      });
      return;
    }

    navigate("/datasheets");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando ficha...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">{error || "Error cargando ficha"}</div>
        <button
          onClick={() => navigate("/datasheets")}
          className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium"
        >
          Volver a Fichas
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <PageModuleHeader
        title="Editar Ficha de Producto"
        backButton={{ onClick: () => navigate("/datasheets"), label: "Volver" }}
        breadcrumbs={[
          { label: "Fichas", href: "/datasheets" },
          { label: datasheetId || "" },
          { label: "Editar" },
        ]}
        badges={
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            Edición
          </span>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto">
          <FormCard title="Información General" icon="📋" color="#00395A" required>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInput
                label="Nombre de la Ficha *"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                onBlur={() => markFieldAsTouched("name")}
                error={shouldShowFieldError("name") ? validationErrors.name : ""}
                placeholder="Ej. Doy Pack 250ml Mayonesa"
              />

              <FormSelect
                label="Categoría *"
                value={form.category}
                onChange={(value) => updateField("category", value)}
                onBlur={() => markFieldAsTouched("category")}
                error={shouldShowFieldError("category") ? validationErrors.category : ""}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                placeholder="-- Seleccione --"
              />

              <FormSelect
                label="Material *"
                value={form.material}
                onChange={(value) => updateField("material", value)}
                onBlur={() => markFieldAsTouched("material")}
                error={shouldShowFieldError("material") ? validationErrors.material : ""}
                options={MATERIALS.map((m) => ({ value: m, label: m }))}
                placeholder="-- Seleccione --"
              />

              <FormInput
                label="Dimensiones *"
                value={form.dimensions}
                onChange={(value) => updateField("dimensions", value)}
                onBlur={() => markFieldAsTouched("dimensions")}
                error={shouldShowFieldError("dimensions") ? validationErrors.dimensions : ""}
                placeholder="Ej. 120x180mm"
              />

              <FormSelect
                label="Estado"
                value={form.status}
                onChange={(value) => updateField("status", value as "Activo" | "Inactivo")}
                options={[
                  { value: "Activo", label: "Activo" },
                  { value: "Inactivo", label: "Inactivo" },
                ]}
              />
            </div>
          </FormCard>

          <div className="mt-5">
            <FormCard title="Detalles Técnicos" icon="⚙️" color="#00A1DE">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextarea
                  label="Descripción"
                  value={form.description}
                  onChange={(value) => updateField("description", value)}
                  placeholder="Descripción detallada del producto..."
                  helper="Opcional"
                />

                <FormTextarea
                  label="Especificaciones Técnicas"
                  value={form.specifications}
                  onChange={(value) => updateField("specifications", value)}
                  placeholder="Especificaciones técnicas del producto..."
                  helper="Opcional"
                />
              </div>
            </FormCard>
          </div>
        </div>

        <div className="sticky bottom-0 z-40 mt-6 border-t border-slate-200 bg-[#f6f8fb]/95 py-4 backdrop-blur">
          <FormActionButtons
            onCancel={() => navigate("/datasheets")}
            validationErrorList={validationErrorList}
            submitAttempted={submitAttempted}
            submitLabel="Guardar Cambios"
            cancelLabel="Cancelar"
            validationTitle="Faltan campos obligatorios para actualizar la ficha."
          />
        </div>
      </form>
    </div>
  );
}
