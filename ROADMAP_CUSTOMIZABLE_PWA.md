# Roadmap: Frontend Customizable & PWA para Fit Finance

## 1. Sistema de Temas y Branding

- Crear archivo de configuración de tema (ej: `src/theme/config.js`)
  - Colores principales/secundarios
  - Logo
  - Nombre del gimnasio
  - Tipografía
- Usar librería de theming (ej: styled-components o MUI ThemeProvider)
- Permitir cargar logo y nombre desde JSON o base de datos

## 2. Estructura de Layout Flexible

- Crear componente `Layout` general que reciba tema y branding
- Dividir layout en zonas: header (logo, nombre), sidebar/menu, contenido principal, footer
- Usar componentes reutilizables para cada zona

## 3. Preparar para PWA

- Usar Vite PWA Plugin para agregar soporte PWA
- Agregar `manifest.json` con nombre, iconos, colores, etc.
- Agregar service worker para offline y push notifications

## 4. Personalización rápida

- Permitir cambiar el tema desde panel de administración o archivo de config
- Guardar configuración en localStorage, backend o archivo de settings

## 5. Siguiente paso concreto

- Empezar por el sistema de temas y layout
- Luego agregar la PWA (rápido con Vite)

---

Este roadmap te permite avanzar por etapas y tener una app lista para vender a distintos gimnasios, con personalización y soporte PWA.

Mejoras a implementar
Sidebar tipo menú hamburguesa en mobile:

El sidebar debe ocultarse en pantallas chicas y mostrarse como un Drawer lateral que se abre con un botón hamburguesa en el header.
El menú debe tener accesos rápidos a: Cuotas, Rutina, Info personal, etc.
Cards y cuotas:

Los cards deben ocupar el ancho completo en mobile.
Espaciado y tamaño de fuente adaptados para pantallas pequeñas.
Botones grandes y fáciles de tocar.
Header y navegación:

El header debe tener el botón hamburguesa en mobile.
El título y el usuario deben verse bien en todas las resoluciones.
General:

Usar breakpoints de MUI (xs, sm, md) para ajustar paddings, grid y tamaños.
Probar el flujo de pago y rutina en mobile.
Sugerencia de navegación mobile
Sidebar tipo Drawer (menú hamburguesa) con las siguientes secciones:
Cuotas
Rutina
Info personal
Salir
