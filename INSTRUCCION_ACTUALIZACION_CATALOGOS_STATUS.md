# INSTRUCCIÓN EJECUCIÓN: Actualizar Catálogos ODISEO P1-P4 desde Excel

## ✅ TAREAS COMPLETADAS

### Tarea 1: Crear `src/shared/data/productCatalogs.ts`
**Estado:** ✅ COMPLETADO

- Archivo creado con 37 catálogos de Producto P1-P4 desde Excel oficial
- **PRODUCT_CATALOGS** objeto export con estructura:
  ```typescript
  {
    aplicacionTecnica: { label, code, values[] }
    clasificacion: { ... }
    ... (34 más)
  }
  ```
- **PRODUCT_FIELD_CATALOG_MAP** export para mapear campos → catálogos
- Total: **450+** valores de catálogo, **0** valores inventados
- Fuente: Excel ODISEO-GFP-PDFP-0003-Diseño Funcional Producto

### Tarea 2: Actualizar ProductStep1Design.tsx
**Estado:** ✅ COMPLETADO

**Cambios:**
- Importado: `import { PRODUCT_CATALOGS } from "../../../shared/data/productCatalogs";`
- Reemplazado: `printClass` options (Flexo/Rotograbado/Offset) → PRODUCT_CATALOGS.claseDeImpresion.values
- Reemplazado: `printType` options (Nuevo/Revisión/Copia) → PRODUCT_CATALOGS.tipoDeImpresion.values
- Reemplazado: `printForm` options (Continua/Repetitiva/Seccional) → PRODUCT_CATALOGS.formaDeImpresion.values

**Conflictos resueltos:**
| Campo | Antes (APP) | Ahora (Excel) |
|-------|------------|---------------|
| Clase de Impresión | Flexo, Rotograbado, Offset | Flexo, Huecograbado, Sin impresión |
| Tipo Impresión | Nuevo, Revisión, Copia | Repetitivo, Continuo |
| Forma de Impresión | Continua, Repetitiva, Seccional | Superficie, Dorso |

### Tarea 3: Actualizar ProductStep2Structure.tsx
**Estado:** ✅ COMPLETADO

**Cambios:**
- Importado: `import { PRODUCT_CATALOGS } from "../../../shared/data/productCatalogs";`
- Reemplazado: `structureType` options (Monolaminado/Bilaminado/Trilaminado/Cuadrilaminado) → PRODUCT_CATALOGS.tipoDeEstructura.values

**Conflictos resueltos:**
| Campo | Antes (APP) | Ahora (Excel) |
|-------|------------|---------------|
| Tipo Estructura | Monolaminado, Bilaminado, Trilaminado, Cuadrilaminado | Monocapa, Bilaminado, Trilaminado, Tetralaminado |

---

## ⏳ TAREAS PENDIENTES

### Tarea 4: Actualizar ProductCreatePage.tsx
**Estado:** ❌ PENDIENTE

**Archivos encontrados con hardcoded options:**
- `src/modules/products/pages/ProductCreatePage.tsx`
- `src/modules/products/components/ProductStep0General.tsx`
- `src/modules/products/pages/ProductEditPage.tsx`

**Acciones necesarias:**
1. Remover/actualizar arrays hardcoded de clasificación y subclasificación
2. Importar PRODUCT_CATALOGS
3. Reemplazar options con valores dinámicos

**Ejemplos de hardcoded encontrados:**
```typescript
// ANTES (hardcoded, incorrecto)
const CLASSIFICATION_OPTIONS = [
  { value: "Nuevo", label: "Nuevo" },
  { value: "Modificado", label: "Modificado" },
];

// DESPUÉS (dinámico, correcto desde Excel)
const CLASSIFICATION_OPTIONS = PRODUCT_CATALOGS.clasificacion.values.map(v => ({
  value: v,
  label: v,
}));
```

### Tarea 5: Validación de cambios
**Estado:** ❌ PENDIENTE

Verificar que:
- [ ] No existan valores hardcoded en selects de Producto que contradigan Excel
- [ ] Todos los imports de PRODUCT_CATALOGS se hayan agregado
- [ ] No se hayan eliminado catálogos usados por otros módulos
- [ ] El layout visual se mantenga igual
- [ ] `npm run build` compile sin errores TypeScript

### Tarea 6: Documentación de campos pendientes
**Estado:** ⏸️ INFORMATIVO

Estos campos del Excel NO tienen catálogos definidos en la app:
- **P4:Embalaje de Productos de Exportación** → PENDING_DEFINITION
- **P4:Embalaje de material** → PENDING_DEFINITION
- **P4:Empalmes** → PENDING_DEFINITION
- **P1:Número de capas** → PENDING_DEFINITION
- **P2:Corte aliviador** → PENDING_DEFINITION
- **P2:Dispensador** → PENDING_DEFINITION

**Acción:** No inventar valores. Dejar como `PENDING_DEFINITION` en formularios hasta que negocio proporcione opciones.

---

## 📊 RESUMEN DE CATÁLOGOS ACTUALIZADOS

| Archivo | Catálogos Actualizados | Estado |
|---------|----------------------|--------|
| ProductStep1Design.tsx | claseDeImpresion, tipoDeImpresion, formaDeImpresion | ✅ Done |
| ProductStep2Structure.tsx | tipoDeEstructura | ✅ Done |
| ProductCreatePage.tsx | clasificacion, subclassification | ❌ Pending |
| ProductStep0General.tsx | (recibe via props) | ✅ N/A |
| ProductEditPage.tsx | (orquestador) | ⏳ Revisar |

---

## 🔍 CONFLICTOS ENCONTRADOS Y RESUELTOS

### Conflicto 1: Clase de Impresión
- **APP:** Flexo, Rotograbado, **Offset**
- **Excel:** Flexo, **Huecograbado**, Sin impresión
- **Resolución:** ✅ Actualizado a valores Excel

### Conflicto 2: Tipo de Impresión  
- **APP:** Nuevo, Revisión, Copia
- **Excel:** Repetitivo, Continuo
- **Resolución:** ✅ Actualizado a valores Excel

### Conflicto 3: Forma de Impresión
- **APP:** Continua, Repetitiva, Seccional
- **Excel:** Superficie, Dorso
- **Resolución:** ✅ Actualizado a valores Excel

### Conflicto 4: Tipo Estructura
- **APP:** Monolaminado, Bilaminado, Trilaminado, **Cuadrilaminado**
- **Excel:** Monocapa, Bilaminado, Trilaminado, **Tetralaminado**
- **Resolución:** ✅ Actualizado a valores Excel

### No Conflicto: Envoltura
- **APP:** POUCH, BOLSA, LAMINA
- **Excel:** POUCH, BOLSA, LAMINA, **ETIQUETA**
- **Resolución:** ✅ ETIQUETA agregado en PRODUCT_CATALOGS (aplicación en UI: bloquear si ODISEO aún no acepta)

---

## ✅ TAREA 4: ACTUALIZAR OPCIONES DINÁMICAS EN PAGES
**Estado:** ✅ COMPLETADO

**Cambios realizados:**
- ProductCreatePage.tsx: Reemplazado CLASSIFICATION_OPTIONS y SUBCLASSIFICATION_*_OPTIONS con dinámicos
- ProductEditPage.tsx: Reemplazado CLASSIFICATION_OPTIONS y SUBCLASSIFICATION_*_OPTIONS con dinámicos
- Ambos archivos mantienen compatibilidad con valores almacenados (Nuevo/Modificado)
- Compilación: ✅ Sin errores TypeScript
- Build: ✅ Exitoso

---

## 🆕 NUEVA TAREA: ACTUALIZACIÓN INTEGRAL DE P2

**Estado:** ⏳ PENDIENTE ANÁLISIS Y PLANIFICACIÓN

**Objetivo:** Implementar todos los campos P2 del Excel funcional en ProductStep0General.tsx y catalogs

**Scope:** 
- Agregar 90+ campos P2 faltantes
- Crear 40+ catálogos nuevos en PRODUCT_CATALOGS
- Implementar reglas de visibilidad condicional por envoltura (POUCH/BOLSA/LAMINA)
- Asegurar persistencia de datos (save/load)

**Archivos a modificar:**
1. `src/shared/data/productCatalogs.ts` - Agregar catálogos P2
2. `src/modules/products/components/ProductStep0General.tsx` - Agregar campos P2
3. `src/modules/products/pages/ProductEditPage.tsx` - Actualizar state/props si es necesario

**Próximos pasos:**
1. Analizar ProductStep0General.tsx actual vs especificación de P2
2. Identificar campos faltantes
3. Crear/actualizar catálogos necesarios
4. Implementar campos en secciones organizadas
5. Implementar reglas de visibilidad
6. Testing y validación

---

## 🔧 NOTAS TÉCNICAS

### Estructura PRODUCT_CATALOGS
Cada catálogo tiene:
```typescript
{
  label: string;           // Etiqueta para UI
  code?: string;           // Código técnico o undefined si no existe
  values: string[];        // Valores oficiales del Excel
}
```

### PRODUCT_FIELD_CATALOG_MAP
Mapeo bidireccional: `"P1:Campo Nombre" → "catalogKey"`
- Si value es `"MAESTRO_CLIENTES"`: obtener del módulo Clientes (no catálogo fijo)
- Si value es `"PENDING_DEFINITION"`: campo sin definición Excel (dejar pendiente)

---

## ✨ VALIDACIÓN FINAL

Al terminar:
- [ ] Compilación sin errores TypeScript
- [ ] No existen arrays hardcoded en selectes de Producto que contradigan Excel
- [ ] Todos los cambios están en PRODUCT_CATALOGS (fuente única de verdad)
- [ ] Campos P4, Corte Aliviador, Dispensador sin definición están marcados como PENDING_DEFINITION
- [ ] Envoltura incluye ETIQUETA (aunque bloqueado en UI si aplica)

---

**Fecha actualización:** 2026-06-05  
**Fuente oficial:** Excel ODISEO-GFP-PDFP-0003-Diseño Funcional Producto  
**Principio:** Lo que está en Excel es la fuente válida. No inventar valores.
