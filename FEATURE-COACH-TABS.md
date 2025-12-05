# 🏋️ Feature: Reestructuración Vista Coach con Tabs

## 📋 Resumen

Reorganizar la vista `StudentDetail` (detalle del alumno desde la perspectiva del coach) utilizando un sistema de tabs para mejorar la organización y navegación.

---

## 🎯 Objetivo

Transformar la vista actual (cards en fila + sección de rutinas) en una interfaz con **3 tabs principales**:

1. **👤 Información** - Datos personales + Plan/Suscripción
2. **🏋️ Entrenamiento** - Rutinas, progreso, historial
3. **🍽️ Nutrición** - Objetivos + Acceso al seguimiento

---

## 📊 Estado Actual vs Propuesto

### Antes (Actual)

```
┌─────────────────────────────────────────────────────────┐
│  Header: Avatar + Nombre + Chips                        │
├─────────────────────────────────────────────────────────┤
│  [Info Personal] [Plan Deportivo] [Nutrición]  ← Cards  │
├─────────────────────────────────────────────────────────┤
│  Rutinas (Macro-ciclos)                                 │
│  [Bloque técnico] [+ Nueva]                             │
└─────────────────────────────────────────────────────────┘
```

### Después (Propuesto)

```
┌─────────────────────────────────────────────────────────┐
│  Header: Avatar + Nombre + Chips (fijo)                 │
│  [👤 Información] [🏋️ Entrenamiento] [🍽️ Nutrición]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Contenido según tab seleccionado                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estructura de cada Tab

### Tab 1: 👤 Información

Datos básicos del alumno y su suscripción.

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │ 📋 Info Personal     │  │ 💳 Plan Deportivo    │    │
│  │                      │  │                      │    │
│  │ Email: pedro@...     │  │ Plan: Ilimitado      │    │
│  │ Tel: 2235551111      │  │ Precio: $12000/mes   │    │
│  │ Nacimiento: 3/20/93  │  │ Frecuencia: 7x/sem   │    │
│  │ Alta: 1/8/2025       │  │ Tipo: Musculación    │    │
│  │                      │  │                      │    │
│  │ [✏️ Editar datos]    │  │ [🔄 Cambiar plan]    │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Componentes a reutilizar:**

- Card de información personal (ya existe)
- Card de plan deportivo (ya existe)

---

### Tab 2: 🏋️ Entrenamiento

Centro de comando para rutinas y seguimiento.

```
┌─────────────────────────────────────────────────────────┐
│  🔥 MACRO-CICLO ACTUAL                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ "Bloque técnico"                                 │   │
│  │ 📆 28/8/2025 → 28/12/2025  |  Semana 12 de 16   │   │
│  │ ████████████░░░░ 75%                            │   │
│  │                                                  │   │
│  │ [👁️ Ver rutina] [✏️ Editar] [📊 Progreso]       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ 📈 Progreso │  │ 📋 Historial│  │ 📊 Stats    │    │
│  │  Ver stats  │  │  Últimos    │  │  Métricas   │    │
│  │  →          │  │  entrenos → │  │  →          │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  + Crear nuevo macro-ciclo                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📜 HISTORIAL DE MACRO-CICLOS                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ Adaptación   │  │ Hipertrofia  │                    │
│  │ ✅ Finalizado │  │ ✅ Finalizado │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**Acciones desde este tab:**

- Click "Ver rutina" → Navega a `/coach/alumno/:id/rutina/:macroId`
- Click "Progreso" → Navega a `/coach/alumno/:id/progreso` (futuro)
- Click "Historial" → Navega a `/coach/alumno/:id/historial` (futuro)
- Click "+ Nuevo" → Abre modal de crear macro-ciclo

---

### Tab 3: 🍽️ Nutrición

Resumen nutricional con acceso al seguimiento completo.

```
┌─────────────────────────────────────────────────────────┐
│  🎯 OBJETIVOS NUTRICIONALES                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │                    2130                          │   │
│  │                  kcal/día                        │   │
│  │                                                  │   │
│  │    🥩 174g      💧 185g      🧈 77g              │   │
│  │   Proteína     Carbos      Grasas               │   │
│  │                                                  │   │
│  │  Peso: 96.5kg | 3x/semana                       │   │
│  │                                                  │   │
│  │  [✏️ Editar objetivos]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📊 RESUMEN DE HOY                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Consumido: 0 kcal  |  Restante: 2130 kcal      │   │
│  │  ░░░░░░░░░░░░░░░░░░░░ 0%                        │   │
│  │                                                  │   │
│  │  Comidas registradas: 0                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📅 Ver Historial Nutricional Completo →        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Acciones desde este tab:**

- Click "Editar objetivos" → Abre modal NutritionProfileCard
- Click "Ver Historial Completo" → Navega a `/coach/alumno/:id/nutricion` (ya existe!)

---

## 🛠️ Plan de Implementación

### Fase 1: Estructura base de Tabs

**Archivo:** `StudentDetail.jsx`

- [ ] Agregar estado para tab activo (`useState`)
- [ ] Implementar componente `Tabs` de MUI
- [ ] Crear estructura condicional para renderizar contenido según tab
- [ ] Mantener header fijo (avatar, nombre, chips) arriba de los tabs

### Fase 2: Tab Información

**Archivo:** `StudentDetail.jsx` (o componente separado)

- [ ] Mover cards de Info Personal y Plan Deportivo al Tab 1
- [ ] Ajustar layout (2 columnas en desktop, 1 en mobile)
- [ ] Mantener funcionalidad existente

### Fase 3: Tab Entrenamiento

**Archivo:** `StudentDetail.jsx` + nuevo componente

- [ ] Crear componente `StudentTrainingTab.jsx`
- [ ] Mostrar macro-ciclo actual destacado con progreso visual
- [ ] Cards de acceso rápido (Progreso, Historial, Stats) - pueden ser placeholders por ahora
- [ ] Mover sección de macro-ciclos existente
- [ ] Botón "+ Crear nuevo macro-ciclo"
- [ ] Sección de historial de macro-ciclos finalizados

### Fase 4: Tab Nutrición

**Archivo:** `StudentDetail.jsx` + reutilizar componentes

- [ ] Crear sección de objetivos (reutilizar NutritionProfileCard en modo vista)
- [ ] Agregar resumen del día actual (consumido vs objetivo)
- [ ] Botón para navegar a vista completa de nutrición

### Fase 5: Mejoras visuales

- [ ] Animaciones de transición entre tabs
- [ ] Indicadores visuales de estado (alertas, progreso)
- [ ] Responsive design para mobile
- [ ] Colores y estilos consistentes con el resto de la app

---

## 📁 Archivos a modificar/crear

```
fit-finance-ui-2/src/scene/coach/
├── StudentDetail.jsx          ← MODIFICAR (agregar tabs)
├── StudentInfoTab.jsx         ← CREAR (opcional, o inline)
├── StudentTrainingTab.jsx     ← CREAR
├── StudentNutritionTab.jsx    ← CREAR (opcional, o inline)
└── StudentNutritionView.jsx   ← YA EXISTE (vista completa)
```

---

## 🔗 Navegación propuesta

```
/coach/alumno/:id                    ← StudentDetail (con tabs)
    │
    ├── Tab 1: Información           ← Inline en StudentDetail
    │
    ├── Tab 2: Entrenamiento         ← StudentTrainingTab
    │       │
    │       ├── /coach/alumno/:id/rutina/:macroId    ← Ver rutina (ya existe?)
    │       ├── /coach/alumno/:id/progreso           ← FUTURO
    │       └── /coach/alumno/:id/historial          ← FUTURO
    │
    └── Tab 3: Nutrición             ← Inline en StudentDetail
            │
            └── /coach/alumno/:id/nutricion          ← StudentNutritionView (YA EXISTE)
```

---

## 🎨 Consideraciones de UX

1. **Tab por defecto**: Entrenamiento (es lo que más usa el coach)
2. **Persistencia**: Recordar último tab visitado (localStorage)
3. **URL con tab**: Opcionalmente `/coach/alumno/:id?tab=entrenamiento`
4. **Mobile**: Tabs scrolleables horizontalmente si no entran
5. **Indicadores**: Badge en tab de Nutrición si hay alertas

---

## ✅ Checklist de Progreso

### Fase 1: Estructura base ✅ COMPLETADA

- [x] Estado de tabs implementado
- [x] Tabs de MUI funcionando
- [x] Header fijo arriba de tabs
- [x] Contenido condicional por tab

### Fase 2: Tab Información ✅ COMPLETADA + MEJORADA

- [x] Cards movidas al tab
- [x] Layout responsive (3 columnas equilibradas)
- [x] Funcionalidad preservada
- [x] **MEJORA**: Datos personales + Plan deportivo en columna 1
- [x] **MEJORA**: Estadísticas de Asistencia en columna 2 (placeholder)
- [x] **MEJORA**: Notas del Coach en columna 3 (placeholder)

### Fase 3: Tab Entrenamiento ✅ COMPLETADA

- [x] Macro-ciclo actual destacado
- [x] Cards de acceso rápido (Progreso, Historial, Config)
- [x] Lista de macro-ciclos
- [x] Botón crear nuevo
- [ ] Historial de finalizados (futuro - requiere backend)

### Fase 4: Tab Nutrición ✅ COMPLETADA

- [x] Objetivos visibles (NutritionProfileCard)
- [x] Card de acceso al historial
- [x] Link a vista completa

### Fase 5: Polish ✅ COMPLETADA

- [x] Transiciones suaves entre tabs (Fade 300ms)
- [x] Responsive design
- [ ] Testing completo

### Fase 6: Mejoras Tab Entrenamiento ✅ COMPLETADA

- [x] Rediseñar cards de acceso rápido (Progreso, Historial, Config)
- [x] Mejorar visualización del macro-ciclo actual (barra progreso, stats)
- [x] Agregar info útil a las cards placeholder (PRs, última sesión, preferencias)
- [x] Mejorar lista de macro-ciclos (estado: Activo/Próximo/Finalizado, mini progreso)

### Fase 7: Historial de Entrenamientos ✅ COMPLETADA

- [x] Backend: Endpoint `GET /macrocycle/history/:studentId` (por sesión)
- [x] Backend: Endpoint `GET /macrocycle/exercises/:studentId` (por ejercicio)
- [x] Backend: Stats calculadas (sesiones mes, racha, última visita, progresión)
- [x] Frontend: APIs `getTrainingHistory()` y `getExerciseHistory()`
- [x] Frontend: Card Historial con datos reales
- [x] Frontend: Tab Información - Estadísticas de Asistencia con datos reales
- [x] Indicador de constancia automático (Excelente/Constante/Regular/Irregular)
- [x] Modal con 3 tabs: "Sesiones", "Ejercicios" y "Gráficos"
- [x] Vista por ejercicio: muestra progresión de cargas, mejor carga, sets detallados
- [x] Vista de gráficos: LineChart con evolución de carga máxima y promedio por ejercicio
- [x] Selector de ejercicio para ver diferentes gráficos
- [x] Detalle por sesión debajo del gráfico

### Fase 8: Tab Nutrición Mejorado ✅ COMPLETADA

- [x] Vista rápida de objetivos (calorías, macros)
- [x] Resumen del día actual (consumido vs objetivo, barra de progreso)
- [x] Resumen semanal (adherencia, días con registro, promedio)
- [x] Mini gráfico de barras por día de la semana
- [x] Sistema de alertas automáticas (proteína baja, exceso calórico, etc.)
- [x] Acceso rápido al historial completo

### Fase 9: Backend Notas del Coach (Futuro)

- [ ] Entidad `CoachNote` para notas del coach
- [ ] Endpoints CRUD para notas
- [ ] UI para agregar/editar notas

### Fase 9: PRs y Progreso (Futuro)

- [ ] Entidad `PersonalRecord` para registrar PRs
- [ ] Endpoint para obtener PRs de un estudiante
- [ ] Card Progreso con datos reales

---

## 📋 Backlog - Vistas Pendientes

### 📈 Vista de Progreso (`/coach/alumno/:id/progreso`)

**Descripción**: Dashboard de evolución del alumno en el gimnasio.

**Funcionalidades sugeridas**:

- [ ] Gráfico de evolución de pesos levantados por ejercicio
- [ ] Comparativa mes a mes
- [ ] Records personales (PRs)
- [ ] Gráfico de asistencia/frecuencia de entrenamientos
- [ ] Métricas de volumen de entrenamiento

**Datos necesarios (backend)**:

- Historial de sets/reps/peso por ejercicio
- Registro de asistencia

---

### 📋 Vista de Historial (`/coach/alumno/:id/historial`)

**Descripción**: Lista de todos los entrenamientos completados.

**Funcionalidades sugeridas**:

- [ ] Lista cronológica de entrenamientos
- [ ] Filtros por fecha, macro-ciclo, tipo de entrenamiento
- [ ] Detalle de cada sesión (ejercicios, series, pesos)
- [ ] Exportar a PDF/Excel

**Datos necesarios (backend)**:

- Entidad `TrainingSession` o similar
- Registro de cada entrenamiento completado

---

### ⚙️ Vista de Configuración (`/coach/alumno/:id/configuracion`)

**Descripción**: Preferencias de entrenamiento del alumno.

**Funcionalidades sugeridas**:

- [ ] Días preferidos de entrenamiento
- [ ] Equipamiento disponible (si entrena en casa)
- [ ] Lesiones/restricciones
- [ ] Objetivos personales
- [ ] Notas del coach

**Datos necesarios (backend)**:

- Campos adicionales en entidad `Student` o nueva entidad `StudentPreferences`

---

## 🔮 Ideas Futuras

- [ ] **Notificaciones**: Alertar al coach si el alumno no registra entrenamientos
- [ ] **Comparativas**: Ver progreso de varios alumnos lado a lado
- [ ] **Templates**: Guardar macro-ciclos como plantillas reutilizables
- [ ] **Chat**: Comunicación directa coach-alumno dentro de la app

---

## 🚀 Estado del Feature

**Fecha inicio**: 5/12/2025
**Estado**: ✅ MVP Completado (Tabs funcionando)

```bash
# Comando para iniciar desarrollo
cd fit-finance-ui-2
npm run dev
```
