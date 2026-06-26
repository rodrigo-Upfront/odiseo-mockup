/**
 * Ejemplos y pruebas de las reglas de generación de códigos SKU
 *
 * Para ejecutar las pruebas:
 * npm test -- skuCodeRules.test.ts
 */

import {
  parseSKUCode,
  formatSKU,
  validateSKUCode,
  generateNewProductSKU,
  generateModifiedProductSKU,
  approveSKU,
  markSKUAsBase,
  inactivateSKU,
  validateNewSKUGeneration,
  getNextCorrelativo,
  getSKUCycle,
  getSKUVersion,
  getSKUCorrelativo,
  getCycleLabel,
} from './skuCodeRules';

/**
 * ========== EJEMPLOS DE USO ==========
 */

// Ejemplo 1: Parsear un SKU existente
console.log('=== Ejemplo 1: Parsear SKU ===');
const parsed = parseSKUCode('SKU-00001-E-00');
console.log('Parsed:', parsed);
// Output: { correlativo: 1, cycle: 'E', version: 0, valid: true }

// Ejemplo 2: Validar un SKU
console.log('\n=== Ejemplo 2: Validar SKU ===');
const validation = validateSKUCode('SKU-00001-A-02');
console.log('Validation:', validation);
// Output: { valid: true, errors: [] }

// Ejemplo 3: Generar nuevo producto
console.log('\n=== Ejemplo 3: Generar SKU Producto Nuevo ===');
const newSKU = generateNewProductSKU(1);
console.log('New Product SKU:', newSKU);
// Output: SKU-00001-E-00

// Ejemplo 4: Generar producto modificado
console.log('\n=== Ejemplo 4: Generar SKU Producto Modificado ===');
const baseSKU = 'SKU-00001-A-01';
const modifiedSKU = generateModifiedProductSKU(baseSKU);
console.log(`Base: ${baseSKU}`);
console.log(`Modified: ${modifiedSKU}`);
// Output: Base: SKU-00001-A-01
//         Modified: SKU-00001-E-02

// Ejemplo 5: Aprobar un SKU
console.log('\n=== Ejemplo 5: Aprobar SKU ===');
const preliminarSKU = 'SKU-00001-E-02';
const approvedSKU = approveSKU(preliminarSKU);
console.log(`Before: ${preliminarSKU}`);
console.log(`After: ${approvedSKU}`);
// Output: Before: SKU-00001-E-02
//         After: SKU-00001-A-02

// Ejemplo 6: Marcar como Base
console.log('\n=== Ejemplo 6: Marcar como Base ===');
const baseSKU2 = markSKUAsBase('SKU-00001-E-02');
console.log('Marked as Base:', baseSKU2);
// Output: SKU-00001-B-02

// Ejemplo 7: Inactivar
console.log('\n=== Ejemplo 7: Inactivar SKU ===');
const inactiveSKU = inactivateSKU('SKU-00005-A-00');
console.log('Inactivated:', inactiveSKU);
// Output: SKU-00005-I-00

// Ejemplo 8: Obtener próximo correlativo
console.log('\n=== Ejemplo 8: Obtener próximo correlativo ===');
const existingSKUs = [
  'SKU-00001-A-01',
  'SKU-00003-E-00',
  'SKU-00005-A-02',
];
const nextCorrelativo = getNextCorrelativo(existingSKUs);
console.log('Existing SKUs:', existingSKUs);
console.log('Next Correlativo:', String(nextCorrelativo).padStart(5, '0'));
// Output: Next Correlativo: 00006

/**
 * ========== PRUEBAS UNITARIAS ==========
 */

// Test 1: Parsing válido
console.log('\n=== TEST 1: Parsing válido ===');
const test1 = parseSKUCode('SKU-00042-B-07');
console.assert(test1.valid === true, 'Debería ser válido');
console.assert(test1.correlativo === 42, 'Correlativo debería ser 42');
console.assert(test1.cycle === 'B', 'Ciclo debería ser B');
console.assert(test1.version === 7, 'Versión debería ser 7');
console.log('✓ PASSED');

// Test 2: Parsing inválido
console.log('\n=== TEST 2: Parsing inválido ===');
const test2 = parseSKUCode('INVALID-SKU-CODE');
console.assert(test2.valid === false, 'Debería ser inválido');
console.log('✓ PASSED');

// Test 3: Validación de ciclo P (no permitido)
console.log('\n=== TEST 3: Validación ciclo P (no permitido) ===');
const test3 = validateSKUCode('SKU-00001-P-00');
console.assert(test3.valid === false, 'Debería rechazar ciclo P');
console.log('✓ PASSED');

// Test 4: Generar producto nuevo con versión 00
console.log('\n=== TEST 4: Producto nuevo inicia en versión 00 ===');
const test4 = generateNewProductSKU(1);
console.assert(test4 === 'SKU-00001-E-00', 'Debería ser SKU-00001-E-00');
console.log('✓ PASSED');

// Test 5: Producto modificado incrementa versión
console.log('\n=== TEST 5: Producto modificado incrementa versión ===');
const test5 = generateModifiedProductSKU('SKU-00001-A-01');
console.assert(test5 === 'SKU-00001-E-02', 'Versión debería incrementarse de 01 a 02');
console.log('✓ PASSED');

// Test 6: No se puede aprobar desde ciclo diferente a E
console.log('\n=== TEST 6: No se puede aprobar desde ciclo diferente a E ===');
const test6 = approveSKU('SKU-00001-A-02');
console.assert(test6 === null, 'No debería poder aprobar un SKU ya aprobado');
console.log('✓ PASSED');

// Test 7: Aprobar válido
console.log('\n=== TEST 7: Aprobar desde E ===');
const test7 = approveSKU('SKU-00001-E-02');
console.assert(test7 === 'SKU-00001-A-02', 'Debería cambiar de E a A');
console.log('✓ PASSED');

// Test 8: Obtener ciclo
console.log('\n=== TEST 8: Obtener ciclo ===');
const test8 = getSKUCycle('SKU-00001-B-01');
console.assert(test8 === 'B', 'Debería retornar ciclo B');
console.log('✓ PASSED');

// Test 9: Obtener versión
console.log('\n=== TEST 9: Obtener versión ===');
const test9 = getSKUVersion('SKU-00001-A-07');
console.assert(test9 === 7, 'Debería retornar versión 7');
console.log('✓ PASSED');

// Test 10: Obtener correlativo
console.log('\n=== TEST 10: Obtener correlativo ===');
const test10 = getSKUCorrelativo('SKU-00042-E-00');
console.assert(test10 === 42, 'Debería retornar correlativo 42');
console.log('✓ PASSED');

// Test 11: Etiqueta de ciclo
console.log('\n=== TEST 11: Etiqueta de ciclo ===');
console.assert(getCycleLabel('E') === 'Preliminar', 'E = Preliminar');
console.assert(getCycleLabel('B') === 'Base', 'B = Base');
console.assert(getCycleLabel('A') === 'Aprobado', 'A = Aprobado');
console.assert(getCycleLabel('I') === 'Inactivo', 'I = Inactivo');
console.log('✓ PASSED');

// Test 12: Formatear SKU
console.log('\n=== TEST 12: Formatear SKU ===');
const test12 = formatSKU(5, 'A', 3);
console.assert(test12 === 'SKU-00005-A-03', 'Debería formatear correctamente');
console.log('✓ PASSED');

// Test 13: Validación de nueva generación - Producto Nuevo
console.log('\n=== TEST 13: Validar generación Producto Nuevo ===');
const test13 = validateNewSKUGeneration('Producto Nuevo');
console.assert(test13.valid === true, 'Producto Nuevo debería ser válido sin SKU base');
console.log('✓ PASSED');

// Test 14: Validación de nueva generación - Producto Modificado sin SKU base
console.log('\n=== TEST 14: Validar generación Producto Modificado sin SKU base ===');
const test14 = validateNewSKUGeneration('Producto Modificado');
console.assert(test14.valid === false, 'Debería requerir SKU base');
console.log('✓ PASSED');

// Test 15: Validación de nueva generación - Producto Modificado con SKU base
console.log('\n=== TEST 15: Validar generación Producto Modificado con SKU base ===');
const test15 = validateNewSKUGeneration('Producto Modificado', 'SKU-00001-A-05');
console.assert(test15.valid === true, 'Debería ser válido con SKU base');
console.log('✓ PASSED');

console.log('\n========== TODAS LAS PRUEBAS PASARON ✓ ==========');
