export type SkuLifecycleCode = "B" | "A" | "P" | "E";

export type ApprovedProduct = {
  id: string;
  code: string;
  name: string;
  productName?: string;
  portfolioCode: string;
  portfolioName?: string;
  clientCode?: string;
  clientName?: string;
  type: "base" | "approved" | "portfolio_standard";
  productType?: "base" | "approved" | "portfolio_standard";
  version?: string;
  status: "Activo" | "Inactivo" | "Base" | "Aprobado" | "Portafolio estándar";
  skuLifecycleCode?: SkuLifecycleCode;
  cicloVida?: SkuLifecycleCode;
  lifecycleLabel?: string;
  // Heredable fields
  wrappingName?: string;
  envoltura?: string;
  useFinalName?: string;
  usoFinal?: string;
  packingMachineName?: string;
  maquinaCliente?: string;
  capacityValue?: string;
  capacityUnit?: string;
  hasSpecialDesign?: "Sí" | "No";
  description?: string;
  // Materiales por capa
  layer1Material?: string;
  layer1Micron?: string;
  layer2Material?: string;
  layer2Micron?: string;
  layer3Material?: string;
  layer3Micron?: string;
  layer4Material?: string;
  layer4Micron?: string;
};

const APPROVED_PRODUCTS: ApprovedProduct[] = [
  // Productos Base para Portafolio Mayonesa Premium
  {
    id: "APR-001",
    code: "SKU-00001-B",
    name: "Mayonesa Premium Base - Botella 500ml",
    portfolioCode: "PO-000023",
    type: "base",
    version: "01",
    status: "Activo",
    wrappingName: "POUCH",
    useFinalName: "Wet Condiments & Sauces",
    packingMachineName: "HFFS - Stand up Pouch - Sello Doy Pack",
    capacityValue: "500",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Premium en formato botella de 500ml. Producto base para salsas y condimentos húmedos.",
    layer1Material: "BOPP",
    layer1Micron: "20",
    layer2Material: "PET / Poliéster",
    layer2Micron: "12",
    layer3Material: "COEX",
    layer3Micron: "25",
  },
  {
    id: "APR-002",
    code: "SKU-00002-B",
    name: "Mayonesa Premium Base - Sachet 20ml",
    portfolioCode: "PO-000023",
    type: "base",
    version: "01",
    status: "Activo",
    wrappingName: "SOBRE",
    useFinalName: "Retail - Dispensers",
    packingMachineName: "Sachets - Horizontal Form Fill Seal",
    capacityValue: "20",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Premium en formato sachet de 20ml. Ideal para dispensadores retail.",
    layer1Material: "BOPP",
    layer1Micron: "15",
    layer2Material: "PET / Poliéster",
    layer2Micron: "10",
    layer3Material: "COEX",
    layer3Micron: "20",
  },
  {
    id: "APR-003",
    code: "SKU-00003-B",
    name: "Mayonesa Premium Base - Balde 5kg",
    portfolioCode: "PO-000023",
    type: "base",
    version: "01",
    status: "Activo",
    wrappingName: "BALDE",
    useFinalName: "Food Service - Bulk",
    packingMachineName: "Llenadora de Baldes",
    capacityValue: "5",
    capacityUnit: "kg",
    hasSpecialDesign: "No",
    description: "Mayonesa Premium en formato balde de 5kg. Presentación para food service y distribución a granel.",
    layer1Material: "BOPP",
    layer1Micron: "25",
    layer2Material: "PET / Poliéster",
    layer2Micron: "12",
    layer3Material: "COEX",
    layer3Micron: "30",
  },
  // Productos Aprobados para Portafolio Mayonesa Premium
  {
    id: "APR-004",
    code: "SKU-00001-A",
    name: "Mayonesa Premium Aprobada - Botella 500ml",
    portfolioCode: "PO-000023",
    type: "approved",
    version: "21",
    status: "Activo",
    wrappingName: "POUCH",
    useFinalName: "Wet Condiments & Sauces",
    packingMachineName: "HFFS - Stand up Pouch - Sello Doy Pack",
    capacityValue: "500",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Premium aprobada en formato botella de 500ml. Versión 2.1 con mejoras en formulación.",
    layer1Material: "BOPP",
    layer1Micron: "20",
    layer2Material: "PET / Poliéster",
    layer2Micron: "12",
    layer3Material: "COEX",
    layer3Micron: "25",
  },
  {
    id: "APR-005",
    code: "SKU-00002-A",
    name: "Mayonesa Premium Aprobada - Sachet 20ml",
    portfolioCode: "PO-000023",
    type: "approved",
    version: "02",
    status: "Activo",
    wrappingName: "SOBRE",
    useFinalName: "Retail - Dispensers",
    packingMachineName: "Sachets - Horizontal Form Fill Seal",
    capacityValue: "20",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Premium aprobada en formato sachet de 20ml. Perfecto para dispensadores retail.",
    layer1Material: "BOPP",
    layer1Micron: "15",
    layer2Material: "PET / Poliéster",
    layer2Micron: "10",
    layer3Material: "COEX",
    layer3Micron: "20",
  },
  {
    id: "APR-006",
    code: "SKU-00003-A",
    name: "Mayonesa Premium Aprobada - Balde 5kg",
    portfolioCode: "PO-000023",
    type: "approved",
    version: "15",
    status: "Activo",
    wrappingName: "BALDE",
    useFinalName: "Food Service - Bulk",
    packingMachineName: "Llenadora de Baldes",
    capacityValue: "5",
    capacityUnit: "kg",
    hasSpecialDesign: "No",
    description: "Mayonesa Premium aprobada en formato balde de 5kg. Para food service y distribución a granel.",
    layer1Material: "BOPP",
    layer1Micron: "25",
    layer2Material: "PET / Poliéster",
    layer2Micron: "12",
    layer3Material: "COEX",
    layer3Micron: "30",
  },
  // Productos Base adicionales para Portafolio Mayonesa Premium - Alicorp
  {
    id: "APR-007",
    code: "SKU-00004-B",
    name: "Mayonesa Light Base - Botella 400ml",
    portfolioCode: "PO-000023",
    type: "base",
    version: "01",
    status: "Activo",
    wrappingName: "BOTELLA PLÁSTICA",
    useFinalName: "Retail - Premium",
    packingMachineName: "Llenadora de Botellas PET",
    capacityValue: "400",
    capacityUnit: "ml",
    hasSpecialDesign: "Sí",
    description: "Mayonesa Light base en botella de 400ml con diseño especial. Versión reducida en calorías.",
    layer1Material: "BOPP",
    layer1Micron: "17",
    layer2Material: "PET / Poliéster",
    layer2Micron: "12",
    layer3Material: "COEX",
    layer3Micron: "22",
  },
  {
    id: "APR-008",
    code: "SKU-00005-B",
    name: "Mayonesa Extra Base - Tubo 150ml",
    portfolioCode: "PO-000023",
    type: "base",
    version: "01",
    status: "Activo",
    wrappingName: "TUBO",
    useFinalName: "Retail - Travel Size",
    packingMachineName: "Llenadora de Tubos",
    capacityValue: "150",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Extra base en tubo de 150ml. Formato portátil ideal para viajes y uso personal.",
    layer1Material: "Aluminio / Foil",
    layer1Micron: "9",
    layer2Material: "BOPA / Nylon",
    layer2Micron: "15",
    layer3Material: "PE sellante",
    layer3Micron: "90",
  },
  {
    id: "APR-009",
    code: "SKU-00006-B",
    name: "Mayonesa Económica Base - Pote 750ml",
    portfolioCode: "PO-000023",
    type: "base",
    version: "01",
    status: "Activo",
    wrappingName: "POTE",
    useFinalName: "Food Service - Bulk",
    packingMachineName: "Llenadora de Potes",
    capacityValue: "750",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Económica base en pote de 750ml. Opción de precio accesible para distribución a granel.",
    layer1Material: "BOPP",
    layer1Micron: "16",
    layer2Material: "PET / Poliéster",
    layer2Micron: "10",
    layer3Material: "COEX",
    layer3Micron: "21",
  },
  // Productos Aprobados adicionales para Portafolio Mayonesa Premium - Alicorp
  {
    id: "APR-010",
    code: "SKU-00004-A",
    name: "Mayonesa Light Aprobada - Botella 400ml",
    portfolioCode: "PO-000023",
    type: "approved",
    version: "1.2",
    status: "Activo",
    wrappingName: "BOTELLA PLÁSTICA",
    useFinalName: "Retail - Premium",
    packingMachineName: "Llenadora de Botellas PET",
    capacityValue: "400",
    capacityUnit: "ml",
    hasSpecialDesign: "Sí",
    description: "Mayonesa Light aprobada en botella de 400ml con diseño especial premium. Versión 1.2.",
    layer1Material: "BOPP",
    layer1Micron: "17",
    layer2Material: "PET / Poliéster",
    layer2Micron: "12",
    layer3Material: "COEX",
    layer3Micron: "22",
  },
  {
    id: "APR-011",
    code: "SKU-00005-A",
    name: "Mayonesa Extra Aprobada - Tubo 150ml",
    portfolioCode: "PO-000023",
    type: "approved",
    version: "01",
    status: "Activo",
    wrappingName: "TUBO",
    useFinalName: "Retail - Travel Size",
    packingMachineName: "Llenadora de Tubos",
    capacityValue: "150",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Extra aprobada en tubo de 150ml. Formato portátil ideal para viajes.",
    layer1Material: "Aluminio / Foil",
    layer1Micron: "9",
    layer2Material: "BOPA / Nylon",
    layer2Micron: "15",
    layer3Material: "PE sellante",
    layer3Micron: "90",
  },
  {
    id: "APR-012",
    code: "SKU-00006-A",
    name: "Mayonesa Económica Aprobada - Pote 750ml",
    portfolioCode: "PO-000023",
    type: "approved",
    version: "1.1",
    status: "Activo",
    wrappingName: "POTE",
    useFinalName: "Food Service - Bulk",
    packingMachineName: "Llenadora de Potes",
    capacityValue: "750",
    capacityUnit: "ml",
    hasSpecialDesign: "No",
    description: "Mayonesa Económica aprobada en pote de 750ml. Versión 1.1 mejorada para distribución.",
    layer1Material: "BOPP",
    layer1Micron: "16",
    layer2Material: "PET / Poliéster",
    layer2Micron: "10",
    layer3Material: "COEX",
    layer3Micron: "21",
  },
  // Productos Alicorp - Mayonesa Premium (CL-000001 / PO-000023)
  {
    id: "SKU-00021-B-01",
    code: "SKU-00021-B",
    version: "01",
    name: "Mayonesa Premium 500 g",
    productName: "Mayonesa Premium",
    clientCode: "CL-000001",
    clientName: "Alicorp S.A.A.",
    portfolioCode: "PO-000023",
    portfolioName: "Mayonesa Premium",
    type: "base",
    productType: "base",
    skuLifecycleCode: "B",
    cicloVida: "B",
    lifecycleLabel: "Base",
    status: "Base",
    wrappingName: "POUCH",
    envoltura: "POUCH",
    useFinalName: "Wet Condiments & Sauces",
    usoFinal: "Wet Condiments & Sauces",
    packingMachineName: "HFFS - Stand up Pouch - Sello Doy Pack",
    maquinaCliente: "HFFS - Stand up Pouch - Sello Doy Pack",
    capacityValue: "500",
    capacityUnit: "g",
    description: "Producto base técnico reutilizable para solicitudes de mayonesa premium en formato pouch.",
    layer1Material: "PET",
    layer1Micron: "12",
    layer2Material: "BOPP",
    layer2Micron: "20",
    layer3Material: "PE_SELLANTE",
    layer3Micron: "80",
  },
  {
    id: "SKU-00022-A-01",
    code: "SKU-00022-A",
    version: "01",
    name: "Mayonesa Premium 500 g Pouch",
    productName: "Mayonesa Premium",
    clientCode: "CL-000001",
    clientName: "Alicorp S.A.A.",
    portfolioCode: "PO-000023",
    portfolioName: "Mayonesa Premium",
    type: "approved",
    productType: "approved",
    skuLifecycleCode: "A",
    cicloVida: "A",
    lifecycleLabel: "Aprobado",
    status: "Aprobado",
    wrappingName: "POUCH",
    envoltura: "POUCH",
    useFinalName: "Wet Condiments & Sauces",
    usoFinal: "Wet Condiments & Sauces",
    packingMachineName: "HFFS - Stand up Pouch - Sello Doy Pack",
    maquinaCliente: "HFFS - Stand up Pouch - Sello Doy Pack",
    capacityValue: "500",
    capacityUnit: "g",
    description: "SKU aprobado y vigente para operación comercial de Mayonesa Premium 500 g.",
    layer1Material: "PET",
    layer1Micron: "12",
    layer2Material: "BOPP",
    layer2Micron: "20",
    layer3Material: "PE_SELLANTE",
    layer3Micron: "80",
  },
  {
    id: "SKU-00023-A-01",
    code: "SKU-00023-A",
    version: "01",
    name: "Mayonesa Premium 900 g Pouch",
    productName: "Mayonesa Premium",
    clientCode: "CL-000001",
    clientName: "Alicorp S.A.A.",
    portfolioCode: "PO-000023",
    portfolioName: "Mayonesa Premium",
    type: "approved",
    productType: "approved",
    skuLifecycleCode: "A",
    cicloVida: "A",
    lifecycleLabel: "Aprobado",
    status: "Aprobado",
    wrappingName: "POUCH",
    envoltura: "POUCH",
    useFinalName: "Wet Condiments & Sauces",
    usoFinal: "Wet Condiments & Sauces",
    packingMachineName: "HFFS - Stand up Pouch - Sello Doy Pack",
    maquinaCliente: "HFFS - Stand up Pouch - Sello Doy Pack",
    capacityValue: "900",
    capacityUnit: "g",
    description: "SKU aprobado y vigente para operación comercial de Mayonesa Premium 900 g.",
    layer1Material: "PET",
    layer1Micron: "12",
    layer2Material: "ALUMINIO",
    layer2Micron: "7",
    layer3Material: "PE_SELLANTE",
    layer3Micron: "90",
  },
  {
    id: "SKU-00024-P-01",
    code: "SKU-00024-P",
    version: "01",
    name: "Mayonesa Premium Estándar Pouch",
    productName: "Mayonesa Premium",
    clientCode: "CL-000001",
    clientName: "Alicorp S.A.A.",
    portfolioCode: "PO-000023",
    portfolioName: "Mayonesa Premium",
    type: "approved",
    productType: "portfolio_standard",
    skuLifecycleCode: "P",
    cicloVida: "P",
    lifecycleLabel: "Portafolio estándar",
    status: "Portafolio estándar",
    wrappingName: "POUCH",
    envoltura: "POUCH",
    useFinalName: "Wet Condiments & Sauces",
    usoFinal: "Wet Condiments & Sauces",
    packingMachineName: "HFFS - Stand up Pouch - Sello Doy Pack",
    maquinaCliente: "HFFS - Stand up Pouch - Sello Doy Pack",
    capacityValue: "500",
    capacityUnit: "g",
    description: "Producto aprobado que forma parte de una configuración estándar de portafolio.",
    layer1Material: "PET",
    layer1Micron: "12",
    layer2Material: "BOPP",
    layer2Micron: "20",
    layer3Material: "PE_SELLANTE",
    layer3Micron: "80",
  },
];

export function getAllApprovedProducts(): ApprovedProduct[] {
  return APPROVED_PRODUCTS;
}

export function getApprovedProductsByPortfolio(portfolioCode: string): ApprovedProduct[] {
  return APPROVED_PRODUCTS.filter(
    (product) => product.portfolioCode === portfolioCode && product.status === "Activo"
  );
}

export function getApprovedProductByCode(code: string): ApprovedProduct | undefined {
  return APPROVED_PRODUCTS.find((product) => product.code === code);
}

export function searchApprovedProducts(
  query: string,
  portfolioCode?: string,
  productType?: "base" | "approved" | "portfolio_standard"
): ApprovedProduct[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];

  let results = APPROVED_PRODUCTS.filter(
    (product) => product.status === "Activo"
  );

  if (portfolioCode) {
    results = results.filter((product) => product.portfolioCode === portfolioCode);
  }

  // Filter by productType -> skuLifecycleCode mapping
  if (productType) {
    results = results.filter((product) => {
      const lifecycle = product.skuLifecycleCode || product.cicloVida;

      if (productType === "base") {
        // Base products: skuLifecycleCode "B"
        return lifecycle === "B" || product.type === "base";
      } else if (productType === "approved") {
        // Approved products: skuLifecycleCode "A" and "P"
        return lifecycle === "A" || lifecycle === "P" || product.type === "approved" || product.type === "portfolio_standard";
      } else if (productType === "portfolio_standard") {
        // Portfolio standard products: skuLifecycleCode "P"
        return lifecycle === "P" || product.type === "portfolio_standard";
      }

      return true;
    });
  }

  return results.filter((product) => {
    const code = (product.code || "").toLowerCase();
    const name = (product.name || "").toLowerCase();
    const productName = (product.productName || "").toLowerCase();

    return (
      code.includes(searchTerm) ||
      name.includes(searchTerm) ||
      productName.includes(searchTerm)
    );
  });
}
