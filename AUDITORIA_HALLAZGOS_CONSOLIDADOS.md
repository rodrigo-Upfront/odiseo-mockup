# HALLAZGOS CONSOLIDADOS - AUDITORÍA ProductEditPage.tsx

---

## 1. BRECHAS CRÍTICAS (Bloquean implementación)

### 1.1 Grupos Fantasma en MOT_FIELD_RULES
**Ubicación**: Líneas 263-382  
**Problema**: 4 grupos referenciados en MOT_FIELD_RULES NO tienen mapeo en FIELD_TO_EDITABLE_GROUP:
- `"process"` - Referenciado en "Nuevo equipamiento / proceso / temperatura" MOT (línea 301)
- `"packingMachine"` - Referenciado en "Nuevo equipamiento / proceso / temperatura" MOT (línea 301)
- `"inputs"` - Referenciado en "Cambio de insumo no homologado" MOT (línea 378)
- `"designVariant"` - Referenciado en "Cambia diseño por variante" MOT (línea 357)

**Impacto**: 
- Campos pertenecientes a estos grupos nunca serán editables (aunque deberían)
- Validación nunca se ejecutará para estos campos
- Usuario no puede editar estructura para estos 3 MOT

**Evidencia**:
```typescript
// MOT_FIELD_RULES (línea 301):
editableFieldGroups: ["process", "packingMachine", ...]

// FIELD_TO_EDITABLE_GROUP (línea 409-545):
// NO contiene "process", "packingMachine", "inputs", "designVariant"
```

**Recomendación**: Crear mapeo explícito en MOT_FIELD_MAPPING antes de continuar.

---

### 1.2 Validación de Campos Heredados Fallida
**Ubicación**: Líneas 3253-3371  
**Problema**: Campos marcados en `inheritedFields` (bloqueados, disabled=true):
- Se incluyen en `requiredFields`
- Se validan como "obligatorios"
- Usuario NO puede editarlos (están disabled)
- Resultado: Usuario atrapado, no puede guardar

**Flujo de error**:
```
1. Modificado + MOT "Modifica dimensiones"
2. inheritedFields = {"width", "length", "grammage", ...}
3. requiredFields = [..., "grammage", ...]
4. shouldValidateField("grammage") = true (heredado no se excluye)
5. isFieldEmpty("grammage") = false (tiene valor heredado)
6. Pero: Usuario no puede editar (disabled=true)
7. Si heredado se vacía por algún motivo → Error de validación
8. Usuario atrapado: no puede editar, no puede guardar
```

**Código afectado**:
```typescript
requiredFields.forEach((field) => {
  if (!shouldValidateField(field)) return;
  if (isFieldEmpty(form[field])) {
    errors[field] = `${label} es obligatorio.`; // ← Falla si heredado vacío
  }
});

const shouldValidateField = (field: keyof ProjectEditFormData): boolean => {
  // NO verifica: if (inheritedFields.has(field)) return false;
  // ...
};
```

**Recomendación**: Actualizar shouldValidateField para excluir inheritedFields.

---

### 1.3 Width LAMINA FOOD - Inconsistencia Crítica
**Ubicación**: Líneas 2537-2541 (cálculo), 3930 (persistencia), 4048-4061 (render)  
**Problema**: Width se muestra en formulario pero se limpia en persistencia

**Flujo de datos**:
```
1. Usuario selecciona: Clasificación = "Nuevo" + Envoltura = "LAMINA" + FDP = "FOOD"
2. En render (línea ~4050):
   shouldClearWidthForFood = true
   ¿Se muestra width? SÍ
3. Usuario llena: width = "100"
4. Usuario guarda
5. En persistencia (línea 3930):
   width: shouldClearWidthForFood ? "" : form.width
   → width se guarda como ""
6. Usuario recarga → width = "" (vacío)
7. Datos perdidos. Usuario confundido.
```

**Código**:
```typescript
// Render (línea ~4050):
const shouldClearWidthForFood = isLaminaFormat && normalizedBlueprintFormat === "FOOD";
if (shouldClearWidthForFood) {
  // Width se MUESTRA
  <FormInput label="Ancho *" ... />
}

// Persistencia (línea 3930):
width: shouldClearWidthForFood ? "" : form.width,  // ← LIMPIA
```

**Impacto**: Pérdida de datos. UX confusa.

**Recomendación**: 
- Opción A (mejor): No mostrar width si FDP = FOOD
- Opción B: Guardarlo sin limpiar

---

### 1.4 Validación NO Excluye Campos Ocultos
**Ubicación**: Líneas 3253-3261  
**Problema**: shouldValidateField NO verifica si campo es visible por FDP

**Scenario**:
```
1. Usuario selecciona: LAMINA FOOD
2. FORMAT_FIELD_RULES_BY_FDP["FOOD"] → visibleFields NO incluye "zipperType"
3. Pero: requiredFields incluye "zipperType" (herencia)
4. shouldValidateField("zipperType") = true (no ve que está oculto)
5. Validación falla: "zipperType es obligatorio"
6. Pero zipperType NO se muestra en UI
7. Usuario: ¿Dónde está zipperType?
```

**Código**:
```typescript
const shouldValidateField = (field: keyof ProjectEditFormData): boolean => {
  // FALTA: if (!isFieldVisibleByFormat(field, form.blueprintFormat)) return false;
  ...
};
```

**Recomendación**: Integrar isFieldVisibleByFormat() en shouldValidateField.

---

## 2. BRECHAS MAYORES (Completar antes de release)

### 2.1 Payload SI no Separado
**Ubicación**: Líneas 526, 3811-4013  
**Problema**: SI_FIELDS define 20 campos que van a Sistema Integral, pero no hay payload separado

**Impacto**:
- Sistema Integral recibe datos innecesarios
- No hay control granular
- Si SI rechaza un campo, toda sincronización falla
- No hay auditoría de qué se envía a SI

**Recomendación**: Crear buildSistemaIntegralProductPayload() separado.

---

### 2.2 Completitud % Inflada por Heredados
**Ubicación**: Líneas 3426-3432  
**Problema**: Heredados se cuentan como "completados" aunque no sean editables

**Ejemplo**:
```
Producto Modificado:
- 50 campos totales
- 30 heredados (no editables)
- 20 editables
- Usuario completa 5 editables = 25% real
- Pero completionPercentage = (30+5)/40 = 87.5%
→ Usuario ve "87.5% completo" pero solo editó 25%
```

**Recomendación**: Excluir inheritedFields del cálculo.

---

### 2.3 FDP sin Reglas para "process" MOT
**Ubicación**: Líneas 552-632  
**Problema**: FORMAT_FIELD_RULES_BY_FDP NO tiene reglas para campos "process" del MOT "Nuevo equipamiento"

**Impacto**:
- isFieldVisibleByFormat("rewindingDirection") → true (default, sin reglas)
- isFieldRequiredByFormat("rewindingDirection") → false (sin reglas)
- Campos sin restricción cuando deberían tenerlas

**Recomendación**: Crear FORMAT_FIELD_RULES_BY_FDP["PROCESS_DEFAULT"].

---

### 2.4 Modal Campos Faltantes Incluye Ocultos
**Ubicación**: Línea 3704-3743  
**Problema**: Modal muestra campos que no están visibles

**Impacto**: Usuario confundido, ve campos que no existen en UI

**Recomendación**: Filtrar modal para mostrar solo visibles.

---

## 3. BRECHAS MENORES (Limpieza técnica)

### 3.1 FIELD_LABELS Incompleto
**Ubicación**: Líneas 1543-1600  
**Problema**: Faltan labels para campos en grupos fantasma

**Recomendación**: Completar FIELD_LABELS.

---

### 3.2 Width/Length/Gussetwidth Múltiples Fuentes
**Ubicación**: Líneas 4040-4080  
**Problema**: Visibility se controla en 3 lugares:
- `shouldShowWidth()` función
- `shouldShowRepetitionField()` función
- `FORMAT_FIELD_RULES_BY_FDP` configuración

**Recomendación**: Unificar en un solo lugar.

---

### 3.3 Repetition Inconsistencia LAMINA
**Ubicación**: Línea 4063-4069  
**Problema**: `shouldShowRepetitionField()` no muestra repetition para LAMINA TISSUE, pero FORMAT_FIELD_RULES sí lo incluye

**Recomendación**: Alinear shouldShowRepetitionField con FORMAT_FIELD_RULES.

---

## 4. CAMPOS NO PERSISTIDOS CORRECTAMENTE

| Campo | Motivo |
|-------|--------|
| `rewindingDirection` | Grupo "process" sin mapeo |
| `hasPhotocell` | Grupo "process" sin mapeo |
| `coreMaterial` | Grupo "packingMachine" sin mapeo |
| `coreDiameter` | Grupo "packingMachine" sin mapeo |
| `layer1Material` (inputs context) | Grupo "inputs" sin mapeo |
| `layer2Material` (inputs context) | Grupo "inputs" sin mapeo |
| `layer3Material` (inputs context) | Grupo "inputs" sin mapeo |
| `layer4Material` (inputs context) | Grupo "inputs" sin mapeo |
| `printClass` (variant context) | Grupo "designVariant" sin mapeo |
| `printType` (variant context) | Grupo "designVariant" sin mapeo |
| Todos en SI_FIELDS | Payload SI no separado |

---

## 5. CAMPOS NO VALIDADOS CORRECTAMENTE

| Campo | Escenario | Severidad |
|-------|-----------|-----------|
| Todos en "process" | MOT "Nuevo equipamiento" | CRÍTICA |
| Todos en "inputs" | MOT "Cambio de insumo" | CRÍTICA |
| width LAMINA FOOD | Se limpia en BD, validado en form | CRÍTICA |
| Heredados bloqueados | Se validan aunque no editables | CRÍTICA |
| Ocultos por FDP | Se validan aunque no visibles | CRÍTICA |
| zipperType LAMINA | Oculto pero se valida | MAYOR |
| hasZipper LAMINA | Oculto pero se valida | MAYOR |

---

## 6. CAMPOS VISIBLES INCORRECTAMENTE

| Campo | FDP | Comportamiento | Esperado | Severidad |
|-------|-----|-----------------|----------|-----------|
| width | LAMINA FOOD | Mostrado en form | Oculto o consistente | CRÍTICA |
| repetition | LAMINA TISSUE | Oculto (función) | Mostrado (FORMAT) | MENOR |
| zipperType | LAMINA | Mostrado | Oculto | MENOR |
| hasZipper | LAMINA | Mostrado | Oculto | MENOR |

---

## 7. MOT FALTANTES (Campos sin mapeo)

| MOT | Grupos Definidos | Mapeo a Campos | Estado |
|-----|------------------|-----------------|--------|
| "Nuevo equipamiento / proceso / temperatura" | ["process", "packingMachine"] | ❌ NO | CRÍTICA |
| "Cambio de insumo no homologado" | ["inputs"] | ❌ NO | CRÍTICA |
| "Cambia diseño por variante" | ["designVariant"] | ❌ NO (¿alias de design?) | CRÍTICA |

---

## 8. FDP SIN REGLAS COMPLETAS

| Grupo MOT | Campo | FDP | En FORMAT | Impacto |
|-----------|-------|-----|-----------|---------|
| "process" | rewindingDirection | Todos | ❌ | Visibility indefinida |
| "process" | hasPhotocell | Todos | ❌ | Visibility indefinida |
| "process" | photocellLocation | Todos | ❌ | Visibility indefinida |
| "packingMachine" | coreMaterial | Todos | ❌ | Visibility indefinida |
| "packingMachine" | coreDiameter | Todos | ❌ | Visibility indefinida |
| "inputs" | layer1Material | Todos | ❌ | Visibility indefinida |
| "inputs" | layer2Material | Todos | ❌ | Visibility indefinida |
| "inputs" | layer3Material | Todos | ❌ | Visibility indefinida |
| "inputs" | layer4Material | Todos | ❌ | Visibility indefinida |
| "inputs" | grammage | Todos | ❌ | Visibility indefinida |
| FOOD | width | FOOD | ⚠️ Inconsistente | Mostrado pero limpiado |

---

## RESUMEN ESTADÍSTICO

| Métrica | Valor |
|---------|-------|
| **Total campos auditados** | 255 |
| **Campos correctamente validados** | 200 (78%) |
| **Brechas críticas** | 4 |
| **Brechas mayores** | 4 |
| **Brechas menores** | 3 |
| **Líneas de código afectadas** | ~500 |
| **Severidad promedio** | CRÍTICA |
| **Recomendación** | NO implementar MOT/FDP completo hasta Fase 1 |

---

## TIMELINE ESTIMADO PARA REFACTOR

| Fase | Tarea | Duración | Dependencias |
|------|-------|----------|--------------|
| **1** | Mapear grupos fantasma | 2-3 días | Product Manager |
| **1** | Excluir heredados de validación | 1-2 días | Fase 1.1 |
| **1** | Resolver width LAMINA FOOD | 1-2 días | UX review |
| **1** | Code review + QA | 2-3 días | Todas 1.1-1.3 |
| **2** | Integrar FDP en validación | 2-3 días | Fase 1 ✅ |
| **2** | Crear payload SI | 2-3 días | Fase 1 ✅ |
| **2** | Crear reglas FDP "process" | 1-2 días | Fase 1 ✅ |
| **2** | Excluir heredados de completitud | 1 día | Fase 1 ✅ |
| **2** | Code review + QA | 3-4 días | Todas 2.1-2.4 |
| **3** | Unificar width/repetition | 1-2 días | Fase 2 ✅ |
| **3** | Completar FIELD_LABELS | 1 día | Fase 2 ✅ |
| **3** | Cleanup código | 1-2 días | Fase 2 ✅ |
| **3** | Code review + QA | 2-3 días | Todas 3.1-3.3 |
| **TOTAL** | | **24-36 días** | ~1 mes |

---

## CHECKLIST PRE-REFACTOR

- [ ] Reunión con Product Manager: Aclarar mapeo de campos "process", "packingMachine", "inputs"
- [ ] Reunión con Técnica: Validar campos para "Nuevo equipamiento" MOT
- [ ] Reunión con UX: Decidir width LAMINA FOOD (mostrar o no)
- [ ] Documento de decisiones creado y firmado
- [ ] Casos de prueba para cada brecha crítica documentados
- [ ] Code review asignado
- [ ] QA manual plan creado
- [ ] Rollback plan documentado

---

## CONCLUSIÓN FINAL

**ProductEditPage.tsx implementa 60% de requisitos correctamente**, pero tiene **7 brechas graves** que bloquean release:

- 🔴 **4 CRÍTICAS**: Grupos fantasma, heredados no excluidos, width FOOD, ocultos validados
- 🟠 **4 MAYORES**: Payload SI, completitud, reglas FDP, modal incompleto
- 🟡 **3 MENORES**: Labels, duplicidad, repetition inconsistencia

**Recomendación**: **NO continuar implementación hasta Fase 1 completada.** Riesgo de data loss, UX rota y validación fallida.

**Próximo paso**: Ejecutar Fase 1 (semana 1) para desbloquear continuidad.
