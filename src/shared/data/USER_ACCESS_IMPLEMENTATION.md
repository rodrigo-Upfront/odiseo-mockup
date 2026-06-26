# Implementación de TABUSUODISEO y TABESTACCODISEO

## Resumen

Se han implementado las tablas maestro de Usuario ODISEO (TABUSUODISEO) y Catálogo de Estado de Acceso (TABESTACCODISEO) con auditoría completa.

## Archivos Creados

### 1. `accessStatusCatalog.ts`
Catálogo maestro de estados de acceso del usuario.

**Estados disponibles:**
- `PENDIENTE_ACTIVACION` (ID: 1) - El usuario aún no genera su contraseña
- `HABILITADO` (ID: 2) - El usuario ya puede ingresar a ODISEO
- `BLOQUEADO` (ID: 3) - Usuario bloqueado por intentos fallidos o acción administrativa

**Funciones principales:**
```typescript
getAccessStatusCatalog(): AccessStatus[]
getAccessStatusById(id: number): AccessStatus | undefined
getAccessStatusByCode(code: AccessStatusCode): AccessStatus | undefined
getActiveAccessStatuses(): AccessStatus[]
getAccessStatusLabel(code: AccessStatusCode): string
```

### 2. `userAccessAuditStorage.ts`
Sistema de auditoría para todos los eventos de acceso del usuario.

**Tipos de eventos registrados:**
- `CREAR_USUARIO` - Nuevo usuario creado
- `EDITAR_USUARIO` - Usuario editado
- `CAMBIO_PERFIL` - Perfil de acceso cambiado
- `CAMBIO_ESTADO_ACCESO` - Estado de acceso cambió
- `ACTIVAR_USUARIO` - Usuario activado (vigencia)
- `INACTIVAR_USUARIO` - Usuario inactivado (baja lógica)
- `BLOQUEAR_USUARIO` - Usuario bloqueado
- `DESBLOQUEAR_USUARIO` - Usuario desbloqueado
- `INTENTO_LOGIN_FALLIDO` - Intento de login fallido
- `LOGIN_EXITOSO` - Login exitoso
- `ACTIVACION_CONTRASENA` - Contraseña activada

**Funciones principales:**
```typescript
registerAccessAuditEvent(userId: string, eventType: AccessAuditEventType, ...): AccessAuditEvent
getUserAccessAuditHistory(userId: string): AccessAuditEvent[]
getEntityAuditHistory(entityId: string): AccessAuditEvent[]
getAuditEventsByType(eventType: AccessAuditEventType): AccessAuditEvent[]
```

## Modelo User Actualizado

### Nuevos Campos Técnicos

| Campo | Tipo | Descripción | Valores |
|-------|------|-------------|---------|
| `accessStatusId` | number | FK a catálogo de estados | 1, 2, 3 |
| `failedLoginAttempts` | number | Contador de intentos fallidos | 0-3+ |
| `blockedAt` | string \| undefined | Cuando fue bloqueado | ISO datetime |
| `createdByUser` | string | Usuario que creó el registro | "SISTEMA" o nombre |
| `updatedByUser` | string \| undefined | Usuario que modificó | Último que modificó |

### Cambios Removidos
- Removed: `odiseoUserStatus` (tipo OdiseoUserStatus)
- Replaced by: `accessStatusId` (referencia a catálogo)

## Lógica de Seguridad Implementada

### 1. Intentos Fallidos de Login

```typescript
recordFailedLoginAttempt(userId: string): boolean
```

**Comportamiento:**
- Incrementa `failedLoginAttempts` cada intento fallido
- Al alcanzar 3 intentos:
  - Cambia estado a `BLOQUEADO` (accessStatusId = 3)
  - Registra timestamp en `blockedAt`
  - Genera evento de auditoría "BLOQUEAR_USUARIO" con origen "Seguridad"

### 2. Login Exitoso

```typescript
recordSuccessfulLogin(userId: string): boolean
```

**Comportamiento:**
- Si `failedLoginAttempts > 0`, lo reinicia a 0
- Registra evento de auditoría "LOGIN_EXITOSO"

### 3. Desbloqueo Administrativo

```typescript
unblockUserAccess(userId: string, unlockedBy: string): boolean
```

**Comportamiento:**
- Cambia estado a `HABILITADO` (accessStatusId = 2)
- Reinicia `failedLoginAttempts` a 0
- Limpia `blockedAt`
- Registra evento de auditoría "DESBLOQUEAR_USUARIO" con origen "Manual"

### 4. Activación de Contraseña

```typescript
activateUserPassword(userId: string, activatedBy: string): boolean
```

**Comportamiento:**
- Cambia estado de `PENDIENTE_ACTIVACION` a `HABILITADO`
- Reinicia `failedLoginAttempts` a 0
- Registra evento de auditoría "ACTIVACION_CONTRASENA" con origen "Sistema"

### 5. Inactivación Lógica

```typescript
inactivateUserLogical(userId: string, inactivatedBy: string): boolean
```

**Comportamiento:**
- Establece `activeLogical = false` (baja lógica)
- **NO** cambia el estado de acceso (permanece PENDIENTE_ACTIVACION, HABILITADO o BLOQUEADO)
- Registra evento de auditoría "INACTIVAR_USUARIO"

## Flujo de Ciclo de Vida del Usuario

### 1. Creación
```
Estado inicial: PENDIENTE_ACTIVACION
failedLoginAttempts: 0
activeLogical: true
Evento: CREAR_USUARIO
```

### 2. Generación de Contraseña (Primera vez)
```
Antes: accessStatusId = 1 (PENDIENTE_ACTIVACION)
Después: accessStatusId = 2 (HABILITADO)
Evento: ACTIVACION_CONTRASENA
```

### 3. Login Fallido (1er intento)
```
failedLoginAttempts: 0 → 1
accessStatusId: Sin cambio
Evento: INTENTO_LOGIN_FALLIDO
```

### 4. Login Fallido (3er intento)
```
failedLoginAttempts: 2 → 3
accessStatusId: 2 (HABILITADO) → 3 (BLOQUEADO)
blockedAt: Timestamp del bloqueo
Eventos: INTENTO_LOGIN_FALLIDO + BLOQUEAR_USUARIO
```

### 5. Desbloqueo Administrativo
```
Antes: accessStatusId = 3 (BLOQUEADO), failedLoginAttempts = 3
Después: accessStatusId = 2 (HABILITADO), failedLoginAttempts = 0
Evento: DESBLOQUEAR_USUARIO
```

### 6. Login Exitoso (después de bloqueo)
```
Antes: failedLoginAttempts = 1
Después: failedLoginAttempts = 0
Evento: LOGIN_EXITOSO
```

### 7. Inactivación (Baja Lógica)
```
activeLogical: true → false
accessStatusId: Sin cambio (mantiene su estado)
Evento: INACTIVAR_USUARIO
```

## Validaciones Implementadas

### En Creación
- ✅ Email obligatorio, único, con formato válido
- ✅ Nombre completo obligatorio
- ✅ Perfil obligatorio (ADMINISTRADOR, EDITOR, AUDITOR, VISOR)
- ✅ Código de usuario automático (US-XXXXXX)
- ✅ Estado inicial: PENDIENTE_ACTIVACION
- ✅ activeLogical: true
- ✅ failedLoginAttempts: 0

### En Actualización
- ✅ Preserva campos de auditoría (createdAt, createdByUser)
- ✅ Actualiza automáticamente updatedAt y updatedByUser
- ✅ Mantiene separación entre activeLogical y accessStatusId

### En Login
- ⚠️ Validar: `activeLogical = true` (en implementación futura)
- ⚠️ Validar: `accessStatusId != 3` (BLOQUEADO) (en implementación futura)
- ⚠️ Validar: Si `accessStatusId = 1` redirigir a activación de contraseña (en implementación futura)

## Auditoría Completa

Cada evento genera registro en `userAccessAuditStorage` con:
- ID único del evento
- ID del usuario afectado
- Tipo de evento
- Entidad: "TABUSUODISEO"
- ID del registro afectado
- Campo modificado (si aplica)
- Valor anterior
- Valor nuevo
- Usuario que ejecutó acción
- Timestamp ISO
- Origen: "Manual", "Sistema" o "Seguridad"
- Detalles adicionales

## Integración con Formulario de Registro

### Cambios Requeridos en UserCreatePage.tsx

1. **En createUser call:**
```typescript
const newUser = createUser({
  email: form.email.trim().toLowerCase(),
  password: tempPassword,
  fullName: form.fullName.trim(),
  phone: form.phone || undefined,
  workerCode: odiseoUsername,
  position: form.position.trim(),
  role: "master_data", // Cambiar según lógica
  status: "pending_activation",
  area: form.area || undefined,
  areaCode: form.areaCode,
  areaLabel: form.areaLabel,
  profileCode: form.profileCode,
  profileLabel: selectedProfileData?.name,
  roles: profileRoles,
  integralSystemUserId: form.integralSystemUserId,
  integralSystemUserValue: form.integralSystemUserValue,
  integralSystemUserName: form.integralSystemUserName,
  integralSystemUserStatus: form.integralSystemUserStatus,
  syncStatus: "PENDIENTE_SINCRONIZACION",
  createdByUser: currentUser?.fullName || "SISTEMA",
});
```

2. **Estado del usuario no se pasa (auto-generado):**
   - ❌ NO pasar `odiseoUserStatus`
   - ❌ NO pasar `accessStatusId` (siempre será 1)
   - ❌ NO pasar `failedLoginAttempts` (siempre será 0)
   - ❌ NO pasar `activeLogical` (siempre será true)

## Próximos Pasos

1. Actualizar LoginPage.tsx para usar `recordFailedLoginAttempt()` y `recordSuccessfulLogin()`
2. Actualizar validaciones de acceso para verificar `activeLogical` y `accessStatusId`
3. Crear vista de auditoría de usuario
4. Implementar página de gestión de usuarios con opción de desbloqueo
5. Actualizar UserEditPage.tsx para mostrar historia de cambios

## Referencias

- `src/shared/data/accessStatusCatalog.ts` - Catálogo de estados
- `src/shared/data/userAccessAuditStorage.ts` - Auditoría
- `src/shared/data/userStorage.ts` - Modelo y funciones de usuario
