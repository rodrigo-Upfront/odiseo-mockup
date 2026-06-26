type LooseProps = {
  className?: string;
  [key: string]: unknown;
};

function ProjectProductsPanel({ className = "" }: LooseProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900">Productos asociados</h3>
      <p className="mt-1 text-xs text-slate-500">
        Panel temporal para productos relacionados al proyecto.
      </p>
    </section>
  );
}

export default ProjectProductsPanel;
