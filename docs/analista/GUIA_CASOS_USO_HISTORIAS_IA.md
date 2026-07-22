# Guía de Casos de Uso e Historias de Usuario compatibles con el motor de IA

**Producto:** Portal ODISEO (Amcor F2)  
**Audiencia:** Analistas funcionales / de negocio  
**Propósito:** Estandarizar la definición de requerimientos para que el agente de IA (Cursor Cloud Agent) genere entregables más rápidos, predecibles y seguros.  
**Versión:** 1.0  
**Fecha:** 2026-07-22

---

## 1. Por qué existe este documento

El motor de IA del proyecto trabaja mejor cuando recibe **requerimientos estructurados, acotados y verificables**.  
Si el analista entrega ambigüedad (“mejorar el formulario”, “hacer más amigable”), el agente improvisa.  
Si entrega un **caso de uso + historias IA-ready**, el agente puede:

1. Ubicar el módulo y archivos correctos.
2. Reutilizar componentes del design system existente.
3. Implementar solo el alcance acordado.
4. Proponer criterios de aceptación ejecutables (QA / Playwright).
5. Abrir un PR con cambios revisables.

**Regla de oro:** cada historia debe poder convertirse en un prompt de agente **sin preguntas adicionales**.

---

## 2. Definiciones (glosario operativo)

| Término | Definición operativa para este sistema |
|--------|----------------------------------------|
| **Actor** | Rol concreto del portal (Admin, Ejecutivo comercial, Validador, Cliente interno, etc.). Evitar “usuario” genérico. |
| **Caso de uso (CU)** | Capacidad de negocio completa (ej. “Crear usuario desde Sistema Integral”). Contiene contexto, actores, flujo y reglas. |
| **Historia de usuario (HU)** | Unidad implementable en **una** iteración de agente. Un CU se parte en 1–N HUs. |
| **Criterio de aceptación (CA)** | Condición verificable (Given/When/Then o checklist). Sin CA no hay “Done”. |
| **Regla de negocio (RN)** | Restricción o cálculo que el sistema debe respetar (validaciones, estados, permisos). |
| **Fuera de alcance** | Lo que **no** debe tocar el agente. Reduce regresiones. |
| **Dependencia** | Catálogo, API, storage, módulo o permiso que debe existir antes. |
| **Evidencia de listo** | Cómo se demuestra: ruta UI, captura, test, log, archivo tocado. |
| **Prompt de agente** | Texto listo para pegar en Cursor Cloud Agent, derivado de la HU. |

---

## 3. Mapa de módulos del sistema (para referenciar en CU/HU)

Usar siempre el **código de módulo** al definir alcance:

| Código | Módulo | Rutas típicas | Carpeta |
|--------|--------|---------------|---------|
| `AUTH` | Autenticación | `/login` | `src/modules/auth` |
| `DASH` | Dashboard | `/dashboard` | `src/modules/dashboard` |
| `PORT` | Portafolio | `/portfolio/*` | `src/modules/portfolio` |
| `PROJ` | Proyectos / Productos | `/products/*` | `src/modules/products` |
| `CLI` | Clientes | `/clients/*` | `src/modules/clients` |
| `DS` | Fichas técnicas | `/datasheets/*` | `src/modules/datasheets` |
| `USR` | Usuarios | `/users/*` | `src/modules/users` |
| `CAT` | Catálogos | `/catalogs/*` | `src/modules/catalog-management`, `src/shared/catalogs` |
| `CHK` | Validaciones / Checks | módulo Checks | `src/modules/Checks` |
| `SHARED` | Componentes compartidos | — | `src/shared/components`, `src/shared/data` |

**Patrones UI a respetar (no reinventar):**

- Listas: `PageLayout` + `PageHeader` + `DataTable` + `ListToolbar`
- Formularios: componentes en `src/shared/components/forms`
- Estados vacíos: `EmptyState`
- Badges / botones: design system existente (`ESTANDARIZACION_UI.md`)

---

## 4. Jerarquía recomendada

```
Epic / Iniciativa
 └── Caso de uso (CU-XXX)
      ├── Historia HU-XXX-01  ← 1 prompt de agente
      ├── Historia HU-XXX-02
      └── Historia HU-XXX-03
```

| Nivel | Tamaño ideal | Entregable del agente |
|-------|--------------|------------------------|
| Epic | Varias semanas de negocio | No se implementa directo |
| Caso de uso | 2–8 historias | Documento de análisis + backlog |
| Historia | **1 PR enfocado** | Código + tests + PR |

**Límite práctico para IA:** una historia = un objetivo, un módulo principal, ≤ ~8 archivos tocados de forma intencional. Si supera eso, partir.

---

## 5. Plantilla de Caso de Uso (CU)

Copiar y completar. Los campos marcados ★ son **obligatorios** para el motor de IA.

```markdown
# CU-<MOD>-<NNN>: <Nombre corto en imperativo de negocio>

## Metadatos ★
- ID: CU-USR-001
- Módulo: USR
- Prioridad: Alta | Media | Baja
- Estado: Borrador | Listo para IA | En desarrollo | Validado
- Actor(es) principal(es): Admin ODISEO
- Actor(es) secundario(s): Usuario SI (Sistema Integral)
- Autor analista: <nombre>
- Fecha: YYYY-MM-DD
- Relacionado con: CU-..., HU-..., tickets...

## Objetivo de negocio ★
<Una frase: qué valor aporta y a quién.>

## Contexto / Precondiciones ★
- El actor está autenticado con rol <X>
- Existen datos en <catálogo/storage>
- El usuario llega desde <ruta o menú>

## Disparador ★
<Evento que inicia el CU: click en “Nuevo usuario”, recepción de correo, etc.>

## Flujo principal (éxito) ★
1. ...
2. ...
3. ...
N. Sistema confirma resultado visible al actor

## Flujos alternos
- A1: Si <condición>, entonces <comportamiento>
- A2: ...

## Flujos de excepción / error ★
- E1: Dato duplicado → mensaje + acciones permitidas
- E2: Sin permisos → bloqueo + mensaje
- E3: Catálogo vacío → EmptyState + CTA

## Reglas de negocio ★
- RN-01: ...
- RN-02: ...

## Datos involucrados ★
| Campo | Origen | Editable | Validación | Notas |
|-------|--------|----------|------------|-------|
| email | SI / manual | No si viene de SI | formato email | ... |

## Permisos e impacto de seguridad ★
- Roles que pueden ejecutar: ...
- Datos sensibles: ...
- Auditoría requerida: sí/no (qué se registra)

## Criterios de aceptación del CU (alto nivel) ★
- [ ] ...
- [ ] ...

## Fuera de alcance ★
- No modificar módulo X
- No cambiar API Y
- No rediseñar layout global

## Historias derivadas
- HU-USR-001
- HU-USR-002

## Notas para el agente de IA
- Reutilizar: <componentes/archivos>
- No inventar catálogos hardcodeados; usar `src/shared/catalogs`
- Seguir patrones de: <página de referencia>
```

---

## 6. Plantilla de Historia de Usuario (HU) — formato IA-ready

```markdown
# HU-<MOD>-<NNN>: <Título accionable>

## Metadatos ★
- ID: HU-USR-001
- Caso de uso padre: CU-USR-001
- Módulo: USR
- Tipo: Feature | Bugfix | Refactor | UX | Validación
- Prioridad: Must | Should | Could
- Estimación relativa: S | M | L (S = 1 sesión de agente)
- Dependencias: HU-..., catálogo X, permiso Y
- Estado: Listo para IA

## Historia ★
Como <rol concreto>
quiero <acción / capacidad>
para <beneficio de negocio medible o claro>

## Alcance técnico sugerido ★
- Pantallas / rutas: `/users/new`
- Archivos probables: `src/modules/users/pages/UserCreatePage.tsx`, ...
- Componentes a reutilizar: `SystemIntegrationUserSearch`, `PageLayout`, ...
- Storages / servicios: `userStorage.ts`, `vendorMirrorStorage.ts`

## Criterios de aceptación (Given / When / Then) ★
### CA-01 <nombre>
- **Given** <contexto>
- **When** <acción>
- **Then** <resultado observable>

### CA-02 ...
- **Given** ...
- **When** ...
- **Then** ...

## Reglas de negocio aplicables ★
- RN-01 ...
- RN-02 ...

## UX / UI (si aplica)
- Layout: seguir patrón de <página referencia>
- Mensajes exactos (copy):
  - Éxito: "..."
  - Error: "..."
- Responsive: desktop obligatorio; mobile <sí/no>

## Datos de prueba ★
| Escenario | Input | Resultado esperado |
|-----------|-------|--------------------|
| Feliz | ... | ... |
| Duplicado | email existente | ... |
| Vacío | sin catálogo | EmptyState |

## Fuera de alcance ★
- ...

## Definición de Done ★
- [ ] Cumple todos los CA
- [ ] No rompe listados/detalles relacionados
- [ ] Usa componentes compartidos (no CSS one-off innecesario)
- [ ] Incluye o actualiza prueba (manual checklist o Playwright)
- [ ] PR con descripción de cambios y cómo probar

## Prompt listo para Cursor Cloud Agent ★
(ver sección 8 — pegar el bloque generado)
```

---

## 7. Checklist de calidad “Listo para IA”

Antes de pasar una HU al agente, el analista marca:

### Claridad
- [ ] Hay **un solo objetivo** por historia
- [ ] El actor es un **rol real** del portal
- [ ] El “para qué” es de negocio, no técnico
- [ ] Los CA son **observables** (UI, mensaje, estado, navegación)

### Acotamiento
- [ ] Módulo principal identificado (`PORT`, `USR`, etc.)
- [ ] Fuera de alcance explícito
- [ ] Sin “y también…” no priorizados
- [ ] Tamaño S/M (si es L, partir)

### Seguridad y datos
- [ ] Roles/permisos indicados
- [ ] Validaciones de duplicidad / vacíos / errores
- [ ] No se pide hardcodear catálogos (usar registry/storage)
- [ ] Datos sensibles identificados

### Verificabilidad
- [ ] Datos de prueba incluidos
- [ ] Ruta UI para validar
- [ ] Resultado esperado por escenario
- [ ] Criterio de regresión mínimo (qué no debe romperse)

### Compatibilidad con el repo
- [ ] Referencia a patrón UI existente cuando aplica
- [ ] Nombres de campos alineados al dominio ODISEO
- [ ] No contradice reglas ya documentadas (SKU, catálogos, flujo usuario, etc.)

Si faltan 2+ ítems de Claridad o Acotamiento → **no está listo para IA**.

---

## 8. Cómo convertir una HU en prompt de agente

### Estructura del prompt (obligatoria)

```text
## Objetivo
Implementar HU-<ID>: <título>

## Contexto del producto
Portal ODISEO (Amcor F2). Stack: React 19 + Vite + TypeScript + Tailwind + React Router.
Seguir design system y componentes en src/shared. No inventar catálogos hardcodeados.

## Historia
Como <rol> quiero <acción> para <beneficio>.

## Alcance
- Módulo: <MOD>
- Rutas: <...>
- Archivos sugeridos: <...>
- Reutilizar: <...>

## Criterios de aceptación
1. Given ... When ... Then ...
2. ...

## Reglas de negocio
- RN-01 ...

## Fuera de alcance
- ...

## Datos de prueba
- ...

## Entregables esperados
- Código implementado
- Checklist o test de verificación
- PR con pasos para probar en /ruta

## Restricciones
- No cambiar arquitectura global
- No agregar dependencias npm sin justificación
- Preferir patrones existentes (PageLayout, DataTable, forms compartidos)
```

### Anti-patrones de prompt (evitar)

| Mal | Bien |
|-----|------|
| “Mejora la UX del portafolio” | “En `/portfolio`, al filtrar por estado vacío mostrar `EmptyState` con CTA Crear” |
| “Que sea más rápido” | “Debounce 300ms en búsqueda; máximo 8 resultados” |
| “Arregla usuarios” | “En creación, si email o workerCode existe, mostrar `UserDuplicateHandler` según estado” |
| “Usa el mejor enfoque” | “Reutilizar `catalog.service` / `catalog.registry`; no arrays locales” |

---

## 9. Tipos de historia compatibles (taxonomía)

Usar un tipo por HU para orientar al agente:

| Tipo | Cuándo | Ejemplo |
|------|--------|---------|
| `Feature` | Nueva capacidad | Búsqueda SI en alta de usuario |
| `Bugfix` | Defecto reproducible | Select de impresión no carga catálogo |
| `UX` | Mejora visual/flujo sin regla nueva | Estandarizar header de listas |
| `Validation` | Reglas / checks | Restricción dimensional por formato |
| `Catalog` | Datos maestros | Alta de ítem en catálogo de plantas |
| `Security` | Roles/permisos | Ocultar acción sin rol Admin |
| `Refactor` | Sin cambio funcional | Extraer componente compartido |
| `Test` | Cobertura / verificación | Playwright del flujo de login |

Para `Bugfix`, agregar siempre:

- Pasos de reproducción
- Resultado actual vs esperado
- Ambiente / navegador si aplica
- Evidencia (screenshot path o descripción)

---

## 10. Ejemplo completo (dominio ODISEO)

### Caso de uso (resumen)

**CU-USR-001 — Crear usuario ODISEO desde Sistema Integral**

- **Actor:** Admin ODISEO  
- **Objetivo:** Dar de alta un usuario evitando duplicados y reutilizando datos de SI.  
- **Flujo:** Buscar en SI → autocompletar → asignar rol → validar duplicidad → guardar / manejar existente.  
- **Fuera de alcance:** Edición masiva, SSO, cambio de layout global.

### Historia IA-ready

**HU-USR-001 — Búsqueda inteligente de usuario SI como primer campo**

```markdown
Como Admin ODISEO
quiero buscar un usuario del Sistema Integral por código, nombre o email
para autocompletar el alta y reducir errores de captura

## Alcance
- Ruta: creación de usuario (UserCreatePage)
- Reutilizar/crear: SystemIntegrationUserSearch
- Storage: searchSistemaIntegralUsers en vendorMirrorStorage

## CA-01 Búsqueda encuentra coincidencias
- Given existen usuarios SI activos
- When escribo “juan” en el buscador
- Then veo hasta 8 resultados con código, nombre, email, área y estado

## CA-02 Selección autocompleta y bloquea campos SI
- Given selecciono un resultado
- When se carga el formulario
- Then nombre/email/código quedan poblados y no editables

## CA-03 Sin resultados
- Given no hay coincidencias
- When la búsqueda termina
- Then veo mensaje contextual y puedo continuar en modo manual

## Fuera de alcance
- No implementar reenvío de activación (HU-USR-002)
- No cambiar listado de usuarios

## Datos de prueba
| Escenario | Input | Esperado |
|-----------|-------|----------|
| Match | código conocido | lista con 1+ items |
| Vacío | "zzzxxx" | mensaje sin resultados |
| Select | click resultado | campos bloqueados |
```

### Prompt mínimo derivado

```text
Implementar HU-USR-001 en Portal ODISEO.
Módulo USR, página de creación de usuario.
Agregar búsqueda SI como primer campo con debounce/resultados máx 8,
selección que autocompleta y bloquea campos provenientes de SI,
y empty state de “sin resultados” permitiendo modo manual.
Reutilizar patrones de forms en src/shared/components/forms.
No implementar manejo de duplicados ni reenvío de correo en esta HU.
Criterios: CA-01, CA-02, CA-03 de la historia.
Entregar PR con pasos de prueba manual.
```

---

## 11. Matriz de severidad para priorizar

| Severidad | Criterio | Acción analista |
|-----------|----------|-----------------|
| Crítica | Bloquea operación / riesgo de datos incorrectos | HU Must inmediata |
| Alta | Flujo principal incompleto | Must en el mismo CU |
| Media | Alterno o UX relevante | Should |
| Baja | Cosmético / nice-to-have | Could / backlog |

El agente debe recibir **solo Must (+ Should si caben en la misma sesión)**. No mezclar Could en el mismo prompt.

---

## 12. Convenciones de ID

```
CU-<MOD>-<NNN>     → CU-PORT-003
HU-<MOD>-<NNN>     → HU-PORT-012
RN-<MOD>-<NNN>     → RN-PROJ-004
CA-<NN>            → CA-01 (local a la HU)
```

- `NNN` correlativo por módulo.
- No reutilizar IDs aunque se cancele la historia (marcar `Cancelada`).

---

## 13. Paquete mínimo que el analista entrega al equipo / agente

Para cada iniciativa, adjuntar:

1. **CU** completo (sección 5)
2. **HU** partidas y priorizadas (sección 6)
3. **Checklist** “Listo para IA” marcado (sección 7)
4. **Prompt** por cada HU Must (sección 8)
5. **Referencias** a docs existentes si aplica (`ESTANDARIZACION_UI.md`, guías de SKU, catálogos, etc.)

Con ese paquete, el agente puede ejecutar sin reinterpretar el negocio.

---

## 14. Plantillas rápidas (copiar/pegar)

### 14.1 Mini-HU (cuando el tiempo es corto)

```markdown
ID: HU-<MOD>-<NNN>
Como <rol> quiero <acción> para <beneficio>
Módulo/Ruta: 
CA:
1. Given/When/Then
2. Given/When/Then
Reglas: 
Fuera de alcance: 
Datos de prueba: 
DoD: CA OK + sin regresiones en <pantalla> + PR testeable
```

### 14.2 Mini-Bug

```markdown
ID: HU-<MOD>-<NNN> (Bugfix)
Resumen: 
Repro:
1.
2.
Actual: 
Esperado: 
Módulo/archivo sospechoso: 
No tocar: 
```

---

## 15. Qué hace el motor de IA con este input

| Input del analista | Comportamiento esperado del agente |
|--------------------|------------------------------------|
| CU + HU Listas | Implementa por HU, un PR enfocado |
| CA Given/When/Then | Usa CA como checklist de verificación |
| Fuera de alcance | Evita cambios colaterales |
| Componentes a reutilizar | Prefiere shared vs reinventar |
| Datos de prueba | Valida escenarios felices y de error |
| Restricciones de stack | No agrega libs ni reescribe arquitectura |

---

## 16. Contacto del proceso

1. Analista completa CU/HU con esta guía.  
2. Tech lead o PM marca HU como **Listo para IA**.  
3. Se lanza Cursor Cloud Agent con el **prompt de la sección 8**.  
4. Se revisa el PR contra los CA.  
5. QA valida con la tabla de datos de prueba.

---

## Anexo A — Campos prohibidos / vagos

No usar como único contenido de una HU:

- “Mejorar”, “optimizar”, “revisar”, “ajustar”, “dejar bonito”
- “Como siempre”, “igual que el otro sistema” (sin especificar qué)
- “Lo más intuitivo posible” (sin comportamiento)
- “Todos los campos necesarios” (listar campos)
- “Validar correctamente” (definir reglas)

## Anexo B — Documentos de apoyo en el repo

| Documento | Uso para el analista |
|-----------|----------------------|
| `ESTANDARIZACION_UI.md` | Patrones de página y componentes |
| `GUIA_RAPIDA_FLUJO_USUARIO.md` | Ejemplo de flujo usuario ya implementado |
| `FLUJO_CREACION_USUARIO_ANALISIS.md` | Nivel de detalle técnico útil al partir HUs |
| `GUIA_SKU_INTEGRATION.md` / `GUIA_ODISEO_PRODUCT_CODES.md` | Reglas de códigos producto |
| Auditorías de catálogos | Evitar pedir catálogos hardcodeados |

---

**Fin del documento.**  
Mantener esta guía versionada. Cualquier nuevo módulo debe agregarse a la tabla de la sección 3.
