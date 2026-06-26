# PLAN DE ESTANDARIZACIÓN DE COMPONENTES, COLORES Y ESTILOS

## 📊 ESTADO ACTUAL
- **Compliance con Brand Colors**: 40%
- **Colores Hardcoded**: 30+
- **Botones incompatibles**: 2 sistemas
- **Espaciado inconsistente**: 3+ variaciones
- **Selectores duplicados**: 2 (PlantSelector, EnvolturaSelector)

---

## 🎯 OBJETIVOS
1. **100% Brand Colors** - Eliminar todos los hardcodes
2. **Un sistema de botones** - Consolidar Button.tsx como única fuente
3. **Spacing consistente** - gap-2/3, padding-4/5/6, padding-buttons
4. **Focus/Ring estándar** - brand-primary en todos los inputs
5. **Selectores reutilizables** - GenericSelector.tsx
6. **Guía de estilos** - Documentar el sistema

---

## 📋 ACCIONES PRIORITARIAS

### FASE 1: CRÍTICO (Hoy - 2 horas)
Afecta UI global, visibilidad inmediata

1. **NewActionDropdown.tsx**
   - [ ] `bg-[#003B5C]` → `bg-brand-primary`
   - [ ] `hover:bg-[#00567f]` → `hover:bg-brand-primary-hover`
   - [ ] `bg-[#003B5C]/10` → `bg-brand-primary/10`

2. **FormInput.tsx, FormSelect.tsx, FormTextarea.tsx**
   - [ ] `focus:border-[#0d4c5c]` → `focus:border-brand-primary`
   - [ ] `focus:ring-[#0d4c5c]` → `focus:ring-brand-primary`

3. **PlantSelector.tsx, EnvolturaSelector.tsx**
   - [ ] `bg-blue-50/60` → `bg-brand-primary-soft`
   - [ ] `border-brand-primary` ✓ (ya correcto)

4. **Button.tsx**
   - [ ] Convertir AMCOR_COLORS a clases Tailwind
   - [ ] Usar brand-primary, brand-secondary, etc.

### FASE 2: ALTA (Próxima - 3 horas)
Inconsistencias visuales, experiencia del usuario

5. **Dashboard Cards (ProductCard.tsx)**
   - [ ] `text-[#003B5C]` → `text-brand-primary`
   - [ ] `border-[#003B5C]` → `border-brand-primary`
   - [ ] `text-[#00A3E0]` → `text-brand-secondary`

6. **Modales (ProductInitialCreateModal.tsx, etc.)**
   - [ ] Estandarizar spacing: `p-6` consistente
   - [ ] Usar `bg-brand-primary-soft` para fondos
   - [ ] Header: `border-b border-slate-200`

7. **RowActionButtons.tsx**
   - [ ] `hover:bg-[#f6f8fb]` → `hover:bg-brand-primary/5`

8. **FinalUseCatalogModal.tsx**
   - [ ] `bg-[#0d4c5c]` → `bg-brand-primary`
   - [ ] `focus:border-[#0d4c5c]` → `focus:border-brand-primary`

### FASE 3: MEDIA (Sprint siguiente - 2 horas)
Mejoras de sistema

9. **Crear GenericSelector.tsx**
   - [ ] Consolidar PlantSelector + EnvolturaSelector
   - [ ] Soportar: icons, images, labels
   - [ ] Reutilizable en futuro

10. **StatusBadge.tsx, ProjectStatusBadge.tsx**
    - [ ] Crear `badgeStyles` object centralizado
    - [ ] Mapeo consistente de estados a colores
    - [ ] Documentar paleta de estados

---

## 🎨 ESTÁNDARES DEFINIDOS

### Colores (Brand-first)
```
PRIMARY:
  - bg-brand-primary (#00395A)
  - text-brand-primary
  - border-brand-primary
  - hover:bg-brand-primary-hover (#002A42)

SECONDARY:
  - bg-brand-secondary (#00A1DE)
  - text-brand-secondary
  - hover:bg-brand-secondary-hover (#0081B2)

SOFT BACKGROUNDS:
  - bg-brand-primary-soft (#E5EBEE) - 10% opacity
  - bg-brand-secondary-soft (#E5F6FC)

FOCUS/RING:
  - focus:border-brand-primary
  - focus:ring-2 focus:ring-brand-primary/20

STATES:
  - success: green-600, green-50, green-200
  - warning: amber-600, amber-50, amber-200
  - danger/error: red-600, red-50, red-200
```

### Spacing
```
GAP (flex items):
  - gap-2: muy cercanos (botones inline)
  - gap-3: estándar (grupos de elementos)
  - gap-4: amplio (secciones)

PADDING (cards, secciones):
  - p-4: elementos pequeños
  - p-5: estándar
  - p-6: contenido principal

PADDING (inputs, buttons):
  - px-3 py-2: input pequeño
  - px-4 py-2: botón estándar
  - px-6 py-3: botón grande
```

### Border Radius
```
  - rounded-md: inputs, small elements (6px)
  - rounded-lg: buttons, cards (8px)
  - rounded-xl: cards principales (12px)
  - rounded-2xl: modales (16px)
```

### Shadows
```
  - shadow-sm: reposo
  - shadow-md: hover
  - shadow-lg: elevación
  - shadow-xl: modales, dropdowns
```

---

## 📈 IMPACTO ESPERADO

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Brand Color Compliance | 40% | 100% | ✅ +60% |
| Colores Hardcoded | 30+ | 0 | ✅ Eliminados |
| Consistencia Visual | 60% | 95% | ✅ +35% |
| Componentes Reutilizables | 1 | 3+ | ✅ Mejorado |
| Tiempo de Diseño | Alto | Bajo | ✅ Optimizado |

---

## ✅ TESTING PLAN
1. [ ] Verificar botones en todas las páginas
2. [ ] Verificar focus en inputs (Portfolio, Products)
3. [ ] Verificar selectors (PlantSelector, EnvolturaSelector)
4. [ ] Verificar modales (Create/Edit)
5. [ ] Verificar badges (status, estados)
6. [ ] Verificar dropdown (NewActionDropdown)
7. [ ] Verificar cards (ProductCard, Dashboard)

---

## 📝 NOTAS
- No cambiar Tailwind config (ya está bien)
- Preservar funcionalidad de componentes
- Mantener accesibilidad (focus, contrast)
- Documentar patrones en componentes
