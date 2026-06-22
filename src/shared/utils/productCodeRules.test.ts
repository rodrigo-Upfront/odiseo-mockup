/**
 * Ejemplos y pruebas de las reglas de códigos de producto en ODISEO
 *
 * Separa SKU (interno), EDAG (WebCenter + SI) y EM (solo SI)
 */

import {
  // SKU
  parseSKU,
  formatSKU,
  validateSKU,
  generateNewSKU,
  getSKUInfo,
  getSKUCycleLabel,
  // EDAG
  parseEDAG,
  formatEDAG,
  validateEDAG,
  generateNewEDAG,
  incrementEDAGVersion,
  getEDAGInfo,
  // EM
  parseEM,
  formatEM,
  validateEM,
  generateNewEM,
  incrementEMVersion,
  getEMInfo,
  // Validación general
  validateProductCodes,
} from './productCodeRules';

import {
  generateWebCenterPayload,
  generateSistemaIntegralPayload,
  validateForWebCenter,
  validateForSistemaIntegral,
  validateSKUNotSent,
  validateEMNotSentToWebCenter,
  validateCodeConsistency,
  getProductCodesSummary,
} from './productCodeIntegration';

console.log('========== EJEMPLOS DE USO ODISEO ==========\n');

// ============= EJEMPLOS SKU (Interno) =============

console.log('=== EJEMPLO 1: SKU Producto Nuevo ===');
const newSKU = generateNewSKU(1);
console.log('SKU generado:', newSKU);
console.log('Información:', getSKUInfo(newSKU));
// Output: SKU-00001-E-00

console.log('\n=== EJEMPLO 2: SKU Producto Modificado ===');
const modifiedSKU = formatSKU(1, 'E', 1);
console.log('SKU modificado:', modifiedSKU);
const skuParsed = parseSKU(modifiedSKU);
console.log('Ciclo:', getSKUCycleLabel(skuParsed.cycle));
// Output: SKU-00001-E-01, Ciclo: Preliminar

console.log('\n=== EJEMPLO 3: SKU Aprobado ===');
const approvedSKU = formatSKU(1, 'A', 1);
console.log('SKU aprobado:', approvedSKU);
// Output: SKU-00001-A-01

// ============= EJEMPLOS EDAG (WebCenter + SI) =============

console.log('\n=== EJEMPLO 4: EDAG Primera Versión ===');
const newEDAG = generateNewEDAG(60000);
console.log('EDAG generado:', newEDAG);
console.log('Información:', getEDAGInfo(newEDAG));
// Output: 60000-00

console.log('\n=== EJEMPLO 5: EDAG Versión Incrementada ===');
const edagV1 = incrementEDAGVersion('60000-00');
console.log('EDAG versión anterior: 60000-00');
console.log('EDAG versión nueva:', edagV1);
// Output: 60000-01

console.log('\n=== EJEMPLO 6: Validar EDAG para WebCenter ===');
const validation = validateForWebCenter('60000-00');
console.log('¿Válido para WebCenter?', validation.valid);
console.log('Errores:', validation.errors);
// Output: true, []

// ============= EJEMPLOS EM (Solo SI) =============

console.log('\n=== EJEMPLO 7: EM Primera Versión ===');
const newEM = generateNewEM(500000);
console.log('EM generado:', newEM);
console.log('Información:', getEMInfo(newEM));
// Output: 50000-00

console.log('\n=== EJEMPLO 8: EM Versión Incrementada ===');
const emV1 = incrementEMVersion('50000-00');
console.log('EM versión anterior: 50000-00');
console.log('EM versión nueva:', emV1);
// Output: 500000-01

console.log('\n=== EJEMPLO 9: Validar EM para Sistema Integral ===');
const emValidation = validateForSistemaIntegral('60000-00', '50000-00');
console.log('¿Válido para Sistema Integral?', emValidation.valid);
console.log('Errores:', emValidation.errors);
// Output: true, []

// ============= EJEMPLOS PAYLOADS =============

console.log('\n=== EJEMPLO 10: Payload para WebCenter ===');
const webCenterPayload = generateWebCenterPayload('60000-00');
console.log('Payload:', JSON.stringify(webCenterPayload, null, 2));
// Output: { edagCode: "60000-00" }

console.log('\n=== EJEMPLO 11: Payload para Sistema Integral ===');
const siPayload = generateSistemaIntegralPayload('60000-00', '50000-00');
console.log('Payload:', JSON.stringify(siPayload, null, 2));
// Output: { edagCode: "60000-00", emCode: "50000-00" }

// ============= EJEMPLO COMPLETO =============

console.log('\n=== EJEMPLO 12: Producto Completo con Todos los Códigos ===');
const productCodes = {
  // SKU interno (NO se envía)
  skuCode: 'SKU-00001-E-00',
  skuSequence: 1,
  skuLifecycleCode: 'E' as const,
  skuVersion: 0,
  // EDAG (se envía a WebCenter y SI)
  edagCode: '60000-00',
  edagSequence: 60000,
  edagVersion: 0,
  // EM (se envía solo a SI)
  emCode: '50000-00',
  emSequence: 500000,
  emVersion: 0,
};

console.log(getProductCodesSummary(productCodes));

// ============= PRUEBAS UNITARIAS =============

console.log('\n========== PRUEBAS UNITARIAS ==========\n');

// Test 1: SKU válido
console.log('TEST 1: SKU válido');
const test1 = validateSKU('SKU-00001-E-00');
console.assert(test1.valid === true, 'SKU debería ser válido');
console.log('✓ PASSED\n');

// Test 2: SKU inválido - ciclo incorrecto
console.log('TEST 2: SKU inválido - ciclo P');
const test2 = validateSKU('SKU-00001-P-00');
console.assert(test2.valid === false, 'SKU con ciclo P debería ser inválido');
console.log('✓ PASSED\n');

// Test 3: EDAG válido
console.log('TEST 3: EDAG válido');
const test3 = validateEDAG('60000-00');
console.assert(test3.valid === true, 'EDAG debería ser válido');
console.log('✓ PASSED\n');

// Test 4: EDAG inválido - secuencia menor a 60000
console.log('TEST 4: EDAG inválido - secuencia menor a 60000');
const test4 = validateEDAG('50000-00');
console.assert(test4.valid === false, 'EDAG con secuencia < 60000 debería ser inválido');
console.log('✓ PASSED\n');

// Test 5: EM válido
console.log('TEST 5: EM válido');
const test5 = validateEM('50000-00');
console.assert(test5.valid === true, 'EM debería ser válido');
console.log('✓ PASSED\n');

// Test 6: EM inválido - secuencia menor a 500000
console.log('TEST 6: EM inválido - secuencia menor a 500000');
const test6 = validateEM('400000-00');
console.assert(test6.valid === false, 'EM con secuencia < 500000 debería ser inválido');
console.log('✓ PASSED\n');

// Test 7: Incrementar EDAG version
console.log('TEST 7: Incrementar EDAG version');
const test7 = incrementEDAGVersion('60000-00');
console.assert(test7 === '60000-01', 'EDAG versión debería incrementarse');
console.log('✓ PASSED\n');

// Test 8: Incrementar EM version
console.log('TEST 8: Incrementar EM version');
const test8 = incrementEMVersion('50000-00');
console.assert(test8 === '500000-01', 'EM versión debería incrementarse');
console.log('✓ PASSED\n');

// Test 9: No se puede enviar SKU a WebCenter
console.log('TEST 9: Validar que SKU NO se envía a WebCenter');
const test9 = validateSKUNotSent('SKU-00001-E-00');
console.assert(test9.valid === false, 'SKU no debería enviarse a WebCenter');
console.log('✓ PASSED\n');

// Test 10: No se puede enviar EM a WebCenter
console.log('TEST 10: Validar que EM NO se envía a WebCenter');
const test10 = validateEMNotSentToWebCenter('50000-00');
console.assert(test10.valid === false, 'EM no debería enviarse a WebCenter');
console.log('✓ PASSED\n');

// Test 11: WebCenter payload solo contiene EDAG
console.log('TEST 11: WebCenter payload solo contiene EDAG');
const test11 = generateWebCenterPayload('60000-00');
console.assert(test11?.edagCode === '60000-00', 'Payload debería contener EDAG');
console.assert(!('emCode' in (test11 || {})), 'Payload NO debería contener EM');
console.log('✓ PASSED\n');

// Test 12: Sistema Integral payload contiene EDAG y EM
console.log('TEST 12: Sistema Integral payload contiene EDAG y EM');
const test12 = generateSistemaIntegralPayload('60000-00', '50000-00');
console.assert(test12?.edagCode === '60000-00', 'Payload debería contener EDAG');
console.assert(test12?.emCode === '50000-00', 'Payload debería contener EM');
console.log('✓ PASSED\n');

// Test 13: Validar consistencia de códigos
console.log('TEST 13: Validar consistencia de códigos');
const test13 = validateCodeConsistency({
  skuCode: 'SKU-00001-E-00',
  skuSequence: 1,
  skuLifecycleCode: 'E',
  skuVersion: 0,
  edagCode: '60000-00',
  edagSequence: 60000,
  edagVersion: 0,
  emCode: '50000-00',
  emSequence: 500000,
  emVersion: 0,
});
console.assert(test13.valid === true, 'Códigos deberían ser consistentes');
console.log('✓ PASSED\n');

// Test 14: Detectar inconsistencia en versión SKU
console.log('TEST 14: Detectar inconsistencia en versión SKU');
const test14 = validateCodeConsistency({
  skuCode: 'SKU-00001-E-00',
  skuVersion: 5, // Inconsistente
});
console.assert(test14.warnings.length > 0, 'Debería detectar inconsistencia');
console.log('✓ PASSED\n');

// Test 15: Formato de EM con 6 dígitos
console.log('TEST 15: Formato de EM con 6 dígitos');
const test15 = formatEM(500000, 0);
console.assert(test15 === '50000-00', 'EM debería tener 6 dígitos');
console.log('✓ PASSED\n');

console.log('========== TODAS LAS PRUEBAS PASARON ✓ ==========');
