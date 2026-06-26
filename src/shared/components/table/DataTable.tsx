import { type ReactNode } from "react";

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: any, item: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  striped?: boolean;
  hover?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends object>({
  columns,
  data,
  keyField,
  striped = true,
  hover = true,
  onRowClick,
  emptyMessage = "No hay datos disponibles",
}: DataTableProps<T>) {
  const getAlignClass = (align?: string) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3 font-semibold text-slate-900 ${getAlignClass(col.align)}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={String(item[keyField])}
                className={`border-b border-slate-200 transition-colors ${
                  striped && rowIndex % 2 === 1 ? "bg-slate-50" : "bg-white"
                } ${hover && onRowClick ? "hover:bg-blue-50 cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-6 py-4 text-slate-700 ${getAlignClass(col.align)} ${col.className || ""}`}
                  >
                    {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
