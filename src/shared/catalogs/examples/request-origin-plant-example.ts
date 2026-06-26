/**
 * EJEMPLO INTERNO: Cómo agregar o modificar el estado del catálogo "plant"
 *
 * Este archivo demuestra:
 * 1. Cómo obtener los valores actuales del catálogo
 * 2. Cómo agregar un nuevo valor
 * 3. Cómo modificar el estado de un valor existente (inactivar/activar)
 * 4. Cómo validar que los cambios se aplican correctamente en PlantSelector
 *
 * IMPORTANTE: El PlantSelector en PortfolioCreatePage.tsx está conectado directamente
 * a getCatalogValues("plant", { activeOnly: true }), así que cualquier
 * cambio se refleja automáticamente en la interfaz.
 */

import { getCatalogValues, upsertCatalogValues } from "../catalog.service";

// ═════════════════════════════════════════════════════════════════════
// EJEMPLO 1: OBTENER LOS VALORES ACTUALES DEL CATÁLOGO
// ═════════════════════════════════════════════════════════════════════

export function exampleGetRequestOriginPlants() {
  console.log("📋 Obteniendo valores del catálogo 'request_origin_plant'...\n");

  const allValues = getCatalogValues("plant");
  const activeValues = getCatalogValues("plant", { activeOnly: true });

  console.log(`✅ Valores totales: ${allValues.length}`);
  console.log(`✅ Valores activos: ${activeValues.length}`);
  console.log("\n📊 Detalle:");
  allValues.forEach((v) => {
    const status = v.status === "Activo" ? "✅" : "❌";
    console.log(`  ${status} ${v.item}: ${v.name} (${v.status})`);
  });

  return { allValues, activeValues };
}

// ═════════════════════════════════════════════════════════════════════
// EJEMPLO 2: AGREGAR UN NUEVO VALOR AL CATÁLOGO
// ═════════════════════════════════════════════════════════════════════

export function exampleAddNewPlant() {
  console.log("➕ Agregando nueva planta al catálogo...\n");

  const currentPlants = getCatalogValues("plant");
  console.log(`Plantas actuales: ${currentPlants.length}`);

  // Obtener los datos actuales + nuevo valor
  const plantsToUpdate = currentPlants.map((p) => ({
    item: p.item,
    name: p.name,
    status: p.status as "Activo" | "Inactivo" | "Bloqueado",
  }));

  // Agregar nueva planta
  plantsToUpdate.push({
    item: "AF-TJA",
    name: "AF Tijuana",
    status: "Activo",
  });

  // Aplicar cambios
  const result = upsertCatalogValues({
    catalogCode: "plant",
    rows: plantsToUpdate,
    user: "demo_user",
    reason: "Ejemplo interno: agregar nueva planta",
  });

  console.log("✅ Resultado de la actualización:");
  console.log(`   - Nuevos registros: ${result.newRecords}`);
  console.log(`   - Registros modificados: ${result.modifiedRecords}`);
  console.log(`   - Éxito: ${result.success}`);

  // Verificar que se agregó correctamente
  const updatedValues = getCatalogValues("plant");
  console.log(`\n📊 Plantas después de agregar: ${updatedValues.length}`);

  return result;
}

// ═════════════════════════════════════════════════════════════════════
// EJEMPLO 3: INACTIVAR UNA PLANTA EXISTENTE
// ═════════════════════════════════════════════════════════════════════

export function exampleInactivatePlant(plantItem: string) {
  console.log(`🔄 Inactivando planta: ${plantItem}...\n`);

  const allPlants = getCatalogValues("plant");
  const plantToInactivate = allPlants.find((p) => p.item === plantItem);

  if (!plantToInactivate) {
    console.log(`❌ Planta no encontrada: ${plantItem}`);
    return null;
  }

  console.log(`Found: ${plantToInactivate.item} - ${plantToInactivate.name}`);

  // Actualizar todas las plantas, cambiando el estado de la que queremos inactivar
  const plantsToUpdate = allPlants.map((p) => ({
    item: p.item,
    name: p.name,
    status: p.item === plantItem ? ("Inactivo" as const) : (p.status as "Activo" | "Inactivo" | "Bloqueado"),
  }));

  const result = upsertCatalogValues({
    catalogCode: "plant",
    rows: plantsToUpdate,
    user: "demo_user",
    reason: `Ejemplo interno: inactivar planta ${plantItem}`,
  });

  console.log("✅ Resultado:");
  console.log(`   - Registros inactivados: ${result.inactivatedRecords}`);
  console.log(`   - Éxito: ${result.success}`);

  // Verificar
  const activeValues = getCatalogValues("plant", { activeOnly: true });
  console.log(`\n📊 Plantas activas después de inactivar: ${activeValues.length}`);

  return result;
}

// ═════════════════════════════════════════════════════════════════════
// EJEMPLO 4: REACTIVAR UNA PLANTA
// ═════════════════════════════════════════════════════════════════════

export function exampleReactivatePlant(plantItem: string) {
  console.log(`♻️  Reactivando planta: ${plantItem}...\n`);

  const allPlants = getCatalogValues("plant");
  const plantToReactivate = allPlants.find((p) => p.item === plantItem);

  if (!plantToReactivate) {
    console.log(`❌ Planta no encontrada: ${plantItem}`);
    return null;
  }

  console.log(`Found: ${plantToReactivate.item} - ${plantToReactivate.name}`);

  // Actualizar todas las plantas, cambiando el estado a Activo
  const plantsToUpdate = allPlants.map((p) => ({
    item: p.item,
    name: p.name,
    status: p.item === plantItem ? ("Activo" as const) : (p.status as "Activo" | "Inactivo" | "Bloqueado"),
  }));

  const result = upsertCatalogValues({
    catalogCode: "plant",
    rows: plantsToUpdate,
    user: "demo_user",
    reason: `Ejemplo interno: reactivar planta ${plantItem}`,
  });

  console.log("✅ Resultado:");
  console.log(`   - Registros modificados: ${result.modifiedRecords}`);
  console.log(`   - Éxito: ${result.success}`);

  return result;
}

// ═════════════════════════════════════════════════════════════════════
// EJEMPLO 5: VALIDACIÓN - VERIFICAR INTEGRIDAD DEL CATÁLOGO
// ═════════════════════════════════════════════════════════════════════

export function exampleValidateCatalogIntegrity() {
  console.log("🔍 Validando integridad del catálogo 'request_origin_plant'...\n");

  const allValues = getCatalogValues("plant");
  const activeValues = getCatalogValues("plant", { activeOnly: true });
  const expectedPlants = ["AF-LIM", "AF-CAL", "AF-STN", "AF-SL"];

  console.log(`Total de registros: ${allValues.length}`);
  console.log(`Esperados: ${expectedPlants.length}`);
  console.log(`Registros activos: ${activeValues.length}`);

  const foundPlants = allValues.map((v) => v.item);
  const allFound = expectedPlants.every((plant) => foundPlants.includes(plant));

  if (allFound) {
    console.log("\n✅ Catálogo válido: Todos los valores esperados están presentes");
  } else {
    const missing = expectedPlants.filter((plant) => !foundPlants.includes(plant));
    console.log(`\n❌ Catálogo inválido: Faltan plantas: ${missing.join(", ")}`);
  }

  // Mostrar estado detallado
  console.log("\n📋 Detalle de plantas:");
  allValues.forEach((v) => {
    const status = v.status === "Activo" ? "✅" : "❌";
    console.log(`  ${status} ${v.item}: ${v.name} (${v.status})`);
  });

  return allFound;
}

// ═════════════════════════════════════════════════════════════════════
// CÓMO USAR ESTOS EJEMPLOS EN CONSOLA DEL NAVEGADOR:
// ═════════════════════════════════════════════════════════════════════

/**
 * 1. Abre la consola del navegador (F12 → Console)
 *
 * 2. Importa e importa el módulo:
 *    import * as examples from "/src/shared/catalogs/examples/request-origin-plant-example.ts"
 *
 * 3. Ejecuta los ejemplos:
 *    - examples.exampleGetRequestOriginPlants()
 *    - examples.exampleValidateCatalogIntegrity()
 *    - examples.exampleInactivatePlant("AF-LIM")  // Inactivar AF Lima
 *    - examples.exampleReactivatePlant("AF-LIM")  // Reactivar AF Lima
 *    - examples.exampleAddNewPlant()              // Agregar AF Tijuana
 *
 * 4. PRUEBA EN VIVO EN LA UI:
 *    - Navega a "Crear Portafolio" (PortfolioCreatePage)
 *    - La Sección 5 "Planta de Origen de solicitud" mostrará el PlantSelector
 *    - Los botones de plantas desaparecerán automáticamente si las inactivas desde la consola
 *    - Las plantas reaparecerán cuando las reactives
 *
 * ✨ MAGIA: PlantSelector está conectado directamente a getCatalogValues() vía useMemo,
 *    así que cualquier cambio en el catálogo se refleja automáticamente sin necesidad
 *    de recargar la página.
 */
