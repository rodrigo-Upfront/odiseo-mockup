import FormCard from "../../../shared/components/forms/FormCard";
import CatalogSearch from "./CatalogSearch";
import RestrictionSearch from "./RestrictionSearch";
import type { ManagementType, CatalogItem, RestrictionItem } from "../types/catalogRestriction.types";

interface ManagementParametersCardProps {
  type: ManagementType;
  selectedTarget: string;
  selectedTargetId: string;
  onTargetChange: (value: string) => void;
  onTargetIdChange: (id: string) => void;
  errors: Record<string, string>;
  submitAttempted: boolean;
  catalogSource?: "ODISEO" | "SISTEMA_INTEGRAL";
  onCatalogSourceChange?: (source: "ODISEO" | "SISTEMA_INTEGRAL") => void;
}

export default function ManagementParametersCard({
  type,
  selectedTarget,
  selectedTargetId,
  onTargetChange,
  onTargetIdChange,
  errors,
  submitAttempted,
  catalogSource = "ODISEO",
  onCatalogSourceChange,
}: ManagementParametersCardProps) {
  const handleCatalogSelect = (catalog: CatalogItem) => {
    onTargetIdChange(catalog.code);
    if (onCatalogSourceChange) {
      onCatalogSourceChange(catalog.source);
    }
  };

  const handleRestrictionSelect = (restriction: RestrictionItem) => {
    onTargetIdChange(restriction.id);
  };

  return (
    <FormCard title="Parámetros de actualización" icon="⚙️" color="#00395A" required>
      <div className="space-y-6">

        <div>
          {type === "catalog" ? (
            <CatalogSearch
              onSelect={handleCatalogSelect}
              value={selectedTarget}
              onChange={onTargetChange}
              error={submitAttempted ? errors.target : undefined}
              source={catalogSource}
            />
          ) : (
            <RestrictionSearch
              onSelect={handleRestrictionSelect}
              value={selectedTarget}
              onChange={onTargetChange}
              error={submitAttempted ? errors.target : undefined}
            />
          )}
        </div>
      </div>
    </FormCard>
  );
}
