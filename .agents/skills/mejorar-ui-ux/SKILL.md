---
name: mejorar-ui-ux
description: >-
  Audita y mejora directamente el diseño UI/UX y el código frontend de un proyecto web.
  Se activa cuando el usuario dice "MEJORAR UI UX", "mejorar ui ux", "mejora esta vista"
  o comparte código o capturas pidiendo optimizar la interfaz y experiencia de usuario.
---

# Mejorar UI UX

Esta skill analiza primero el contexto real de un proyecto web, evalúa su estado actual en una tabla comparativa y aplica directamente las mejoras de UI/UX sobre el código o propuesta de diseño, trabajando sobre la rama main.

## Cuándo Usar Esta Skill

* El usuario escribe "MEJORAR UI UX", "mejorar ui ux" o "mejora esta vista".
* El usuario pide auditar, optimizar o arreglar la interfaz o experiencia de usuario de un proyecto web.
* El usuario comparte código, archivos o una captura de su aplicación web buscando mejoras visuales, de layout o de usabilidad.

## Reglas de Diseño y Desarrollo

1. **Contexto primero, decisiones después**: Nunca asumas la arquitectura ni modifiques a ciegas. Revisa primero el código, archivos, capturas o descripción proporcionada. Si falta información crítica sobre el stack, el objetivo de la vista o los componentes existentes, haz primero entre 2 y 4 preguntas breves antes de intervenir.
2. **Iteración mínima vs. rediseño total**: Toma la vista actual como base y aplica modificaciones mínimas para conservar lo que ya funciona. Ejecuta un rediseño total únicamente cuando la estructura actual tenga fallos graves de usabilidad, jerarquía rota o impida completar el flujo principal.
3. **Lineamientos visuales obligatorios**:
   * **Arquitectura basada en componentes reutilizables** y una distribución de componentes correcta (espaciado consistente, jerarquía clara y agrupación lógica).
   * **Estética minimalista con colores pastel equilibrados**.
   * **Soporte completo para modo claro y modo oscuro** (usando tokens o variables de tema coherentes).
4. **Ejecución directa (sin generar prompts)**: No entregues un prompt para copiar y pegar en otra herramienta. Aplica directamente los cambios sobre el código del proyecto o entrega la implementación resuelta.
5. **Flujo de trabajo en Git**: Si tienes acceso al repositorio o entorno de archivos (como en Antigravity), trabaja directamente sobre la rama `main` (sin crear ramas aisladas) y valida cada cambio visual en localhost.
6. **Alcance estricto**: Actúa únicamente desde la perspectiva de Senior UI/UX Designer y Senior Frontend / Full-Stack Developer. No incluyas mecánicas de juegos, gamificación ni roles de Game Designer.

## Flujo de Trabajo

### 1. Capturar el contexto del proyecto
* Analiza los archivos, código, repositorio o captura compartidos por el usuario.
* Identifica el stack tecnológico, el propósito de la vista, los componentes actuales y el sistema de estilos.
* Si el usuario solo escribió "MEJORAR UI UX" sin dar contexto del proyecto, pídele que comparta la vista, captura o ruta de archivos antes de proponer o aplicar cambios.

### 2. Evaluar en tabla de diagnóstico
* Presenta una tabla detallada dividida en **Qué funciona (se conserva)** y **Qué no funciona (se corrige)** evaluando layout, jerarquía visual, componentes, paleta pastel y soporte claro/oscuro.
* Indica explícitamente si la estrategia será **Ajuste incremental sobre base actual** o **Rediseño total** (justificando por qué).

### 3. Aplicar directamente las mejoras
* Implementa los cambios necesarios en el código (o entrega el código/diseño completamente resuelto si se trabaja desde el chat) siguiendo los lineamientos:
  * Refactorización en componentes reutilizables y distribución limpia.
  * Estética minimalista con paleta pastel y soporte para modo claro y oscuro.
  * Modificaciones mínimas respetando la base actual (o rediseño total si la vista no funciona).
* En entornos con acceso al proyecto local (como Antigravity), aplica los cambios directamente en la rama `main`, comprueba que compile sin errores y verifica el resultado en localhost.

## Estructura de la Respuesta

Cuando ya cuentes con el contexto del proyecto, responde en este orden:

### Diagnóstico UI/UX del Proyecto

| Aspecto | Qué funciona (Conservar) | Qué no funciona (Corregir) |
| :--- | :--- | :--- |
| **Distribución y Layout** | ... | ... |
| **Componentes Reutilizables** | ... | ... |
| **Estética y Colores Pastel** | ... | ... |
| **Modo Claro / Oscuro** | ... | ... |
| **Flujo y Usabilidad** | ... | ... |

**Estrategia recomendada:** [Ajuste incremental con cambios mínimos / Rediseño total + justificación breve].

### Cambios Aplicados / Solución UI/UX
[Resumen conciso de las mejoras aplicadas directamente sobre los componentes, estilos y distribución, junto con el código actualizado si corresponde]
