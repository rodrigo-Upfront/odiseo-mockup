// src/modules/dashboard/pages/DashboardPage.tsx

import { useEffect } from "react";
import type { FormEvent } from "react";
import { Search } from "lucide-react";

import { useLayout } from "../../../components/layout/LayoutContext";
import QuickCreatePanel from "../components/QuickCreatePanel";
import WorkQueuePanel from "../components/WorkQueuePanel";
import { ProductActionButton } from "../../../shared/components/ProductActionButton";

import { WORK_QUEUE, EXECUTIVE_SUMMARY } from "../data/homeMockData";

function DashboardCommandBar() {
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("search") ?? "").trim();

    if (!value) return;

    console.log("Buscar producto en ODISEO:", value);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Portal Web ODISEO
        </h1>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            name="search"
            type="text"
            placeholder="Buscar cliente, producto, SKU, ficha, portafolio o rubro..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#003B5C] focus:ring-2 focus:ring-[#003B5C]/10"
          />
        </div>

        <ProductActionButton source="dashboard" />
      </form>
    </div>
  );
}

function ExecutiveSummary() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {EXECUTIVE_SUMMARY.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="text-sm font-semibold text-slate-900">{card.label}</div>
          <div className="mt-2 text-2xl font-black text-brand-primary">
            {card.value}
          </div>
          <div className="mt-1 text-xs text-slate-500">{card.description}</div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { setHeader, resetHeader } = useLayout();

  useEffect(() => {
    setHeader({
      title: "Portal Web ODISEO",
      subtitle: undefined,
      toolbar: <DashboardCommandBar />,
    });

    return () => resetHeader();
  }, [setHeader, resetHeader]);

  return (
    <div className="w-full space-y-6">
      {/* Executive Summary */}
      <ExecutiveSummary />

      {/* Grid principal: Repositorio reutilizable (izq) + Mi bandeja (der) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        {/* Columna izquierda: Productos aprobados */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            Productos aprobados
          </h2>
          <p className="text-xs text-slate-500">
            Encuentra un Producto Base con SKU o SKU Aprobado para crear una ficha nueva o modificada con menor esfuerzo.
          </p>
          <QuickCreatePanel />
        </section>

        {/* Columna derecha: Mi bandeja */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900">
            Mi bandeja de productos
          </h2>
          <p className="text-xs text-slate-500">
            Fichas y productos que requieren una acción de mi rol.
          </p>
          <WorkQueuePanel items={WORK_QUEUE} />
        </section>
      </div>
    </div>
  );
}
