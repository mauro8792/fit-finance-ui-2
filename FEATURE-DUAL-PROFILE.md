# 🔄 Feature: Perfil Dual (Coach + Alumno)

## 📋 Descripción

Permitir que un **Coach** también pueda usar las funcionalidades de **Alumno** para su uso personal, con un único email/cuenta.

### Caso de Uso
> Brian es coach del gimnasio, pero también quiere trackear su propio entrenamiento, nutrición y cardio usando la misma app.

---

## 🏗️ Arquitectura

### Modelo de Datos Actual
```
USER (email, password, roles)
  ├── COACH (si rol = coach)
  └── STUDENT (si rol = user)
```

### Modelo de Datos Propuesto
```
USER (email, password, roles: ['coach', 'user'])
  ├── COACH (id: 1)
  │     └── students: [Student X, Student Y, ...]
  │
  └── STUDENT (id: X) ← Perfil personal del coach
        └── coachId: 1 (se auto-asigna)
```

### Ejemplo Concreto
```
┌─────────────────────────────────────────────────────────────┐
│  USER: brian@bracamp.com                                    │
│  roles: ['coach', 'user']                                   │
├──────────────────────────┬──────────────────────────────────┤
│  COACH (id: 1)           │  STUDENT (id: 15)                │
│  - Gestiona alumnos      │  - Su rutina personal            │
│  - Crea plantillas       │  - Su nutrición                  │
│  - Catálogo alimentos    │  - Su cardio                     │
│  - Ve progreso alumnos   │  - Su peso/medidas               │
│                          │  - coachId: 1 (él mismo)         │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación

### Login Response Actualizado
```typescript
{
  token: "jwt...",
  user: {
    id: 1,
    email: "brian@bracamp.com",
    fullName: "Brian Campillay",
    roles: ["coach", "user"]
  },
  profiles: {
    coach: {
      id: 1,
      specialization: "Musculación",
      studentsCount: 10
    },
    student: {
      id: 15,
      firstName: "Brian",
      lastName: "Campillay",
      permissions: { ... }
    }
  }
}
```

### Flujo Post-Login
```
┌─────────────────────────────────────────┐
│            LOGIN EXITOSO                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ ¿Tiene múltiples │
        │    perfiles?     │
        └────────┬────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼ SÍ                ▼ NO
┌──────────────┐    ┌──────────────┐
│  SELECTOR    │    │   DIRECTO    │
│  DE PERFIL   │    │ AL DASHBOARD │
└──────┬───────┘    └──────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  👋 Hola Brian                   │
│                                  │
│  ¿Cómo querés ingresar hoy?     │
│                                  │
│  ┌────────┐    ┌────────┐       │
│  │🏋️ COACH│    │📱 ALUMNO│       │
│  └────────┘    └────────┘       │
│                                  │
│  ☐ Recordar mi elección         │
└──────────────────────────────────┘
```

---

## 🗃️ Cambios en Base de Datos

### 1. Tabla `coaches` - Agregar campo
```sql
ALTER TABLE coaches 
ADD COLUMN has_personal_profile BOOLEAN DEFAULT false;
```

### 2. Sin cambios en `students`
- Ya tiene `coach_id` que puede apuntar al mismo coach
- Ya tiene `user_id` que apuntará al mismo user

---

## 🔌 API Endpoints

### Endpoints Modificados

#### `POST /auth/login` - Modificar response
```typescript
// Antes
{ token, user, student?, coach? }

// Después
{ token, user, profiles: { coach?, student? } }
```

#### `POST /coaches` - Agregar opción
```typescript
// Body
{
  userId: number,
  specialization: string,
  createPersonalProfile: boolean  // ← NUEVO
}
```

### Endpoints Nuevos

#### `POST /coaches/:id/activate-personal-profile`
Activa el perfil de alumno para un coach existente.

#### `GET /auth/switch-profile/:profileType`
Cambia el perfil activo (coach | student) sin re-login.

---

## 🎨 Componentes UI

### Nuevos Componentes

#### 1. `ProfileSelector.jsx`
Pantalla post-login para seleccionar perfil.

```jsx
<ProfileSelector 
  coachProfile={...}
  studentProfile={...}
  onSelect={(type) => handleProfileSelect(type)}
  onRemember={(remember) => setRememberChoice(remember)}
/>
```

#### 2. `ProfileSwitcher.jsx`
Botón en el header para cambiar de perfil sin logout.

```jsx
<ProfileSwitcher 
  currentProfile="coach"
  availableProfiles={['coach', 'student']}
  onSwitch={(newProfile) => switchProfile(newProfile)}
/>
```

### Componentes Modificados

#### `AuthLayout.jsx`
- Agregar lógica para mostrar `ProfileSelector` cuando corresponda

#### `Topbar.jsx` / Header
- Agregar `ProfileSwitcher` si tiene múltiples perfiles

#### `useAuthStore.js`
- Agregar estado `activeProfile`
- Agregar estado `availableProfiles`
- Agregar acción `switchProfile()`

#### Wizard de Crear Coach (Admin)
- Agregar checkbox "También crear perfil personal de alumno"

---

## 📦 Plan de Implementación

### Fase 1: Backend - Base de Datos y Entidades
- [ ] Crear migración para agregar `has_personal_profile` a coaches
- [ ] Actualizar `Coach` entity
- [ ] Actualizar `CreateCoachDto`

### Fase 2: Backend - Lógica de Creación
- [ ] Modificar `CoachService.create()` para crear Student si `createPersonalProfile: true`
- [ ] Auto-asignar el Student al Coach
- [ ] Asignar roles `['coach', 'user']` al User

### Fase 3: Backend - Login Response
- [ ] Modificar `AuthService.login()` para devolver `profiles`
- [ ] Modificar `AuthService.checkAuthStatus()` para devolver `profiles`
- [ ] Incluir información relevante de cada perfil

### Fase 4: Frontend - Store y Estado
- [ ] Modificar `useAuthStore.js` para manejar `profiles`
- [ ] Agregar `activeProfile` al estado
- [ ] Agregar `switchProfile()` action
- [ ] Persistir `activeProfile` en localStorage

### Fase 5: Frontend - Selector de Perfil
- [ ] Crear `ProfileSelector.jsx`
- [ ] Integrar en flujo post-login
- [ ] Manejar "Recordar mi elección"

### Fase 6: Frontend - Cambio de Perfil
- [ ] Crear `ProfileSwitcher.jsx`
- [ ] Agregar al header/topbar
- [ ] Implementar cambio sin re-login

### Fase 7: Frontend - Wizard de Coach
- [ ] Agregar checkbox en creación de coach
- [ ] Conectar con backend

### Fase 8: Testing y Ajustes
- [ ] Probar flujo completo
- [ ] Ajustar UI/UX según feedback
- [ ] Verificar que los datos no se mezclen

---

## 🧪 Casos de Test

### Test 1: Crear Coach con Perfil Personal
1. Admin crea coach con checkbox marcado
2. Verificar que se creó User con roles `['coach', 'user']`
3. Verificar que se creó registro en `coaches`
4. Verificar que se creó registro en `students`
5. Verificar que Student.coachId = Coach.id

### Test 2: Login con Perfil Dual
1. Coach con perfil dual hace login
2. Verificar que aparece selector de perfil
3. Seleccionar "Coach" → ver dashboard de coach
4. Seleccionar "Alumno" → ver dashboard de alumno

### Test 3: Cambio de Perfil
1. Logueado como Coach, click en "Cambiar a Alumno"
2. Verificar que cambia la UI sin re-login
3. Verificar que los datos mostrados son del Student

### Test 4: Datos Separados
1. Como Alumno, registrar comida
2. Cambiar a Coach
3. Verificar que la comida NO aparece en el dashboard de coach
4. Ver el alumno "Brian" en la lista de alumnos
5. Verificar que SÍ aparece la comida registrada

---

## 📝 Notas Técnicas

### Separación de Datos
- Los datos de entrenamiento, nutrición, cardio, etc. van vinculados al `studentId`
- El coach "Brian" cuando usa su perfil de alumno, usa `studentId: 15`
- Cuando gestiona alumnos, usa `coachId: 1`
- **Nunca se mezclan los datos**

### Permisos del Perfil Personal
- El Student del coach puede tener permisos restringidos si se desea
- Por defecto, todos los permisos activos
- El coach se auto-gestiona (puede editarse su propia rutina, etc.)

### LocalStorage
```javascript
// Guardar preferencia
localStorage.setItem('preferredProfile', 'coach'); // o 'student'

// Al cargar, si tiene preferencia guardada, ir directo
```

---

## 🚀 Estado Actual

| Fase | Estado | Notas |
|------|--------|-------|
| 1. Backend - BD y Entidades | ✅ Completado | Migración + entity Coach |
| 2. Backend - Lógica Creación | ✅ Completado | CoachService.createComplete() |
| 3. Backend - Login Response | ✅ Completado | AuthService con profiles |
| 4. Frontend - Store | ✅ Completado | authSlice + useAuthStore |
| 5. Frontend - Selector | ✅ Completado | ProfileSelector.jsx |
| 6. Frontend - Switcher | ✅ Completado | ProfileSwitcher.jsx + Topbar |
| 7. Frontend - Wizard Coach | ✅ Completado | Checkbox en NewCoachWizard |
| 8. Testing | 🔄 En progreso | Pendiente probar flujo completo |

---

## 📁 Archivos Creados/Modificados

### Backend
- `fit-finance/src/migrations/1765400000000-AddCoachPersonalProfile.ts` (NUEVO)
- `fit-finance/src/coach/entities/coach.entity.ts` (hasPersonalProfile)
- `fit-finance/src/coach/dto/create-complete-coach.dto.ts` (createPersonalProfile)
- `fit-finance/src/coach/coach.service.ts` (crear Student para Coach)
- `fit-finance/src/coach/coach.module.ts` (importar Student)
- `fit-finance/src/auth/auth.service.ts` (profiles en login/checkAuth/verifyToken)

### Frontend
- `fit-finance-ui-2/src/components/ProfileSelector.jsx` (NUEVO)
- `fit-finance-ui-2/src/components/ProfileSwitcher.jsx` (NUEVO)
- `fit-finance-ui-2/src/store/auth/authSlice.js` (profiles, activeProfile, selectProfile, switchProfile)
- `fit-finance-ui-2/src/hooks/useAuthStore.js` (exponer nuevas funciones)
- `fit-finance-ui-2/src/FitFinanceApp.jsx` (status select-profile)
- `fit-finance-ui-2/src/scene/global/Topbar.jsx` (ProfileSwitcher)
- `fit-finance-ui-2/src/scene/admin-coaches/NewCoachWizard.jsx` (checkbox)

---

## 📅 Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| 2025-12-13 | Creación del documento |
| 2025-12-13 | Implementación completa Fases 1-7 |


