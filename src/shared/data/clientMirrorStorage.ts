export type ClientMirror = {
  id: string;
  code: string;
  razonSocial: string;
  nombreComercial?: string;
  ruc: string;
  email?: string;
  sector: string;
  status: "Activo" | "Inactivo";
};

const CLIENTS_MIRROR: ClientMirror[] = [
  {
    id: "CMI-001",
    code: "CL-SI-001",
    razonSocial: "Alicorp S.A.A.",
    nombreComercial: "Alicorp",
    ruc: "20100055237",
    email: "contacto@alicorp.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-002",
    code: "CL-SI-002",
    razonSocial: "Kimberly-Clark Perú",
    nombreComercial: "Kimberly-Clark",
    ruc: "20100152941",
    email: "contacto@kimberly-clark.com",
    sector: "Cuidado personal",
    status: "Activo",
  },
  {
    id: "CMI-003",
    code: "CL-SI-003",
    razonSocial: "Leche Gloria S.A.",
    nombreComercial: "Gloria",
    ruc: "20100190797",
    email: "contacto@gloria.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-004",
    code: "CL-SI-004",
    razonSocial: "Nestlé Perú",
    nombreComercial: "Nestlé",
    ruc: "20100028698",
    email: "a.vega@pe.nestle.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-005",
    code: "CL-SI-005",
    razonSocial: "Inka Crops",
    nombreComercial: "Inka Crops",
    ruc: "20510893793",
    email: "f.lopez@inkachips.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-006",
    code: "CL-SI-006",
    razonSocial: "Intradevco Industrial",
    nombreComercial: "Intradevco",
    ruc: "20295567934",
    email: "l.vargas@intradevco.com",
    sector: "Manufactura",
    status: "Activo",
  },
  {
    id: "CMI-007",
    code: "CL-SI-007",
    razonSocial: "Procter & Gamble",
    nombreComercial: "P&G",
    ruc: "20100132592",
    email: "herrera.s@pg.com",
    sector: "Consumo masivo",
    status: "Activo",
  },
  {
    id: "CMI-008",
    code: "CL-SI-008",
    razonSocial: "Unacem",
    nombreComercial: "Unacem",
    ruc: "20100137390",
    email: "m.sanchez@unacem.com.pe",
    sector: "Manufactura",
    status: "Activo",
  },
  {
    id: "CMI-009",
    code: "CL-SI-009",
    razonSocial: "Haleon Perú",
    nombreComercial: "Haleon",
    ruc: "20100148712",
    email: "c.rios@haleon.com",
    sector: "Cuidado personal",
    status: "Activo",
  },
  {
    id: "CMI-010",
    code: "CL-SI-010",
    razonSocial: "Rinti S.A.",
    nombreComercial: "Rinti",
    ruc: "20100175182",
    email: "d.paredes@rinti.com.pe",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-011",
    code: "CL-SI-011",
    razonSocial: "Agroindustrias del Norte S.A.C.",
    nombreComercial: "Agroindustrias del Norte",
    ruc: "20604589123",
    email: "m.salazar@agronorte.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-012",
    code: "CL-SI-012",
    razonSocial: "Café Andino Export S.A.C.",
    nombreComercial: "Café Andino",
    ruc: "20547896321",
    email: "j.huaman@cafeandino.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-013",
    code: "CL-SI-013",
    razonSocial: "Snacks Peruanos S.A.C.",
    nombreComercial: "Snacks Peruanos",
    ruc: "20601987452",
    email: "c.medina@snacksperuanos.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-014",
    code: "CL-SI-014",
    razonSocial: "Salsas del Pacífico S.A.",
    nombreComercial: "Salsas del Pacífico",
    ruc: "20563214789",
    email: "g.paredes@salsaspacifico.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-015",
    code: "CL-SI-015",
    razonSocial: "NutriPet Foods S.A.C.",
    nombreComercial: "NutriPet Foods",
    ruc: "20607894561",
    email: "v.castillo@nutripetfoods.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-016",
    code: "CL-SI-016",
    razonSocial: "Derivados Lácteos Andinos S.A.",
    nombreComercial: "Lácteos Andinos",
    ruc: "20598741236",
    email: "r.cardenas@lacteosandinos.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-017",
    code: "CL-SI-017",
    razonSocial: "Cuidado Hogar Perú S.A.C.",
    nombreComercial: "Cuidado Hogar",
    ruc: "20601478523",
    email: "p.gomez@cuidadohogar.pe",
    sector: "Cuidado personal",
    status: "Activo",
  },
  {
    id: "CMI-018",
    code: "CL-SI-018",
    razonSocial: "Belleza Natural S.A.C.",
    nombreComercial: "Belleza Natural",
    ruc: "20574125896",
    email: "d.reyes@bellezanatural.com",
    sector: "Cuidado personal",
    status: "Activo",
  },
  {
    id: "CMI-019",
    code: "CL-SI-019",
    razonSocial: "Congelados del Sur S.A.",
    nombreComercial: "Congelados del Sur",
    ruc: "20603258974",
    email: "h.flores@congeladossur.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
  {
    id: "CMI-020",
    code: "CL-SI-020",
    razonSocial: "Cereales y Granos Perú S.A.C.",
    nombreComercial: "Cereales y Granos",
    ruc: "20536987412",
    email: "l.vargas@cerealesperu.com",
    sector: "Alimentos y bebidas",
    status: "Activo",
  },
];

const LAST_SYNC_TIMESTAMP_KEY = "odiseo_clients_mirror_last_sync";

export function getAllClientsMirror(): ClientMirror[] {
  return CLIENTS_MIRROR;
}

export function getClientMirrorByCode(code: string): ClientMirror | undefined {
  return CLIENTS_MIRROR.find((client) => client.code === code);
}

export function getClientMirrorByRuc(ruc: string): ClientMirror | undefined {
  return CLIENTS_MIRROR.find((client) => client.ruc === ruc);
}

export function getClientMirrorByRazonSocial(razonSocial: string): ClientMirror | undefined {
  return CLIENTS_MIRROR.find((client) =>
    client.razonSocial.toLowerCase() === razonSocial.toLowerCase()
  );
}

export function getActiveClientsMirror(): ClientMirror[] {
  return CLIENTS_MIRROR.filter((client) => client.status === "Activo");
}

export function getLastSyncTimestamp(): string {
  return localStorage.getItem(LAST_SYNC_TIMESTAMP_KEY) || new Date(2026, 0, 1).toISOString();
}

export function formatSyncTimestamp(timestamp: string): string {
  if (!timestamp) return "Nunca";
  const date = new Date(timestamp);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
