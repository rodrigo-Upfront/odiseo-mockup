# Guía de Integración de Códigos SKU

## Descripción General

La nueva lógica de codificación SKU implementa las reglas oficiales de generación y validación de códigos de productos. El sistema permite crear, validar, y modificar códigos SKU siguiendo el formato estricto:

```
SKU-#####-C-##
```

Donde:
- **SKU**: Dominio fijo del producto
- **#####**: Correlativo único de 5 dígitos (00001-99999)
- **C**: Ciclo de vida (E=Preliminar, B=Base, A=Aprobado, I=Inactivo)
- **##**: Versión de 2 dígitos (00-99)

## Archivos Creados

### 1. `skuCodeRules.ts`
Funciones fundamentales para parsing, validación y formateo:
- `parseSKUCode()` - Extrae componentes de un SKU
- `formatSKU()` - Formatea componentes como SKU
- `validateSKUCode()` - Valida que cumpla el formato
- `generateNewProductSKU()` - Genera SKU para producto nuevo
- `generateModifiedProductSKU()` - Genera SKU para producto modificado
- `approveSKU()` - Aprueba un SKU (E → A)
- `markSKUAsBase()` - Marca como Base (E → B)
- `inactivateSKU()` - Inactiva un SKU (→ I)

### 2. `skuCodeGenerator.ts`
Gestor de generación automática integrado con flujos de negocio:
- `generateAutoSKU()` - Genera automáticamente según contexto
- `validateSKUForAction()` - Valida si un SKU puede realizar una acción
- `getSKUInfo()` - Obtiene información legible de un SKU

### 3. `skuCodeRules.test.ts`
Ejemplos y pruebas unitarias de todas las funciones.

## Casos de Uso

### Caso 1: Crear Producto Nuevo

```typescript
import { generateAutoSKU } from '@shared/utils/skuCodeGenerator';

const result = generateAutoSKU({
  classification: 'Producto Nuevo',
  projectType: 'Nueva estructura',
  allExistingSKUs: ['SKU-00001-A-01', 'SKU-00003-A-00'],
});

// Result: { skuCode: 'SKU-00004-E-00', reason: 'Nuevo producto...', errors: [] }
```

### Caso 2: Crear Producto Modificado

```typescript
const result = generateAutoSKU({
  classification: 'Producto Modificado',
  projectType: 'Cambia materia prima',
  baseSKUCode: 'SKU-00001-A-02',
});

// Result: { skuCode: 'SKU-00001-E-03', reason: 'Producto modificado...', errors: [] }
```

### Caso 3: Aprobar un Producto

```typescript
const result = generateAutoSKU({
  classification: 'Producto Modificado',
  isApprovalFlow: true,
  currentSKUCode: 'SKU-00001-E-03',
});

// Result: { skuCode: 'SKU-00001-A-03', reason: 'SKU aprobado...', errors: [] }
```

### Caso 4: Marcar como Base

```typescript
const result = generateAutoSKU({
  classification: 'Producto Nuevo',
  isBaseMarkingFlow: true,
  currentSKUCode: 'SKU-00005-E-00',
});

// Result: { skuCode: 'SKU-00005-B-00', reason: 'SKU marcado como Base...', errors: [] }
```

### Caso 5: Inactivar Producto

```typescript
const result = generateAutoSKU({
  isInactivationFlow: true,
  currentSKUCode: 'SKU-00005-A-00',
});

// Result: { skuCode: 'SKU-00005-I-00', reason: 'SKU inactivado...', errors: [] }
```

## Integración en ProductEditPage.tsx

### Opción 1: Generar SKU al Crear Nuevo Producto

```typescript
import { generateAutoSKU } from '@shared/utils/skuCodeGenerator';
import { getProjectRecords } from '@shared/data/projectStorage';

// En el manejador de creación
const handleCreateProduct = (formData) => {
  const allSKUs = getProjectRecords()
    .map(p => p.skuCode)
    .filter(Boolean);

  const skuResult = generateAutoSKU({
    classification: formData.classification,
    projectType: formData.projectType,
    allExistingSKUs: allSKUs,
  });

  if (!skuResult.errors.length) {
    // Usar skuResult.skuCode como SKU del nuevo producto
    const newProject = {
      ...formData,
      skuCode: skuResult.skuCode,
    };
    // Guardar proyecto
  } else {
    // Mostrar errores
    console.error(skuResult.errors);
  }
};
```

### Opción 2: Validar SKU en Panel de Producto Modificado

```typescript
import { validateSKUForAction, getSKUInfo } from '@shared/utils/skuCodeGenerator';

// En el componente de visualización del SKU
const SKUDisplay = ({ skuCode, isApprovalFlow }) => {
  const info = getSKUInfo(skuCode);
  
  if (!info) return <div>SKU inválido</div>;

  const validation = validateSKUForAction('approve', skuCode);

  return (
    <div className="sku-display">
      <p>SKU: {info.formatted}</p>
      <p>Ciclo: {info.cycleLabel}</p>
      <p>Versión: {info.version}</p>
      <p>Correlativo: {info.correlativo}</p>
      
      {isApprovalFlow && (
        <div>
          <p className={validation.canProceed ? 'text-green-600' : 'text-red-600'}>
            {validation.message}
          </p>
        </div>
      )}
    </div>
  );
};
```

### Opción 3: Auto-generar en Modal de Confirmación

```typescript
import { generateAutoSKU, validateSKUForAction } from '@shared/utils/skuCodeGenerator';

// En modal de validación/aprobación
const ApprovalModal = ({ currentProject }) => {
  const handleApprove = () => {
    const result = generateAutoSKU({
      isApprovalFlow: true,
      currentSKUCode: currentProject.skuCode,
    });

    if (result.errors.length > 0) {
      showError(result.errors.join(', '));
      return;
    }

    // Actualizar proyecto con nuevo SKU
    updateProjectRecord(currentProject.id, {
      skuCode: result.skuCode,
      status: 'Aprobado',
    });
  };

  return (
    <div>
      <h3>Confirmar Aprobación</h3>
      <p>SKU actual: {currentProject.skuCode}</p>
      <p>SKU después de aprobación: {generateAutoSKU({ isApprovalFlow: true, currentSKUCode: currentProject.skuCode }).skuCode}</p>
      <button onClick={handleApprove}>Aprobar</button>
    </div>
  );
};
```

## Validaciones Implementadas

- ✅ No generar PRJ como código de producto
- ✅ No usar P como ciclo de vida
- ✅ Producto nuevo preliminar inicia en versión 00
- ✅ Producto nuevo preliminar NO puede tener versión 01
- ✅ Producto modificado preliminar incrementa versión +1 del SKU base
- ✅ Solo estado E puede ser aprobado a A
- ✅ Solo estado E puede ser marcado como B
- ✅ Versión máxima es 99
- ✅ Correlativo debe estar entre 00001 y 99999

## Ejemplos de Flujos Completos

### Flujo: Producto Nuevo → Aprobación

```
1. Crear: SKU-00001-E-00 (Producto Nuevo)
2. Modificar si es necesario: SKU-00001-E-00 (sin cambios de versión)
3. Aprobar: SKU-00001-E-00 → SKU-00001-A-00
```

### Flujo: Producto Nuevo → Base Estándar

```
1. Crear: SKU-00001-E-00 (Producto Nuevo)
2. Marcar como Base: SKU-00001-E-00 → SKU-00001-B-00
3. (Opcional) Aprobar después: SKU-00001-B-00 → SKU-00001-A-00
```

### Flujo: Producto Modificado

```
1. Base: SKU-00001-A-02 (Producto existente aprobado)
2. Crear modificación: SKU-00001-E-03 (Producto Modificado)
3. Modificar: SKU-00001-E-03 (sin cambios de versión)
4. Aprobar: SKU-00001-E-03 → SKU-00001-A-03
```

### Flujo: Inactivación

```
1. Actual: SKU-00005-A-00
2. Inactivar: SKU-00005-A-00 → SKU-00005-I-00
3. No puede reactivarse automáticamente (manual)
```

## Testing

Para ejecutar las pruebas unitarias:

```bash
npm test -- skuCodeRules.test.ts
```

O para probar manualmente:

```typescript
import { 
  generateNewProductSKU,
  generateModifiedProductSKU,
  approveSKU 
} from '@shared/utils/skuCodeRules';

// Prueba 1: Nuevo producto
const newSKU = generateNewProductSKU(1);
console.log(newSKU); // SKU-00001-E-00

// Prueba 2: Producto modificado
const modSKU = generateModifiedProductSKU('SKU-00001-A-02');
console.log(modSKU); // SKU-00001-E-03

// Prueba 3: Aprobación
const approved = approveSKU('SKU-00001-E-03');
console.log(approved); // SKU-00001-A-03
```

## Notas Importantes

1. **Generación automática**: Usar `generateAutoSKU()` en la mayoría de casos - maneja toda la lógica
2. **Validación previa**: Siempre validar con `validateSKUForAction()` antes de permitir cambios de ciclo
3. **Persistencia**: El SKU debe guardarse en `ProjectRecord.skuCode`
4. **Portafolio estándar**: Es un atributo funcional separado, no afecta la generación de SKU
5. **Múltiples versiones**: Mantener historial de cambios de versión para auditoria

## Resumen de Cambios

| Versión | Cambio | Ejemplo |
|---------|--------|---------|
| E-00 | Producto nuevo preliminar | SKU-00001-E-00 |
| E-01 | Primer cambio menor | SKU-00001-E-01 |
| E-02+ | Cambios sucesivos | SKU-00001-E-02 |
| A-00 | Aprobación de versión 00 | SKU-00001-A-00 |
| A-01 | Aprobación de versión 01 | SKU-00001-A-01 |
| B-00 | Base aprobada | SKU-00001-B-00 |
| I-00 | Inactivado | SKU-00001-I-00 |
