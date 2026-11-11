# Reglas de Arquitectura y Desarrollo para Antigravity (AGY)

## 1. Modularidad Estricta y Componentes Atómicos
* **Límite de tamaño:** NINGÚN archivo de componente visual (`.tsx`) debe exceder **150 - 200 líneas**. Si un componente supera este límite, DEBE subdividirse inmediatamente en subcomponentes atómicos.
* **Separación de Capas:**
  * Componentes Visuales: Exclusivamente renderizado JSX, estilos y emisión de callbacks (`onSelect`, `onToggle`, etc.).
  * Lógica y Fetch: Custom hooks dedicados o orquestadores delgados.
  * Regla de negocio: SIEMPRE en el Backend (API routes).

## 2. Directrices de UI / UX de este Proyecto
* **Vistas de Tabla:** El proyecto utiliza vistas de tabla optimizadas, legibles y de tipografía cómoda (`text-sm` en cuerpo, `text-xs font-semibold` en cabeceras y etiquetas). NO crear vistas de "Tarjetas/Cards" para tablas de egresos ni agregar selectores de vista innecesarios.
* **Vencimientos:** No existe "día de vencimiento" configurable por ítem. Todos los compromisos se liquidan a fin de mes. No añadir columnas de vencimiento a las tablas de finanzas del mes.
* **Clasificación en Tablas:** Dado que las listas ya están agrupadas por secciones (Costos Fijos, Préstamos, Compras en Cuotas, Gastos Variables), evitar columnas redundantes de "Clasificación" dentro de esas secciones.

## 3. Calidad de Código
* TypeScript estricto con interfaces claras para props.
* Mantener siempre `npx tsc --noEmit` con 0 errores.
