import { ChevronLeft, ChevronRight } from "lucide-react";

interface TableFooterPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export default function TableFooterPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: TableFooterPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="text-sm text-slate-600">
          Mostrando <span className="font-semibold">{startItem}</span> a{" "}
          <span className="font-semibold">{endItem}</span> de{" "}
          <span className="font-semibold">{totalItems}</span> registros
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-slate-600">
            Items por página:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="px-4 py-2 text-sm font-medium text-slate-700">
          Página <span className="font-bold">{currentPage}</span> de{" "}
          <span className="font-bold">{totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
