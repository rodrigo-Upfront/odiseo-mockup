# Auditoría: Catálogos Hardcoded vs PRODUCT_CATALOGS

**Fecha:** 2026-06-05  
**Estado:** 🔴 CRÍTICO - Violación de "Única Fuente de Verdad"

---

## 📊 Resumen

| Módulo | Hardcoded | En PRODUCT_CATALOGS | Estado |
|--------|-----------|---------------------|--------|
| ProductCreatePage.tsx | **27** | Parcial | 🔴 CRÍTICO |
| ProductInitialCreateModal.tsx | 2+ | No | 🔴 CRÍTICO |
| portfolioStorage.ts | 45+* | ✅ Sí (aplicacionTecnica) | 🟡 MIGRACIÓN |
| ProjectValidationPanel.tsx | 2 | No | 🟡 REVISAR |
| Otros módulos (Portfolio, Clients, Users) | 0 | - | ✅ OK |

*TECHNICAL_APPLICATION_OPTIONS tiene 45+ valores que ya existen en PRODUCT_CATALOGS.aplicacionTecnica

---

## 🔴 HALLAZGO CRÍTICO #1: ProductCreatePage.tsx

**27 opciones hardcoded encontradas (líneas 135-459):**

---

## 🔴 HALLAZGO CRÍTICO #2: portfolioStorage.ts

**TECHNICAL_APPLICATION_OPTIONS (línea 260+)**
- ❌ Definida localmente en portfolioStorage.ts
- ✅ DUPLICADA en PRODUCT_CATALOGS.aplicacionTecnica
- 📊 45+ valores
- 🔧 Acción: Migrar a usar PRODUCT_CATALOGS.aplicacionTecnica

Impacto: Cualquier cambio en Excel debe hacerse en DOS lugares (inconsistencia crítica)

---

## 🟡 HALLAZGO IMPORTANTE #3: ProductInitialCreateModal.tsx

**MOTIVO_OPTIONS (línea 57)**
- ❌ Hardcoded: ["Producto nuevo", "Producto modificado"]
- ✅ Debería estar en PRODUCT_CATALOGS.clasificacion
- 🔧 Acción: Reemplazar con PRODUCT_CATALOGS

---

## 🟡 HALLAZGO IMPORTANTE #4: ProjectValidationPanel.tsx

**STATUS_OPTIONS y AREAS (línea 17+)**
- ❌ Hardcoded locales
- ⚠️ Posiblemente no estén en PRODUCT_CATALOGS
- 🔧 Acción: Verificar y consolidar

---

## 🔴 HALLAZGO CRÍTICO: ProductCreatePage.tsx

**27 opciones hardcoded encontradas (líneas 135-459):**

### Grupo 1: Clasificación (Líneas 135-189)
- ✅ **YES_NO_OPTIONS** (L135) - Sí/No
- ✅ **CLASSIFICATION_OPTIONS** (L141) - Nuevo/Modificado  
- ✅ **PROJECT_TYPE_OPTIONS** (L163)
- ✅ **PROJECT_TYPE_RD_OPTIONS** (L170)
- ✅ **PROJECT_TYPE_TECNICA_OPTIONS** (L181)

### Grupo 2: Formatos (Líneas 189-270)
- ✅ **POUCH_FORMAT_OPTIONS** (L189)
- ✅ **BOLSA_FORMAT_OPTIONS** (L206)
- ✅ **LAMINA_FORMAT_OPTIONS** (L217)
- ✅ **PRINT_CLASS_OPTIONS** (L272)
- ✅ **PRINT_TYPE_OPTIONS** (L278)
- ✅ **STRUCTURE_TYPE_OPTIONS** (L283)

### Grupo 3: Comercial (Líneas 368-459)
- ⚠️ **SALE_TYPE_OPTIONS** (L368) - Nacional/Internacional
- ⚠️ **INCOTERM_OPTIONS** (L373) - EXW, FCA, etc.
- ⚠️ **CURRENCY_OPTIONS** (L387) - Soles/Dólares
- ⚠️ **SPECIAL_DESIGN_SPECS_OPTIONS** (L392)
- ⚠️ **DOY_PACK_BASE_OPTIONS** (L400)
- ⚠️ **CORE_MATERIAL_OPTIONS** (L406)
- ⚠️ **GUSSET_TYPE_OPTIONS** (L413)
- ⚠️ **ZIPPER_TYPE_OPTIONS** (L418)
- ⚠️ **VALVE_TYPE_OPTIONS** (L423)
- ⚠️ **ROUNDED_CORNERS_TYPE_OPTIONS** (L428)
- ⚠️ **POUCH_PERFORATION_TYPE_OPTIONS** (L433)
- ⚠️ **BAG_PERFORATION_TYPE_OPTIONS** (L439)
- ⚠️ **PERFORATION_LOCATION_OPTIONS** (L444)
- ⚠️ **PRECUT_TYPE_OPTIONS** (L449)
- ⚠️ **OTHER_ACCESSORIES_OPTIONS** (L454)
- ⚠️ **DESTINATION_COUNTRY_OPTIONS** (L459)

---

## ✅ Verificación contra PRODUCT_CATALOGS

| Opción | En PRODUCT_CATALOGS? | Nombre en PRODUCT_CATALOGS |
|--------|----------------------|---------------------------|
| YES_NO_OPTIONS | ❌ No | (crear) |
| CLASSIFICATION_OPTIONS | ✅ Sí | clasificacion |
| PROJECT_TYPE_OPTIONS | ❌ No | (verificar) |
| POUCH_FORMAT_OPTIONS | ✅ Sí | formatoDePlano |
| PRINT_CLASS_OPTIONS | ✅ Sí | claseDeImpresion |
| PRINT_TYPE_OPTIONS | ✅ Sí | tipoDeImpresion |
| STRUCTURE_TYPE_OPTIONS | ✅ Sí | tipoDeEstructura |
| SALE_TYPE_OPTIONS | ✅ Sí | ? |
| INCOTERM_OPTIONS | ✅ Sí | incoterm |
| CURRENCY_OPTIONS | ❌ No | (crear) |
| SPECIAL_DESIGN_SPECS_OPTIONS | ✅ Sí | especificacionesDeDisenoEspeciales |
| DOY_PACK_BASE_OPTIONS | ✅ Sí | baseDelDoypack |
| CORE_MATERIAL_OPTIONS | ✅ Sí | materialDeTuco |
| GUSSET_TYPE_OPTIONS | ❌ No | (crear) |
| ZIPPER_TYPE_OPTIONS | ✅ Sí | zipper |
| VALVE_TYPE_OPTIONS | ✅ Sí | valvula |
| ROUNDED_CORNERS_TYPE_OPTIONS | ✅ Sí | esquinasPr |
| POUCH_PERFORATION_TYPE_OPTIONS | ✅ Sí | tipoDePerforacionPouch |
| BAG_PERFORATION_TYPE_OPTIONS | ✅ Sí | tipoDePerforacionBolsa |
| PERFORATION_LOCATION_OPTIONS | ✅ Sí | ubicacionDePerforaciones |
| PRECUT_TYPE_OPTIONS | ✅ Sí | preCorte |
| OTHER_ACCESSORIES_OPTIONS | ❌ No | (crear) |
| DESTINATION_COUNTRY_OPTIONS | ✅ Sí | ? |

---

## 🔧 Acciones Necesarias

### 🔴 Priority 1: CRÍTICO (Hoy)

1. **portfolioStorage.ts - TECHNICAL_APPLICATION_OPTIONS**
   - [ ] Migrar a usar PRODUCT_CATALOGS.aplicacionTecnica
   - [ ] Remover array local (línea 260+)
   - [ ] Actualizar imports en archivos que lo usan
   - [ ] Tiempo estimado: 1 hora
   - **Razón:** DUPLICACIÓN completa de 45+ valores

2. **ProductCreatePage.tsx - 27 OPTIONS hardcoded**
   - [ ] Reemplazar constantes con PRODUCT_CATALOGS.miCatalogo
   - [ ] Seguir patrón: `PRODUCT_CATALOGS.xxx.values.map(...)`
   - [ ] Tiempo estimado: 3 horas
   - **Razón:** Violaría "única fuente de verdad"

### 🟡 Priority 2: IMPORTANTE (Esta semana)

3. **ProductInitialCreateModal.tsx - MOTIVO_OPTIONS**
   - [ ] Reemplazar con PRODUCT_CATALOGS.clasificacion
   - [ ] Tiempo estimado: 30 minutos

4. **ProjectValidationPanel.tsx - STATUS_OPTIONS & AREAS**
   - [ ] Verificar si deben estar en PRODUCT_CATALOGS
   - [ ] Consolidar si aplica
   - [ ] Tiempo estimado: 1 hora

### 🟢 Priority 3: VERIFICACIÓN (Próxima semana)

5. **Auditoría Final**
   - [ ] Verificar que NO haya más hardcoded en shared/
   - [ ] Verificar que NO haya más hardcoded en módulos
   - [ ] Validar que 100% de opciones usen PRODUCT_CATALOGS
   - [ ] Testing: crear/editar en todos módulos
   - [ ] Tiempo estimado: 2 horas

---

## 📝 Patrón de Reemplazo

### ANTES (Hardcoded - ❌ INCORRECTO):
```typescript
const PRINT_CLASS_OPTIONS = [
  { value: "Flexo", label: "Flexo" },
  { value: "Huecograbado", label: "Huecograbado" },
  { value: "Sin impresión", label: "Sin impresión" },
];
```

### DESPUÉS (Dinámico - ✅ CORRECTO):
```typescript
// En FormSelect:
options={PRODUCT_CATALOGS.claseDeImpresion.values.map((val) => ({
  value: val,
  label: val,
}))}
```

---

## 🎯 Impacto

### Riesgo Actual
- ❌ Múltiples fuentes de verdad para mismas opciones
- ❌ Cambios en Excel no se reflejan en hardcoded arrays
- ❌ Posibles inconsistencias en UI
- ❌ Mantenimiento difícil

### Beneficio de Consolidación
- ✅ Una única fuente: PRODUCT_CATALOGS
- ✅ Cambios en Excel = cambios automáticos en app
- ✅ Consistencia garantizada
- ✅ Mantenimiento simplificado

---

## 📋 Checklist de Auditoría

- [x] Encontrar todos los hardcoded OPTIONS
- [ ] Mapear cada uno a PRODUCT_CATALOGS
- [ ] Identificar catalogs faltantes
- [ ] Reemplazar en ProductCreatePage.tsx
- [ ] Reemplazar en ProductEditPage.tsx
- [ ] Auditar otros módulos
- [ ] Validar build sin errores
- [ ] Testing en dev (crear/editar productos)
- [ ] Verificar visibilidad condicional por envoltura

---

**Documento generado por:** Auditoría de Catálogos  
**Próxima acción:** Reemplazar 27 hardcoded OPTIONS en ProductCreatePage.tsx
