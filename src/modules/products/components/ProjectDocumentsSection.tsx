type LooseProps = {
  className?: string;
  [key: string]: unknown;
};

function ProjectDocumentsSection({ className = "" }: LooseProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900">Documentos del proyecto</h3>
      <p className="mt-1 text-xs text-slate-500">
        Sección temporal para mostrar documentos asociados al producto o proyecto.
      </p>
    </section>
  );
}

export default ProjectDocumentsSection;
