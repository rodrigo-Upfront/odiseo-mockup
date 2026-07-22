# HU-<MOD>-<NNN>: <Título accionable>

> Plantilla IA-ready. Si no pasa el checklist final, no enviar al agente.
> Guía: `docs/analista/GUIA_CASOS_USO_HISTORIAS_IA.md`

## Metadatos ★

| Campo | Valor |
|-------|-------|
| ID | HU- |
| Caso de uso padre | CU- |
| Módulo | |
| Tipo | Feature / Bugfix / UX / Validation / Catalog / Security / Refactor / Test |
| Prioridad | Must / Should / Could |
| Tamaño | S / M / L |
| Dependencias | |
| Estado | Borrador / Listo para IA |

## Historia ★

Como **<rol concreto>**  
quiero **<acción / capacidad>**  
para **<beneficio de negocio>**

## Alcance técnico sugerido ★

| Ítem | Detalle |
|------|---------|
| Rutas / pantallas | |
| Archivos probables | |
| Componentes a reutilizar | |
| Storages / servicios / catálogos | |

## Criterios de aceptación ★

### CA-01 <nombre>

- **Given** 
- **When** 
- **Then** 

### CA-02 <nombre>

- **Given** 
- **When** 
- **Then** 

### CA-03 <nombre>

- **Given** 
- **When** 
- **Then** 

## Reglas de negocio aplicables ★

- RN-
- RN-

## UX / UI

- Patrón de referencia:
- Copy éxito:
- Copy error:
- Desktop / Mobile:

## Datos de prueba ★

| Escenario | Input | Resultado esperado |
|-----------|-------|--------------------|
| Feliz | | |
| Error / vacío | | |
| Permisos | | |

## Fuera de alcance ★

- 
- 

## Definición de Done ★

- [ ] Todos los CA cumplidos
- [ ] Sin regresión en:
- [ ] Componentes compartidos reutilizados
- [ ] Prueba manual o automatizada documentada
- [ ] PR con pasos para probar

## Checklist Listo para IA

- [ ] Un solo objetivo
- [ ] Actor concreto
- [ ] CA observables
- [ ] Módulo identificado
- [ ] Fuera de alcance explícito
- [ ] Tamaño S/M (si L → partir)
- [ ] Roles/permisos indicados
- [ ] Sin catálogos hardcodeados pedidos
- [ ] Datos de prueba incluidos
- [ ] Prompt completado abajo

## Prompt para Cursor Cloud Agent ★

```text
## Objetivo
Implementar HU-<ID>: <título>

## Contexto del producto
Portal ODISEO (Amcor F2). Stack: React 19 + Vite + TypeScript + Tailwind + React Router.
Seguir design system y componentes en src/shared. No inventar catálogos hardcodeados.

## Historia
Como <rol> quiero <acción> para <beneficio>.

## Alcance
- Módulo:
- Rutas:
- Archivos sugeridos:
- Reutilizar:

## Criterios de aceptación
1. Given ... When ... Then ...
2. Given ... When ... Then ...

## Reglas de negocio
- 

## Fuera de alcance
- 

## Datos de prueba
- 

## Entregables esperados
- Código implementado
- Checklist o test de verificación
- PR con pasos para probar

## Restricciones
- No cambiar arquitectura global
- No agregar dependencias npm sin justificación
- Preferir patrones existentes (PageLayout, DataTable, forms compartidos)
```
