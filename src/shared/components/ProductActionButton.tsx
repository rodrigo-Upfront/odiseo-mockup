import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Upload } from "lucide-react";
import NewActionDropdown from "./NewActionDropdown";
import ProductInitialCreateModal from "./modals/ProductInitialCreateModal";
import BulkProductImportModal from "./modals/BulkProductImportModal";
import type { NewActionOption } from "./NewActionDropdown";

export interface PortfolioContext {
  portfolioId?: string;
  portfolioCode?: string;
  portfolioName?: string;
  clientName?: string;
  clientId?: string;
  envoltura?: string;
  usoFinal?: string;
  sector?: string;
  segmento?: string;
  subSegmento?: string;
  afMarketId?: string;
  maquinaCliente?: string;
}

export interface ProductActionButtonProps {
  source: "dashboard" | "products" | "portfolio";
  disabled?: boolean;
  portfolioContext?: PortfolioContext;
  onProductCreated?: (product?: any) => void;
}

export function ProductActionButton({
  source,
  disabled = false,
  portfolioContext,
  onProductCreated,
}: ProductActionButtonProps) {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const options = useMemo<NewActionOption[]>(() => {
    const baseState = source === "portfolio" && portfolioContext
      ? {
          source,
          portfolioContext,
        }
      : undefined;

    return [
      {
        label: "Nueva solicitud",
        description: "Registrar un nuevo producto preliminar.",
        enabled: true,
        icon: <FolderPlus size={17} />,
        onClick: () => setShowCreateModal(true),
      },
      {
        label: "Importar Productos",
        description: "Carga masiva de productos desde plantilla.",
        enabled: true,
        icon: <Upload size={17} />,
        onClick: () => setShowImportModal(true),
      },
    ];
  }, [source, portfolioContext]);

  return (
    <>
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <NewActionDropdown options={options} />
      </div>

      <ProductInitialCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={() => {
          setShowCreateModal(false);
          onProductCreated?.();
        }}
      />

      <BulkProductImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          setShowImportModal(false);
          onProductCreated?.();
        }}
        portfolioContext={portfolioContext}
      />
    </>
  );
}
