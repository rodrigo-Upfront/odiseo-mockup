# RECOMENDACIÓN: Campo "Formato de Plano" - Comportamiento Esperado

## ACLARACIÓN IMPORTANTE

El campo que actualmente contiene el FDP calculado **debe ser renombrado y rediseñado** para ser más claro:

### Situación Actual
- **Nombre del campo**: `blueprintFormat` (nombre técnico)
- **Label en UI**: "Formato de Plano" (nombre para usuario, pero no consistente)
- **Tipo**: `<FormInput>` o similar que sugiere editable
- **Comportamiento**: Se calcula automáticamente, pero la UI puede inducir a error

### Situación Esperada
- **Nombre del campo**: `blueprintFormat` (mantener en code)
- **Label en UI**: "Formato de Plano" (claro y consistente)
- **Tipo**: **Etiqueta de solo lectura / Display**, NO input
- **Comportamiento**: 
  1. Se calcula automáticamente según preguntas guiadas
  2. Se muestra como resultado calculado
  3. Usuario NO puede editar
  4. Se actualiza automáticamente si cambian preguntas

---

## FLUJO ESPERADO POR ENVOLTURA

### POUCH - Formato de Plano Calculado

**Preguntas** (usuario responde):
1. ¿Familia de Pouch? → "Pouch Stand Up" / "Pouch Plano" / "Pouch con Sello Central" / "Pouch con Sello en Fuelle"
2. Si Stand Up: ¿Tipo? → "Tipo K" / "Doy Pack" / "Fuelle"
3. Si Doy Pack: ¿Base? → "Redondo" / "Cuadrado"
4. Si Fuelle: ¿Tipo? → "Propio" / "Insertado"
5. Si Plano: ¿Cantidad sellos? → "Dos sellos" / "Tres sellos"
6. Si Sello Central: ¿Material sello? → "PE" / "PPE"
7. Si Sello en Fuelle: ¿Tipo sello? → "TIPO 4-1" / "TIPO 1-1"

**Resultado Calculado** → Se muestra como:
```
┌─────────────────────────────────────────────┐
│ Formato de Plano (Calculado):               │
│ ┌─────────────────────────────────────────┐ │
│ │ POUCH STAND UP\TIPO K\FUELLE PROPIO    │ │
│ └─────────────────────────────────────────┘ │
│ [Botón "Copiar"] [Botón "Ver detalles"]   │
└─────────────────────────────────────────────┘
```

**Comportamiento**:
- ✅ Read-only (usuario no puede editar)
- ✅ Se actualiza si cambia familia o tipo
- ✅ Botón "Copiar" para pegar en referencia
- ✅ Botón "Ver detalles" para expandir

---

### BOLSA - Formato de Plano Calculado

**Preguntas** (usuario responde):
1. ¿Tipo presentación? → "Bolsa sellada" / "Bolsa abierta"
2. Si sellada: ¿Tipo sello? → "Sello lateral" / "Sello de fondo"
3. Si lateral: ¿Acabado? → "Corte" / "Pestaña"
4. Si lateral: ¿Fuelle? → "Con fuelle fondo" / "Sin fuelle"
5. Si fondo: ¿Fuelle lateral? → "Con fuelle" / "Sin fuelle"
6. ¿Wicket? → "Sí" / "No"
7. Si no tradicional: ¿HOJAS? → "Sí" / "No"

**Resultado Calculado** → Se muestra como:
```
┌──────────────────────────────────────────────────┐
│ Formato de Plano (Calculado):                    │
│ ┌────────────────────────────────────────────┐   │
│ │ SELLO LATERAL\PESTAÑA\CON FUELLE FONDO    │   │
│ └────────────────────────────────────────────┘   │
│ [Botón "Copiar"] [Botón "Ver detalles"]         │
└──────────────────────────────────────────────────┘
```

**Comportamiento**:
- ✅ Read-only
- ✅ Se actualiza si cambian respuestas
- ✅ Botón "Copiar"
- ✅ Botón "Ver detalles"

---

### LAMINA - Formato de Plano Calculado

**Preguntas** (usuario responde):
1. ¿Tipo de lámina? → "GENERICA" / "TISSUE" / "FOOD"

**Resultado Calculado** → Se muestra como:
```
┌────────────────────────────────────────────┐
│ Formato de Plano (Calculado):              │
│ ┌──────────────────────────────────────────┤
│ │ GENERICA                                 │
│ └──────────────────────────────────────────┘
│ [Botón "Copiar"] [Botón "Ver detalles"]   │
└────────────────────────────────────────────┘
```

**Comportamiento**:
- ✅ Read-only
- ✅ Se actualiza si cambia tipo lámina
- ✅ Botón "Copiar"
- ✅ Botón "Ver detalles"

---

## ESPECIFICACIÓN DEL COMPONENTE

### Nombre
`<FormatoPlanoBadge>` o `<FormatoPanoDisplay>`

### Props
```typescript
interface FormatoPanoDisplayProps {
  value: string;                    // El FDP calculado
  wrappingType: string;            // POUCH / BOLSA / LAMINA
  isCalculated: boolean;           // Siempre true
  onCopy?: () => void;            // Copiar al clipboard
  onShowDetails?: () => void;     // Expandir detalle
}
```

### Ubicación en Stepper
- **Paso 2 (Diseño)** → Sección "Configuración de Formato"
- **Posición**: Debajo de las preguntas guiadas
- **Etiqueta encima**: "Formato de Plano (Calculado automáticamente)"

### Estilos
```tsx
<div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
  <label className="text-sm font-semibold text-slate-700 block mb-2">
    Formato de Plano (Calculado automáticamente)
  </label>
  
  <div className="bg-white rounded border border-slate-200 p-3 mb-3">
    <code className="text-sm text-slate-900 block overflow-x-auto">
      {value}
    </code>
  </div>
  
  <div className="flex gap-2">
    <button 
      onClick={onCopy}
      className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Copiar
    </button>
    <button 
      onClick={onShowDetails}
      className="text-xs px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
    >
      Ver detalles
    </button>
  </div>
</div>
```

---

## VALIDACIONES ESPERADAS

El "Formato de Plano" calculado:
- ✅ **No se edita manualmente**
- ✅ **Se guarda en `blueprintFormat`** sin cambios
- ✅ **Se envía a Sistema Integral** como es
- ✅ **Se persiste en BD** correctamente
- ✅ **Se muestra read-only** en edición posterior
- ✅ **No genera error** aunque tenga caracteres especiales `\`

---

## DIFERENCIA CON ESTADO ACTUAL

| Aspecto | Estado Actual | Estado Esperado |
|---------|---------------|-----------------|
| **Label** | "Formato de Plano" | "Formato de Plano (Calculado automáticamente)" |
| **Componente** | FormInput (parece editable) | Display/Badge (claramente read-only) |
| **Editable** | Parece que sí | No, claramente no |
| **Ubicación** | Lado derecho del stepper | Lado derecho, sección "Configuración de Formato" |
| **Visibilidad** | Siempre visible | Visible solo cuando hay preguntas respondidas |
| **Botones** | Ninguno | Copiar, Ver detalles |
| **Actualización** | Manual (usuario) | Automática (cuando cambian preguntas) |

---

## IMPACTO EN AUDITORÍA

Esta clarificación **RESUELVE** un hallazgo en la auditoría:

**Antes**:
- ❌ "Formato de Plano se muestra en input, parece editable" (confuso)

**Después**:
- ✅ "Formato de Plano se muestra en display read-only, claramente calculado"

---

## IMPLEMENTACIÓN RECOMENDADA

### 1. Crear componente FormatoPlanoBadge
Archivo: `src/shared/components/forms/FormatoPlanoBadge.tsx`

```typescript
interface FormatoPlanoBadgeProps {
  value: string;
  wrappingType: 'POUCH' | 'BOLSA' | 'LAMINA';
  isLoading?: boolean;
  onCopy?: () => void;
  onShowDetails?: () => void;
}

export function FormatoPlanoBadge({
  value,
  wrappingType,
  isLoading = false,
  onCopy,
  onShowDetails,
}: FormatoPlanoBadgeProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    onCopy?.();
  };

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
      <label className="text-sm font-semibold text-slate-700 block mb-2">
        Formato de Plano (Calculado automáticamente)
      </label>

      <div className="bg-white rounded border border-slate-200 p-3 mb-3">
        {isLoading ? (
          <div className="text-sm text-slate-500">Calculando...</div>
        ) : (
          <code className="text-sm text-slate-900 block overflow-x-auto font-mono">
            {value}
          </code>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!value}
          className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Copiar
        </button>
        <button
          onClick={onShowDetails}
          className="text-xs px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}
```

### 2. Usar en ProductEditPage

Reemplazar en Paso 2 (Diseño):
```tsx
{shouldShowFormatoPano && (
  <div className="mt-4">
    <FormatoPlanoBadge
      value={form.blueprintFormat}
      wrappingType={inheritedWrapping}
      onCopy={() => {
        navigator.clipboard.writeText(form.blueprintFormat);
        toast.success("Formato copiado");
      }}
      onShowDetails={() => showFormatoDetails()}
    />
  </div>
)}
```

### 3. Validación

Asegurar que:
- ✅ blueprintFormat NO se valida como campo editable
- ✅ blueprintFormat se persiste sin cambios
- ✅ blueprintFormat se incluye en payload SI
- ✅ blueprintFormat NO se borra al limpiar formulario

---

## RESUMEN DE CAMBIOS EN AUDITORÍA

**Antes de esta clarificación**:
- ⚠️ "blueprintFormat no claro si es input o display" (hallazgo menor)

**Después de esta clarificación**:
- ✅ "blueprintFormat es display read-only calculado automático" (correcto)

---

## PRÓXIMOS PASOS

1. ✅ Crear componente FormatoPlanoBadge
2. ✅ Reemplazar en ProductEditPage paso 2
3. ✅ Validar persistencia (no se edita, se guarda igual)
4. ✅ Validar sistema integral (incluye FDP)
5. ✅ Testing: Cambiar preguntas → FDP se actualiza
6. ✅ Code review
7. ✅ QA manual
