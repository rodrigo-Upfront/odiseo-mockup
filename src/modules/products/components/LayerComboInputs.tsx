import type { ProjectEditFormData } from "../pages/ProductEditPage";
import FormSelect from "../../../shared/components/forms/FormSelect";

const MATERIAL_MICRON_CONFIG: Record<
  string,
  {
    label: string;
    micronOptions?: string[];
    defaultMicron?: string;
  }
> = {
  BOPP: { label: "BOPP", micronOptions: ["13.5", "15", "17", "20", "25", "27", "30", "35"] },
  "PET - Cristal": { label: "PET - Cristal", micronOptions: ["10", "12"], defaultMicron: "12" },
  "PET - Opaco": { label: "PET - Opaco", micronOptions: ["10", "12"], defaultMicron: "12" },
  BOPA: { label: "BOPA / Nylon", micronOptions: ["15"], defaultMicron: "15" },
  PAPEL: { label: "Papel", micronOptions: ["40", "60", "70"] },
  COEX: { label: "COEX", micronOptions: [] },
  ALU: { label: "Aluminio / Foil", micronOptions: ["7", "8", "9"], defaultMicron: "7" },
  AMPRIMA: { label: "AmPrima", micronOptions: ["25"] },
  "PP Cast": { label: "PP Cast", micronOptions: ["20", "25", "30", "60"] },
  "PE - PEBD": { label: "PE - PEBD", micronOptions: ["70", "80", "90"] },
  "PE Sellante": { label: "PE Sellante", micronOptions: ["70", "80", "90"], defaultMicron: "80" },
  TERMOFORMADOS: { label: "Termoformados", micronOptions: ["75", "90", "100", "110", "150", "178", "200"] },
};

const MATERIAL_OPTIONS = Object.entries(MATERIAL_MICRON_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

const getMicronOptionsByMaterial = (material: string): string[] => {
  return MATERIAL_MICRON_CONFIG[material]?.micronOptions ?? [];
};

const getDefaultMicronByMaterial = (material: string): string => {
  return MATERIAL_MICRON_CONFIG[material]?.defaultMicron ?? "";
};

type LayerComboInputsProps = {
  form: ProjectEditFormData;
  updateField: (field: keyof ProjectEditFormData, value: string) => void;
  markFieldAsTouched: (field: keyof ProjectEditFormData) => void;
  shouldShowFieldError: (field: keyof ProjectEditFormData) => boolean;
  getError: (field: keyof ProjectEditFormData) => string;
};

export default function LayerComboInputs({
  form,
  updateField,
  markFieldAsTouched,
  shouldShowFieldError,
  getError,
}: LayerComboInputsProps) {
  const layers = [1, 2, 3, 4] as const;
  const micronOptions = (layer: number) => {
    const material = form[`layer${layer}Material` as keyof ProjectEditFormData] as string;
    return getMicronOptionsByMaterial(material).map((m) => ({
      value: m,
      label: m,
    }));
  };

  return (
    <div className="space-y-4">
      {layers.map((layer) => (
        <div key={layer} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormSelect
            label={`Capa ${layer} - Material`}
            value={form[`layer${layer}Material` as keyof ProjectEditFormData] as string}
            onChange={(value) => {
              updateField(`layer${layer}Material` as keyof ProjectEditFormData, value);
              markFieldAsTouched(`layer${layer}Material` as keyof ProjectEditFormData);
              // Reset micron if material changes
              const defaultMicron = getDefaultMicronByMaterial(value);
              if (defaultMicron) {
                updateField(`layer${layer}Micron` as keyof ProjectEditFormData, defaultMicron);
              }
            }}
            onBlur={() => markFieldAsTouched(`layer${layer}Material` as keyof ProjectEditFormData)}
            options={MATERIAL_OPTIONS}
            placeholder="-- Seleccione Material --"
          />
          <FormSelect
            label={`Capa ${layer} - Micrón`}
            value={form[`layer${layer}Micron` as keyof ProjectEditFormData] as string}
            onChange={(value) => {
              updateField(`layer${layer}Micron` as keyof ProjectEditFormData, value);
              markFieldAsTouched(`layer${layer}Micron` as keyof ProjectEditFormData);
            }}
            onBlur={() => markFieldAsTouched(`layer${layer}Micron` as keyof ProjectEditFormData)}
            options={micronOptions(layer)}
            placeholder="-- Seleccione Micrón --"
            disabled={!form[`layer${layer}Material` as keyof ProjectEditFormData]}
          />
        </div>
      ))}
    </div>
  );
}
