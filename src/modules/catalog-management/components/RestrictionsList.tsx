import { ChevronRight } from "lucide-react";
import type { RestrictionItem } from "../types/catalogRestriction.types";

interface RestrictionsListProps {
  restrictions: RestrictionItem[];
}

export default function RestrictionsList({
  restrictions,
}: RestrictionsListProps) {
  return (
    <div className="space-y-3">
      {restrictions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">
            No hay restricciones disponibles aún
          </p>
        </div>
      ) : (
        restrictions.map((restriction) => (
          <div
            key={restriction.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-sm group-hover:text-brand-primary transition-colors">
                  {restriction.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  ID: {restriction.id}
                </p>
              </div>
              <ChevronRight
                size={16}
                className="text-slate-400 group-hover:text-brand-primary transition-colors flex-shrink-0"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
