# Índice — Paquete para analistas (motor de IA ODISEO)

Documentación para definir casos de uso e historias de usuario **compatibles con Cursor Cloud Agent**, a fin de generar entregables más rápidos y seguros.

| Documento | Uso |
|-----------|-----|
| [GUIA_CASOS_USO_HISTORIAS_IA.md](./GUIA_CASOS_USO_HISTORIAS_IA.md) | Guía completa: glosario, módulos, calidad, ejemplos, prompt |
| [PLANTILLA_CASO_USO.md](./PLANTILLA_CASO_USO.md) | Formulario vacío de Caso de Uso (CU) |
| [PLANTILLA_HISTORIA_USUARIO.md](./PLANTILLA_HISTORIA_USUARIO.md) | Formulario vacío de Historia (HU) + prompt de agente |

## Flujo recomendado

1. Analista escribe el **CU** con la plantilla.
2. Parte el CU en **HU** Must/Should (una HU ≈ un PR).
3. Marca el checklist **Listo para IA** en cada HU Must.
4. Copia el **prompt** de la HU al agente de Cursor.
5. QA valida contra los CA y la tabla de datos de prueba.

## Regla de oro

> Cada historia debe poder convertirse en un prompt de agente **sin preguntas adicionales**.
