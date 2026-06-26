# 🚀 GUÍA RÁPIDA - FLUJO DE CREACIÓN DE USUARIO

**Última actualización:** 2026-04-28 | **Estado:** ✅ COMPLETADO

---

## 📖 ÍNDICE DE DOCUMENTOS

| Documento | Propósito | Público | Localización |
|-----------|-----------|---------|--------------|
| **FLUJO_CREACION_USUARIO_ANALISIS.md** | Análisis técnico completo, decisiones, supuestos | Dev/Tech Lead | `/` |
| **RESUMEN_IMPLEMENTACION_FLUJO_USUARIO.md** | Resumen ejecutivo con métricas | PM/Manager | `/` |
| **COMPARATIVA_ANTES_DESPUES.md** | Comparación visual antes/después | Stakeholders | `/` |
| **GUIA_RAPIDA_FLUJO_USUARIO.md** | Este archivo - guía de uso rápido | Todos | `/` |

---

## 🎯 PARA DIFERENTES PÚBLICOS

### 👨‍💼 Project Manager / Stakeholder
→ Lee: **RESUMEN_IMPLEMENTACION_FLUJO_USUARIO.md**
- Métricas claras
- Estado del proyecto
- Casos de prueba cubiertos
- Timeline recomendado

### 👨‍💻 Desarrollador
→ Lee: **FLUJO_CREACION_USUARIO_ANALISIS.md**
- Decisiones arquitectónicas
- Código específico
- Validaciones implementadas
- Pendientes técnicos

### 🎨 UX/Designer
→ Lee: **COMPARATIVA_ANTES_DESPUES.md**
- Mockups antes/después
- Cambios de UI
- Flujos visuales
- Mejoras UX

### 📊 QA / Tester
→ Lee: **FLUJO_CREACION_USUARIO_ANALISIS.md** (sección 7)
- 10 casos de prueba
- Pasos específicos
- Resultados esperados
- Estado de validación

---

## 🔧 ARCHIVOS DE CÓDIGO MODIFICADOS/CREADOS

### 🆕 NUEVOS ARCHIVOS

#### 1. `src/shared/components/forms/SystemIntegrationUserSearch.tsx`
**¿Qué es?** Componente de búsqueda inteligente  
**¿Cuándo se usa?** En UserCreatePage (campo 1 del formulario)  
**¿Cómo se usa?**
```tsx
import SystemIntegrationUserSearch from "...";

<SystemIntegrationUserSearch
  value={searchQuery}
  onChange={setSearchQuery}
  onSelect={handleSiUserSelect}
/>
```

#### 2. `src/shared/components/forms/UserDuplicateHandler.tsx`
**¿Qué es?** Componente para manejar usuarios duplicados  
**¿Cuándo se usa?** En UserCreatePage (cuando se detecta duplicidad)  
**¿Cómo se usa?**
```tsx
import UserDuplicateHandler from "...";

<UserDuplicateHandler
  existingUser={duplicateUser}
  onResendActivation={handleResendActivation}
/>
```

### ✏️ ARCHIVOS MODIFICADOS

#### 1. `src/shared/data/vendorMirrorStorage.ts`
**Función nueva:**
```typescript
export function searchSistemaIntegralUsers(query: string): VendorMirror[]
// Busca en: código, nombre, email, área
```

#### 2. `src/shared/data/userStorage.ts`
**Funciones nuevas:**
```typescript
export function getUserByWorkerCode(workerCode: string): User | undefined
export function findDuplicateUser(email, workerCode?): User | undefined
```

#### 3. `src/modules/users/pages/UserCreatePage.tsx`
**Cambios:** Reescrita completa (400 LOC)
- Búsqueda SI como primer paso
- Autocompletar de datos
- Campos bloqueados si vienen de SI
- Manejo de usuarios duplicados
- 5 flujos condicionales (A-E)

---

## 🧪 PRUEBAS FUNCIONALES - CHECKLIST

### ✅ Caso 1: Usuario SI Existe
```
1. Abre formulario "Crear Usuario"
2. Busca "jose" en campo "Usuario Sistema Integral"
3. Click en "JOSÉ CANNY (EJC-000001)"
4. Verifica que se autocompletaron: código, email, nombre, apellido, puesto, área
5. Verifica que esos campos están DESHABILITADOS
6. Selecciona rol (ej: "Ejecutivo Comercial")
7. Click "Crear Usuario"
8. Verifica mensaje: "Usuario creado correctamente. Se envió el correo de activación."
9. Verifica que redirige a listado de usuarios
10. Verifica que usuario aparece en estado "Pendiente de activación"
```

### ✅ Caso 2: Usuario NO Existe en SI
```
1. Abre formulario "Crear Usuario"
2. Busca "zzzz" en campo "Usuario Sistema Integral"
3. Verifica que muestra: "No se encontraron usuarios en el Sistema Integral"
4. Llena formulario manualmente:
   - Código: "NEW-001"
   - Email: "newuser@amcor.com"
   - Nombre: "Carlos"
   - Apellido: "López"
   - Puesto: "Analista"
   - Empresa: "Amcor"
   - Área: (dropdown) "R&D"
5. Selecciona rol: "R&D"
6. Click "Crear Usuario"
7. Verifica éxito y redirección
8. Verifica que usuario aparece en listado
```

### ✅ Caso 3: Usuario Ya Existe - ACTIVO
```
1. Abre formulario "Crear Usuario"
2. Busca usuario ACTIVO (ej: "JOSÉ CANNY")
3. Click seleccionar
4. Asigna rol
5. Click "Crear Usuario"
6. Verifica que muestra: "Usuario ya registrado"
7. Verifica que muestra estado: "Activo"
8. Verifica botón: "Ver detalle del usuario"
9. Click botón
10. Verifica que abre detalle del usuario
```

### ✅ Caso 4: Usuario Ya Existe - PENDIENTE_ACTIVACION
```
1. Crea usuario nuevo (caso 1)
2. Abre nuevo formulario "Crear Usuario"
3. Busca mismo usuario
4. Selecciona
5. Asigna rol
6. Click "Crear Usuario"
7. Verifica que muestra: "Usuario ya fue creado, pero aún no activó"
8. Verifica botón: "Reenviar correo de activación"
9. Click botón
10. Verifica mensaje: "Correo de activación reenviado correctamente"
11. Verifica que redirige a listado
```

### ✅ Caso 5: Usuario Ya Existe - INACTIVO
```
1. En detalle de usuario existente
2. Cambia estado a "inactivo" (usando botón de detalle)
3. Abre nuevo formulario "Crear Usuario"
4. Busca mismo usuario
5. Selecciona
6. Asigna rol
7. Click "Crear Usuario"
8. Verifica que muestra: "Usuario existe, pero se encuentra inactivo"
9. Verifica botón: "Reactivar usuario"
10. Click botón
11. Confirma en dialog
12. Verifica mensaje: "Usuario reactivado correctamente. Se envió correo."
13. Verifica redirección
```

### ✅ Caso 6: Usuario Ya Existe - BLOQUEADO
```
Pasos similares a Caso 5 pero:
8. Mensaje: "Usuario se encuentra bloqueado"
9. Botón: "Desbloquear usuario"
12. Mensaje: "Usuario desbloqueado correctamente"
```

### ✅ Caso 7: Validaciones
```
1. Abre formulario
2. Deja todos los campos vacíos
3. Click "Crear Usuario"
4. Verifica que NO guarda
5. Verifica que muestra errores en rojo debajo de cada campo:
   - "El código de trabajador es obligatorio"
   - "El correo electrónico es obligatorio"
   - "El nombre es obligatorio"
   - "El apellido es obligatorio"
   - "El puesto es obligatorio"
   - "La empresa es obligatoria"
   - "El área es obligatoria"
   - "El rol es obligatorio"
```

### ✅ Caso 8: Email Inválido
```
1. Abre formulario
2. Busca usuario SI → selecciona
3. Email ya está lleno (y validado)
4. Si intenta cambiar email a inválido (ej "notanemail")
5. Click "Crear Usuario"
6. Verifica error: "El formato del correo no es válido"
```

### ✅ Caso 9: Campos SI Bloqueados
```
1. Abre formulario
2. Busca usuario SI → selecciona
3. Intenta editar uno de estos campos:
   - Código de trabajador
   - Email
   - Nombre
   - Apellido
   - Puesto
   - Empresa
   - Área
4. Verifica que NO permite editar (gris, cursor: not-allowed)
5. Verifica que solo permite editar:
   - Teléfono
   - Rol
```

### ✅ Caso 10: Área es Dropdown
```
1. Abre formulario (sin SI seleccionado)
2. Busca campo "Área"
3. Click en el campo
4. Verifica que abre dropdown con exactamente 6 opciones:
   - Comercial
   - Artes Gráficas
   - R&D
   - Commercial Finance
   - Administración
   - TI
5. Selecciona una opción
6. Verifica que se completa el campo
7. Verifica que NO permite texto libre
```

---

## 🔐 VALIDACIONES PARA VERIFICAR

### Email
```
✅ "user@amcor.com" → Válido
✅ "juan.perez@amcor.com" → Válido
❌ "notanemail" → Error
❌ "user@" → Error
❌ "@amcor.com" → Error
```

### Duplicidad
```
✅ Email único + Código único → Crea usuario
❌ Email existe (cualquier código) → Usuario duplicado
❌ Código existe (cualquier email) → Usuario duplicado
```

---

## 🚨 POSIBLES ERRORES Y SOLUCIONES

| Error | Causa | Solución |
|-------|-------|----------|
| "Usuario ya existe" pero no debería | Email o código duplicado | Verificar findDuplicateUser() en userStorage.ts |
| Campos no se desactivan | isSiUserSelected no cambia | Verificar handleSiUserSelect() |
| Búsqueda lenta | Muchos registros SI | Usar pagination (future work) |
| Email mock no llega | Envío es mock | Verificar mockSendEmail() en notificationStorage.ts |
| Estado no cambia al reactivar | Función no ejecuta | Verificar handleReactivateUser() |

---

## 📚 RECURSOS TÉCNICOS

### Componentes Utilizados
- ✅ FormInput (input text)
- ✅ FormSelect (select dropdown)
- ✅ FormCard (container)
- ✅ FormActionButtons (botones submit/cancel)
- ✅ ActionButton (botones individuales)
- ✅ AlertCircle (icono de alerta)

### Funciones de Data
- ✅ searchSistemaIntegralUsers() - Nueva
- ✅ findDuplicateUser() - Nueva
- ✅ createUser()
- ✅ mockSendEmail()
- ✅ registerUserStatusChange()

### Estados Implementados
- ✅ pending_activation (nuevo usuario)
- ✅ pending_validation (en validación)
- ✅ active (usuario activo)
- ✅ inactive (usuario inactivo)
- ✅ blocked (usuario bloqueado)

---

## 📞 PREGUNTAS FRECUENTES

### P: ¿Por qué la búsqueda del SI es obligatoria?
R: Para:
1. Evitar duplicados desde el inicio
2. Reutilizar datos ya validados en SI
3. Mantener sincronización de data
4. Reducir errores manuales

### P: ¿Qué pasa si usuario está en SI pero no aparece en la búsqueda?
R: Verificar:
1. ¿Está activo en SI? (status = "Activo")
2. ¿Se escribió bien el búsqueda?
3. ¿Existen registros en INITIAL_VENDORS_MIRROR?

### P: ¿Puedo editar los datos que vienen de SI?
R: NO. Están bloqueados (disabled=true) porque:
1. Deben ser la fuente única de verdad
2. Cambios deben hacerse en SI primero
3. Previene inconsistencias

### P: ¿Qué email debo usar para crear usuario?
R: El que tenga registrado en SI. Aunque si lo creo manualmente, puedo usar cualquiera.

### P: ¿Cómo reactivar un usuario bloqueado?
R: Desde el formulario de creación:
1. Buscar usuario
2. Si está bloqueado → aparece opción "Desbloquear"
3. Click desbloquear con confirmación

O desde la página de detalle del usuario directamente.

### P: ¿Dónde veo el historial de cambios?
R: En la página de detalle del usuario (UserDetailPage).

---

## 🎓 APRENDER MÁS

### Si quieres entender:

**La arquitectura general:**
→ Lee: FLUJO_CREACION_USUARIO_ANALISIS.md (Sección 3: Decisiones Arquitectónicas)

**Los casos de uso:**
→ Lee: COMPARATIVA_ANTES_DESPUES.md (Sección Escenarios)

**Las validaciones:**
→ Lee: FLUJO_CREACION_USUARIO_ANALISIS.md (Sección 5)

**El código:**
→ Lee archivos en src/ directamente

---

## ✅ CHECKLIST PRE-DEPLOY

Antes de hacer deploy a producción:

- [ ] Todos los tests manuales (10 casos) pasaron
- [ ] Build ejecuta sin errores
- [ ] TypeScript no reporta errores
- [ ] Probado en navegadores: Chrome, Firefox, Safari, Edge
- [ ] Probado en móvil (responsive)
- [ ] Emails de mock funcionan
- [ ] Redirecciones funcionan
- [ ] Mensajes de error claros
- [ ] Validaciones bloquean correctamente
- [ ] Usuario puede volver atrás (botón Cancelar)
- [ ] Performance > 3 segundos (carga inicial)
- [ ] Sin console errors
- [ ] Sin console warnings

---

**Documento actualizado:** 2026-04-28  
**Versión:** 1.0  
**Responsable:** Equipo de Desarrollo  
**Para preguntas:** Ver FLUJO_CREACION_USUARIO_ANALISIS.md (Sección 10: Soporte)
