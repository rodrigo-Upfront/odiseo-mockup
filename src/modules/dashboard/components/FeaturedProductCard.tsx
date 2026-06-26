import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Package, ShoppingBag, Layers, Archive, Box } from "lucide-react";
import InfoTooltip from "../../../shared/components/display/InfoTooltip";
import type { SoldProduct } from "../data/homeMockData";

const getRubroColor = (rubro: string) => {
  const normalized = rubro.toLowerCase();
  if (normalized.includes("salsa") || normalized.includes("aderezo")) return "bg-orange-400";
  if (normalized.includes("bebida")) return "bg-blue-400";
  if (normalized.includes("higiene") || normalized.includes("cuidado")) return "bg-teal-400";
  if (normalized.includes("seco") || normalized.includes("alimento")) return "bg-amber-400";
  if (normalized.includes("lácteo")) return "bg-sky-400";
  return "bg-blue-400";
};

const getPackageIcon = (wrapping?: string) => {
  switch (wrapping?.toUpperCase()) {
    case "BOLSA":
      return <ShoppingBag size={56} />;
    case "LAMINA":
      return <Layers size={56} />;
    case "POUCH":
    default:
      return <Package size={56} />;
  }
};

interface FeaturedProductCardProps {
  product: SoldProduct;
}

export default function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const navigate = useNavigate();

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <p><strong>SKU:</strong> {product.code}</p>
      <p><strong>Rubro:</strong> {product.rubro}</p>
      <p><strong>Estructura:</strong> {product.structure}</p>
      <p><strong>Capas:</strong> {product.layerCount}</p>
      <p><strong>Último uso:</strong> {product.lastUsed}</p>
    </div>
  );

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden">

      {/* Sidebar color por rubro */}
      <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-2xl ${getRubroColor(product.rubro)}`} />

      {/* Watermark icon */}
      <div className="absolute right-4 top-4 text-slate-900 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none">
        {getPackageIcon(product.wrapping)}
      </div>

      {/* Top badges: Wrapping + Success badge */}
      <div className="relative z-10 flex items-start justify-between gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          {product.wrapping}
        </span>

        {product.successBadge && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
            <TrendingUp size={11} />
            {product.successBadge}
          </span>
        )}
      </div>

      {/* Product name */}
      <h3 className="relative z-10 text-xl font-black text-slate-900 leading-tight mb-3">
        {product.name}
      </h3>

      {/* Client */}
      <p className="relative z-10 text-sm text-slate-500 mb-5 flex-1">
        {product.client}
      </p>

      {/* Bottom: Info + CTA */}
      <div className="relative z-10 flex items-center justify-between gap-3 mt-auto pt-3 border-t border-slate-100">
        <InfoTooltip content={tooltipContent} size="sm" />

        <button
          onClick={() => navigate(`/products/clone/${product.code}`)}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all duration-200"
        >
          Usar como base
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
