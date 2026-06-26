type LooseProps = {
  className?: string;
  [key: string]: unknown;
};

function ProjectStatusPanel({ className = "" }: LooseProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900">Estado del proyecto</h3>
      <p className="mt-1 text-xs text-slate-500">
        Panel temporal para mostrar el estado general del proyecto.
      </p>
    </section>
  );
}

export default ProjectStatusPanel;
