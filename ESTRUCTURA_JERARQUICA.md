# Estructura Jerárquica: Portafolio → Proyecto → Ficha de Producto

## Descripción General

El Portal ODISEO utiliza una estructura jerárquica de tres niveles para organizar productos y oportunidades comerciales:

```
Portafolio (Familia/Campaña)
  ├── Proyecto (Presentación específica)
  │   ├── Ficha Producto (Variante 1)
  │   ├── Ficha Producto (Variante 2)
  │   └── Ficha Producto (Variante 3)
  └── Proyecto (Otra presentación)
      └── Ficha Producto (Variante)
```

## Niveles Jerárquicos

### 1. Portafolio
**Propósito**: Agrupador libre que representa una familia, línea comercial o campaña.

**Características**:
- Nombre texto libre (no requiere valor ni unidad)
- Puede tener múltiples proyectos
- Representa una estrategia comercial o agrupador de oportunidades

**Ejemplo**:
```
P0001 - Salsas nuevos logos
P0002 - Fundas Great Value
P0003 - Doypack Camarones
```

**Campos**:
- Código Portafolio (auto-generado: P0001)
- Nombre Portafolio (texto libre)
- Cliente
- Estado

### 2. Proyecto
**Propósito**: Presentación específica dentro de un portafolio, con definición de tamaño/cantidad.

**Características**:
- Obligatoriamente debe especificar:
  - Nombre base (ej: "Salsas")
  - Valor de presentación (ej: 8, 100, 450)
  - Unidad de medida (ej: g, ml, un)
- El nombre visible se genera automáticamente
- Hereda cliente del portafolio
- Las fichas de producto deben respetar esta presentación

**Ejemplo**:
```
Y001 - Salsas 8 g    (Nombre base: Salsas, Valor: 8, Unidad: g)
Y002 - Salsas 100 g  (Nombre base: Salsas, Valor: 100, Unidad: g)
Y003 - Salsas 450 g  (Nombre base: Salsas, Valor: 450, Unidad: g)
```

**Campos**:
- Código Proyecto (auto-generado: Y001)
- Nombre base (obligatorio, 3-100 caracteres)
- Valor presentación (obligatorio, numérico, > 0)
- Unidad medida (obligatoria, del catálogo)
- Nombre visible (auto-generado, no editable)
- Portafolio padre
- Estado

### 3. Ficha de Producto
**Propósito**: Variante específica dentro de un proyecto.

**Características**:
- Hereda presentación del proyecto (valor + unidad)
- Solo requiere nombre base
- El nombre visible se genera automáticamente
- No es editable la presentación (hereda del proyecto)
- Representa un producto o sabor específico

**Ejemplo**:
```
Proyecto padre: Salsas 8 g

F001 - Mayonesa 8 g   (Hereda 8 g del proyecto)
F002 - Mostaza 8 g    (Hereda 8 g del proyecto)
F003 - Ají 8 g        (Hereda 8 g del proyecto)
```

**Campos**:
- Código Ficha (auto-generado: F001)
- Nombre base (obligatorio, 2-100 caracteres)
- Valor presentación (heredado, solo lectura)
- Unidad medida (heredada, solo lectura)
- Nombre visible (auto-generado, no editable)
- Proyecto padre
- Estado

## Catálogo de Unidades de Medida

```typescript
Type: UnitOfMeasure = "g" | "kg" | "ml" | "L" | "un" | "m" | "cm" | "mm"

Valores válidos:
- g   → Gramos
- kg  → Kilogramos
- ml  → Mililitros
- L   → Litros
- un  → Unidades
- m   → Metros
- cm  → Centímetros
- mm  → Milímetros
```

## Funciones Principales

### Almacenamiento de Datos
```typescript
// Portafolio
getPortafolios(): Portafolio[]
getPortafolioById(id: string): Portafolio | null
getPortafolioByCodigo(codigo: string): Portafolio | null
savePortafolio(portafolio: Portafolio): void
getNextPortafolioCode(): string  // Genera P0001, P0002, etc.

// Proyecto
getProyectos(): Proyecto[]
getProyectoById(id: string): Proyecto | null
getProyectoByCodigo(codigo: string): Proyecto | null
getProyectosByPortafolio(portafolioId: string): Proyecto[]
saveProyecto(proyecto: Proyecto): void
getNextProyectoCode(): string  // Genera Y001, Y002, etc.

// Ficha Producto
getFichasProducto(): FichaProducto[]
getFichaProductoById(id: string): FichaProducto | null
getFichaProductoByCodigo(codigo: string): FichaProducto | null
getFichasProductoByProyecto(proyectoId: string): FichaProducto[]
saveFichaProducto(ficha: FichaProducto): void
getNextFichaProductoCode(): string  // Genera F001, F002, etc.

// Utilidades
buildDisplayName(nombreBase: string, valor: number, unidad: string): string
// Ejemplo: buildDisplayName("Mayonesa", 8, "g") → "Mayonesa 8 g"
```

### Validaciones
```typescript
// Validar Proyecto
validateProyecto(
  nombreBase: string,
  valorPresentacion: number | string,
  unidadMedida: string
): ProyectoValidationErrors

// Validar Ficha Producto
validateFichaProducto(
  nombreBase: string
): FichaProductoValidationErrors

// Validar Portafolio
validatePortafolio(nombre: string): Record<string, string>

// Validar compatibilidad entre Ficha y Proyecto
validateFichaCompatibilityWithProyecto(
  fichaValor: number,
  fichaUnidad: string,
  proyectoValor: number,
  proyectoUnidad: string
): boolean
```

## Reglas de Negocio Implementadas

### 1. Portafolio
- ✅ Nombre libre (texto)
- ✅ No requiere valor ni unidad
- ✅ Puede contener múltiples proyectos
- ✅ Código auto-generado (P0001, P0002, etc.)

### 2. Proyecto
- ✅ Nombre base obligatorio (3-100 caracteres)
- ✅ Valor presentación obligatorio (numérico, > 0)
- ✅ Unidad medida obligatoria (del catálogo)
- ✅ Nombre visible auto-generado (no editable)
- ✅ No se puede guardar sin valor y unidad
- ✅ Código auto-generado (Y001, Y002, etc.)

### 3. Ficha de Producto
- ✅ Nombre base obligatorio (2-100 caracteres)
- ✅ Valor y unidad heredados del proyecto (solo lectura)
- ✅ Nombre visible auto-generado (no editable)
- ✅ Debe estar asociada a un proyecto
- ✅ No se puede crear sin proyecto padre
- ✅ Código auto-generado (F001, F002, etc.)

## Ejemplo de Datos Mock Actualizados

```typescript
// Portafolio
P0001 - Salsas nuevos logos

// Proyectos (con Portafolio P0001)
Y001 - Salsas 8 g     (nombreBase: "Salsas", valor: 8, unidad: "g")
Y002 - Salsas 100 g   (nombreBase: "Salsas", valor: 100, unidad: "g")
Y003 - Salsas 450 g   (nombreBase: "Salsas", valor: 450, unidad: "g")

// Fichas de Producto
F001 - Mayonesa 8 g    (Proyecto Y001)
F002 - Mostaza 8 g     (Proyecto Y001)
F003 - Ají 8 g         (Proyecto Y001)

F004 - Mayonesa 100 g  (Proyecto Y002)
F005 - Mostaza 100 g   (Proyecto Y002)
F006 - Ají 100 g       (Proyecto Y002)

F007 - Mayonesa 450 g  (Proyecto Y003)
F008 - Mostaza 450 g   (Proyecto Y003)
F009 - Ají 450 g       (Proyecto Y003)
```

## Archivos Implementados

- `src/shared/data/unitOfMeasureStorage.ts` - Catálogo de unidades
- `src/shared/data/projectHierarchyStorage.ts` - Almacenamiento CRUD
- `src/shared/utils/projectHierarchyValidation.ts` - Validaciones

## Próximos Pasos

1. Crear formularios para Portafolio, Proyecto y Ficha de Producto
2. Crear vistas de listado con jerarquía visual
3. Implementar validaciones en formularios
4. Agregar opciones de editar/eliminar con cascadas apropiadas
5. Integrar con módulo de Proyectos existente
