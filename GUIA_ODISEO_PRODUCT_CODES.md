# Guía de Códigos de Producto en ODISEO

## Concepto General

ODISEO maneja **tres tipos independientes de códigos** para cada producto:

1. **SKU** - Concepto interno (no se envía a sistemas externos)
2. **EDAG** - Se envía a WebCenter y Sistema Integral
3. **EM** - Se envía solo a Sistema Integral

### Diagrama de Flujo

```
ODISEO INTERNO
  ├── SKU (no se envía)
  │   └── SKU-00001-E-00
  ├── EDAG (se envía)
  │   └── 60000-00 → WebCenter + Sistema Integral
  └── EM (se envía)
      └── 500000-00 → Sistema Integral
```

## Definiciones

### 1. SKU (Concepto Interno)

**Propósito**: Identificar el ciclo de vida interno del producto en ODISEO

**Formato**: `SKU-#####-C-##`
- `SKU` = Dominio fijo interno
- `#####` = Correlativo interno (00001-99999)
- `C` = Ciclo de vida (E/B/A/I)
- `##` = Versión interna (00-99)

**Ciclos de Vida**:
- **E (Preliminar)** - Producto en desarrollo
- **B (Base)** - Estructura base aprobada
- **A (Aprobado)** - Producto aprobado
- **I (Inactivo)** - Producto descontinuado

**Ejemplo**:
```
SKU-00001-E-00  ← Producto nuevo preliminar
SKU-00001-E-01  ← Modificación de producto
SKU-00001-A-01  ← Producto aprobado
SKU-00001-I-01  ← Producto inactivado
```

**Características**:
- ✅ Se usa solo internamente en ODISEO
- ✅ NO se envía a WebCenter
- ✅ NO se envía a Sistema Integral
- ✅ Sirve para tracking interno del ciclo de vida
- ✅ Permite auditoría de cambios

### 2. EDAG (Diseño Técnico)

**Propósito**: Código técnico del diseño que se envía a WebCenter y Sistema Integral

**Formato**: `#####-##`
- `#####` = Secuencia EDAG (60000-99999)
- `##` = Versión EDAG (00-99)

**Rango Inicial**: 60000-00

**Características**:
- ✅ Se envía a WebCenter
- ✅ Se envía a Sistema Integral
- ✅ Siempre debe tener versión
- ✅ No se confunde con código interno
- ✅ Representa el diseño técnico

**Ejemplos**:
```
60000-00  ← Primer EDAG
60000-01  ← EDAG versión incrementada
60001-00  ← Segundo producto con EDAG
```

### 3. EM (Estructura de Material)

**Propósito**: Especificación de materiales que se envía a Sistema Integral

**Formato**: `#####-##`
- `#####` = Secuencia EM (50000-99999)
- `##` = Versión EM (00-99)

**Rango Inicial**: 50000-00

**Características**:
- ✅ Se envía solo a Sistema Integral
- ✅ NO se envía a WebCenter
- ✅ Siempre debe tener versión
- ✅ 6 dígitos para diferenciarse de EDAG

**Ejemplos**:
```
500000-00  ← Primer EM
500000-01  ← EM versión incrementada
500001-00  ← Segundo producto con EM
```

## Integración con Sistemas Externos

### WebCenter

**Payload Esperado**:
```json
{
  "edagCode": "60000-00"
}
```

**Validaciones**:
- ✅ Solo recibe EDAG
- ❌ NO recibe SKU
- ❌ NO recibe EM

**Código de Integración**:
```typescript
import { generateWebCenterPayload } from '@shared/utils/productCodeIntegration';

const payload = generateWebCenterPayload('60000-00');
// { edagCode: "60000-00" }
```

### Sistema Integral

**Payload Esperado**:
```json
{
  "edagCode": "60000-00",
  "emCode": "500000-00"
}
```

**Validaciones**:
- ✅ Recibe EDAG
- ✅ Recibe EM
- ❌ NO recibe SKU

**Código de Integración**:
```typescript
import { generateSistemaIntegralPayload } from '@shared/utils/productCodeIntegration';

const payload = generateSistemaIntegralPayload('60000-00', '500000-00');
// { edagCode: "60000-00", emCode: "500000-00" }
```

## Casos de Uso

### Caso 1: Crear Producto Nuevo

```typescript
import {
  generateNewSKU,
  generateNewEDAG,
  generateNewEM,
} from '@shared/utils/productCodeRules';

// Generar códigos para producto nuevo
const skuCode = generateNewSKU(1);        // SKU-00001-E-00
const edagCode = generateNewEDAG(60000);  // 60000-00
const emCode = generateNewEM(500000);     // 500000-00

const product = {
  // Interno ODISEO
  skuCode,
  skuSequence: 1,
  skuLifecycleCode: 'E',
  skuVersion: 0,
  // Para WebCenter + SI
  edagCode,
  edagSequence: 60000,
  edagVersion: 0,
  // Para SI
  emCode,
  emSequence: 500000,
  emVersion: 0,
};
```

### Caso 2: Modificar Producto

```typescript
import {
  formatSKU,
  incrementEDAGVersion,
  incrementEMVersion,
} from '@shared/utils/productCodeRules';

const baseSKU = 'SKU-00001-A-00';
const baseEDAG = '60000-00';
const baseEM = '500000-00';

// Crear versión modificada
const modifiedSKU = formatSKU(1, 'E', 1);                    // SKU-00001-E-01
const modifiedEDAG = incrementEDAGVersion(baseEDAG);         // 60000-01
const modifiedEM = incrementEMVersion(baseEM);               // 500000-01

const modifiedProduct = {
  skuCode: modifiedSKU,
  skuVersion: 1,
  edagCode: modifiedEDAG,
  edagVersion: 1,
  emCode: modifiedEM,
  emVersion: 1,
};
```

### Caso 3: Aprobar Producto

```typescript
import { formatSKU } from '@shared/utils/productCodeRules';

const preliminarSKU = 'SKU-00001-E-01';
const approvedEDAG = '60000-01';  // EDAG permanece igual
const approvedEM = '500000-01';    // EM permanece igual

// Cambiar ciclo SKU a Aprobado
const approvedSKU = formatSKU(1, 'A', 1);  // SKU-00001-A-01

const approvedProduct = {
  skuCode: approvedSKU,
  skuLifecycleCode: 'A',
  // EDAG y EM no cambian
  edagCode: approvedEDAG,
  emCode: approvedEM,
};
```

### Caso 4: Inactivar Producto

```typescript
import { formatSKU } from '@shared/utils/productCodeRules';

const activeSKU = 'SKU-00005-A-00';

// Cambiar ciclo SKU a Inactivo
const inactiveSKU = formatSKU(5, 'I', 0);  // SKU-00005-I-00

// EDAG y EM permanecen iguales
const inactiveProduct = {
  skuCode: inactiveSKU,
  skuLifecycleCode: 'I',
};
```

## Campos en ProjectRecord

Los campos recomendados para almacenar en `ProjectRecord`:

```typescript
interface ProjectRecord {
  // SKU (Interno ODISEO)
  skuCode?: string;              // Ej: SKU-00001-E-00
  skuSequence?: number;          // Ej: 1
  skuLifecycleCode?: 'E'|'B'|'A'|'I';  // Ciclo actual
  skuVersion?: number;           // Ej: 0

  // EDAG (WebCenter + Sistema Integral)
  edagCode?: string;             // Ej: 60000-00
  edagSequence?: number;         // Ej: 60000
  edagVersion?: number;          // Ej: 0

  // EM (Solo Sistema Integral)
  emCode?: string;               // Ej: 500000-00
  emSequence?: number;           // Ej: 500000
  emVersion?: number;            // Ej: 0

  // ... otros campos
}
```

## Validaciones

### Validar SKU

```typescript
import { validateSKU } from '@shared/utils/productCodeRules';

const result = validateSKU('SKU-00001-E-00');
// { valid: true, errors: [] }

const invalid = validateSKU('INVALID');
// { valid: false, errors: ['Formato SKU inválido...'] }
```

### Validar EDAG

```typescript
import { validateEDAG } from '@shared/utils/productCodeRules';

const result = validateEDAG('60000-00');
// { valid: true, errors: [] }

const invalid = validateEDAG('50000-00');  // Menor a 60000
// { valid: false, errors: ['Secuencia EDAG debe ser >= 60000'] }
```

### Validar EM

```typescript
import { validateEM } from '@shared/utils/productCodeRules';

const result = validateEM('500000-00');
// { valid: true, errors: [] }

const invalid = validateEM('400000-00');  // Menor a 500000
// { valid: false, errors: ['Secuencia EM debe ser >= 500000'] }
```

### Validar para WebCenter

```typescript
import { validateForWebCenter } from '@shared/utils/productCodeIntegration';

const result = validateForWebCenter('60000-00');
// { valid: true, errors: [] }
```

### Validar para Sistema Integral

```typescript
import { validateForSistemaIntegral } from '@shared/utils/productCodeIntegration';

const result = validateForSistemaIntegral('60000-00', '500000-00');
// { valid: true, errors: [] }
```

## Tablas de Referencia

### Ciclos de Vida SKU

| Ciclo | Label | Descripción |
|-------|-------|-------------|
| E | Preliminar | Producto en desarrollo, no aprobado |
| B | Base | Estructura base aprobada |
| A | Aprobado | Producto completamente aprobado |
| I | Inactivo | Producto descontinuado |

### Transiciones de Ciclo Permitidas

```
E (Preliminar)
├── → A (Aprobado)
├── → B (Base)
└── → I (Inactivo)

B (Base)
└── → I (Inactivo)

A (Aprobado)
└── → I (Inactivo)

I (Inactivo)
└── (Terminal - no se puede reactivar automáticamente)
```

## Ejemplo Completo: Flujo de Producto

```typescript
import {
  generateNewSKU,
  generateNewEDAG,
  generateNewEM,
  formatSKU,
  incrementEDAGVersion,
  incrementEMVersion,
} from '@shared/utils/productCodeRules';

import {
  generateWebCenterPayload,
  generateSistemaIntegralPayload,
  getProductCodesSummary,
} from '@shared/utils/productCodeIntegration';

// PASO 1: Crear producto nuevo
console.log('PASO 1: Crear Producto Nuevo');
const step1 = {
  skuCode: generateNewSKU(1),              // SKU-00001-E-00
  edagCode: generateNewEDAG(60000),        // 60000-00
  emCode: generateNewEM(500000),           // 500000-00
};
console.log(getProductCodesSummary(step1));

// PASO 2: Modificar producto
console.log('\nPASO 2: Modificar Producto');
const step2 = {
  skuCode: formatSKU(1, 'E', 1),           // SKU-00001-E-01
  edagCode: incrementEDAGVersion(step1.edagCode),  // 60000-01
  emCode: incrementEMVersion(step1.emCode),        // 500000-01
};
console.log(getProductCodesSummary(step2));

// PASO 3: Aprobar producto
console.log('\nPASO 3: Aprobar Producto');
const step3 = {
  skuCode: formatSKU(1, 'A', 1),           // SKU-00001-A-01
  edagCode: step2.edagCode,                // 60000-01 (no cambia)
  emCode: step2.emCode,                    // 500000-01 (no cambia)
};
console.log(getProductCodesSummary(step3));

// PASO 4: Generar payloads para sistemas
console.log('\nPASO 4: Payloads para Sistemas Externos');
console.log('WebCenter:');
console.log(JSON.stringify(generateWebCenterPayload(step3.edagCode), null, 2));
console.log('\nSistema Integral:');
console.log(JSON.stringify(generateSistemaIntegralPayload(step3.edagCode, step3.emCode), null, 2));
```

## Notas Importantes

1. **SKU es solo interno**: Nunca enviar SKU a WebCenter o Sistema Integral
2. **EDAG siempre se envía**: Incluirlo siempre en payloads de sistemas externos
3. **EM solo a SI**: No enviar EM a WebCenter, solo a Sistema Integral
4. **Versiones obligatorias**: Todos los códigos deben incluir versión (00-99)
5. **Secuencias iniciales**:
   - SKU comienza en 00001
   - EDAG comienza en 60000
   - EM comienza en 500000
6. **No confundir ciclos**: El ciclo solo aplica a SKU, no a EDAG ni EM
7. **Auditoria**: Mantener historial de cambios de versión para tracking

## Resumen Rápido

| Concepto | Uso | Formato | Inicio | Externos |
|----------|-----|---------|--------|----------|
| **SKU** | Interno | SKU-#####-C-## | 00001 | ❌ |
| **EDAG** | Diseño | #####-## | 60000 | ✅ WebCenter, SI |
| **EM** | Materiales | #####-## | 50000 | ✅ SI |
