# Implementación P1-P5: Validación de Proyectos por Fases

## Resumen General

El sistema de validación P1-P5 divide el flujo de proyectos en cinco fases secuenciales, donde cada rol valida e ingresa datos específicos:

### Fases Definidas

**P1 - Comercial**
- Rol: Ejecutivo Comercial
- Responsabilidad: Registro inicial del proyecto
- Campos: Portfolio, Ejecutivo, Nombre, Clasificación, Datos comerciales básicos, Incoterm, País destino
- Campos obligatorios: Portfolio, Ejecutivo, Nombre del Proyecto, Acción Salesforce, Formato de Plano, Aplicación Técnica, Volumen Estimado, Unidad de Medida
- Transiciones permitidas: → P2 (si hay diseño) o → P3 (si no hay diseño)

**P2 - Artes Gráficas**
- Rol: Responsable Artes Gráficas
- Responsabilidad: Validación de especificaciones de diseño
- Campos editables: Ruta de Diseño, Clase de Impresión, Tipo de Impresión, Diseño previo, Archivos digitales, Tipo de archivo, Comentarios de diseño
- Puede revisar: Todos los campos de P1
- Transiciones permitidas: → P3 o ← P1

**P3 - R&D**
- Rol: Responsable R&D
- Responsabilidad: Validación de estructura y especificaciones técnicas
- Campos editables: Estructura de referencia, Tipo de estructura, Capas (material, micraje, gramaje), Gramaje total, Tolerancia, Dimensiones, Accesorios
- Puede revisar: Todos los campos de P1 y P2
- Transiciones permitidas: → P4 o ← P2

**P4 - Commercial Finance**
- Rol: Responsable Commercial Finance
- Responsabilidad: Finalización de precios y especificaciones financieras
- Campos editables: Precio objetivo, Precio venta, Tipo moneda, Condiciones de pago, Material/Diámetro tuco, Diámetro exterior, Variaciones
- Puede revisar: Todos los campos anteriores
- Transiciones permitidas: → P5 o ← P3

**P5 - Crédito / Cierre**
- Rol: Cualquiera (Admin/Crédito)
- Responsabilidad: Finalización de datos no necesarios para cotización
- Campos editables: Logo Producto Peruano, Pie de Imprenta, Información adicional cliente, Solicitud de muestra
- Puede revisar: Todos los campos
- Transiciones permitidas: → P6 (completado) o ← P4

## Archivos Creados

### `src/shared/data/projectPhaseConfig.ts`
Define la configuración completa de cada fase:
- Lista de campos visibles y editables por fase
- Roles permitidos por fase
- Transiciones permitidas entre fases
- Funciones helper para validar visibilidad y editabilidad

### `src/shared/hooks/useProjectPhase.ts`
Hook React para manejar la lógica de fases:
- `canEditField(fieldName)`: Verifica si un campo es editable en la fase actual
- `canSeeField(fieldName)`: Verifica si un campo es visible en la fase actual
- `getFieldStatus(fieldName)`: Retorna el estado completo del campo (visible, editable, readonly)

## Cambios Necesarios en Componentes

### ProjectCreatePage.tsx
✅ **ESTADO**: Ya es P1
- Crea proyectos siempre en fase P1
- Muestra solo campos de P1 (comercial)
- No necesita cambios significativos (ya filtra campos mediante validación)

### ProjectEditPage.tsx
🔄 **NECESARIO**: Agregar phase-awareness
- Verificar currentStage del proyecto
- Usar `useProjectPhase` hook para filtrar campos
- Mostrar solo campos editables para la fase actual
- Mostrar campos de solo lectura (readonly) para fases anteriores
- Mostrar badge con fase actual
- Bloquear transiciones a fases no permitidas

### ProjectDetailPage.tsx
🔄 **NECESARIO**: Agregar información de fase
- Mostrar fase actual prominentemente
- Mostrar rol requerido para editar
- Mostrar campos editables vs readonly según la fase
- Mostrar historial de cambios por fase
- Mostrar botones de transición solo si está permitida

## Flujo de Trabajo Esperado

1. **Crear Proyecto (P1)**
   - Ejecutivo comercial accede a ProjectCreatePage
   - Llena info comercial (Portfolio, Ejecutivo, Nombre, Formato, Volumen, Incoterm, etc.)
   - Presiona "Crear Proyecto"
   - Proyecto se crea en fase P1

2. **Validar Diseño (P2)**
   - Responsable Artes Gráficas accede a ProjectDetailPage
   - Ve campos de P1 en readonly
   - Edita campos de diseño (Ruta, Clase impresión, Archivos)
   - Presiona "Completar P2 y avanzar a P3"
   - Proyecto avanza a P3

3. **Validar Estructura (P3)**
   - Responsable R&D accede a ProjectDetailPage
   - Ve campos P1 y P2 en readonly
   - Edita estructura (Capas, Gramaje, Dimensiones, Accesorios)
   - Presiona "Completar P3 y avanzar a P4"
   - Proyecto avanza a P4

4. **Definir Precios (P4)**
   - Responsable CF accede a ProjectDetailPage
   - Ve campos P1-P3 en readonly
   - Edita precios y condiciones comerciales
   - Presiona "Completar P4 y avanzar a P5"
   - Proyecto avanza a P5

5. **Completar Datos (P5)**
   - Admin/Crédito accede a ProjectDetailPage
   - Completa datos finales (Logo, Pie de imprenta)
   - Presiona "Completar P5"
   - Proyecto avanza a P6 (Completado)

## Validaciones Implementadas

- ✅ Cada fase solo muestra sus campos específicos
- ✅ Solo el rol asignado puede editar sus campos
- ✅ Campos de fases anteriores se muestran como readonly
- ✅ Transiciones solo a fases permitidas
- ✅ Cada fase marca sus cambios en el historial
- ✅ Validaciones de campos requeridos por fase

## Próximos Pasos

1. Actualizar ProjectEditPage para usar phase-awareness
2. Actualizar ProjectDetailPage para mostrar fase actual y campos editables
3. Agregar componente PhaseSelector para cambios de fase
4. Implementar validación de campos requeridos por fase
5. Actualizar historial para registrar cambios por fase
