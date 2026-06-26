// src/modules/dashboard/components/QuickCreatePanel.tsx

import ReusableProductCard from "./ReusableProductCard";
import {
  RECENT_CLIENTS,
  RECENT_RUBROS,
  REUSABLE_PRODUCTS,
} from "../data/homeMockData";

const chipClassName =
  "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[#003B5C]/20 hover:bg-[#003B5C]/5 hover:text-[#003B5C] cursor-pointer";

export default function QuickCreatePanel() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Productos aprobados
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {REUSABLE_PRODUCTS.slice(0, 4).map((product) => (
            <ReusableProductCard key={product.sku} product={product} />
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Clientes frecuentes
          </p>

          <div className="flex flex-wrap gap-2">
            {RECENT_CLIENTS.slice(0, 4).map((client) => (
              <button
                key={client.name}
                type="button"
                title={`Último producto: ${client.lastProduct}`}
                className={chipClassName}
              >
                {client.name}
              </button>
            ))}

            <button type="button" className={chipClassName}>
              + Ver más
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Rubros frecuentes
          </p>

          <div className="flex flex-wrap gap-2">
            {RECENT_RUBROS.slice(0, 4).map((rubro) => (
              <button
                key={rubro.name}
                type="button"
                title={`Envoltura frecuente: ${rubro.frequentWrapping} | Estructura frecuente: ${rubro.frequentStructure}`}
                className={chipClassName}
              >
                {rubro.name}
              </button>
            ))}

            <button type="button" className={chipClassName}>
              + Ver más
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
