import { ChevronDown, Download, FolderOpen } from "lucide-react";
import { useRef, useState } from "react";

interface ExcelTemplateActionsProps {
  onDownloadTemplate: () => void;
  onUploadTemplateClick: () => void;
}

export default function ExcelTemplateActions({
  onDownloadTemplate,
  onUploadTemplateClick,
}: ExcelTemplateActionsProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-brand-primary hover:text-brand-primary"
      >
        Importar Excel
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              onDownloadTemplate();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={15} />
            Descargar plantilla
          </button>

          <button
            type="button"
            onClick={() => {
              onUploadTemplateClick();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FolderOpen size={15} />
            Cargar plantilla Excel
          </button>
        </div>
      )}
    </div>
  );
}
