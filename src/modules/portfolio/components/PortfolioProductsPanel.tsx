import { useState, useEffect } from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";
import type { PortfolioRecord } from "../../../shared/data/portfolioStorage";
import type { ProductPreliminaryRecord } from "../../../shared/data/productPreliminaryTypes";
import {
  getProductsByPortfolio,
  deleteProductPreliminaryRecord,
} from "../../../shared/data/productPreliminaryStorage";
import { ProductActionButton } from "../../../shared/components/ProductActionButton";

export interface PortfolioProductsPanelProps {
  portfolio: PortfolioRecord;
  onPortfolioUpdated?: () => void;
}

const getPortfolioStatus = (portfolio: PortfolioRecord): "active" | "inactive" => {
  const rawStatus = String(
    portfolio.status ||
      (portfolio as any).est ||
      (portfolio as any).estado ||
      ((portfolio as any).isActive === false ? "inactive" : "") ||
      ((portfolio as any).active === false ? "inactive" : "") ||
      "active"
  ).toLowerCase();

  if (
    rawStatus.includes("inactivo") ||
    rawStatus.includes("inactive") ||
    rawStatus === "false"
  ) {
    return "inactive";
  }

  return "active";
};

export function PortfolioProductsPanel({
  portfolio,
  onPortfolioUpdated,
}: PortfolioProductsPanelProps) {
  const [products, setProducts] = useState<ProductPreliminaryRecord[]>([]);

  const portfolioCode = portfolio?.codigo || portfolio?.id || "";
  const portfolioStatus = getPortfolioStatus(portfolio);
  const isPortfolioActive = portfolioStatus === "active";


  const loadProducts = () => {
    const loaded = getProductsByPortfolio(portfolioCode);
    setProducts(loaded);
  };

  useEffect(() => {
    if (portfolioCode) {
      loadProducts();
    }
  }, [portfolioCode]);


  const handleDeleteProduct = (productCode: string) => {
    if (
      window.confirm(
        "¿Está seguro de que desea eliminar este producto preliminar?"
      )
    ) {
      deleteProductPreliminaryRecord(productCode);
      loadProducts();
      onPortfolioUpdated?.();
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div>
            <h3 className="font-bold text-gray-800">
              Productos Aprobados
            </h3>
            <p className="text-xs text-gray-500">
              Gestiona los productos aprobados dados de alta asociados a este portafolio.
            </p>
          </div>

          <ProductActionButton
            source="portfolio"
            disabled={!isPortfolioActive}
            portfolioContext={{
              portfolioId: portfolio?.id,
              portfolioCode: portfolioCode,
              portfolioName: portfolio?.nom || portfolio?.name || portfolio?.nombre,
              clientName: (portfolio as any)?.clientName || (portfolio as any)?.cli,
            }}
            onProductCreated={() => {
              loadProducts();
              onPortfolioUpdated?.();
            }}
          />
        </div>

        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-gray-200 bg-white text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Código</th>
              <th className="px-6 py-3 text-left font-semibold">
                Nombre Comercial
              </th>
              <th className="px-6 py-3 text-left font-semibold">Motivo</th>
              <th className="px-6 py-3 text-left font-semibold">Causal</th>
              <th className="px-6 py-3 text-left font-semibold">Estado</th>
              <th className="px-6 py-3 text-center font-semibold">Capas</th>
              <th className="px-6 py-3 text-left font-semibold">Validación</th>
              <th className="px-6 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product.id || product.productCode}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-bold text-brand-primary">
                    {product.productCode}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {product.commercialName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.calculatedName}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {product.requestReason}
                  </td>

                  <td className="px-6 py-4 text-sm">{product.causal}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        product.status === "Registrado"
                          ? "border border-blue-200 bg-blue-50 text-blue-700"
                          : product.status === "Listo para cotizar"
                            ? "border border-green-200 bg-green-50 text-green-700"
                            : product.status === "Desestimado"
                              ? "border border-red-200 bg-red-50 text-red-700"
                              : "border border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      {product.layerCount}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {product.validationRoute !== "SIN_VALIDACION" ? (
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                        {product.validationRoute}
                      </span>
                    ) : (
                      <span className="text-gray-400">Sin validación</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // TODO: Implement view/edit product
                        }}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Ver producto"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // TODO: Implement edit product
                        }}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Editar producto"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProduct(product.productCode)
                        }
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center italic text-gray-500"
                >
                  {isPortfolioActive
                    ? "Aún no hay productos aprobados. Haz clic en '+ Nuevo' para comenzar."
                    : "Este portafolio está inactivo. No se pueden crear productos preliminares."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </>
  );
}
