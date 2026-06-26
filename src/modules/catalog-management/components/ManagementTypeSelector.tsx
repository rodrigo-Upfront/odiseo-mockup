import type { ManagementType } from "../types/catalogRestriction.types";
import FormCard from "../../../shared/components/forms/FormCard";

interface ManagementTypeSelectorProps {
  value: ManagementType;
  onChange: (type: ManagementType) => void;
}

export default function ManagementTypeSelector({
  value,
  onChange,
}: ManagementTypeSelectorProps) {
  return (
    <FormCard title="Tipo de Gestión" icon="📋" color="#7E3FB2" required>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="managementType"
            value="catalog"
            checked={value === "catalog"}
            onChange={(e) => onChange(e.target.value as ManagementType)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-slate-700">Catálogos</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="managementType"
            value="restriction"
            checked={value === "restriction"}
            onChange={(e) => onChange(e.target.value as ManagementType)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-slate-700">Restricciones</span>
        </label>
      </div>
    </FormCard>
  );
}
