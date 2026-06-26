// Registro central de todos los catálogos disponibles en el sistema
// Basado en catálogos reales encontrados en:
// - src/shared/data/projectCatalogStorage.ts (27 catálogos)
// - src/shared/data/mockDatabase.ts (6 catálogos)

import type { CatalogDefinition } from "./catalog.types";

export const CATALOG_REGISTRY: CatalogDefinition[] = [
  // FASE 1 - CATÁLOGOS CRÍTICOS
  {
    id: "catalog_wrapping_type",
    code: "wrapping_type",
    name: "Tipo de Envoltura",
    description: "Tabla espejo del Sistema Integral: Tipos de envoltura válidos (POUCH, BOLSA, LÁMINA). Solo consulta/sincronización.",
    ownerModule: "products",
    ownerSystem: "SISTEMA_INTEGRAL",
    status: "active",
  },
  {
    id: "catalog_subclassification",
    code: "subclassification",
    name: "Sub-clasificación",
    description: "Sub-clasificación según clasificación principal",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_layer_material",
    code: "layer_material",
    name: "Material de Capa",
    description: "Materiales disponibles para capas de estructura (58 variantes)",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_unit_measure",
    code: "unit_measure",
    name: "Unidad de Medida",
    description: "Unidades de medida para volumen referencial",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },

  // FASE 1 - CATÁLOGOS COMERCIALES
  {
    id: "catalog_sale_type",
    code: "sale_type",
    name: "Tipo de Venta",
    description: "Nacional o Internacional",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_incoterm",
    code: "incoterm",
    name: "Incoterm",
    description: "Términos internacionales de comercio",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_destination_country",
    code: "destination_country",
    name: "País de Destino",
    description: "Países de América Latina y otros destinos válidos",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_currency",
    code: "currency",
    name: "Tipo de Moneda",
    description: "Monedas de cotización: PEN, USD, EUR",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },

  // FASE 1 - CATÁLOGOS DE IMPRESIÓN Y ESTRUCTURA
  {
    id: "catalog_print_class",
    code: "print_class",
    name: "Clase de Impresión",
    description: "Niveles de calidad de impresión",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_print_type",
    code: "print_type",
    name: "Tipo de Impresión",
    description: "Tecnología de impresión (Flexografía, Rotograbado, Digital, Sin Impresión)",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_structure_type",
    code: "structure_type",
    name: "Tipo de Estructura",
    description: "Número de capas en la estructura",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },

  // FASE 1 - CATÁLOGOS DE PORTFOLIO
  {
    id: "catalog_final_use",
    code: "final_use",
    name: "Uso Final",
    description: "Categoría de uso final del producto con taxonomía (sector, segmento, subsegmento)",
    ownerModule: "portfolio",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_plant",
    code: "plant",
    name: "Planta de Origen de solicitud",
    description: "Catálogo maestro: Plantas de origen Amcor Flex (AF Lima, AF Cali, AF Santiago Norte, AF San Luis)",
    ownerModule: "portfolio",
    ownerSystem: "ODISEO",
    status: "active",
  },

  // FASE 2 - CATÁLOGOS DE ESPECIFICACIONES TÉCNICAS
  {
    id: "catalog_blueprint_format",
    code: "blueprint_format",
    name: "Formato de Plano",
    description: "Formatos de presentación del plano",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_technical_application",
    code: "technical_application",
    name: "Aplicación Técnica",
    description: "Métodos técnicos de envasado",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_zipper_type",
    code: "zipper_type",
    name: "Tipo de Zipper",
    description: "Tipos de cierre tipo zipper",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_valve_type",
    code: "valve_type",
    name: "Tipo de Válvula",
    description: "Tipos de válvula para pouches",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_rounded_corners_type",
    code: "rounded_corners_type",
    name: "Tipo de Esquinas Redondeadas",
    description: "Opciones de redondeado de esquinas",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_pouch_perforation_type",
    code: "pouch_perforation_type",
    name: "Tipo de Perforación Pouch",
    description: "Tipos de perforación para pouches",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_bag_perforation_type",
    code: "bag_perforation_type",
    name: "Tipo de Perforación Bolsa",
    description: "Tipos de perforación para bolsas",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_precut_type",
    code: "precut_type",
    name: "Tipo de Pre-Corte",
    description: "Estilos de pre-corte",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_payment_terms",
    code: "payment_terms",
    name: "Términos de Pago",
    description: "Términos de pago comerciales",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_core_material",
    code: "core_material",
    name: "Material del Core",
    description: "Materiales para núcleo de rollo",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },

  // FASE 2 - CATÁLOGOS AUXILIARES
  {
    id: "catalog_peruvian_logo",
    code: "peruvian_logo",
    name: "Logo Producto Peruano",
    description: "Incluir logo de producto peruano",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_printing_footer",
    code: "printing_footer",
    name: "Pie de Imprenta",
    description: "Pie de imprenta en documentos",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_salesforce_action",
    code: "salesforce_action",
    name: "Acción Salesforce",
    description: "Acciones en integración Salesforce",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_project_type",
    code: "project_type",
    name: "Tipo de Proyecto",
    description: "Tipos de proyecto o muestra",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_yes_no",
    code: "yes_no",
    name: "Sí/No",
    description: "Valores booleanos estándar",
    ownerModule: "shared",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_artwork_file_type",
    code: "artwork_file_type",
    name: "Tipo de Archivo de Arte",
    description: "Formatos de archivo de arte válidos",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },

  // FASE 3 - CATÁLOGOS DE CLIENTES
  {
    id: "catalog_client_type",
    code: "client_type",
    name: "Tipo de Cliente",
    description: "Clasificación de clientes por tipo",
    ownerModule: "clients",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_client_sector",
    code: "client_sector",
    name: "Sector Cliente",
    description: "Sectores comerciales de clientes",
    ownerModule: "clients",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_client_country",
    code: "client_country",
    name: "País Cliente",
    description: "Países donde operan los clientes",
    ownerModule: "clients",
    ownerSystem: "ODISEO",
    status: "active",
  },

  // FASE 3 - CATÁLOGOS DE USUARIOS
  {
    id: "catalog_user_role",
    code: "user_role",
    name: "Rol de Usuario",
    description: "Roles disponibles en el sistema ODISEO",
    ownerModule: "users",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_user_area",
    code: "user_area",
    name: "Área de Usuario",
    description: "Áreas departamentales de la organización",
    ownerModule: "users",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_user_status",
    code: "user_status",
    name: "Estado de Usuario",
    description: "Tabla espejo del Sistema Integral: Estados del ciclo de vida de usuarios. Solo consulta/sincronización.",
    ownerModule: "users",
    ownerSystem: "SISTEMA_INTEGRAL",
    status: "active",
  },

  // FASE 3 - CATÁLOGOS DE PORTAFOLIO
  {
    id: "catalog_portfolio_status",
    code: "portfolio_status",
    name: "Estado de Portafolio",
    description: "Estados del portafolio: Activo, Inactivo",
    ownerModule: "portfolio",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_product_status",
    code: "product_status",
    name: "Estado de Producto",
    description: "Estados del ciclo de vida de productos",
    ownerModule: "products",
    ownerSystem: "ODISEO",
    status: "active",
  },
  // FASE 4 - CATÁLOGOS DEL SISTEMA INTEGRAL (TABLAS ESPEJO)
  {
    id: "catalog_packaging_machine",
    code: "packaging_machine",
    name: "Tipo de Envasado (Máquina de cliente)",
    description: "Tabla espejo del Sistema Integral: Tipos de envasado y máquinas de cliente. Solo consulta/sincronización.",
    ownerModule: "products",
    ownerSystem: "SISTEMA_INTEGRAL",
    status: "active",
  },

  {
    id: "catalog_product_line",
    code: "product_line",
    name: "Línea de Producto",
    description: "Líneas de negocio o producto",
    ownerModule: "portfolio",
    ownerSystem: "ODISEO",
    status: "active",
  },
  {
    id: "catalog_market_segment",
    code: "market_segment",
    name: "Segmento de Mercado",
    description: "Segmentación del mercado",
    ownerModule: "portfolio",
    ownerSystem: "ODISEO",
    status: "active",
  },
];

export function getCatalogDefinition(code: string): CatalogDefinition | undefined {
  return CATALOG_REGISTRY.find((cat) => cat.code === code);
}

export function getCatalogDefinitionById(id: string): CatalogDefinition | undefined {
  return CATALOG_REGISTRY.find((cat) => cat.id === id);
}

export function getActiveCatalogs(): CatalogDefinition[] {
  return CATALOG_REGISTRY.filter((cat) => cat.status === "active");
}

export function getCatalogsByModule(module: string): CatalogDefinition[] {
  return CATALOG_REGISTRY.filter((cat) => cat.ownerModule === module);
}
