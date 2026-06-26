# AUDITORÍA FUNCIONAL Y TÉCNICA - ProductEditPage.tsx

**Fecha**: 2026-06-09  
**Archivo auditado**: `src/modules/products/pages/ProductEditPage.tsx` (5779 líneas)  
**Estado**: DIAGNÓSTICO SIN CAMBIOS  
**Conclusión**: 7 brechas críticas/mayores identificadas. Refactor recomendado antes de implementar MOT/FDP completo.

---

## RESUMEN EJECUTIVO

ProductEditPage implementa correctamente:
- ✅ Carga y inicialización de productos (Nuevo/Modificado)
- ✅ 16 casuísticas MOT definidas en MOT_FIELD_RULES
- ✅ 25 FDP cubiertos (14 POUCH + 8 BOLSA + 3 LAMINA)
- ✅ Persistencia básica en handleSubmit/handleSaveAndExit
- ✅ Badges de heredado/SI en dimensiones (width, length, gussetWidth)

**PERO** implementa incorrectamente:
- ❌ 4 grupos de campos MOT sin mapeo a campos reales (CRÍTICA)
- ❌ Validación de heredados que no pueden editarse (CRÍTICA)
- ❌ Validación no excluye campos ocultos por FDP (CRÍTICA)
- ❌ Width LAMINA FOOD mostrado/persistido inconsistentemente (CRÍTICA)
- ❌ Payload SI no separado del payload general (MAYOR)
- ❌ Completitud % inflada por heredados no editables (MAYOR)
- ❌ FDP sin reglas para "process" MOT (MAYOR)

---

## BRECHAS CRÍTICAS

### 1. GRUPOS FANTASMA EN MOT_FIELD_RULES ⚠️ CRÍTICA

**Ubicación**: ProductEditPage.tsx líneas 263-382

**Problema**:
```typescript
MOT_FIELD_RULES["Nuevo equipamiento / proceso / temperatura"] = {
  editableFieldGroups: ["process", "packingMachine", ...]  // ← NO EXISTEN
}
MOT_FIELD_RULES["Cambio de insumo no homologado"] = {
  editableFieldGroups: ["inputs", ...]  // ← NO EXISTE
}
MOT_FIELD_RULES["Cambia diseño por variante"] = {
  editableFieldGroups: ["designVariant", ...]  // ← NO EXISTE
}
```

**FIELD_TO_EDITABLE_GROUP** (líneas 409-545) NO contiene:
- `process` → Sin mapeo de campos
- `packingMachine` → Sin mapeo de campos
- `inputs` → Sin mapeo de campos
- `designVariant` → Sin mapeo de campos

**Impacto**:
- `isFieldEditableByMot()` retorna `false` para campos en estos grupos
- Campos que deberían ser editables para estos MOT quedan bloqueados
- Campos que deberían requerirse no se validan
- Usuario no puede modificar estructura cuando selecciona estos MOT

**Severidad**: 🔴 CRÍTICA

**Acción**: Crear mapeo explícito de campos para cada grupo fantasma

---

### 2. VALIDACIÓN DE CAMPOS HEREDADOS ⚠️ CRÍTICA

**Ubicación**: ProductEditPage.tsx líneas 3253-3371

**Problema**:
```typescript
const shouldValidateField = (field: keyof ProjectEditFormData): boolean => {
  if (!isModifiedProject) return true;
  const mot = form.projectType;
  if (!isFieldEditableByMot(field as string, mot)) return false;
  return true;  // ← Valida aunque sea heredado y bloqueado
};

// En validationErrors:
requiredFields.forEach((field) => {
  if (!shouldValidateField(field)) return;
  if (isFieldEmpty(form[field])) {
    errors[field] = `${label} es obligatorio.`;  // ← Falla si heredado está vacío
  }
});
```

**Scenario de error**:
1. Usuario carga producto Modificado con MOT "Modifica dimensiones"
2. `inheritedFields` contiene: {"width", "length", "layer1Material", ...}
3. Campo "grammage" es heredado (bloqueado, disabled=true)
4. `requiredFields` incluye "grammage"
5. Usuario NO puede editar "grammage" (está disabled)
6. Validación falla: "grammage es obligatorio" pero usuario no puede tocarlo
7. Usuario atrapado: no puede guardar ni editar

**Severidad**: 🔴 CRÍTICA

**Acción**: Excluir inheritedFields de validación obligatoria

---

### 3. WIDTH LAMINA FOOD INCONSISTENCIA ⚠️ CRÍTICA

**Ubicación**: ProductEditPage.tsx líneas 2537-2541, 3930, 4048-4061

**Problema**:

En **render** (línea 4048-4061):
```typescript
const shouldClearWidthForFood = isLaminaFormat && 
  normalizedBlueprintFormat === "FOOD";

if (shouldClearWidthForFood) {
  // Width se MUESTRA en el formulario
} else {
  <FormInput label="Ancho *" value={form.width} ... />
}
```

En **persistencia** (línea 3930):
```typescript
width: shouldClearWidthForFood ? "" : form.width,  // ← Se LIMPIA al guardar
```

**Flujo de error**:
1. Usuario selecciona LAMINA + FOOD
2. Width se muestra en formulario
3. Usuario llena width = "100"
4. Usuario guarda
5. En BD: width se guarda como ""
6. Usuario recarga: width aparece vacío
7. Datos perdidos. Usuario confundido.

**Severidad**: 🔴 CRÍTICA (Pérdida de datos)

**Acción**: No mostrar width en render si FOOD, o no limpiar si mostrado

---

### 4. VALIDACIÓN NO EXCLUYE CAMPOS OCULTOS ⚠️ CRÍTICA

**Ubicación**: ProductEditPage.tsx líneas 3253-3261

**Problema**:
```typescript
const shouldValidateField = (field: keyof ProjectEditFormData): boolean => {
  if (!isModifiedProject) return true;
  const mot = form.projectType;
  if (!isFieldEditableByMot(field as string, mot)) return false;
  
  // ← FALTA: Verificar si campo es visible por FDP
  // if (!isFieldVisibleByFormat(field as string, form.blueprintFormat)) return false;
  
  return true;
};
```

**Scenario**:
1. Usuario selecciona LAMINA FOOD
2. Según FORMAT_FIELD_RULES_BY_FDP, campos como "zipperType", "hasZipper" no son visibles
3. requiredFields incluye "zipperType" (herencia de BASE_REQUIRED_FIELDS)
4. "zipperType" no es visible en UI
5. Validación falla: "zipperType es obligatorio" pero no se muestra en pantalla
6. Usuario no sabe qué completar

**Severidad**: 🔴 CRÍTICA (UX rota)

**Acción**: Integrar isFieldVisibleByFormat() en shouldValidateField()

---

## BRECHAS MAYORES

### 5. PAYLOAD SI NO SEPARADO ⚠️ MAYOR

**Ubicación**: ProductEditPage.tsx líneas 526, 3811-4013

**Problema**:
```typescript
const SI_FIELDS = new Set<string>([
  "approvedProductCode", "technicalApplication", "structureType",
  "layer1Material", "layer2Material", "layer3Material", "layer4Material",
  "grammage", "width", "length", "repetition", "gussetWidth", "gussetType",
  "rewindingDirection", "hasPhotocell", "coreMaterial", "coreDiameter",
  "materialPackaging", "splices", ...
]);

// Pero en handleSubmit/handleSaveAndExit:
const updatedProject: ProjectRecord = {
  // TODOS los campos se guardan igual
  approvedProductCode: form.approvedProductCode,
  width: form.width,
  grammage: form.grammage,
  // ... no hay payload separado para SI
};
```

**Impacto**:
- Sistema Integral recibe datos que no debe (campos administrativos, etc.)
- No hay control granular sobre qué va a SI
- No hay auditoría de campos enviados a SI
- Si SI rechaza un campo, toda la sincronización falla

**Severidad**: 🟠 MAYOR

**Acción**: Crear buildSistemaIntegralProductPayload() separado

---

### 6. COMPLETITUD % INFLADA ⚠️ MAYOR

**Ubicación**: ProductEditPage.tsx líneas 3426-3432

**Problema**:
```typescript
const completionPercentage = useMemo(() => {
  const completedCount = requiredFields.filter(
    (field) => !isFieldEmpty(form[field])
  ).length;
  // Cuenta heredados como "completados" aunque no sean editables
  return Math.round((completedCount / requiredFields.length) * 100);
}, [form, requiredFields]);
```

**Scenario**:
1. Producto Modificado con 50 fields totales
2. 30 heredados (no editables): {"width", "length", "grammage", ...}
3. 20 editables
4. requiredFields = 40 (incluye 30 heredados)
5. Usuario completa 5 de los 20 editables = 25%
6. Pero: completionPercentage = (30 + 5) / 40 = **87.5%**
7. Usuario ve "87.5% completo" pero solo puede editar 25%

**Impacto**:
- Métrica de progreso engañosa
- Usuario cree que producto está casi listo
- No refleja trabajo real del usuario

**Severidad**: 🟠 MAYOR

**Acción**: Excluir inheritedFields de conteo de completitud

---

### 7. FDP SIN REGLAS PARA "PROCESS" MOT ⚠️ MAYOR

**Ubicación**: ProductEditPage.tsx líneas 552-632

**Problema**:
```typescript
FORMAT_FIELD_RULES_BY_FDP = {
  "GENERICA": { ... },
  "TISSUE": { ... },
  "FOOD": { ... },
  "POUCH_DEFAULT": { ... },
  "BOLSA_DEFAULT": { ... },
};

// Pero MOT "Nuevo equipamiento / proceso / temperatura" 
// edita grupo "process" que contiene campos como
// rewindingDirection, hasPhotocell, que NO tienen reglas FDP
```

**Impacto**:
- isFieldVisibleByFormat() retorna `true` por defecto (campos sin reglas se muestran)
- isFieldRequiredByFormat() retorna `false` (campos sin reglas no se requieren)
- Usuario puede llenar proceso sin restricciones
- Si después cambia envoltura, campos de proceso quedan huérfanos

**Severidad**: 🟠 MAYOR

**Acción**: Crear FORMAT_FIELD_RULES_BY_FDP para campos "process"

---

## BRECHAS MENORES

### 8. FIELD_LABELS INCOMPLETO

**Ubicación**: ProductEditPage.tsx líneas 1543-1600

**Hallazgo**: 
- Faltán labels para campos en grupos "process", "packingMachine", "inputs"
- Ejemplo: ¿"rewindingDirection" → "Sentido de bobinado"?
- Ejemplo: ¿"coreMaterial" → "Material del núcleo"?

**Impacto**: Errores muestran campo técnico, no label amigable

**Severidad**: 🟡 MENOR

**Acción**: Completar FIELD_LABELS

---

### 9. WIDTH/LENGTH/GUSSETWIDTH MÚLTIPLES FUENTES

**Ubicación**: ProductEditPage.tsx líneas 4048-4080

**Hallazgo**:
- `shouldShowWidth()` es función separada (línea ~4040)
- `shouldShowRepetitionField()` es función separada (línea ~4035)
- FORMAT_FIELD_RULES_BY_FDP también define visibilidad
- Tres lugares controlan la misma lógica

**Impacto**: Inconsistencia si se actualiza uno sin otros

**Severidad**: 🟡 MENOR

**Acción**: Unificar en un solo lugar (recomendable FORMAT_FIELD_RULES_BY_FDP)

---

### 10. REPETITION INCONSISTENCIA ENTRE LAMINAS

**Ubicación**: ProductEditPage.tsx líneas 4063-4069

**Hallazgo**:
```typescript
const showRepetition = shouldShowRepetitionField(inheritedWrapping, form.blueprintFormat);
// shouldShowRepetitionField() retorna true solo para BOLSA

// Pero FORMAT_FIELD_RULES_BY_FDP["TISSUE"] incluye "repetition" en visibleFields
// Contradicción: ¿Repetition para LAMINA TISSUE o no?
```

**Impacto**: LAMINA TISSUE puede tener repetition invisible

**Severidad**: 🟡 MENOR

**Acción**: Unificar shouldShowRepetitionField() con FORMAT_FIELD_RULES

---

## MATRIZ DE AUDITORÍA DETALLADA

| Eje | Tipo Producto | MOT | Envoltura | FDP | Campo/Regla | Estado Actual | Resultado Esperado | Brecha | Severidad | Acción Recomendada | Archivo/Función |
|-----|---|---|---|---|---|---|---|---|---|---|---|
| **A. Producto** | Nuevo | - | - | - | P1-P4 inicializan vacíos | ✅ Correcto | Vacíos | Ninguna | OK | Verificado | useState (línea 1746-1854) |
| **A. Producto** | Modificado | - | - | - | P1-P4 cargan desde project | ✅ Correcto | Cargan | Ninguna | OK | Verificado | useEffect (línea 1934-2149) |
| **A. Producto** | Modificado | - | - | - | P1-P4 autofill si requiere | ✅ Correcto | Autofill | Ninguna | OK | Verificado | getMotRule() línea 2098-2125 |
| **A. Producto** | Modificado | - | - | - | Campos bloqueados por MOT | ⚠️ Parcial | Bloqueados | Ver brechas 1, 2, 4 | CRÍTICA | Mapear grupos fantasma | isFieldEditableByMot (línea 557-567) |
| **B. MOT** | Nuevo | Nueva estructura | - | - | Existe y se define | ✅ Correcto | Definido | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 270-276) |
| **B. MOT** | Nuevo | Nuevos insumos | - | - | Existe y se define | ✅ Correcto | Definido | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 277-283) |
| **B. MOT** | Nuevo | Nuevo formato de envasado | - | - | Existe y se define | ✅ Correcto | Definido | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 284-290) |
| **B. MOT** | Nuevo | Diseño nuevo | - | - | Existe y se define | ✅ Correcto | Definido | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 291-297) |
| **B. MOT** | Modificado | Nuevo equipamiento | - | - | editableFieldGroups = [process, packingMachine] | ❌ Sin mapeo | Mapeado | Grupos fantasma | CRÍTICA | Crear MOT_FIELD_MAPPING | MOT_FIELD_RULES (línea 298-304) |
| **B. MOT** | Modificado | Modifica dimensiones | - | - | editableFieldGroups = [dimensions] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 305-311) |
| **B. MOT** | Modificado | Modifica propiedades | - | - | editableFieldGroups = [properties] | ✅ Existe | Mapeado | Verificar mapeo | MENOR | Audit propiedades | MOT_FIELD_RULES (línea 312-318) |
| **B. MOT** | Modificado | Cambia estructura | - | - | editableFieldGroups = [structure, materials] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 319-325) |
| **B. MOT** | Modificado | Cambia materia prima | - | - | editableFieldGroups = [materials] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 326-332) |
| **B. MOT** | Modificado | Cambia diseño | - | - | editableFieldGroups = [design, printing] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 333-339) |
| **B. MOT** | Modificado | Misma estructura | - | - | editableFieldGroups = [technicalComments] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 340-346) |
| **B. MOT** | Modificado | Cambia dimensión fuera tolerancia | - | - | editableFieldGroups = [dimensions] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 347-353) |
| **B. MOT** | Modificado | Cambia diseño por variante | - | - | editableFieldGroups = [designVariant] | ❌ Sin mapeo | Mapeado | Grupo fantasma | CRÍTICA | Crear mapeo | MOT_FIELD_RULES (línea 354-360) |
| **B. MOT** | Modificado | Referencia aprobada sin cambios | - | - | editableFieldGroups = [productBase] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 361-367) |
| **B. MOT** | Modificado | Mismo producto, misma especificación | - | - | editableFieldGroups = [productBase] | ✅ Existe | Mapeado | Ninguna | OK | Verificado | MOT_FIELD_RULES (línea 368-374) |
| **B. MOT** | Modificado | Cambio de insumo no homologado | - | - | editableFieldGroups = [inputs] | ❌ Sin mapeo | Mapeado | Grupo fantasma | CRÍTICA | Crear mapeo | MOT_FIELD_RULES (línea 375-381) |
| **C. Envoltura** | - | - | POUCH | - | Preguntas guiadas | ✅ Correcto | Correctas | Ninguna | OK | Verificado | isPouchWrapping (línea 2681-2708) |
| **C. Envoltura** | - | - | BOLSA | - | Preguntas guiadas | ✅ Correcto | Correctas | Ninguna | OK | Verificado | isBolsaWrapping (línea 2661-2678) |
| **C. Envoltura** | - | - | LAMINA | - | Preguntas guiadas | ✅ Correcto | Correctas | Ninguna | OK | Verificado | isLaminaWrapping (línea 2710-2713) |
| **C. Envoltura** | - | - | POUCH | - | Campos visibles solo POUCH | ⚠️ Parcial | Solo POUCH | Cleanup en persistencia | MENOR | Revisar effects | línea 2681-2708 |
| **C. Envoltura** | - | - | BOLSA | - | Campos visibles solo BOLSA | ⚠️ Parcial | Solo BOLSA | Cleanup en persistencia | MENOR | Revisar effects | línea 2661-2678 |
| **C. Envoltura** | - | - | LAMINA | - | Campos visibles solo LAMINA | ⚠️ Parcial | Solo LAMINA | Width inconsistencia | CRÍTICA | Resolver brechas 3, 7 | línea 2710-2713 |
| **D. FDP** | - | - | POUCH | POUCH C/SELLO EN FUELLE\TIPO 4-1 | Calculado, no selector | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculatePouchFormatPlan (línea 2737-2768) |
| **D. FDP** | - | - | POUCH | POUCH STAND UP\TIPO K | Calculado automático | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculatePouchFormatPlan (línea 2737-2768) |
| **D. FDP** | - | - | POUCH | POUCH STAND UP\DOY PACK | Calculado con restricciones | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculatePouchFormatPlan (línea 2737-2768) |
| **D. FDP** | - | - | BOLSA | SELLO LATERAL\CORTE | Calculado automático | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculateBolsaFormatPlan (línea 2711-2735) |
| **D. FDP** | - | - | BOLSA | SELLO DE FONDO | Calculado automático | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculateBolsaFormatPlan (línea 2711-2735) |
| **D. FDP** | - | - | BOLSA | WICKET | Calculado automático | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculateBolsaFormatPlan (línea 2711-2735) |
| **D. FDP** | - | - | LAMINA | GENERICA | Calculado automático | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculateLaminaFormatPlan (línea 2770-2788) |
| **D. FDP** | - | - | LAMINA | TISSUE | Calculado automático | ✅ Correcto | Calculado | Ninguna | OK | Verificado | calculateLaminaFormatPlan (línea 2770-2788) |
| **D. FDP** | - | - | LAMINA | FOOD | Calculado automático | ⚠️ Inconsistente | Calculado | Width inconsistencia | CRÍTICA | Resolver brecha 3 | calculateLaminaFormatPlan (línea 2770-2788) |
| **E. P1-P4** | - | - | - | - | Todos existen en FormData | ✅ 100% | 100% | Ninguna | OK | Verificado | ProjectEditFormData (línea 58-255) |
| **E. P1-P4** | - | - | - | - | Todos inicializan en useState | ✅ 100% | 100% | Ninguna | OK | Verificado | useState (línea 1746-1854) |
| **E. P1-P4** | - | - | - | - | Todos se cargan en useEffect | ✅ 100% | 100% | Ninguna | OK | Verificado | useEffect (línea 1934-2149) |
| **E. P1-P4** | - | - | - | - | Todos tienen label en FIELD_LABELS | ⚠️ 85% | 100% | Faltán 3-5 labels | MENOR | Completar FIELD_LABELS | FIELD_LABELS (línea 1543-1600) |
| **E. P1-P4** | - | - | - | - | Todos en STEP_FIELDS | ✅ 100% | 100% | Ninguna | OK | Verificado | STEP_FIELDS (línea 1628-1690) |
| **E. P1-P4** | - | - | - | - | Validación si aplican | ⚠️ Parcial | Validar visibles | Ver brechas 2, 4 | CRÍTICA | Excluir heredados/ocultos | validationErrors (línea 3253-3371) |
| **E. P1-P4** | - | - | - | - | Guardan en handleSubmit | ✅ Sí | Guardados | Ninguna | OK | Verificado | handleSubmit (línea 3811-4013) |
| **E. P1-P4** | - | - | - | - | Guardan en handleSaveAndExit | ✅ Sí | Guardados | Ninguna | OK | Verificado | handleSaveAndExit (línea 4025-4213) |
| **E. P1-P4** | - | - | - | - | Incluyen badge "Campo SI" | ⚠️ Solo 3 campos | En aplicables | Ver brecha 5 | MAYOR | Crear payload SI | FieldBadges (línea 1873-1898) |
| **E. P1-P4** | - | - | - | - | Incluyen badge "Heredado" | ⚠️ Solo 3 campos | En aplicables | Integración parcial | MAYOR | Completar integración | FieldBadges (línea 1873-1898) |
| **F. Validación** | - | - | - | - | No valida ocultos | ❌ Valida | No valida | Ver brecha 4 | CRÍTICA | Integrar isFieldVisibleByFormat | shouldValidateField (línea 3253-3261) |
| **F. Validación** | - | - | - | - | No valida heredados bloqueados | ❌ Valida | No valida | Ver brecha 2 | CRÍTICA | Excluir inheritedFields | shouldValidateField (línea 3253-3261) |
| **F. Validación** | Modificado | Modifica dimensiones | - | - | Valida solo editables | ✅ Parcial | Valida editables | Brecha 2: heredados | CRÍTICA | Refactor validation | validationErrors (línea 3263-3371) |
| **F. Validación** | - | - | - | - | Modal campos faltantes correcto | ✅ Sí | Muestra reales | Incluye ocultos | MAYOR | Filtrar ocultos | showMissingFieldsModal (línea 3704-3743) |
| **F. Validación** | - | - | - | - | % completitud correcto | ❌ Inflado | % editable | Ver brecha 6 | MAYOR | Excluir heredados | completionPercentage (línea 3426-3432) |
| **G. Persistencia** | - | - | - | - | normalizeComparableProjectForm completo | ✅ Sí | Completo | Ninguna | OK | Verificado | normalizeComparableProjectForm (línea 1550-1591) |
| **G. Persistencia** | - | - | - | - | handleSubmit persiste todos | ✅ Sí | Persiste | Ver brecha 5: SI | MAYOR | Crear payload SI | handleSubmit (línea 3811-4013) |
| **G. Persistencia** | - | - | - | - | handleSaveAndExit persiste todos | ✅ Sí | Persiste | Ver brecha 5: SI | MAYOR | Crear payload SI | handleSaveAndExit (línea 4025-4213) |
| **G. Persistencia** | - | - | - | - | Payload SI separado | ❌ No | Separado | Ver brecha 5 | MAYOR | buildSistemaIntegralProductPayload | handleSubmit (línea 3811-4013) |
| **H. Duplicidad** | - | - | - | - | width única fuente | ⚠️ Múltiple | Una fuente | shouldShowWidth + FORMAT | MENOR | Unificar | shouldShowWidth (línea 4040) |
| **H. Duplicidad** | - | - | - | - | blueprintFormat única fuente FDP | ✅ Sí | Una fuente | Ninguna | OK | Verificado | calculatePouchFormatPlan, calculateBolsaFormatPlan, calculateLaminaFormatPlan |
| **H. Duplicidad** | - | - | - | - | Sin campos duplicados Diseño/Estructura | ✅ Sí | Sin duplicidad | Ninguna | OK | Verificado | Campos separados por sección |
| **H. Duplicidad** | - | - | POUCH | - | Sin campos BOLSA/LAMINA visibles | ⚠️ Parcial | Limpio | Cleanup incompleto | MENOR | Verificar effects | isPouchWrapping (línea 2681-2708) |
| **H. Duplicidad** | - | - | BOLSA | - | Sin campos POUCH/LAMINA visibles | ⚠️ Parcial | Limpio | Cleanup incompleto | MENOR | Verificar effects | isBolsaWrapping (línea 2661-2678) |
| **H. Duplicidad** | - | - | LAMINA | - | Sin campos POUCH/BOLSA visibles | ⚠️ Parcial | Limpio | Cleanup incompleto | MENOR | Verificar effects | isLaminaWrapping (línea 2710-2713) |

---

## CAMPOS NO PERSISTIDOS CORRECTAMENTE

| Campo | Grupo MOT | Razón |
|-------|-----------|-------|
| `process` fields | "Nuevo equipamiento" | Grupo fantasma, no mapeado |
| `packingMachine` fields | "Nuevo equipamiento" | Grupo fantasma, no mapeado |
| `inputs` fields | "Cambio de insumo" | Grupo fantasma, no mapeado |
| `designVariant` fields | "Cambia diseño por variante" | Grupo fantasma, no mapeado |
| Payload SI (todos) | Todos | No separado en handleSubmit/handleSaveAndExit |

---

## CAMPOS NO VALIDADOS CORRECTAMENTE

| Campo | Envoltura | FDP | MOT | Razón | Severidad |
|-------|-----------|-----|-----|-------|-----------|
| width | LAMINA | FOOD | - | Se limpia en persistencia pero se valida en form | CRÍTICA |
| All en "process" | - | - | "Nuevo equipamiento" | Grupo fantasma sin mapeo | CRÍTICA |
| All en "inputs" | - | - | "Cambio de insumo" | Grupo fantasma sin mapeo | CRÍTICA |
| heredados | Modificado | - | Todos | Se validan como obligatorios aunque no sean editables | CRÍTICA |
| ocultos por FDP | - | Todos | - | Se validan aunque no visibles en UI | CRÍTICA |

---

## CAMPOS VISIBLES INCORRECTAMENTE

| Campo | Envoltura | FDP | Comportamiento Actual | Comportamiento Esperado | Severidad |
|-------|-----------|-----|----------------------|------------------------|-----------|
| width | LAMINA | FOOD | Mostrado en form | Oculto o consistente con persistencia | CRÍTICA |
| repetition | LAMINA | TISSUE | Oculto (shouldShowRepetition) | Mostrado (FORMAT_FIELD_RULES) | MENOR |
| zipperType | LAMINA | - | Mostrado | Oculto | MENOR |
| hasZipper | LAMINA | - | Mostrado | Oculto | MENOR |

---

## MOT SIN MAPEO DE CAMPOS

| MOT | Grupos Definidos | Mapeo a Campos Reales | Estado |
|-----|------------------|----------------------|--------|
| "Nuevo equipamiento / proceso / temperatura" | ["process", "packingMachine", "technicalComments", "sample"] | ❌ NO | CRÍTICA |
| "Cambio de insumo no homologado" | ["inputs", "validation", "technicalComments", "sample"] | ❌ NO | CRÍTICA |
| "Cambia diseño por variante" | ["designVariant", "edag", "printing", ...] | ❌ NO (designVariant?) | CRÍTICA |

---

## FDP SIN REGLAS COMPLETAS

| Grupo MOT | Campo | FDP | Reglas en FORMAT | Impacto |
|-----------|-------|-----|------------------|---------|
| "process" | rewindingDirection | Todos | ❌ NO | Visibilidad indefinida |
| "process" | hasPhotocell | Todos | ❌ NO | Visibilidad indefinida |
| "packingMachine" | coreMaterial | Todos | ❌ NO | Visibilidad indefinida |
| "packingMachine" | coreDiameter | Todos | ❌ NO | Visibilidad indefinida |
| "inputs" | layer1Material | Todos | ❌ NO | Visibilidad indefinida |
| "inputs" | layer2Material | Todos | ❌ NO | Visibilidad indefinida |
| FOOD | width | FOOD | ❌ Inconsistente | Mostrado pero limpiado |

---

## RECOMENDACIÓN DE REFACTOR

### **FASE 1: CRÍTICAS (Semana 1) - BLOQUEAR IMPLEMENTACIÓN**

#### 1.1 Mapear campos reales a grupos MOT fantasma

**Archivo**: ProductEditPage.tsx (agregar después MOT_FIELD_RULES)

```typescript
// Mapeo explícito: Grupo MOT → campos reales
const MOT_FIELD_MAPPING: Record<string, Set<string>> = {
  // Nuevo equipamiento / proceso / temperatura
  "process": new Set([
    "rewindingDirection",
    "rewindingDirectionRef", 
    "hasPhotocell",
    "photocellLocation",
    "fr1Width", "fr1Height", "fr1MarginRight", "fr1MarginBottom", "fr1MarginLeft", "fr1MarginTop",
    "fr2Width", "fr2Height", "fr2MarginRight", "fr2MarginBottom", "fr2MarginLeft", "fr2MarginTop",
  ]),
  "packingMachine": new Set([
    "coreMaterial",
    "coreDiameter",
    "externalDiameter",
    "externalVariationPlus",
    "externalVariationMinus",
    "maxRollWeight",
  ]),
  
  // Cambio de insumo no homologado
  "inputs": new Set([
    "layer1Material", "layer1Micron", "layer1Grammage",
    "layer2Material", "layer2Micron", "layer2Grammage",
    "layer3Material", "layer3Micron", "layer3Grammage",
    "layer4Material", "layer4Micron", "layer4Grammage",
    "grammage", "grammageTolerance",
  ]),
  
  // Cambia diseño por variante
  "designVariant": new Set([
    "printClass", "printType", "designAreaWidth", "designAreaHeight",
    "coPrinting", "codesToPrint",
  ]),
};

// Actualizar FIELD_TO_EDITABLE_GROUP automáticamente:
Object.entries(MOT_FIELD_MAPPING).forEach(([group, fields]) => {
  fields.forEach(field => {
    if (!FIELD_TO_EDITABLE_GROUP[field]) {
      FIELD_TO_EDITABLE_GROUP[field] = group;
    }
  });
});
```

**Validación**: Después, verificar que:
```typescript
// Todos los campos en MOT_FIELD_RULES existen en FIELD_TO_EDITABLE_GROUP
const validateMotMapping = () => {
  const motRules = Object.values(MOT_FIELD_RULES);
  motRules.forEach(rule => {
    rule.editableFieldGroups.forEach(group => {
      if (!Object.values(FIELD_TO_EDITABLE_GROUP).includes(group)) {
        console.error(`Grupo fantasma: ${group}`);
      }
    });
  });
};
```

---

#### 1.2 Excluir heredados de validación obligatoria

**Archivo**: ProductEditPage.tsx (refactor shouldValidateField)

```typescript
const shouldValidateField = (field: keyof ProjectEditFormData): boolean => {
  // NEW: No validar campos heredados bloqueados
  if (inheritedFields.has(field as string)) {
    return false;
  }

  if (!isModifiedProject) return true;

  const mot = form.projectType;
  if (!isFieldEditableByMot(field as string, mot)) return false;

  return true;
};
```

**Impacto**: 
- ✅ Heredados bloqueados no generan errores
- ✅ Usuario puede guardar aunque tenga heredados vacíos
- ✅ Validación respeta disability

---

#### 1.3 Resolver Width LAMINA FOOD

**Opción A (Recomendada)**: No mostrar width para FOOD

```typescript
// En render (línea ~4048):
const shouldShowWidth = !isLaminaFood; // Solo mostrar si no es FOOD

if (shouldShowWidth && shouldShowWidth) {
  <FormInput label="Ancho *" ... />
}

// En persistencia (línea ~3930):
width: form.width,  // Guardar como está (o vacío si no aplica)
```

**Opción B**: Mostrar width pero no limpiar
```typescript
// En persistencia:
width: isLaminaFood ? form.width : form.width,  // Guardar siempre
```

**Elegir**: **Opción A** (no mostrar si no aplica)

---

### **FASE 2: MAYORES (Semana 2) - COMPLETAR MOT/FDP**

#### 2.1 Integrar FDP en validación

**Archivo**: ProductEditPage.tsx (refactor shouldValidateField)

```typescript
const shouldValidateField = (field: keyof ProjectEditFormData): boolean => {
  // Excluir heredados
  if (inheritedFields.has(field as string)) return false;

  // NEW: Excluir ocultos por FDP
  if (!isFieldVisibleByFormat(field as string, form.blueprintFormat)) {
    return false;
  }

  if (!isModifiedProject) return true;

  const mot = form.projectType;
  if (!isFieldEditableByMot(field as string, mot)) return false;

  return true;
};
```

---

#### 2.2 Crear payload SI separado

**Archivo**: ProductEditPage.tsx (nueva función)

```typescript
const buildSistemaIntegralPayload = (form: ProjectEditFormData): Record<string, any> => {
  return {
    approvedProductCode: form.approvedProductCode,
    technicalApplication: form.technicalApplication,
    structureType: form.structureType,
    layer1Material: form.layer1Material,
    layer2Material: form.layer2Material,
    layer3Material: form.layer3Material,
    layer4Material: form.layer4Material,
    grammage: form.grammage,
    grammageTolerance: form.grammageTolerance,
    width: form.width,
    length: form.length,
    repetition: form.repetition,
    gussetWidth: form.gussetWidth,
    gussetType: form.gussetType,
    blueprintFormat: form.blueprintFormat,
    rewindingDirection: form.rewindingDirection,
    hasPhotocell: form.hasPhotocell,
    coreMaterial: form.coreMaterial,
    coreDiameter: form.coreDiameter,
    materialPackaging: form.materialPackaging,
    splices: form.splices,
  };
};

// En handleSubmit:
const siPayload = buildSistemaIntegralPayload(form);
// Enviar a API SI
if (shouldSubmitToSystemIntegral) {
  await submitToSystemIntegral(siPayload);
}
```

---

#### 2.3 Excluir heredados de completitud %

**Archivo**: ProductEditPage.tsx (refactor completionPercentage)

```typescript
const completionPercentage = useMemo(() => {
  // Solo contar campos editables (no heredados)
  const editableRequiredFields = requiredFields.filter(
    field => !inheritedFields.has(field as string)
  );
  
  const completedCount = editableRequiredFields.filter(
    (field) => !isFieldEmpty(form[field])
  ).length;
  
  if (editableRequiredFields.length === 0) return 100;
  
  return Math.round((completedCount / editableRequiredFields.length) * 100);
}, [form, requiredFields, inheritedFields]);
```

---

#### 2.4 Crear reglas FDP para "process" MOT

**Archivo**: ProductEditPage.tsx (expandir FORMAT_FIELD_RULES_BY_FDP)

```typescript
// Agregar después de LAMINA rules:
"PROCESS_DEFAULT": {
  visibleFields: new Set([
    "rewindingDirection", "rewindingDirectionRef", "hasPhotocell", "photocellLocation",
    "fr1Width", "fr1Height", "fr1MarginRight", "fr1MarginBottom", "fr1MarginLeft", "fr1MarginTop",
    "fr2Width", "fr2Height", "fr2MarginRight", "fr2MarginBottom", "fr2MarginLeft", "fr2MarginTop",
  ]),
  requiredFields: new Set(["rewindingDirection", "hasPhotocell"]),
  siFields: new Set(["rewindingDirection", "hasPhotocell"])
},
```

---

### **FASE 3: MENORES (Semana 3) - LIMPIEZA**

#### 3.1 Unificar shouldShowRepetitionField() con FORMAT

Eliminar `shouldShowRepetitionField()` y usar FORMAT_FIELD_RULES_BY_FDP

#### 3.2 Completar FIELD_LABELS

Agregar labels para campos en grupos "process", "packingMachine", "inputs"

#### 3.3 Eliminar duplicidad width/length/gussetWidth

Mantener única fuente de verdad en FORMAT_FIELD_RULES_BY_FDP

---

## CHECKLIST PRE-REFACTOR

- [ ] Revisión de MOT_FIELD_MAPPING con Product Manager
- [ ] Validación de "process" campos con Técnica
- [ ] Validación de "inputs" campos con Técnica
- [ ] Validación de "designVariant" campos con Diseño
- [ ] Crear casos de prueba para cada brecha crítica
- [ ] Documento de decisiones documentado
- [ ] Code review asignado

---

## CONCLUSIÓN

ProductEditPage implementa **60% de los requisitos correctamente**, pero tiene **7 brechas que bloquean** la implementación completa de MOT/FDP:

- 🔴 **3 CRÍTICAS**: Grupos fantasma, validación heredados, width FOOD
- 🟠 **4 MAYORES**: Validación ocultos, payload SI, completitud, reglas FDP

**Recomendación**: NO continuar implementación hasta Fase 1 completada. Riesgo: Data loss, UX rota, validación fallida.

**Timeline estimado**:
- Fase 1: 2-3 días
- Fase 2: 3-4 días  
- Fase 3: 1-2 días
- Testing: 3-4 días

**Total**: 2-3 semanas antes de poder hacer merge a `main`.
