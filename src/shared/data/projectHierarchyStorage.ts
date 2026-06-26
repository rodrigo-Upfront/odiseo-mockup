import type { UnitOfMeasure } from "./unitOfMeasureStorage";

export interface Portafolio {
  id: string;
  codigo: string;
  nombre: string;
  clienteId: string;
  estado: "activo" | "inactivo";
  createdAt: string;
  updatedAt: string;
}

export interface Proyecto {
  id: string;
  codigo: string;
  portafolioId: string;

  nombreBase: string;
  valorPresentacion: number;
  unidadMedida: UnitOfMeasure;
  nombreVisible: string;

  estado: "activo" | "inactivo" | "archivado";
  createdAt: string;
  updatedAt: string;
}

export interface FichaProducto {
  id: string;
  codigo: string;
  proyectoId: string;

  nombreBase: string;
  valorPresentacion: number;
  unidadMedida: UnitOfMeasure;
  nombreVisible: string;

  estado: "activo" | "inactivo" | "archivado";
  createdAt: string;
  updatedAt: string;
}

// Datos mock
const MOCK_PORTAFOLIOS: Portafolio[] = [
  {
    id: "P0001",
    codigo: "P0001",
    nombre: "Salsas nuevos logos",
    clienteId: "CLI001",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
];

const MOCK_PROYECTOS: Proyecto[] = [
  {
    id: "Y001",
    codigo: "Y001",
    portafolioId: "P0001",
    nombreBase: "Salsas",
    valorPresentacion: 8,
    unidadMedida: "G",
    nombreVisible: "Salsas 8 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "Y002",
    codigo: "Y002",
    portafolioId: "P0001",
    nombreBase: "Salsas",
    valorPresentacion: 100,
    unidadMedida: "G",
    nombreVisible: "Salsas 100 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "Y003",
    codigo: "Y003",
    portafolioId: "P0001",
    nombreBase: "Salsas",
    valorPresentacion: 450,
    unidadMedida: "G",
    nombreVisible: "Salsas 450 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
];

const MOCK_FICHAS_PRODUCTO: FichaProducto[] = [
  {
    id: "F001",
    codigo: "F001",
    proyectoId: "Y001",
    nombreBase: "Mayonesa",
    valorPresentacion: 8,
    unidadMedida: "G",
    nombreVisible: "Mayonesa 8 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F002",
    codigo: "F002",
    proyectoId: "Y001",
    nombreBase: "Mostaza",
    valorPresentacion: 8,
    unidadMedida: "G",
    nombreVisible: "Mostaza 8 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F003",
    codigo: "F003",
    proyectoId: "Y001",
    nombreBase: "Ají",
    valorPresentacion: 8,
    unidadMedida: "G",
    nombreVisible: "Ají 8 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F004",
    codigo: "F004",
    proyectoId: "Y002",
    nombreBase: "Mayonesa",
    valorPresentacion: 100,
    unidadMedida: "G",
    nombreVisible: "Mayonesa 100 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F005",
    codigo: "F005",
    proyectoId: "Y002",
    nombreBase: "Mostaza",
    valorPresentacion: 100,
    unidadMedida: "G",
    nombreVisible: "Mostaza 100 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F006",
    codigo: "F006",
    proyectoId: "Y002",
    nombreBase: "Ají",
    valorPresentacion: 100,
    unidadMedida: "G",
    nombreVisible: "Ají 100 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F007",
    codigo: "F007",
    proyectoId: "Y003",
    nombreBase: "Mayonesa",
    valorPresentacion: 450,
    unidadMedida: "G",
    nombreVisible: "Mayonesa 450 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F008",
    codigo: "F008",
    proyectoId: "Y003",
    nombreBase: "Mostaza",
    valorPresentacion: 450,
    unidadMedida: "G",
    nombreVisible: "Mostaza 450 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "F009",
    codigo: "F009",
    proyectoId: "Y003",
    nombreBase: "Ají",
    valorPresentacion: 450,
    unidadMedida: "G",
    nombreVisible: "Ají 450 g",
    estado: "activo",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
];

// CRUD Portafolio
export function getPortafolios(): Portafolio[] {
  return [...MOCK_PORTAFOLIOS];
}

export function getPortafolioById(id: string): Portafolio | null {
  return MOCK_PORTAFOLIOS.find((p) => p.id === id) || null;
}

export function getPortafolioByCodigo(codigo: string): Portafolio | null {
  return MOCK_PORTAFOLIOS.find((p) => p.codigo === codigo) || null;
}

export function savePortafolio(portafolio: Portafolio): void {
  const index = MOCK_PORTAFOLIOS.findIndex((p) => p.id === portafolio.id);
  if (index >= 0) {
    MOCK_PORTAFOLIOS[index] = portafolio;
  } else {
    MOCK_PORTAFOLIOS.push(portafolio);
  }
}

// CRUD Proyecto
export function getProyectos(): Proyecto[] {
  return [...MOCK_PROYECTOS];
}

export function getProyectoById(id: string): Proyecto | null {
  return MOCK_PROYECTOS.find((p) => p.id === id) || null;
}

export function getProyectoByCodigo(codigo: string): Proyecto | null {
  return MOCK_PROYECTOS.find((p) => p.codigo === codigo) || null;
}

export function getProyectosByPortafolio(portafolioId: string): Proyecto[] {
  return MOCK_PROYECTOS.filter((p) => p.portafolioId === portafolioId);
}

export function saveProyecto(proyecto: Proyecto): void {
  const index = MOCK_PROYECTOS.findIndex((p) => p.id === proyecto.id);
  if (index >= 0) {
    MOCK_PROYECTOS[index] = proyecto;
  } else {
    MOCK_PROYECTOS.push(proyecto);
  }
}

// CRUD Ficha Producto
export function getFichasProducto(): FichaProducto[] {
  return [...MOCK_FICHAS_PRODUCTO];
}

export function getFichaProductoById(id: string): FichaProducto | null {
  return MOCK_FICHAS_PRODUCTO.find((f) => f.id === id) || null;
}

export function getFichaProductoByCodigo(codigo: string): FichaProducto | null {
  return MOCK_FICHAS_PRODUCTO.find((f) => f.codigo === codigo) || null;
}

export function getFichasProductoByProyecto(proyectoId: string): FichaProducto[] {
  return MOCK_FICHAS_PRODUCTO.filter((f) => f.proyectoId === proyectoId);
}

export function saveFichaProducto(ficha: FichaProducto): void {
  const index = MOCK_FICHAS_PRODUCTO.findIndex((f) => f.id === ficha.id);
  if (index >= 0) {
    MOCK_FICHAS_PRODUCTO[index] = ficha;
  } else {
    MOCK_FICHAS_PRODUCTO.push(ficha);
  }
}

// Utilidad para generar nombre visible
export function buildDisplayName(
  nombreBase: string,
  valor: number,
  unidad: string
): string {
  return `${nombreBase.trim()} ${valor} ${unidad}`;
}

// Obtener siguiente código
export function getNextPortafolioCode(): string {
  const max = MOCK_PORTAFOLIOS.reduce((acc, p) => {
    const num = parseInt(p.codigo.slice(1), 10);
    return Math.max(acc, num);
  }, 0);
  return `P${String(max + 1).padStart(4, "0")}`;
}

export function getNextProyectoCode(): string {
  const max = MOCK_PROYECTOS.reduce((acc, p) => {
    const num = parseInt(p.codigo.slice(1), 10);
    return Math.max(acc, num);
  }, 0);
  return `Y${String(max + 1).padStart(3, "0")}`;
}

export function getNextFichaProductoCode(): string {
  const max = MOCK_FICHAS_PRODUCTO.reduce((acc, f) => {
    const num = parseInt(f.codigo.slice(1), 10);
    return Math.max(acc, num);
  }, 0);
  return `F${String(max + 1).padStart(3, "0")}`;
}
