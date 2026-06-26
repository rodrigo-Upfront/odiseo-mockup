/**
 * PRUEBA SIMPLE: Gestionar estado del catálogo "request_origin_plant"
 *
 * Este archivo proporciona una forma simple de probar el catálogo desde la consola
 */

import { getCatalogValues, upsertCatalogValues } from "../catalog.service";

// ═════════════════════════════════════════════════════════════════════
// PASO 1: VER ESTADO ACTUAL
// ═════════════════════════════════════════════════════════════════════

export function step1_viewCurrent() {
  console.clear();
  console.log("📋 PASO 1: Ver estado actual del catálogo\n");

  const allPlants = getCatalogValues("plant");
  const activePlants = getCatalogValues("plant", { activeOnly: true });

  console.log(`Total de plantas: ${allPlants.length}`);
  console.log(`Plantas activas: ${activePlants.length}\n`);

  console.log("📊 Detalle:");
  allPlants.forEach((plant) => {
    const status = plant.status === "Activo" ? "✅ ACTIVO" : "❌ INACTIVO";
    console.log(`   ${status}  |  ${plant.item}: ${plant.name}`);
  });

  return { allPlants, activePlants };
}

// ═════════════════════════════════════════════════════════════════════
// PASO 2: INACTIVAR UNA PLANTA (ej: AF Lima)
// ═════════════════════════════════════════════════════════════════════

export function step2_inactivatePlant(plantItemCode: string) {
  console.clear();
  console.log(`🔴 PASO 2: Inactivar planta "${plantItemCode}"\n`);

  try {
    // Obtener todas las plantas
    const allPlants = getCatalogValues("request_origin_plant");
    console.log(`Total de plantas actuales: ${allPlants.length}`);

    // Validar que la planta existe
    const plantExists = allPlants.find((p) => p.item === plantItemCode);
    if (!plantExists) {
      console.error(`❌ Error: Planta no encontrada: ${plantItemCode}`);
      console.log(`Plantas disponibles: ${allPlants.map((p) => p.item).join(", ")}`);
      return null;
    }

    console.log(`✅ Planta encontrada: ${plantExists.name}\n`);

    // Crear array actualizado con la planta inactivada
    const updatedPlants = allPlants.map((p) => ({
      item: p.item,
      name: p.name,
      status:
        p.item === plantItemCode
          ? ("Inactivo" as const)
          : (p.status as "Activo" | "Inactivo" | "Bloqueado"),
    }));

    console.log("📤 Enviando cambios al servicio...\n");

    // Enviar cambios
    const result = upsertCatalogValues({
      catalogCode: "request_origin_plant",
      rows: updatedPlants,
      user: "demo_inactivate",
      reason: `Inactivar ${plantItemCode} desde ejemplo de prueba`,
    });

    // Mostrar resultado
    console.log("✅ Resultado:");
    console.log(`   - Éxito: ${result.success}`);
    console.log(`   - Registros inactivados: ${result.inactivatedRecords}`);
    console.log(`   - Registros modificados: ${result.modifiedRecords}`);

    if (result.errors.length > 0) {
      console.error(`   - Errores: ${result.errors.join(", ")}`);
    }

    // Verificar cambios
    const newActivePlants = getCatalogValues("request_origin_plant", { activeOnly: true });
    console.log(`\n📊 Plantas activas después del cambio: ${newActivePlants.length}`);

    return result;
  } catch (error) {
    console.error("❌ Error:", error);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════════════
// PASO 3: REACTIVAR UNA PLANTA
// ═════════════════════════════════════════════════════════════════════

export function step3_reactivatePlant(plantItemCode: string) {
  console.clear();
  console.log(`🟢 PASO 3: Reactivar planta "${plantItemCode}"\n`);

  try {
    // Obtener todas las plantas
    const allPlants = getCatalogValues("request_origin_plant");

    // Validar que la planta existe
    const plantExists = allPlants.find((p) => p.item === plantItemCode);
    if (!plantExists) {
      console.error(`❌ Error: Planta no encontrada: ${plantItemCode}`);
      return null;
    }

    console.log(`✅ Planta encontrada: ${plantExists.name} (Estado actual: ${plantExists.status})\n`);

    // Crear array actualizado con la planta reactivada
    const updatedPlants = allPlants.map((p) => ({
      item: p.item,
      name: p.name,
      status:
        p.item === plantItemCode ? ("Activo" as const) : (p.status as "Activo" | "Inactivo" | "Bloqueado"),
    }));

    console.log("📤 Enviando cambios al servicio...\n");

    // Enviar cambios
    const result = upsertCatalogValues({
      catalogCode: "request_origin_plant",
      rows: updatedPlants,
      user: "demo_reactivate",
      reason: `Reactivar ${plantItemCode} desde ejemplo de prueba`,
    });

    // Mostrar resultado
    console.log("✅ Resultado:");
    console.log(`   - Éxito: ${result.success}`);
    console.log(`   - Registros modificados: ${result.modifiedRecords}`);

    if (result.errors.length > 0) {
      console.error(`   - Errores: ${result.errors.join(", ")}`);
    }

    // Verificar cambios
    const newActivePlants = getCatalogValues("request_origin_plant", { activeOnly: true });
    console.log(`\n📊 Plantas activas después del cambio: ${newActivePlants.length}`);

    return result;
  } catch (error) {
    console.error("❌ Error:", error);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════════════
// CÓMO USAR DESDE LA CONSOLA DEL NAVEGADOR
// ═════════════════════════════════════════════════════════════════════

/**
 * INSTRUCCIONES:
 *
 * 1. Abre Portafolio → Crear Portafolio (para ver el selector en tiempo real)
 *
 * 2. Abre la consola (F12 → Console)
 *
 * 3. Ejecuta en orden:
 *
 *    // Ver estado actual
 *    import('/src/shared/catalogs/examples/test-catalog.ts').then(m => {
 *      m.step1_viewCurrent();
 *    })
 *
 *    // Inactivar AF Lima - desaparece del selector
 *    import('/src/shared/catalogs/examples/test-catalog.ts').then(m => {
 *      m.step2_inactivatePlant("AF-LIM");
 *    })
 *
 *    // Ver estado actual (AF Lima está inactiva ahora)
 *    import('/src/shared/catalogs/examples/test-catalog.ts').then(m => {
 *      m.step1_viewCurrent();
 *    })
 *
 *    // Reactivar AF Lima - reaparece en el selector
 *    import('/src/shared/catalogs/examples/test-catalog.ts').then(m => {
 *      m.step3_reactivatePlant("AF-LIM");
 *    })
 *
 * ✨ RESULTADO ESPERADO:
 *    - Cuando inactivas una planta, desaparece del selector en Sección 5
 *    - Cuando la reactivas, reaparece automáticamente
 *    - NO necesitas recargar la página
 */
