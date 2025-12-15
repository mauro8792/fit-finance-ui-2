# 💰 Feature: Gestión de Cuotas por Coach

## 📋 Resumen del Nuevo Enfoque

### Modelo Actual vs Nuevo

| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Quién gestiona cuotas | Solo Admin | Coach (sus alumnos) + Admin (todos) |
| Vencimiento | Día 1 del mes | Personalizado (día de ingreso del alumno) |
| Método de pago | Transferencia | Transferencia + comprobante externo (WhatsApp) |
| Aumentos | Manual, editar cada cuota | Programables por el coach |

---

## ✅ Respuestas Definidas

1. **Vencimiento** = Día de ingreso del alumno (ej: entró el 15 → vence siempre el 15)
2. **Generación de cuotas** = Automática (ya funciona con cron job)
3. **Aumentos** = Ambas opciones: todos los alumnos O selectivos
4. **Comprobante** = 100% externo (WhatsApp), no se sube a la app

---

## 🏗️ Estado Actual del Sistema

### ✅ Lo que YA existe y funciona:

#### Backend - Fee Entity (`fees` table)
```typescript
// Ya tiene estos campos:
- id, startDate, endDate, value, amountPaid
- status: 'pending' | 'partial' | 'completed'
- month, year
- student (FK), sport (FK), sportPlan (FK)
- payments[] (relación con tabla payments)
```

#### Backend - Fee Service
- ✅ Generación automática de cuotas (próximos 3 meses)
- ✅ Cron job que corre el 1ro de cada mes
- ✅ Validación de pagos secuenciales
- ✅ Obtener cuotas por estudiante
- ✅ Estadísticas (total, pagadas, parciales, pendientes)

#### Backend - Student Entity
```typescript
// Ya tiene:
- startDate: Date  ✅ <-- PODEMOS USAR ESTO PARA EL DÍA DE VENCIMIENTO
- coachId: number  ✅ <-- YA TIENE RELACIÓN CON COACH
```

#### Frontend - Vista Admin (Fees)
- ✅ Lista de cuotas por período (mes/año)
- ✅ Filtros por estado (pagada, parcial, pendiente)
- ✅ Modal para ver detalle
- ✅ Modal para agregar pago
- ✅ Estadísticas

#### Frontend - Vista Alumno (StudentFees)
- ✅ Historial de cuotas del alumno
- ✅ Resumen (total, pagadas, parciales, pendientes)

---

## 🔧 Lo que FALTA implementar

### 1. Backend - Coach Entity (agregar campos)
```typescript
@Column({ nullable: true })
paymentAlias: string;  // Alias/CBU para transferencias

@Column({ nullable: true })
paymentNotes: string;  // Instrucciones de pago opcionales
```

### 2. Backend - Fee Entity (agregar campos)
```typescript
@Column({ type: 'date', nullable: true })
dueDate: Date;  // Fecha de vencimiento específica (día de ingreso)

@Column({ default: false })
markedPaidByCoach: boolean;  // Si lo marcó el coach manualmente

@Column({ nullable: true })
paymentReference: string;  // Referencia opcional del comprobante
```

### 3. Backend - Nueva tabla `fee_price_schedules`
```typescript
@Entity('fee_price_schedules')
export class FeePriceSchedule {
  id: number;
  coachId: number;          // FK a coaches
  effectiveFrom: Date;      // Desde cuándo aplica el precio
  amount: number;           // Nuevo monto
  sportId?: number;         // Opcional: solo para este deporte
  sportPlanId?: number;     // Opcional: solo para este plan
  studentId?: number;       // Opcional: solo para este alumno (aumento individual)
  appliesToAll: boolean;    // Si aplica a todos los alumnos del coach
  createdAt: Date;
}
```

### 4. Backend - Nuevos endpoints

```typescript
// Para coaches
GET    /fee/coach/my-students-fees       // Cuotas de mis alumnos
POST   /fee/:id/mark-paid-by-coach       // Marcar como pagada
PUT    /coach/payment-config             // Actualizar alias/notas

// Para aumentos
POST   /fee/price-schedule               // Programar aumento
GET    /fee/price-schedule/coach         // Ver mis aumentos programados
DELETE /fee/price-schedule/:id           // Cancelar aumento

// Para alumnos
GET    /fee/my-payment-info              // Obtener alias del coach para pagar
```

### 5. Backend - Modificar generación de cuotas

```typescript
// En generateFeesForStudents():
// 1. Calcular dueDate usando student.startDate (día del mes)
// 2. Aplicar precio del fee_price_schedules si existe para ese período
```

### 6. Frontend - Vista Coach (NUEVA)

#### 6.1 Dashboard Coach - Sección Cuotas
```
┌─────────────────────────────────────────┐
│ 💰 Cuotas de Mis Alumnos                │
├─────────────────────────────────────────┤
│ 🔴 3 Vencidas   🟡 5 Por vencer   🟢 12 Al día │
├─────────────────────────────────────────┤
│ Lucas Pérez     Dic 2024   $35.000  [Marcar Pagada] │
│ María García    Dic 2024   $35.000  [Marcar Pagada] │
└─────────────────────────────────────────┘
```

#### 6.2 Página de Configuración de Pagos
```
┌─────────────────────────────────────────┐
│ ⚙️ Configuración de Pagos               │
├─────────────────────────────────────────┤
│ Alias/CBU: [coach.lucas.mp_________]    │
│ Instrucciones: [Transferir y enviar     │
│                 comprobante por WA]     │
├─────────────────────────────────────────┤
│ 📈 Programar Aumento                    │
│ Desde: [Enero 2025 ▼]                   │
│ Nuevo monto: [$40.000___]               │
│ Aplicar a: ○ Todos   ○ Seleccionar      │
│                        [Programar]      │
└─────────────────────────────────────────┘
```

### 7. Frontend - Vista Alumno (MEJORAR)

```
┌─────────────────────────────────────────┐
│ 💳 Mi Cuota - Diciembre 2024            │
├─────────────────────────────────────────┤
│ Monto: $35.000                          │
│ Vence: 15 de diciembre                  │
│ Estado: 🟡 Pendiente                    │
├─────────────────────────────────────────┤
│ 📱 Datos para transferencia:            │
│ Alias: coach.lucas.mp                   │
│                                         │
│ 💡 Hacé la transferencia y enviá el     │
│    comprobante a tu coach por WhatsApp  │
└─────────────────────────────────────────┘
```

---

## 📅 Plan de Implementación

### Fase 1: Coach ve y marca cuotas ✅ COMPLETADA
- [x] Agregar `paymentAlias`, `paymentNotes` a coach entity
- [x] Migración para agregar columnas (`1734200000000-AddCoachPaymentConfig.ts`)
- [x] Endpoint `GET /fee/coach/my-students-fees`
- [x] Endpoint `POST /fee/:id/mark-paid-by-coach`
- [x] Endpoint `PUT /fee/coach/payment-config`
- [x] Vista Coach: lista de cuotas de sus alumnos (`/coach/fees`)
- [x] Botón "Marcar como Pagada" con diálogo de confirmación
- [x] Filtros por estado y búsqueda
- [x] Estadísticas (total, pagadas, parciales, pendientes)
- [x] Vencimiento calculado por día de ingreso del alumno

#### 🔧 Mejoras pendientes para Fase 1:
- [ ] Opción de pago parcial (ingresar monto específico)
- [ ] Campo para referencia del comprobante (opcional)
- [ ] Historial de pagos por cuota

### Fase 2: Vencimiento personalizado ✅ COMPLETADA
- [x] Agregar `dueDate` a Fee entity
- [x] Migración para calcular dueDate de cuotas existentes (`1734200100000-AddFeeDueDate.ts`)
- [x] Lógica de generación de cuotas con fecha de vencimiento
- [x] Método `calculateDueDate()` que maneja días 29, 30, 31

### Fase 3: Alias de pago ✅ COMPLETADA
- [x] Campos `paymentAlias`, `paymentNotes` en Coach
- [x] Endpoint `PUT /fee/coach/payment-config`
- [x] Endpoint `GET /fee/my-coach-payment-info` (para alumnos)
- [x] Vista Coach: sección desplegable para configurar alias
- [x] Vista Alumno: tarjeta con datos de transferencia + botón copiar

### Fase 4: Aumentos programados ✅ COMPLETADA
- [x] Crear entity `FeePriceSchedule`
- [x] Migración `1734200300000-CreateFeePriceSchedule.ts`
- [x] Endpoints CRUD (`POST/GET/DELETE /fee/price-schedule`)
- [x] UI para programar aumentos (botón "Programar Aumentos" en CoachFees)
- [x] Lógica `getApplicablePrice()` para aplicar precio en generación de cuotas
- [x] Prioridad de aumentos: Alumno específico > Plan > Deporte > Todos

### Fase 5: Precio definido por Coach ✅ COMPLETADA
- [x] Campo `defaultFeeAmount` en Coach entity
- [x] Migración `1734200400000-AddCoachDefaultFeeAmount.ts`
- [x] Lógica de generación de cuotas usa precio del coach primero
- [x] UI para configurar precio base en "Configurar Pagos"
- [x] Prioridad de precio: Coach > SportPlan > Sport

---

## 💬 Notas de Discusión

- **Días 29, 30, 31:** ✅ RESUELTO - Se usa el último día del mes si el día no existe.
  Implementado en `calculateDueDate()`

---

## 📅 Historial

| Fecha | Cambio |
|-------|--------|
| 2024-12-14 | Creación del documento |
| 2024-12-14 | Análisis de código existente completado |
| 2024-12-14 | Respuestas definidas por el usuario |

