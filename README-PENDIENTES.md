# 📋 Tareas Pendientes - Fit Finance

## 🔐 Gestión de Contraseñas 

### 1. Recuperar contraseña (FUTURO)
- [ ] Flujo de "Olvidé mi contraseña"
- [ ] Envío de email con link de recuperación
- [ ] Página para resetear contraseña

---

## ✅ Completadas Hoy (23/12/2024)

### Gestión de Contraseñas
- [x] Admin puede editar contraseña del alumno
- [x] Campo "Nueva Contraseña" en modal de editar estudiante
- [x] Campo "Confirmar Contraseña" con validación
- [x] Endpoint en backend para actualizar contraseña (`newPassword` en UpdateStudentDto)

### Gestión de Alumnos
- [x] Ocultar "Alumnos" del menú mobile, dejar solo "Gestión Alumnos"
- [x] Crear página `/admin-students/new` (reemplaza modal que no funcionaba en PWA)
- [x] Editar página `/admin-students/edit/:studentId` (reemplaza modal que se cerraba en PWA)
- [x] Stepper de 3 pasos para crear alumno
- [x] Validación de confirmar contraseña
- [x] DatePicker con formato dd/mm/aaaa en español
- [x] Botón ojito para ver/ocultar contraseñas

### Coach - Biblioteca de Plantillas
- [x] Crear página `/coach/templates/new` (reemplaza modal que se cerraba en PWA)
- [x] Editar plantilla ahora navega dentro de la app (no abre pestaña nueva)

### Coach - Microciclos
- [x] Botón "Volver" agregado en vista de detalle de microciclo
- [x] Crear página `/coach/microcycle/:id/add-exercise` (reemplaza modal que se cerraba en PWA)

### Cardio sin GPS
- [x] Quitar tracking GPS outdoor (PWA no soporta GPS en background)
- [x] Dejar solo actividades indoor con cronómetro
- [x] Restaurar estilo visual original
- [x] Opción cronómetro + registro manual

### Cronómetro persistente
- [x] Guardar sesión en localStorage
- [x] Recuperar sesión al volver

---

## 📝 Notas

- **PWA y GPS**: Las PWAs no pueden trackear GPS con la pantalla bloqueada. Es limitación del sistema operativo.
- **Modales en PWA**: Algunos modales grandes no funcionan bien en mobile. Mejor usar páginas separadas.
- **Cambiar contraseña**: El admin puede cambiar la contraseña desde "Editar Estudiante" → "🔐 Cambiar contraseña"

