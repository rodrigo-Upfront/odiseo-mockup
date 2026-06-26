// src/modules/dashboard/components/ReusableProductCard.tsx

import { useNavigate } from "react-router-dom";
import { ArrowRight, Package, Clock } from "lucide-react";
import type { ReusableProductItem } from "../data/homeMockData";

type ReusableProductCardProps = {
  product: ReusableProductItem;
};

const getWrappingStyle = (wrapping: ReusableProductItem["packagingType"]) => {
  switch (wrapping) {
    case "POUCH":
      return {
        chip: "bg-blue-50 text-blue-700 border-blue-200",
        accent: "border-l-blue-400",
        watermark: "text-blue-200",
      };

    case "BOLSA":
      return {
        chip: "bg-amber-50 text-amber-700 border-amber-200",
        accent: "border-l-amber-400",
        watermark: "text-amber-200",
      };

    case "LAMINA":
      return {
        chip: "bg-purple-50 text-purple-700 border-purple-200",
        accent: "border-l-purple-400",
        watermark: "text-purple-200",
      };

    default:
      return {
        chip: "bg-slate-50 text-slate-700 border-slate-200",
        accent: "border-l-slate-300",
        watermark: "text-slate-300",
      };
  }
};

const getConditionBadge = (condition: ReusableProductItem["condition"]) => {
  if (condition === "Producto Base") {
    return "bg-green-100 text-green-700";
  }
  return "bg-blue-100 text-blue-700";
};

export default function ReusableProductCard({ product }: ReusableProductCardProps) {
  const navigate = useNavigate();
  const wrappingStyle = getWrappingStyle(product.packagingType);

  const handleUseAsReference = () => {
    navigate(`/products/create?reference=${encodeURIComponent(product.sku)}`);
  };

  return (
    <article
      className={[
        "group relative flex min-h-[200px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl",
        wrappingStyle.accent,
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute -right-5 -bottom-5 opacity-[0.025] transition-opacity duration-300 group-hover:opacity-[0.06]",
          wrappingStyle.watermark,
        ].join(" ")}
      >
        <Package size={100} strokeWidth={1.4} />
      </div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={[
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
              wrappingStyle.chip,
            ].join(" ")}
          >
            {product.packagingType}
          </span>

          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getConditionBadge(product.condition)}`}>
            {product.condition}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-black leading-tight tracking-tight text-slate-900">
            {product.product}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-slate-600">{product.client}</p>
        </div>

        <div className="pt-1">
          <p className="text-xs font-medium text-slate-700">{product.sku}</p>
          <p className="mt-2 text-xs text-slate-500">{product.reuseHint}</p>
        </div>

        {(product.lastUsedLabel || product.updatedLabel) && (
          <div className="flex items-center gap-1 pt-1 text-xs text-slate-500">
            <Clock size={12} />
            <span>{product.lastUsedLabel || product.updatedLabel}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleUseAsReference();
        }}
        className="relative z-10 mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:border-slate-400"
      >
        Usar como referencia
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </article>
  );
}
