# 📋 Implementación del Módulo de Validaciones (Checks)

## ✅ Estado Actual

El módulo de Validaciones está **completamente implementado e integrado** con el flujo de Proyectos. Utiliza la carpeta `/src/modules/Checks` y se muestra en el UI como **"Validaciones"**.

---

## 🏗️ Estructura de Carpetas

```
src/modules/Checks/
├── pages/
│   ├── ChecksListPage.tsx          (Bandeja principal con filtrado por rol)
│   └── ChecksDetailPage.tsx        (Detalle de validación de proyecto)
├── types/
│   └── checks.ts                   (Tipos: UserRole, CurrentUser, ChecksListFilters)
├── data/
│   └── checksFilters.ts            (Lógica de filtrado por rol y responsable)
```

---

## 🛣️ Rutas Implementadas

- `/validaciones` → ChecksListPage (Bandeja)
- `/validaciones/:id` → ChecksDetailPage (Detalle)

---

## 👥 Sistema de Roles y Filtrado

### Filtrado Automático por Rol del Usuario

#### **1️⃣ Usuario: Artes Gráficas**
```typescript
Mostrar proyectos donde:
✅ validacionSolicitada = true
✅ existe validación con area = "Artes Gráficas"
✅ estado de esa validación sea: Pendiente, Observada o Rechazada
```

**Vista:** Proyectos que necesitan validación de Artes Gráficas

---

#### **2️⃣ Usuario: R&D Técnica**
```typescript
Mostrar proyectos donde:
✅ validacionSolicitada = true
✅ existe validación con area = "R&D Técnica"
✅ estado de esa validación sea: Pendiente, Observada o Rechazada
```

**Vista:** Proyectos que necesitan validación de R&D Técnica

---

#### **3️⃣ Usuario: R&D Desarrollo**
```typescript
Mostrar proyectos donde:
✅ validacionSolicitada = true
✅ existe validación con area = "R&D Desarrollo"
✅ estado de esa validación sea: Pendiente, Observada o Rechazada
```

**Vista:** Proyectos que necesitan validación de R&D Desarrollo

---

#### **4️⃣ Usuario: Ejecutivo Comercial**
```typescript
Mostrar SOLO SUS PROYECTOS donde:
✅ ejecutivoComercialId = currentUser.id
✅ estado del proyecto sea uno de:
   - Observada (necesita corregir)
   - Rechazada (bloqueado)
   - En validación (en proceso)
   - Validada por áreas (listo para RFQ)
   - Lista para RFQ
   - Pendiente de precio
   - Precio cargado
```

**Vista:** Panel de seguimiento de sus proyectos

---

#### **5️⃣ Usuario: Administrador / PMO / Master Data**
```typescript
Mostrar TODOS los proyectos donde:
✅ validacionSolicitada = true
```

**Vista:** Panel administrativo completo de todas las validaciones

---

## 🧪 Cómo Probar Diferentes Roles

### Cambiar el usuario actual en ChecksListPage

**Archivo:** `src/modules/Checks/pages/ChecksListPage.tsx`

**Línea:** ~14-19

```typescript
// CAMBIAR ESTE OBJETO PARA PROBAR DIFERENTES ROLES

const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-001",
  fullName: "Ana Pérez",
  role: "Artes Gráficas",  // ← CAMBIAR AQUÍ
  area: "Artes Gráficas",
  departamento: "Calidad",
};
```

### Ejemplos de usuarios para probar

```typescript
// Validador Artes Gráficas
const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-001",
  fullName: "Ana Pérez",
  role: "Artes Gráficas",
  area: "Artes Gráficas",
  departamento: "Diseño",
};

// Validador R&D Técnica
const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-002",
  fullName: "Luis Ramos",
  role: "R&D Técnica",
  area: "R&D Técnica",
  departamento: "Ingeniería",
};

// Validador R&D Desarrollo
const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-003",
  fullName: "Carla Ruiz",
  role: "R&D Desarrollo",
  area: "R&D Desarrollo",
  departamento: "Desarrollo",
};

// Ejecutivo Comercial
const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-004",
  fullName: "Eduardo Baldeon",
  role: "Ejecutivo Comercial",
  area: undefined,
  departamento: "Comercial",
};

// Administrador
const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-005",
  fullName: "Juan Pérez",
  role: "Administrador",
  area: undefined,
  departamento: "Admin",
};
```

---

## 📊 Modelo de Datos de Validación

### ProjectRecord (campos relevantes)

```typescript
{
  // Control de solicitud
  requiereValidacion: boolean;           // ¿Este proyecto requiere validación?
  validacionSolicitada: boolean;         // ¿El ejecutivo solicitó validación?
  fechaSolicitudValidacion?: string;     // Cuándo se solicitó

  // Estado general
  estadoValidacionGeneral: ValidationStatus;
  // "Sin solicitar" | "Pendiente de validación" | "En validación" 
  // | "Observada" | "Rechazada" | "Validada por áreas"

  // Validaciones por área
  validaciones: AreaValidationRecord[]   // Array con validaciones de cada área
}
```

### AreaValidationRecord (estructura)

```typescript
{
  area: "Artes Gráficas" | "R&D Técnica" | "R&D Desarrollo",
  estado: "Pendiente" | "Aprobada" | "Observada" | "Rechazada",
  validador?: string,                    // Nombre del validador
  fechaValidacion?: string,              // Cuándo se validó
  campoObservado?: string,               // Campo específico con problema
  accionRequerida?: string,              // Qué hacer para corregir
  comentarios: [
    {
      id: string,
      comentario: string,
      campo?: string,
      accionRequerida?: string,
      fecha: string,
      autor?: string                     // Quién comentó
    }
  ]
}
```

---

## 🎯 Flujo Funcional Implementado

### P1: Registro de Ficha (Ejecutivo Comercial)
```
Ejecutivo crea proyecto con campos obligatorios
→ Estado: "Registrado"
→ requiereValidacion: true
→ validacionSolicitada: false (aún no solicita)
```

### P2: Solicitud de Validación (Ejecutivo Comercial)
```
Ejecutivo hace clic "Solicitar Validación"
→ validacionSolicitada: true
→ estadoValidacionGeneral: "Pendiente de validación"
→ Proyecto aparece en bandeja de validadores
```

### P3: Validación por Áreas
```
Artes Gráficas revisa:
  ├─ Estado: "Aprobada" → siguiente área
  ├─ Estado: "Observada" → Ejecutivo debe corregir
  └─ Estado: "Rechazada" → Proyecto bloqueado

R&D Técnica revisa (similar)
R&D Desarrollo revisa (similar)
```

### P4: Ejecución Comercial (Ejecutivo Comercial)
```
Cuando todas las áreas aprobaron:
→ estadoValidacionGeneral: "Validada por áreas"
→ Ejecutivo exporta PDF
→ Carga Excel con precios
→ Estado: "Lista para RFQ"
```

### P5: Finalización (Ejecutivo Comercial)
```
Completa campos obligatorios finales
→ Estado: "Ficha aprobada"
→ Proyecto cerrado
```

---

## 🎨 Interfaz de Bandeja

### Vista de Validador (Artes Gráficas)

```
┌─────────────────────────────────────────────────────┐
│ 👤 Ana Pérez                         5 pendientes   │
│    Artes Gráficas                                  │
└─────────────────────────────────────────────────────┘

Buscar: [Proyecto...]    Ordenar: [Más reciente ↓]

┌─────────────────────────────────────────────────────┐
│ PR-000001 [En validación]                          │
│ Stand Up Pouch - Mayonesa                          │
│ Cliente: Alicorp SAC     Ejecutivo: Eduardo        │
│                                                     │
│ Estado de validaciones:                             │
│ Artes Gráficas: [Pendiente] R&D Técnica: [Pendiente] │
│ R&D Desarrollo: [Pendiente]                         │
└─────────────────────────────────────────────────────┘
```

### Vista de Ejecutivo Comercial

```
┌─────────────────────────────────────────────────────┐
│ 👤 Eduardo Baldeon              2 observados        │
│    Ejecutivo Comercial                             │
└─────────────────────────────────────────────────────┘

Buscar: [Proyecto...]    Ordenar: [Más reciente ↓]

┌─────────────────────────────────────────────────────┐
│ PR-000001 [Observada] ⚠️                           │
│ Stand Up Pouch - Mayonesa                          │
│ Cliente: Alicorp SAC     Estado: Observada         │
│                                                     │
│ Estado de validaciones:                             │
│ Artes Gráficas: [Observada]  R&D Técnica: [Aprobada] │
│ R&D Desarrollo: [Aprobada]                         │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Lógica de Filtrado (checksFilters.ts)

### Función Principal: `getProjectsForUser`

```typescript
function getProjectsForUser(
  projects: ProjectRecord[],
  currentUser: CurrentUser
): ProjectRecord[]
```

**Ubicación:** `src/modules/Checks/data/checksFilters.ts`

**Lógica:**
1. Filtra proyectos con `validacionSolicitada = true`
2. Según rol del usuario, aplica filtros específicos
3. Devuelve solo proyectos relevantes para ese usuario

### Funciones Complementarias

```typescript
getObservationsByArea(project, area)     // Comentarios de un área
getLastValidationDate(project)            // Última fecha de validación
getStatusOrder(status)                    // Orden de estados para sorting
```

---

## 📱 Pantalla de Detalle (ChecksDetailPage)

### Estructura

```
┌─────────────────────────────────┐
│ Información del Proyecto         │
├─────────────────────────────────┤
│ Código: PR-000001               │
│ Proyecto: Stand Up Pouch 1KG    │
│ Cliente: Alicorp S.A.A.         │
│ Estado: En validación ✓         │
└─────────────────────────────────┘

[Artes Gráficas] [✓Aprobada] | [R&D Técnica] [Pendiente] | ...

┌─ Validación - Artes Gráficas ───┐
│ Estado: Aprobada *              │
│ Validador: Ana Pérez            │
│ Fecha: 24/04/2026               │
│                                 │
│ Campo observado: (ninguno)      │
│ Acción requerida: (ninguna)     │
│                                 │
│ Historial de comentarios:       │
│ [Aprobado con observación...]   │
│                                 │
│ Agregar comentario:             │
│ [Campo observado...]            │
│ [Comentario...]                 │
│ [Acción requerida...]           │
│ [Registrar comentario]          │
└─────────────────────────────────┘

[Volver] [Ver Proyecto]
```

---

## 🔗 Integración con Proyectos

### ProjectListPage
- Muestra estado de validación en tabla
- Filtros por estado de validación
- Badge visual (naranja observado, rojo rechazado, verde aprobado)

### ProjectDetailPage
- Tabla "Observaciones y comentarios de validación"
- ValidationStatusCard mostrando restricciones
- Botón "Reenviar a validación" (si observado)

### ProjectEditPage
- Muestra restricciones según estado de validación
- Permite edición solo si es observado
- Lógica de re-envío

---

## 🚀 Cómo Comenzar a Usar

### 1. Ingresar al Módulo

```
Sidebar → Validaciones → /validaciones
```

### 2. Ver Proyectos Pendientes

La bandeja muestra automáticamente:
- Proyectos que necesitan su validación (según su rol)
- Filtrados por estado (Pendiente, Observado, etc.)
- Ordenados por fecha o estado

### 3. Revisar un Proyecto

```
Click en proyecto → /validaciones/PR-000001
→ Ver detalles de validación por área
→ Agregar comentarios estructurados
→ Cambiar estado (Aprobada/Observada/Rechazada)
```

### 4. Cambiar a Otra Área (Testing)

Editar `src/modules/Checks/pages/ChecksListPage.tsx` línea 14-19:

```typescript
const MOCK_CURRENT_USER: CurrentUser = {
  id: "USR-002",
  fullName: "Luis Ramos",
  role: "R&D Técnica",  // ← Cambiar aquí
  area: "R&D Técnica",
  departamento: "Ingeniería",
};
```

Guardar → Reload en navegador → Ver proyectos de R&D Técnica

---

## ✨ Características Implementadas

- ✅ Filtrado automático por rol de usuario
- ✅ Bandeja personalizada para cada tipo de usuario
- ✅ Validación estructurada (campo + acción)
- ✅ Historial completo de comentarios
- ✅ Estados claramente diferenciados (Pendiente, Observada, Rechazada, Aprobada)
- ✅ Integración completa con flujo de Proyectos
- ✅ Búsqueda y filtrado avanzado
- ✅ Ordenamiento flexible (fecha/estado)
- ✅ Interfaz responsiva y profesional

---

## 📝 Notas Importantes

1. **Usuario Mock:** Actualmente usa `MOCK_CURRENT_USER` en ChecksListPage para simular diferentes roles. En producción, debe conectarse con `getCurrentUser()` del sistema de autenticación.

2. **Datos de Validación:** Los datos de validación se almacenan en `projectStorage.ts` como parte del `ProjectRecord`. NO hay datos aislados.

3. **Roles Dinámicos:** El sistema soporta agregar nuevos roles fácilmente en `checksFilters.ts`.

4. **Auditoría:** Todos los comentarios registran autor y fecha automáticamente.

---

## 🔄 Próximas Mejoras (Futuro)

- [ ] Integración con autenticación real (getCurrentUser)
- [ ] Notificaciones por email al validar
- [ ] Reportes de validaciones pendientes
- [ ] Métricas de tiempo de validación
- [ ] Asignación automática de validadores
- [ ] Templates de comentarios frecuentes
- [ ] Firma digital de validadores

---

## 📚 Archivos Generados

```
src/modules/Checks/
├── pages/
│   ├── ChecksListPage.tsx          (359 líneas)
│   └── ChecksDetailPage.tsx        (269 líneas, copiada de ValidationDetailPage)
├── types/
│   └── checks.ts                   (47 líneas)
└── data/
    └── checksFilters.ts            (96 líneas)
```

**Total:** ~771 líneas de código nuevo

---

## 🧪 Testing de Roles

Para cada rol, cambiar `MOCK_CURRENT_USER` y verificar:

- ✅ Proyectos mostrados son correctos
- ✅ Filtrados por estado correcto
- ✅ Campos edibles según rol
- ✅ Restricciones aplicadas correctamente
- ✅ Historial de comentarios visible

---

## 📞 Contacto / Soporte

Si encuentra problemas:
1. Verificar que `projectStorage.ts` tiene datos con `validacionSolicitada: true`
2. Confirmar que `MOCK_CURRENT_USER` coincide con rol esperado
3. Limpiar caché del navegador
4. Revisar consola del navegador (F12 → Console)

