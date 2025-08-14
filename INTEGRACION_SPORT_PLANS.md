# Integración del Sistema de SportPlans - Frontend

## Resumen de Cambios

Se ha implementado un sistema completo para manejar **SportPlans** en el frontend, que permite crear diferentes planes de precios y frecuencias para cada disciplina deportiva.

## Nuevos Componentes Creados

### 1. Hook: `useSportPlansStore`

- **Ubicación**: `src/hooks/useSportPlansStore.js`
- **Propósito**: Manejo de estado y API calls para SportPlans
- **Funciones principales**:
  - `findAllSportPlans()`: Obtiene todos los planes
  - `findSportPlansBySport(sportId)`: Obtiene planes por deporte
  - `create(sportPlan)`: Crea nuevo plan
  - `update(payload)`: Actualiza plan existente
  - `deleteSportPlan(id)`: Elimina plan

### 2. Store Slice: `sportPlanSlice`

- **Ubicación**: `src/store/sportPlanSlice.js`
- **Propósito**: Redux slice para manejar estado global de SportPlans

### 3. Componente: `AddSportPlanModal`

- **Ubicación**: `src/scene/sports/AddSportPlan/index.jsx`
- **Propósito**: Modal para crear nuevos planes deportivos
- **Características**:
  - Selección de disciplina base
  - Configuración de frecuencia semanal (1-7 días)
  - Precio específico del plan
  - Descripción y estado activo/inactivo
  - Validación de formularios

### 4. Componente: `SportPlansManager`

- **Ubicación**: `src/scene/sports/SportPlansManager/index.jsx`
- **Propósito**: Vista principal para gestionar todos los SportPlans
- **Características**:
  - Vista agrupada por disciplina
  - Cards con información completa de cada plan
  - Acciones de editar/eliminar
  - Estado visual (activo/inactivo)
  - FAB para agregar nuevos planes

### 5. Componente: `SportsMainView`

- **Ubicación**: `src/scene/sports/SportsMainView/index.jsx`
- **Propósito**: Vista principal con navegación por tabs
- **Características**:
  - Tab 1: Gestión de disciplinas base
  - Tab 2: Gestión de planes de precios

### 6. Componente Actualizado: `AddStudentModal`

- **Ubicación**: `src/scene/students/AddStudent/index.jsx`
- **Mejoras implementadas**:
  - Selección de disciplina + plan específico
  - Carga dinámica de planes por disciplina
  - Vista previa del plan seleccionado
  - Fallback al precio base si no hay planes

## Integración en la Aplicación

### 1. Importar los nuevos hooks

```javascript
import { useSportPlansStore } from "../hooks";
```

### 2. Usar el componente principal

```javascript
import { SportsMainView } from "../scene/sports";

// En tu router o componente principal:
<SportsMainView />;
```

### 3. Para usar solo el gestor de planes:

```javascript
import { SportPlansManager } from "../scene/sports";

<SportPlansManager />;
```

## Estructura de Datos

### SportPlan Object

```javascript
{
  id: "uuid",
  name: "Plan 2 veces por semana",
  weeklyFrequency: 2,
  monthlyFee: 8500.00,
  description: "Plan ideal para principiantes",
  isActive: true,
  sportId: "uuid-del-deporte",
  sport: {
    id: "uuid",
    name: "Boxeo",
    monthlyFee: 10000.00
  }
}
```

### Student Object (actualizado)

```javascript
{
  // ... campos existentes
  sportId: "uuid-del-deporte",
  sportPlanId: "uuid-del-plan", // Nuevo campo opcional
}
```

## API Endpoints Requeridos

El frontend espera estos endpoints en el backend:

```
GET    /sport-plans                 - Obtener todos los planes
GET    /sport-plans/sport/:sportId  - Obtener planes por deporte
POST   /sport-plans                 - Crear nuevo plan
PATCH  /sport-plans/:id             - Actualizar plan
DELETE /sport-plans/:id             - Eliminar plan
```

## Lógica de Precios

1. **Si el estudiante tiene `sportPlanId`**: Se usa `sportPlan.monthlyFee`
2. **Si no tiene plan específico**: Se usa `sport.monthlyFee` (precio base)
3. **Compatibilidad**: El sistema es totalmente compatible con estudiantes existentes

## Flujo de Usuario

### Crear Nueva Disciplina:

1. Ir a "Disciplinas Base"
2. Crear disciplina con precio base
3. Ir a "Planes de Precios"
4. Crear planes específicos para esa disciplina

### Agregar Estudiante:

1. Seleccionar disciplina
2. Sistema carga planes disponibles automáticamente
3. Seleccionar plan específico (opcional)
4. Si no se selecciona plan, usa precio base

### Gestionar Planes:

1. Vista agrupada por disciplina
2. Crear, editar, activar/desactivar planes
3. Eliminar planes no utilizados

## Características Técnicas

- **Responsive**: Todos los componentes se adaptan a móvil
- **Validación**: Formularios con validación en tiempo real
- **Estados de carga**: Indicadores mientras se cargan datos
- **Fallbacks**: Manejo graceful de errores y datos faltantes
- **Accesibilidad**: Componentes con ARIA labels apropiados

## Próximos Pasos

1. Integrar `SportsMainView` en el router principal
2. Actualizar el componente de lista de estudiantes para mostrar plan específico
3. Crear modal de edición para SportPlans
4. Implementar filtros y búsqueda en SportPlansManager
