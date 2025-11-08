# 🏋️ MEJORAS WIZARD MESOCICLO - PLAN COMPLETO

> **Fecha**: 7 de Noviembre, 2025  
> **Proyecto**: BraCamp - Fit Finance  
> **Objetivo**: Implementar sistema completo de creación de mesociclos con funcionalidades avanzadas

---

## 📋 ÍNDICE

1. [Sistema de Sets con AMRAP](#1-sistema-de-sets-con-amrap)
2. [Semanas de Descarga](#2-semanas-de-descarga)
3. [Sistema de Borradores y Publicación](#3-sistema-de-borradores-y-publicación)
4. [Edición Individual de Sets por Microciclo](#4-edición-individual-de-sets-por-microciclo)
5. [Resumen de Prioridades](#5-resumen-de-prioridades)

---

## 1️⃣ SISTEMA DE SETS CON AMRAP ✅ COMPLETADO

### **📌 Contexto**
En las planillas de entrenamiento reales, algunos sets tienen configuraciones especiales:
- **Set 1-2**: `8-10 reps × 40kg` (normal)
- **Set 3**: `Las que salgan × [bajar carga]` (AMRAP)

### **🎯 Objetivo**
Permitir al coach configurar cada serie individualmente con opciones AMRAP.

### **✅ Estado: COMPLETADO**
- ✅ Backend: Campos AMRAP agregados a `SetEntity`
- ✅ Migración ejecutada
- ✅ EditSetModal: Alumno puede marcar sets como AMRAP
- ✅ StudentRoutine: Visualización de sets AMRAP con fondo amarillo
- ✅ **Vista de Edición de Microciclo**: Coach puede editar sets individualmente después de crear el mesociclo

---

### **🔧 Cambios Backend**

#### **1.1. Actualizar `SetEntity`**

**Archivo**: `fit-finance/src/routine/set.entity.ts`

```typescript
@Entity()
export class SetEntity {
  // ... campos existentes ...

  // 🆕 NUEVOS CAMPOS AMRAP
  @Column({ type: 'boolean', default: false })
  isAmrap: boolean;

  @Column({ 
    type: 'enum', 
    enum: ['misma_carga', 'bajar_carga', 'kg_serie_anterior'],
    nullable: true 
  })
  amrapInstruction: string | null;

  @Column({ type: 'text', nullable: true })
  amrapNotes: string | null; // Notas personalizadas del coach
}
```

#### **1.2. Crear Migración**

**Comando**:
```bash
cd fit-finance
npm run migration:generate src/database/migrations/AddAmrapFieldsToSet
npm run migration:run
```

**Contenido esperado**:
- Agregar `isAmrap` (boolean, default false)
- Agregar `amrapInstruction` (enum nullable)
- Agregar `amrapNotes` (text nullable)

---

### **🎨 Cambios Frontend**

#### **1.3. Wizard - Configuración de Series**

**Archivo**: `fit-finance-ui-2/src/scene/coach/MesocycleWizard.jsx`

**Paso 4 - Configurar Ejercicios**:

```jsx
// Para cada serie, permitir configuración individual:

{exercise.sets.map((set, setIndex) => (
  <Box key={setIndex} sx={{ mb: 2, p: 2, border: '1px solid #444', borderRadius: 2 }}>
    <Typography variant="subtitle2">Serie {setIndex + 1}</Typography>
    
    {/* Toggle AMRAP */}
    <FormControlLabel
      control={
        <Checkbox
          checked={set.isAmrap}
          onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'isAmrap', e.target.checked)}
        />
      }
      label="🔥 Marcar como AMRAP (las que salgan)"
    />

    {set.isAmrap ? (
      <>
        {/* Instrucciones AMRAP */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Instrucción de carga</InputLabel>
          <Select
            value={set.amrapInstruction || 'misma_carga'}
            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'amrapInstruction', e.target.value)}
          >
            <MenuItem value="misma_carga">💪 Misma carga que serie anterior</MenuItem>
            <MenuItem value="bajar_carga">⬇️ Bajar carga</MenuItem>
            <MenuItem value="kg_serie_anterior">📊 Usar kg de la serie anterior</MenuItem>
          </Select>
        </FormControl>

        {/* Notas personalizadas */}
        <TextField
          fullWidth
          label="Notas adicionales (opcional)"
          placeholder="Ej: bajar 5kg, usar 80% de la carga anterior"
          value={set.amrapNotes || ''}
          onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'amrapNotes', e.target.value)}
          sx={{ mt: 2 }}
        />
      </>
    ) : (
      <>
        {/* Configuración normal: reps, load, RIR */}
        <TextField label="Rango de reps" placeholder="8-10" />
        <TextField label="Carga (kg)" type="number" />
        <TextField label="RIR esperado" type="number" />
      </>
    )}
  </Box>
))}
```

#### **1.4. Vista Estudiante - StudentRoutine.jsx**

**Archivo**: `fit-finance-ui-2/src/scene/student/StudentRoutine.jsx`

**Mostrar sets AMRAP**:

```jsx
{exercise.sets.map((set, idx) => (
  <TableRow key={idx}>
    <TableCell>
      {set.isExtra && <Chip label="EXTRA" size="small" />}
      {set.isAmrap && <Chip label="🔥 AMRAP" color="warning" size="small" />}
      Set {idx + 1}
    </TableCell>
    
    <TableCell>
      {set.isAmrap ? (
        <Box>
          <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 600 }}>
            Las que salgan
          </Typography>
          {set.amrapInstruction === 'bajar_carga' && (
            <Typography variant="caption" sx={{ color: '#999' }}>
              💡 Bajar carga de la serie anterior
            </Typography>
          )}
          {set.amrapInstruction === 'kg_serie_anterior' && (
            <Typography variant="caption" sx={{ color: '#999' }}>
              💡 Usar misma carga que serie {idx}
            </Typography>
          )}
          {set.amrapNotes && (
            <Typography variant="caption" sx={{ color: '#4caf50', fontStyle: 'italic' }}>
              📝 {set.amrapNotes}
            </Typography>
          )}
        </Box>
      ) : (
        `${set.reps || '-'} reps`
      )}
    </TableCell>
    
    {/* Resto de columnas... */}
  </TableRow>
))}
```

---

## 2️⃣ SEMANAS DE DESCARGA

### **📌 Contexto**
El último microciclo suele ser una "semana de descarga" con:
- ✅ Cargas más bajas (20-30% menos)
- ✅ RIR más alto (+2 o +3 puntos)
- ✅ Mismo volumen de series pero menos intensidad

### **🎯 Objetivo**
Permitir marcar un microciclo como "descarga" con ajustes automáticos sugeridos.

---

### **🔧 Cambios Backend**

#### **2.1. Actualizar `MicrocycleEntity`**

**Archivo**: `fit-finance/src/routine/entities/microcycle.entity.ts`

```typescript
@Entity()
export class Microcycle {
  // ... campos existentes ...

  @Column({ type: 'boolean', default: false })
  isDeload: boolean; // 🔵 Marcar como semana de descarga
}
```

#### **2.2. Crear Migración**

**Comando**:
```bash
cd fit-finance
npm run migration:generate src/database/migrations/AddIsDeloadToMicrocycle
npm run migration:run
```

---

### **🎨 Cambios Frontend**

#### **2.3. Wizard - Marcar Descarga**

**Archivo**: `fit-finance-ui-2/src/scene/coach/MesocycleWizard.jsx`

**Paso 3 - Configurar Microciclos**:

```jsx
{microcycles.map((micro, idx) => (
  <Box key={idx}>
    <Typography>Microciclo {idx + 1}</Typography>
    
    {/* Toggle Descarga */}
    <FormControlLabel
      control={
        <Checkbox
          checked={micro.isDeload}
          onChange={(e) => handleMicrocycleChange(idx, 'isDeload', e.target.checked)}
        />
      }
      label="🔵 Marcar como semana de DESCARGA"
    />

    {micro.isDeload && (
      <Alert severity="info" sx={{ mt: 1 }}>
        💡 <strong>Sugerencias para descarga:</strong>
        <ul>
          <li>Reducir carga 20-30%</li>
          <li>Aumentar RIR en +2 o +3 puntos</li>
          <li>Mantener volumen de series</li>
        </ul>
      </Alert>
    )}
  </Box>
))}
```

#### **2.4. Vista Estudiante - Indicador Visual**

**Archivo**: `fit-finance-ui-2/src/scene/student/StudentRoutine.jsx`

```jsx
{currentMicrocycle.isDeload && (
  <Alert severity="info" sx={{ mb: 2 }}>
    🔵 <strong>Semana de DESCARGA</strong> - Reduce la intensidad y recupera
  </Alert>
)}
```

---

## 3️⃣ SISTEMA DE BORRADORES Y PUBLICACIÓN

### **📌 Contexto**
El coach debe poder:
1. ✅ Crear rutinas en **borrador** (editar en varios momentos)
2. ✅ **Publicar** la rutina cuando esté lista
3. ✅ El estudiante **solo ve rutinas publicadas**
4. ✅ Poder **pausar** o **archivar** rutinas

### **🎯 Objetivo**
Sistema completo de gestión de estados de rutinas.

---

### **🔧 Cambios Backend**

#### **3.1. Crear Enum de Estados**

**Archivo**: `fit-finance/src/routine/entities/mesocycle.entity.ts`

```typescript
export enum RoutineStatus {
  DRAFT = 'draft',           // 📝 Borrador (solo coach ve)
  PUBLISHED = 'published',   // ✅ Publicada (estudiante ve)
  ACTIVE = 'active',         // 🟢 Activa (en progreso)
  PAUSED = 'paused',         // ⏸️ Pausada
  COMPLETED = 'completed',   // ✓ Completada
  ARCHIVED = 'archived'      // 📦 Archivada
}

@Entity()
export class Mesocycle {
  // ... campos existentes ...

  @Column({
    type: 'enum',
    enum: RoutineStatus,
    default: RoutineStatus.DRAFT
  })
  status: RoutineStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
```

#### **3.2. Actualizar Macrocycle con el mismo enum**

**Archivo**: `fit-finance/src/routine/entities/macrocycle.entity.ts`

```typescript
import { RoutineStatus } from './mesocycle.entity';

@Entity()
export class Macrocycle {
  // ... campos existentes ...

  @Column({
    type: 'enum',
    enum: RoutineStatus,
    default: RoutineStatus.DRAFT
  })
  status: RoutineStatus;
}
```

#### **3.3. Crear Migración**

**Comando**:
```bash
cd fit-finance
npm run migration:generate src/database/migrations/AddStatusFieldsToRoutines
npm run migration:run
```

#### **3.4. Endpoint para cambiar estado**

**Archivo**: `fit-finance/src/routine/mesocycle.controller.ts`

```typescript
@Patch(':id/status')
async updateStatus(
  @Param('id') id: number,
  @Body() body: { status: RoutineStatus }
) {
  return await this.mesocycleService.updateStatus(id, body.status);
}
```

**Archivo**: `fit-finance/src/routine/mesocycle.service.ts`

```typescript
async updateStatus(mesocycleId: number, status: RoutineStatus) {
  const mesocycle = await this.mesocycleRepo.findOne({ where: { id: mesocycleId } });
  
  if (!mesocycle) {
    throw new NotFoundException('Mesociclo no encontrado');
  }

  mesocycle.status = status;

  // Actualizar timestamps según el estado
  if (status === RoutineStatus.PUBLISHED) {
    mesocycle.publishedAt = new Date();
  } else if (status === RoutineStatus.ACTIVE) {
    mesocycle.activatedAt = new Date();
  } else if (status === RoutineStatus.COMPLETED) {
    mesocycle.completedAt = new Date();
  }

  await this.mesocycleRepo.save(mesocycle);

  return {
    success: true,
    message: `Mesociclo actualizado a ${status}`,
    mesocycle
  };
}
```

---

### **🎨 Cambios Frontend**

#### **3.5. Wizard - Paso Final (Guardar o Publicar)**

**Archivo**: `fit-finance-ui-2/src/scene/coach/MesocycleWizard.jsx`

**Paso 5 - Resumen y Crear**:

```jsx
<Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
  {/* Botón Guardar Borrador */}
  <Button
    variant="outlined"
    size="large"
    onClick={() => handleSave('draft')}
    startIcon={<SaveIcon />}
  >
    💾 Guardar como BORRADOR
  </Button>

  {/* Botón Publicar */}
  <Button
    variant="contained"
    size="large"
    onClick={() => handleSave('published')}
    startIcon={<PublishIcon />}
    sx={{ bgcolor: '#4caf50' }}
  >
    ✅ PUBLICAR y asignar al alumno
  </Button>
</Box>

<Alert severity="info" sx={{ mt: 2 }}>
  <strong>💡 Diferencia:</strong>
  <ul>
    <li><strong>Borrador:</strong> Solo tú puedes verla. Edítala cuando quieras.</li>
    <li><strong>Publicada:</strong> El alumno la verá en su panel y podrá entrenar.</li>
  </ul>
</Alert>
```

**Función handleSave**:

```javascript
const handleSave = async (status) => {
  try {
    const mesocycleData = {
      ...formData,
      status: status, // 'draft' o 'published'
      studentId: studentId,
      macrocycleId: macrocycleId
    };

    const response = await fetch(`${VITE_API_URL}/mesocycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mesocycleData)
    });

    if (response.ok) {
      const statusText = status === 'draft' ? 'borrador' : 'publicado';
      alert(`✅ Mesociclo guardado como ${statusText}`);
      navigate(`/coach/student/${studentId}/macrocycle/${macrocycleId}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al guardar el mesociclo');
  }
};
```

#### **3.6. Vista Coach - Gestión de Rutinas**

**Archivo**: `fit-finance-ui-2/src/scene/coach/MacrocycleDetail.jsx`

```jsx
{mesocycles.map((meso) => (
  <Card key={meso.id}>
    <CardContent>
      {/* Badge de estado */}
      <Chip 
        label={getStatusLabel(meso.status)} 
        color={getStatusColor(meso.status)}
        size="small"
      />
      
      <Typography variant="h6">{meso.name}</Typography>
      
      {/* Acciones según estado */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {meso.status === 'draft' && (
          <>
            <Button onClick={() => handleEdit(meso.id)}>✏️ Editar</Button>
            <Button onClick={() => handlePublish(meso.id)} color="success">
              ✅ Publicar
            </Button>
          </>
        )}
        
        {meso.status === 'published' && (
          <Button onClick={() => handleActivate(meso.id)} color="primary">
            🟢 Activar
          </Button>
        )}
        
        {meso.status === 'active' && (
          <>
            <Button onClick={() => handleView(meso.id)}>👁️ Ver Progreso</Button>
            <Button onClick={() => handlePause(meso.id)} color="warning">
              ⏸️ Pausar
            </Button>
          </>
        )}
        
        {meso.status === 'completed' && (
          <>
            <Button onClick={() => handleView(meso.id)}>👁️ Ver Resultados</Button>
            <Button onClick={() => handleArchive(meso.id)}>📦 Archivar</Button>
          </>
        )}
      </Box>
    </CardContent>
  </Card>
))}
```

**Funciones auxiliares**:

```javascript
const getStatusLabel = (status) => {
  const labels = {
    'draft': '📝 BORRADOR',
    'published': '✅ PUBLICADA',
    'active': '🟢 ACTIVA',
    'paused': '⏸️ PAUSADA',
    'completed': '✓ COMPLETADA',
    'archived': '📦 ARCHIVADA'
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    'draft': 'default',
    'published': 'info',
    'active': 'success',
    'paused': 'warning',
    'completed': 'secondary',
    'archived': 'default'
  };
  return colors[status] || 'default';
};

const handlePublish = async (mesocycleId) => {
  try {
    await fetch(`${VITE_API_URL}/mesocycle/${mesocycleId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' })
    });
    alert('✅ Mesociclo publicado');
    refetch();
  } catch (error) {
    console.error('Error:', error);
  }
};

// Similar para handleActivate, handlePause, etc.
```

#### **3.7. Vista Estudiante - Filtrar Solo Publicadas**

**Archivo**: `fit-finance-ui-2/src/scene/student/StudentRoutine.jsx`

**Al cargar rutina**:

```javascript
useEffect(() => {
  const fetchRoutine = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/student/${studentId}/active-routine`);
      const data = await response.json();
      
      // Backend ya filtra solo rutinas con status 'active' o 'published'
      if (data.mesocycle) {
        setCurrentRoutine(data.mesocycle);
      } else {
        setNoRoutineMessage('No tienes una rutina activa asignada');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchRoutine();
}, [studentId]);
```

**Backend - Endpoint para estudiante**:

```typescript
// fit-finance/src/routine/mesocycle.controller.ts
@Get('student/:studentId/active-routine')
async getActiveRoutine(@Param('studentId') studentId: number) {
  const mesocycle = await this.mesocycleService.findOne({
    where: { 
      student: { id: studentId },
      status: In([RoutineStatus.ACTIVE, RoutineStatus.PUBLISHED])
    },
    order: { activatedAt: 'DESC' }
  });

  return { mesocycle };
}
```

---

## 4️⃣ EDICIÓN INDIVIDUAL DE SETS POR MICROCICLO ✅ COMPLETADO

### **📌 Contexto**
El wizard crea una estructura genérica que se replica en todos los microciclos. Sin embargo, en la práctica real:
- **Microciclo 1-2**: Sets normales
- **Microciclo 3**: Algunos sets cambian a AMRAP
- **Microciclo 4**: Cargas progresivas diferentes

### **🎯 Solución Implementada**
Vista de edición de microciclo individual donde el coach puede:
- Ver todos los ejercicios y sets del microciclo
- Editar cada set individualmente (reps, carga, RIR, descanso)
- Marcar/desmarcar sets como AMRAP
- Configurar instrucciones AMRAP específicas

---

### **🔧 Implementación**

#### **4.1. Componente `EditMicrocycleSets.jsx`**

**Características**:
- ✅ Modal de diálogo con scroll interno
- ✅ Agrupación por días y ejercicios
- ✅ Accordions colapsables para cada ejercicio
- ✅ Formulario completo para cada set:
  - Reps (número)
  - Carga (kg, con decimales)
  - RIR (texto)
  - Descanso (segundos)
  - Toggle AMRAP
  - Select de instrucción AMRAP
  - Campo de notas AMRAP
- ✅ Visual diferenciado para sets AMRAP (fondo amarillo, border dorado)

#### **4.2. Backend - Endpoint de Actualización**

**Endpoint**: `PATCH /microcycle/:id/sets`

Método `updateSets()` en `microcycle.service.ts`:
- Recibe array de sets con sus nuevos valores
- Actualiza cada set en la BD usando Promise.all
- Retorna confirmación de éxito

#### **4.3. Integración en `MicrocycleDetail.jsx`**

- ✅ Botón "✏️ Editar Sets" en el header del microciclo
- ✅ Estado `editSetsModalOpen`
- ✅ Función `handleSaveEdits()` para refrescar datos

---

### **🎨 Flujo de Uso**

```
1. Coach crea mesociclo con el wizard (estructura genérica)
   ↓
2. Wizard genera 4 microciclos idénticos
   ↓
3. Coach navega a "Ver Detalles" de Microciclo 3
   ↓
4. Coach hace click en "✏️ Editar Sets"
   ↓
5. Se abre modal con todos los ejercicios y sets
   ↓
6. Coach expande "Press Banca" → ve sus 3 sets
   ↓
7. Coach edita Set 3:
   - Marca checkbox "🔥 AMRAP"
   - Selecciona "⬇️ Bajar carga"
   - Agrega nota: "Bajar 5kg"
   ↓
8. Coach guarda cambios
   ↓
9. Solo Microciclo 3 tiene ese set como AMRAP ✅
```

---

### **💡 Ventajas**

1. ✅ **Wizard simple**: Crear estructura rápido
2. ✅ **Flexibilidad total**: Cada microciclo único
3. ✅ **Realista**: Así trabajan los coaches profesionales
4. ✅ **Progresión natural**: Facilita ajustes progresivos
5. ✅ **No destructivo**: El wizard no cambia

---

## 5️⃣ RESUMEN DE PRIORIDADES

### **📊 Orden de Implementación**

| Prioridad | Feature | Esfuerzo | Impacto | Estado |
|-----------|---------|----------|---------|--------|
| 🥇 **1** | Sistema de Borradores y Publicación | Alto | Alto | ✅ COMPLETADO |
| 🥈 **2** | Sets con AMRAP | Medio | Alto | ✅ COMPLETADO |
| 🥉 **3** | Semanas de Descarga | Bajo | Medio | ✅ COMPLETADO |
| 🎯 **4** | Edición Individual de Sets | Medio | Alto | ✅ COMPLETADO |

---

## 🎯 MEJORAS PENDIENTES (Backlog)

### **AMRAP:**
- [x] **Configurar AMRAP desde el wizard** - ✅ COMPLETADO
  - Coach puede marcar cada set individual como AMRAP
  - Configurar instrucciones (misma carga, bajar carga, kg serie anterior)
  - Agregar notas personalizadas por set AMRAP
- [x] **Configuración individual de sets en el wizard** - ✅ COMPLETADO
  - Agregar/eliminar sets por ejercicio
  - Configurar reps, carga, RIR, descanso por set
  - Visual diferenciado para sets AMRAP (fondo amarillo, 🔥)
- [ ] Mostrar instrucciones AMRAP directamente en la tabla del alumno (tooltip o columna adicional)
- [ ] Sugerencias automáticas de carga según la instrucción AMRAP
- [ ] Estadísticas específicas para sets AMRAP en el historial
- [ ] Calcular volumen ajustado para sets AMRAP

### **Sistema de Estados - Mejoras Futuras:**
- [ ] Notificaciones push cuando el coach publica una nueva rutina
- [ ] Historial de cambios de estado (audit log)
- [ ] Transiciones de estado con validación (ej: no permitir pasar de draft a active sin pasar por published)
- [ ] Dashboard con métricas por estado (cuántos mesociclos en cada estado)

### **General:**
- [ ] Exportar rutina completa a PDF
- [ ] Clonar mesociclo existente para crear uno nuevo
- [ ] Plantillas de mesociclos predefinidas
- [ ] Sistema de etiquetas/tags para categorizar rutinas

---

### **✅ Checklist Global**

#### **Backend:**
- [ ] Migración: Agregar `isAmrap`, `amrapInstruction`, `amrapNotes` a `SetEntity`
- [ ] Migración: Agregar `isDeload` a `Microcycle`
- [ ] Migración: Agregar `status`, `publishedAt`, `activatedAt`, `completedAt` a `Mesocycle` y `Macrocycle`
- [ ] Endpoint: `PATCH /mesocycle/:id/status`
- [ ] Endpoint: `GET /student/:studentId/active-routine`
- [ ] Lógica: Filtrar rutinas por estado en servicios

#### **Frontend:**
- [ ] Wizard: Configuración de sets con AMRAP (Paso 4)
- [ ] Wizard: Marcar microciclo como descarga (Paso 3)
- [ ] Wizard: Botones "Guardar Borrador" vs "Publicar" (Paso 5)
- [ ] Coach View: Gestión de estados de rutinas (badges, botones)
- [ ] Student View: Mostrar sets AMRAP con instrucciones
- [ ] Student View: Indicador visual de semana de descarga
- [ ] Student View: Filtrar solo rutinas activas/publicadas

---

## 🚀 PRÓXIMOS PASOS

1. **Revisar este documento** con el equipo
2. **Priorizar** features según necesidades
3. **Crear ramas Git** para cada feature
4. **Implementar** en el orden sugerido
5. **Testear** cada feature antes de mergear

---

## 📝 NOTAS ADICIONALES

- **Backward Compatibility**: Asegurar que rutinas existentes funcionen con `status = 'published'` por defecto
- **Permisos**: Solo coaches pueden cambiar el estado de rutinas
- **Validaciones**: No permitir activar 2 rutinas simultáneamente para el mismo estudiante
- **Notificaciones**: Considerar notificar al estudiante cuando se publique una nueva rutina (futura mejora)

---

**Última actualización**: 7 de Noviembre, 2025  
**Responsable**: Equipo BraCamp

