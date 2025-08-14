# Plan de Mejoras para el Sistema de Cuotas con Sport Plans

## Estado Actual

El backend está funcionando correctamente:

- Los estudiantes pueden crearse con `sportPlanId`
- Se guardan tanto `sport` como `sportPlan`
- El response incluye ambas entidades correctamente

El frontend ha sido mejorado para mostrar la información del plan:

- ✅ Modal de visualización de estudiante mejorado
- ✅ Lista de estudiantes muestra plan específico
- ✅ Vista de detalle del coach mejorada

## Próximos Pasos para el Sistema de Cuotas

### 1. Actualizar la Generación de Cuotas en el Backend

**Archivo:** `src/fee/fee.service.ts`

**Cambios necesarios:**

- Modificar el método que calcula el monto de la cuota
- Priorizar `student.sportPlan.monthlyFee` sobre `student.sport.monthlyFee`
- Mantener fallback al precio base si no hay plan específico

```typescript
private calculateFeeAmount(student: Student): number {
  // Priorizar plan específico
  if (student.sportPlan && student.sportPlan.monthlyFee) {
    return parseFloat(student.sportPlan.monthlyFee.toString());
  }

  // Fallback al precio base del deporte
  if (student.sport && student.sport.monthlyFee) {
    return parseFloat(student.sport.monthlyFee.toString());
  }

  // Valor por defecto si no hay información
  return 0;
}
```

### 2. Actualizar las Relaciones en las Consultas

**Archivos afectados:**

- `src/student/student.service.ts`
- `src/fee/fee.service.ts`

**Cambios necesarios:**

- Asegurar que las consultas incluyan las relaciones `sportPlan` y `sport`
- Actualizar los métodos `findAll`, `findOne` para incluir estas relaciones

### 3. Frontend - Mostrar Información de Cuotas Mejorada

**Archivos a actualizar:**

- `src/scene/student/StudentFees.jsx`
- `src/scene/fees/index.jsx`

**Mejoras:**

- Mostrar en las cuotas si se está usando precio de plan o precio base
- Indicar qué plan específico está aplicando el precio
- Historial de cambios de plan (futuro)

### 4. Validaciones y Reglas de Negocio

**Reglas a implementar:**

- Si un estudiante cambia de plan, las cuotas futuras deben usar el nuevo precio
- Las cuotas ya generadas mantienen el precio original
- Validar que el plan pertenezca al mismo deporte del estudiante

### 5. Migración de Datos Existentes

**Script de migración:**

- Actualizar estudiantes existentes para que tengan `sportPlanId` null
- Verificar que las cuotas existentes sigan funcionando correctamente

## Estructura de Base de Datos Actualizada

```
students:
- id
- firstName, lastName, etc.
- sportId (FK) -> sports.id
- sportPlanId (FK, nullable) -> sport_plans.id

Relaciones:
- student.sport (1:N)
- student.sportPlan (1:N, opcional)
- sportPlan.sport (N:1)

Lógica de precios:
1. Si student.sportPlanId existe -> usar sportPlan.monthlyFee
2. Si no -> usar sport.monthlyFee
3. Validar que sportPlan.sportId === student.sportId
```

## Beneficios del Sistema

1. **Flexibilidad de precios:** Cada deporte puede tener múltiples planes de precios
2. **Escalabilidad:** Fácil agregar nuevos planes sin afectar la estructura base
3. **Transparencia:** El usuario ve claramente qué plan está pagando
4. **Mantenibilidad:** Separación clara entre deporte base y planes específicos

## Implementación Sugerida

**Fase 1:** ✅ Completada

- Backend support para sportPlanId
- Frontend mejorado para visualización

**Fase 2:** Pendiente

- Actualizar generación de cuotas
- Mejorar consultas de base de datos

**Fase 3:** Futuro

- Sistema de cambio de planes
- Historial de precios
- Reportes por plan específico
