// src/modules/dashboard/components/ProductCard.tsx

import { useNavigate } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import type { SoldProduct } from "../data/homeMockData";

type ProductCardProps = {
  product: SoldProduct;
};

const getWrappingStyle = (wrapping: SoldProduct["wrapping"]) => {
  switch (wrapping) {
    case "POUCH":
      return {
        chip: "bg-white text-[#003B5C] border-slate-200",
        accent: "border-l-[#00A3E0]",
        watermark: "text-[#00A3E0]",
      };

    case "BOLSA":
      return {
        chip: "bg-white text-[#003B5C] border-slate-200",
        accent: "border-l-[#36C5F0]",
        watermark: "text-[#36C5F0]",
      };

    case "LAMINA":
      return {
        chip: "bg-white text-[#003B5C] border-slate-200",
        accent: "border-l-[#003B5C]",
        watermark: "text-[#003B5C]",
      };

    default:
      return {
        chip: "bg-white text-slate-700 border-slate-200",
        accent: "border-l-slate-300",
        watermark: "text-slate-300",
      };
  }
};

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const wrappingStyle = getWrappingStyle(product.wrapping);

  const handleUseAsBase = () => {
    navigate(`/products/create?base=${encodeURIComponent(product.code)}`);
  };

  return (
    <article
      onClick={handleUseAsBase}
      className={[
        "group relative flex min-h-[150px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[#003B5C]/30 hover:shadow-xl",
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

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span
            className={[
              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
              wrappingStyle.chip,
            ].join(" ")}
          >
            {product.wrapping}
          </span>

          <span className="text-[10px] font-medium text-emerald-600">
            Aprobado
          </span>
        </div>

        <h3 className="max-w-[88%] text-lg font-black leading-tight tracking-tight text-slate-900">
          {product.name}
        </h3>

        <p className="mt-1.5 text-sm font-medium text-slate-500">
          {product.client}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleUseAsBase();
        }}
        className="relative z-10 mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#003B5C]/15 bg-[#003B5C]/5 px-4 py-2.5 text-sm font-black text-[#003B5C] transition-all duration-300 group-hover:bg-[#003B5C] group-hover:text-white group-hover:shadow-md"
      >
        Usar como base
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </article>
  );
}