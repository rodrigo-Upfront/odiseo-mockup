# Guía de Implementación: Actualización Integral de P2

**Fecha:** 2026-06-05  
**Estado:** 🔄 En Progreso  
**Tarea:** Integración total de campos P2 desde productCatalogs.ts a ProductStep0General.tsx

---

## 📊 Situación Actual

### ✅ Completado
1. **PRODUCT_CATALOGS** - 75 catálogos definidos con especificaciones de Excel
2. **ProductEditPage.tsx** - Actualizado para usar opciones dinámicas
3. **ProductCreatePage.tsx** - Actualizado para usar opciones dinámicas  
4. **ProductStep1Design.tsx** - Integrado con PRODUCT_CATALOGS
5. **ProductStep2Structure.tsx** - Integrado con PRODUCT_CATALOGS
6. **ProductStep0General.tsx** - Importación de PRODUCT_CATALOGS iniciada

### 🔄 En Progreso
- Reemplazo de opciones hardcoded en ProductStep0General.tsx

### ⏳ Pendiente
- Completar reemplazo de todas las opciones hardcoded
- Añadir campos P2 faltantes según especificación
- Implementar reglas de visibilidad condicional
- Testing exhaustivo

---

## 📋 Catálogos Disponibles en PRODUCT_CATALOGS

Total: **75 catálogos** ya definidos

Relacionados con P2:
- `aplicacionTecnica` ✅
- `clasificacion` ✅
- `formatoDePlano` ✅ (parcialmente integrado)
- `unidadDeMedida` ✅
- `tipoDeEstructura` ✅
- `solicitudDeMuestra` ✅
- `claseDeImpresion` ✅
- `tipoDeImpresion` ✅
- `formaDeImpresion` ✅
- `familiaDePouch` ⏳
- `tipoDeStandUp` ⏳
- `fuellePlano` ⏳
- `tipoDeFuelle` ⏳
- `cantidadDeSellos` ⏳
- `materialDelSelloCentral` ⏳
- `tipoDeSelloEnFuelle` ⏳
- `tipoDePresentacion` ⏳
- `tipoDeSello` ⏳
- `acabado` ⏳
- `tipoDeLamina` ⏳
- `elDisenoLlevaFotocelula` ⏳
- `ubicacionDeFotocelula` ⏳
- `microperforado` ⏳
- `ladoMicroperforado` ⏳
- `separacionDePuas` ⏳
- `baseDelDoypack` ⏳
- `repeticionExactaDeDoypack` ⏳
- `toleranciaRepeticionExactaDoypack` ⏳
- `rinonera` ⏳
- `wicketDeControl` ⏳
- `diametroDeWicket` ⏳
- `diametroDeWicketDeControl` ⏳
- `ubicacionWicketDeControl` ⏳
- ... y 41 más

---

## 🔧 Trabajos Necesarios en ProductStep0General.tsx

### Fase 1: Reemplazar Opciones Hardcoded (⏳ En Progreso)

**Sección POUCH** (líneas ~296-370):
```
- Familia POUCH → PRODUCT_CATALOGS.familiaDePouch.values
- Tipo Stand Up → PRODUCT_CATALOGS.tipoDeStandUp.values
- Forma DoyPack → PRODUCT_CATALOGS.fuellePlano.values
- Tipo Fuelle Stand Up → PRODUCT_CATALOGS.tipoDeFuelle.values
- Cantidad Sellos → PRODUCT_CATALOGS.cantidadDeSellos.values
- Material Sello Central → PRODUCT_CATALOGS.materialDelSelloCentral.values
- Tipo Sello Fuelle → PRODUCT_CATALOGS.tipoDeSelloEnFuelle.values
```

**Sección BOLSA** (líneas ~375-430):
```
- Tipo Presentación → PRODUCT_CATALOGS.tipoDePresentacion.values
- Tipo Sello → PRODUCT_CATALOGS.tipoDeSello.values
- Acabado → PRODUCT_CATALOGS.acabado.values
- Tendrá Fuelle → Sí/No (simple)
- Tipo Fuelle → PRODUCT_CATALOGS.tipoDeFuelle.values
```

**Sección LAMINA** (líneas ~435+):
```
- Tipo Formato Lámina → PRODUCT_CATALOGS.tipoDeLamina.values
```

### Fase 2: Agregar Campos P2 Faltantes

Según especificación Excel, falta implementar:

**Sección Especificaciones de Diseño:**
- [x] Formato de Plano* (ya existe)
- [x] Aplicación Técnica* (ya existe)
- [ ] Impresión/Clase de Impresión
- [ ] Tipo de Impresión
- [ ] Forma de Impresión
- [ ] Especificaciones de Diseño Especiales
- [ ] Comentarios de Diseño
- [ ] Ancho total área de diseño
- [ ] Altura total área de diseño
- [ ] Co-printing
- [ ] Códigos a imprimir
- [ ] Sentido de embobinado
- [ ] Referencia Sentido
- [ ] ¿Fotocélula en diseño?
- [ ] Ubicación fotocélula
- [ ] Fotoregistro 1 (6 campos: ancho, alto, márgenes)
- [ ] Fotoregistro 2 (6 campos: ancho, alto, márgenes)

**Sección Estructura/Accesorios (POUCH):**
- [ ] Base DoyPack
- [ ] Rep exacta DoyPack
- [ ] Tolerancia Rep exacta
- [ ] Tolerancia Rep
- [ ] Fuelle cerrado
- [ ] Sello ancho lateral
- [ ] Microperforado + lado
- [ ] Separación púas
- [ ] Distancia lado pouch
- [ ] Zipper + dist
- [ ] Válvula + dist
- [ ] Riñonera
- [ ] Corte Angular + lado
- [ ] Esquinas Redondas + tipo
- [ ] Muesca + dist
- [ ] Perforación + tipo + dist
- [ ] Pre-Corte + tipo + dist

**Sección Estructura/Accesorios (BOLSA):**
- [ ] Wicket (Sí/No) + diámetro + distancias
- [ ] Wicket Control + parámetros
- [ ] Ancho Solapa
- [ ] Corte Aliviador + distancia
- [ ] Dispensador + distancia
- [ ] Fotocélula Bolsa Wicket
- [ ] Precorte Wicket + parámetros
- [ ] (resto de accesorios internos)

**Sección Estructura/Accesorios (LAMINA):**
- [ ] Material Tuco
- [ ] Diámetro Tuco
- [ ] Diámetro Externo
- [ ] Variaciones
- [ ] Peso máximo rollo

### Fase 3: Implementar Reglas de Visibilidad

Crear helper para mostrar/ocultar campos basado en `inheritedWrapping`:

```typescript
const shouldShowPouchFields = (wrapping: string) => wrapping?.includes('POUCH');
const shouldShowBolsaFields = (wrapping: string) => wrapping?.includes('BOLSA');
const shouldShowLaminaFields = (wrapping: string) => wrapping?.includes('LAMINA');
```

---

## 📝 Patrón de Reemplazo

### Antes (Hardcoded):
```typescript
<FormSelect
  label="Mi Campo"
  value={form.miCampo}
  onChange={(value) => updateField("miCampo", value)}
  options={[
    { value: "Opción1", label: "Opción1" },
    { value: "Opción2", label: "Opción2" },
  ]}
/>
```

### Después (Dinámico):
```typescript
<FormSelect
  label="Mi Campo"
  value={form.miCampo}
  onChange={(value) => updateField("miCampo", value)}
  options={PRODUCT_CATALOGS.miCatalogo.values.map((val) => ({
    value: val,
    label: val,
  }))}
/>
```

### Especial para Sí/No:
```typescript
// No cambia - crear constante reutilizable
const YES_NO_OPTIONS = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
];
```

---

## 🧪 Testing Checklist

- [ ] Todos los FormSelect usan PRODUCT_CATALOGS (no hardcoded)
- [ ] Visibilidad condicional funciona por envoltura
- [ ] Campos se cargan correctamente al editar
- [ ] Campos se guardan correctamente
- [ ] No hay errores TypeScript
- [ ] Build sin warnings
- [ ] Aplicación funciona en dev (npm run dev)
- [ ] Crear producto nuevo: P2 fields aparecen
- [ ] Editar producto: P2 fields cargan valores anteriores
- [ ] Cambiar envoltura: P2 fields se muestran/ocultan correctamente

---

## 📚 Archivos Relacionados

- `src/shared/data/productCatalogs.ts` - 75 catalogs (source of truth)
- `src/modules/products/components/ProductStep0General.tsx` - Main component to update
- `src/modules/products/pages/ProductEditPage.tsx` - Passes props to Step0General
- `src/modules/products/components/ProductStep1Design.tsx` - Reference pattern (ya integrado)
- `src/modules/products/components/ProductStep2Structure.tsx` - Reference pattern (ya integrado)

---

## 🎯 Próximos Pasos

1. **Completar reemplazos en ProductStep0General:**
   - Sección POUCH completa
   - Sección BOLSA completa
   - Sección LAMINA completa

2. **Agregar campos P2 faltantes:**
   - Diseño: impresión, fotoregistros
   - Accesorios: todos los tipos
   - Wicket/Precorte: para BOLSA

3. **Implementar visibilidad:**
   - Condicional por `inheritedWrapping`
   - Tests manuales en todas las envolturas

4. **Validación final:**
   - Build sin errores
   - All tests passing
   - Manual testing en dev

---

**Documento actualizado:** 2026-06-05 por Claude Haiku 4.5
