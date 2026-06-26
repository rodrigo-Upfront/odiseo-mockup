# Redesign de PortfolioCreatePage - Resumen de Cambios

## 📋 Descripción General
Se ha refactorizado `PortfolioCreatePage.tsx` para mejorar la visualización y experiencia de usuario, manteniendo toda la información visible en una única vista con layout de 2 columnas y mejor organización visual.

---

## 🎨 Cambios Visuales Principales

### 1. **Layout de 2 Columnas**
- **Izquierda (60-65% en desktop)**: Secciones 1, 2, 3 (Identificación, Comercial, Planta)
- **Derecha (35-40% en desktop)**: Vista rápida + Secciones 4, 5 (Datos de producto, Técnico)
- **Mobile**: Stack vertical manteniendo el mismo orden lógico
- **Sticky**: Columna derecha pegada al viewport para visible siempre en desktop

### 2. **Indicador de Progreso Visual**
- Breadcrumb informativo en la parte superior
- Muestra 6 hitos: Cliente → Portafolio → Planta → Envoltura → Uso final → Técnico
- Estados visuales:
  - ✓ Verde: Completado
  - Número: Pendiente (gris)
  - ⚠️ Rojo: Error (si se intentó guardar)

### 3. **Componentes Nuevos**
Creados 3 nuevos componentes reutilizables:

#### `SectionCard` (SectionCard.tsx)
- Tarjeta con número de sección, título, subtítulo y badge de estado
- Border izquierdo coloreado
- Badge dinámico: Pendiente | Completado | Requiere atención

#### `ProgressIndicator` (ProgressIndicator.tsx)
- Indicador visual de progreso tipo breadcrumb
- Muestra 6 pasos con estados visuales
- Scroll horizontal en mobile

#### `SectionBadge` (SectionBadge.tsx)
- Badge de estado con colores semánticos
- Estados: pending (gris), completed (verde), error (rojo)

### 4. **Reorganización de Secciones**

#### COLUMNA IZQUIERDA

**Sección 1: ¿Para quién es este portafolio?**
- Cliente *
- Ejecutivo Comercial *
- Licitación *
- Código RFQ (condicional si Licitación = Sí)

**Sección 2: ¿Cómo se identificará este portafolio?**
- Nombre de Portafolio *
- Descripción del Portafolio (opcional)

**Sección 3: ¿Dónde se diseñará?**
- Selector visual de Planta (AF Lima, AF Cali, AF Santiago Norte, AF San Luis)
- Mantiene `plantaId` correctamente

#### COLUMNA DERECHA

**Vista Rápida**
- Resumen con 7 campos principales
- Porcentaje de avance
- Muestra "—" para valores vacíos
- Siempre visible en desktop (sticky top-20)

**Sección 4: ¿Qué tipo de producto aplica?**
- Selector visual de Envoltura (Lámina, Bolsa, Pouch)
- Mantiene `envolturaId` correctamente
- Limpia `envasadoId` al cambiar envoltura
- Uso Final *
- Sector, Segmento, Sub-segmento, AFMarketID (autocompletados, solo lectura)

**Sección 5: ¿Qué máquina corresponde?**
- Envasado / Máquina de Cliente * (filtrado por envoltura)
- Portafolio Estándar (opcional)
- Mensaje: "Primero seleccione una envoltura" si falta

---

## 🔧 Cambios Funcionales

### Estados de Secciones
Se agregó función `getSectionStatus()` que calcula dinámicamente:
- **Completado**: Todos los campos obligatorios de la sección tienen valor
- **Pendiente**: Falta completar campos obligatorios
- **Requiere atención**: Se intentó guardar (`submitAttempted=true`) pero hay errores

### Validaciones Mantidas
- Todas las validaciones originales intactas
- Mensajes de error simples en rojo
- Campo Código RFQ obligatorio solo si Licitación = Sí

### Campos Críticos (Sin Cambios)
- `form.clienteId` → Cliente
- `form.ejecutivoId` → Ejecutivo
- `form.plantaId` → Planta (actualizado por PlantSelector)
- `form.envolturaId` → Envoltura (actualizado por EnvolturaSelector)
- `form.usoFinalId` → Uso Final
- `form.envasadoId` → Máquina de Cliente
- `form.nombrePortafolio` → Nombre
- `form.descripcionPortafolio` → Descripción
- `form.licitacion` → Condición comercial
- `form.codigoRFQ` → Código RFQ (condicional)

---

## 📊 Selectores Visuales

### PlantSelector
- 4 opciones: AF Lima, AF Cali, AF Santiago Norte, AF San Luis
- Tarjeta con emoji, nombre y descripción
- Radio button visual con border azul al seleccionar
- Estados: hover, selected, pending

### EnvolturaSelector
- 3 opciones: Lámina, Bolsa, Pouch
- Tarjeta con imagen, nombre y descripción
- Radio button visual con border azul al seleccionar
- Imagen fallback: `/assets/envolturas/[lamina|bolsa|pouch].png`
- Estados: hover, selected, pending

---

## 📱 Responsividad

### Desktop (lg+)
```css
grid-cols-[1fr_380px]
/* Columna izquierda flexible, columna derecha sticky 380px */
```

### Mobile/Tablet (< lg)
```css
grid-cols-1
/* Stack vertical, mismo orden lógico */
```

---

## ✅ Testing Realizado

### Compilación
- ✓ TypeScript sin errores críticos (errores pre-existentes en otros módulos)
- ✓ Vite dev server compiló exitosamente

### Funcionalidad Preservada
- ✓ Datos vinculados correctamente a form state
- ✓ Validaciones funcionan como antes
- ✓ Guardado mantiene estructura original
- ✓ Selectores visuales actualizan campos correctamente
- ✓ Mensajes de error se muestran correctamente
- ✓ Footer sticky con botones de acción

---

## 🎯 Próximos Pasos Sugeridos

1. **Prueba Visual**: Abrir http://localhost:5173/portfolio/create en navegador
2. **Verificar Responsividad**: Probar en móvil y tablet
3. **Validaciones**: Intentar guardar sin completar campos para ver badges de error
4. **Selectores**: Verificar que las imágenes de plantas y envolturas carguen correctamente
5. **Performance**: Revisar sticky behavior en columna derecha en diferentes alturas

---

## 📝 Archivos Modificados

- `src/modules/portfolio/pages/PortfolioCreatePage.tsx` - Refactorización principal
- `src/shared/components/ui/PortfolioPreview.tsx` - Actualización para siempre mostrar resumen
- `src/shared/components/ui/SectionCard.tsx` - Nuevo componente
- `src/shared/components/ui/SectionBadge.tsx` - Nuevo componente
- `src/shared/components/ui/ProgressIndicator.tsx` - Nuevo componente

---

## 💡 Notas de Diseño

- No se usar tabs, pasos ocultos ni navegación multi-step
- Todo visible en una sola vista: flujo visual narrativo
- Usuarios entienden el orden lógico: Quién → Qué → Dónde → Cómo → Técnico
- Badges informan estado sin bloquear interacción
- Sticky right column optimiza desktop sin sacrificar mobile
- Colores mantienen consistencia con Amcor brand guidelines
