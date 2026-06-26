// src/modules/dashboard/components/WorkQueuePanel.tsx

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { WorkQueueItem } from "../data/homeMockData";

type WorkQueuePanelProps = {
  items: WorkQueueItem[];
};

const priorityOrder: Record<WorkQueueItem["priority"], number> = {
  Alta: 1,
  Media: 2,
  Baja: 3,
};

const countPendingItems = (items: WorkQueueItem[]) => {
  return items.filter((item) => {
    if (item.status === "Registrado" || item.status === "En preparación") return true;
    if (item.status === "Completado" && item.integrationStatus === "Pendiente de envío") return true;
    if (item.integrationStatus === "Error de envío") return true;
    return false;
  }).length;
};

export default function WorkQueuePanel({ items }: WorkQueuePanelProps) {
  const navigate = useNavigate();

  const sortedItems = useMemo(() => {
    return [...items]
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 4);
  }, [items]);

  const urgentItem = sortedItems[0];
  const nextItems = sortedItems.slice(1, 4);
  const pendingCount = countPendingItems(items);

  return (
    <section className="rounded-2xl border border-[#003B5C]/10 bg-[#003B5C]/5 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">
          Mi bandeja
        </h2>

        <span className="inline-flex shrink-0 items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          {pendingCount} pendientes
        </span>
      </div>

      {urgentItem && (
        <article className="rounded-2xl border border-[#003B5C]/10 bg-white p-4 shadow-sm mb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#003B5C]">
                Acción prioritaria
              </p>

              <div className="mt-1">
                <span className="text-sm font-semibold text-slate-900">
                  {urgentItem.code}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {urgentItem.client}
              </p>

              <p className="mt-2 text-sm font-normal text-slate-700">
                {urgentItem.actionLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(urgentItem.route)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#003B5C] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00567f] hover:shadow-md whitespace-nowrap"
            >
              {urgentItem.actionLabel}
              <ArrowRight size={14} />
            </button>
          </div>
        </article>
      )}

      {nextItems.length > 0 && (
        <div className="space-y-2">
          {nextItems.map((item) => (
            <article
              key={item.code}
              className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-[#003B5C]/10 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.code}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.client}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-800">
                    {item.actionLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#003B5C]/20 bg-white px-3 py-2 text-xs font-black text-[#003B5C] transition hover:bg-[#003B5C] hover:text-white"
                >
                  {item.actionLabel}
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate("/products")}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-[#003B5C] transition hover:bg-white"
      >
        Ver toda mi bandeja
        <ArrowRight size={14} />
      </button>
    </section>
  );
}
