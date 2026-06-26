import type { Project, NormalizedProject } from "../../shared/types"
import { slugify, formatStatusLabel, computeTabFromStatus } from "../../shared/utils"

export function normalizeProjects(raw: Project[]): NormalizedProject[] {
  return raw.map((p) => ({
    id: p.id,
    code: p.id,
    name: p.nombre,
    description: "",
    client: p.cliente,
    clientKey: slugify(p.cliente),
    status: p.estado,
    statusLabel: formatStatusLabel(p.estado),
    owner: p.responsable,
    updatedAt: p.fechaCreacion,
    tab: computeTabFromStatus(p.estado),
    prioridad: p.prioridad,
    items: p.items,
    segmento: p.segmento,
    categoria: p.categoria,
  }))
}
