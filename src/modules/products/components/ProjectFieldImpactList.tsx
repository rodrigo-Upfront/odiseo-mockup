type LooseProps = {
  className?: string;
  [key: string]: unknown;
};

function ProjectFieldImpactList({ className = "" }: LooseProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900">Impacto de campos</h3>
      <p className="mt-1 text-xs text-slate-500">
        Lista temporal para mostrar campos con impacto en el proyecto.
      </p>
    </section>
  );
}

export default ProjectFieldImpactList;
