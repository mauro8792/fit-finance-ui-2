# 🏋️ Refactorización: Sistema de Catálogo de Ejercicios

## 📋 Resumen

Crear una tabla maestra de ejercicios (`exercise_catalog`) separada de la configuración de ejercicios en las rutinas, permitiendo:
- Reutilización de ejercicios entre diferentes días/rutinas
- Filtrado por grupo muscular
- Estadísticas unificadas para el alumno
- Mejor consistencia de datos

---

## 🎯 Objetivos

1. ✅ Eliminar duplicación de ejercicios en la base de datos
2. ✅ Facilitar la selección de ejercicios por grupo muscular para el coach
3. ✅ Mejorar el historial y estadísticas del alumno
4. ✅ Mantener consistencia en nombres de ejercicios
5. ✅ Permitir ejercicios personalizados por usuario/coach

---

## 📊 Situación Actual

### Modelo actual: `exercise`
```
exercise:
├─ id
├─ orden
├─ nombre           ← se duplica en cada día
├─ grupoMuscular    ← se duplica en cada día
├─ series
├─ repeticiones
├─ descanso
├─ rirEsperado
├─ overrides
├─ createdAt
├─ updatedAt
└─ dayId           ← vinculado directamente al día
```

### Problemas identificados:
- ❌ "Press Banca" se duplica en múltiples días
- ❌ Inconsistencias en nombres ("Press banca" vs "Press Banca")
- ❌ Estadísticas fragmentadas (cada instancia es "diferente")
- ❌ Difícil filtrar por grupo muscular en la UI
- ❌ Desperdicio de espacio en BD

---

## 🎨 Propuesta: Modelo Mejorado

### Nueva tabla: `exercise_catalog` (Catálogo Maestro)
```
exercise_catalog:
├─ id
├─ nombre              (ej: "Press Banca")
├─ grupoMuscular       (enum: pecho, espalda, piernas, hombros, brazos, core, cardio)
├─ descripcion         (opcional - cómo hacer el ejercicio)
├─ videoUrl            (opcional - tutorial)
├─ isCustom            (boolean - si es creado por usuario)
├─ createdBy           (userId - si es custom)
├─ isActive            (boolean - para soft delete)
├─ createdAt
└─ updatedAt
```

### Tabla actualizada: `routine_exercise` (antes `exercise`)
```
routine_exercise:
├─ id
├─ exerciseCatalogId   ← FK a exercise_catalog
├─ orden
├─ series
├─ repeticiones
├─ descanso
├─ rirEsperado
├─ overrides           (JSON - para personalizar nombre si es necesario)
├─ createdAt
├─ updatedAt
└─ dayId               ← FK a day
```

### Relaciones:
```
exercise_catalog (1) ─────< (N) routine_exercise
     (maestro)                  (configuración)
        │
        └─> Múltiples rutinas pueden usar el mismo ejercicio
```

---

## 🔧 Plan de Implementación

### **FASE 1: Backend - Base de Datos**

#### 1.1. Crear nueva tabla `exercise_catalog`
```sql
CREATE TABLE exercise_catalog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  grupoMuscular ENUM('pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'core', 'cardio') NOT NULL,
  descripcion TEXT,
  videoUrl VARCHAR(500),
  isCustom BOOLEAN DEFAULT FALSE,
  createdBy INT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_grupo_muscular (grupoMuscular),
  INDEX idx_nombre (nombre),
  INDEX idx_created_by (createdBy),
  FOREIGN KEY (createdBy) REFERENCES user(id) ON DELETE SET NULL
);
```

#### 1.2. Migrar datos existentes
```sql
-- Insertar ejercicios únicos del sistema actual al catálogo
INSERT INTO exercise_catalog (nombre, grupoMuscular, isCustom, createdBy)
SELECT DISTINCT nombre, grupoMuscular, FALSE, NULL
FROM exercise
WHERE nombre IS NOT NULL AND grupoMuscular IS NOT NULL;
```

#### 1.3. Modificar tabla `exercise` → `routine_exercise`
```sql
-- Agregar columna para FK al catálogo
ALTER TABLE exercise 
ADD COLUMN exerciseCatalogId INT AFTER id;

-- Actualizar referencias (vincular ejercicios existentes con el catálogo)
UPDATE exercise e
INNER JOIN exercise_catalog ec ON e.nombre = ec.nombre AND e.grupoMuscular = ec.grupoMuscular
SET e.exerciseCatalogId = ec.id;

-- Eliminar columnas redundantes (después de verificar que todo está OK)
ALTER TABLE exercise 
DROP COLUMN nombre,
DROP COLUMN grupoMuscular;

-- Renombrar tabla
RENAME TABLE exercise TO routine_exercise;

-- Agregar FK constraint
ALTER TABLE routine_exercise
ADD CONSTRAINT fk_routine_exercise_catalog
FOREIGN KEY (exerciseCatalogId) REFERENCES exercise_catalog(id) ON DELETE RESTRICT;
```

---

### **FASE 2: Backend - API**

#### 2.1. Crear endpoints para `exercise_catalog`

**GET /api/exercise-catalog**
- Query params: `?grupoMuscular=pecho&search=press`
- Devuelve lista de ejercicios del catálogo
- Incluye ejercicios del sistema + custom del usuario

**POST /api/exercise-catalog**
- Crear ejercicio personalizado
- Body: `{ nombre, grupoMuscular, descripcion }`
- Marca como `isCustom: true`

**GET /api/exercise-catalog/:id**
- Detalle de un ejercicio

**PUT /api/exercise-catalog/:id**
- Editar ejercicio (solo si es custom y del usuario)

**DELETE /api/exercise-catalog/:id**
- Soft delete (marcar `isActive: false`)

#### 2.2. Actualizar endpoints de rutinas

**POST /api/days/:dayId/exercises**
- Body cambia de:
  ```json
  {
    "nombre": "Press Banca",
    "grupoMuscular": "pecho",
    "series": 4,
    ...
  }
  ```
- A:
  ```json
  {
    "exerciseCatalogId": 15,
    "series": 4,
    "repeticiones": "8-12",
    ...
  }
  ```

**GET /api/days/:dayId/exercises**
- Hacer JOIN con `exercise_catalog` para devolver:
  ```json
  {
    "id": 123,
    "exerciseCatalogId": 15,
    "exercise": {
      "id": 15,
      "nombre": "Press Banca",
      "grupoMuscular": "pecho"
    },
    "series": 4,
    ...
  }
  ```

---

### **FASE 3: Frontend - UI del Coach**

#### 3.1. Selector de ejercicios con filtro

**Componente: `ExerciseCatalogSelector.jsx`**
```jsx
<ExerciseCatalogSelector 
  onSelect={(exercise) => handleAddExercise(exercise)}
  onCreateCustom={(newExercise) => handleCreateCustomExercise(newExercise)}
/>
```

**Flujo:**
1. Coach hace clic en "Agregar ejercicio"
2. Modal/Dialog con:
   - Filtro por grupo muscular (chips/tabs)
   - Barra de búsqueda
   - Lista de ejercicios del catálogo
   - Botón "Crear ejercicio personalizado"
3. Al seleccionar → abre formulario para configurar series, reps, etc.

#### 3.2. Actualizar vistas de edición de rutinas

**Archivos a modificar:**
- `src/components/MicrocycleDetail.jsx`
- `src/scene/coach/CreateRoutine.jsx` (si existe)

**Cambios:**
- Reemplazar input de texto libre por selector del catálogo
- Mantener opción de editar configuración (series, reps, descanso)

---

### **FASE 4: Frontend - UI del Alumno**

#### 4.1. Actualizar historial

**Archivo: `src/scene/student/TrainingHistory.jsx`**

**Ventajas automáticas:**
- ✅ Los ejercicios ya estarán unificados (mismo `exerciseCatalogId`)
- ✅ Las estadísticas se agruparán correctamente
- ✅ La búsqueda será más precisa

**Cambios mínimos necesarios:**
- Actualizar queries para hacer JOIN con `exercise_catalog`
- El resto debería funcionar igual

#### 4.2. Vista de ejercicio

**Archivo: `src/scene/student/StudentRoutine.jsx`**

**Cambios:**
- Los ejercicios seguirán mostrándose igual
- Opcionalmente: Mostrar descripción/video del ejercicio del catálogo

---

## 📦 Datos Semilla (Seed) para `exercise_catalog`

### Ejercicios comunes por grupo muscular:

**Pecho:**
- Press Banca
- Press Inclinado
- Aperturas con Mancuernas
- Fondos
- Press con Mancuernas

**Espalda:**
- Dominadas
- Remo con Barra
- Jalón al Pecho
- Peso Muerto
- Remo con Mancuernas

**Piernas:**
- Sentadilla
- Peso Muerto Rumano
- Prensa
- Zancadas
- Curl Femoral

**Hombros:**
- Press Militar
- Elevaciones Laterales
- Elevaciones Frontales
- Face Pulls
- Press Arnold

**Brazos:**
- Curl con Barra
- Extensiones de Tríceps
- Curl Martillo
- Fondos en Paralelas
- Curl Concentrado

**Core:**
- Plancha
- Abdominales
- Elevación de Piernas
- Russian Twist
- Dead Bug

**Cardio:**
- Cinta
- Bicicleta
- Remo
- Elíptica
- Saltos

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear migración para tabla `exercise_catalog`
- [ ] Crear script de seed con ejercicios comunes
- [ ] Migrar datos existentes de `exercise` a `exercise_catalog`
- [ ] Crear migración para modificar tabla `exercise` → `routine_exercise`
- [ ] Actualizar modelos (Sequelize/Prisma/etc.)
- [ ] Crear endpoints CRUD para `exercise_catalog`
- [ ] Actualizar endpoints de rutinas para usar `exerciseCatalogId`
- [ ] Testing de endpoints

### Frontend - Coach
- [ ] Crear componente `ExerciseCatalogSelector`
- [ ] Integrar selector en creación de rutinas
- [ ] Agregar filtro por grupo muscular
- [ ] Agregar opción de crear ejercicio custom
- [ ] Actualizar formulario de edición de ejercicios
- [ ] Testing de UI

### Frontend - Alumno
- [ ] Actualizar queries en `StudentRoutine.jsx`
- [ ] Actualizar queries en `TrainingHistory.jsx`
- [ ] Verificar que estadísticas funcionen correctamente
- [ ] Testing de UI

### Testing General
- [ ] Probar migración con datos existentes
- [ ] Verificar integridad referencial
- [ ] Probar creación de rutinas nuevas
- [ ] Probar historial del alumno
- [ ] Probar ejercicios custom
- [ ] Probar edge cases (eliminar ejercicio usado, etc.)

---

## 🚨 Consideraciones Importantes

### 1. Integridad Referencial
- ❗ No permitir eliminar ejercicios del catálogo si están en uso
- Solución: Soft delete (`isActive: false`) o validación en API

### 2. Ejercicios Custom
- ✅ Coach puede crear ejercicios personalizados
- ✅ Solo visible para ese coach y sus alumnos
- Opcional: Permitir "publicar" ejercicios custom al catálogo global

### 3. Migración de Datos
- ⚠️ **CRÍTICO**: Hacer backup antes de migrar
- Verificar duplicados antes de eliminar columnas
- Probar en ambiente de desarrollo primero

### 4. Retrocompatibilidad
- Considerar mantener columnas antiguas temporalmente
- Deprecar gradualmente el sistema antiguo

### 5. Performance
- Agregar índices en `exercise_catalog` (nombre, grupoMuscular)
- Considerar caché para ejercicios del catálogo

---

## 📈 Beneficios Esperados

### Para el Coach:
- ⚡ Selección más rápida de ejercicios
- 🎯 Filtrado por grupo muscular
- 📚 Biblioteca de ejercicios reutilizables
- 🔧 Menos errores de tipeo

### Para el Alumno:
- 📊 Estadísticas más precisas
- 🔍 Búsqueda de historial mejorada
- 📈 Progreso unificado por ejercicio
- 📱 Mejor experiencia en PWA

### Para el Sistema:
- 💾 Menos redundancia de datos
- 🚀 Queries más eficientes
- 🛡️ Mayor consistencia de datos
- 🔄 Más fácil de mantener

---

## 🔄 Plan de Rollback

Si algo sale mal:
1. Restaurar backup de base de datos
2. Revertir cambios en API (git revert)
3. Revertir cambios en frontend (git revert)
4. Las columnas antiguas se mantienen temporalmente como fallback

---

## 📝 Notas Adicionales

- Considerar agregar imágenes/iconos para cada ejercicio
- Posible integración con biblioteca de ejercicios externa (Wger API, etc.)
- Gamificación: badges por ejercicios completados
- Análisis: ejercicios más populares, recomendaciones

---

**Fecha de creación:** 2025-11-05  
**Última actualización:** 2025-11-05  
**Estado:** 📋 Planificación  
**Prioridad:** Alta  

