# 🔔 Sistema de Notificaciones - FitFinance

## Objetivo
Implementar un sistema de notificaciones para mejorar la comunicación entre coaches y alumnos.

---

## 📋 Fase 1: In-App Notifications (Campanita)

### Backend
- [ ] Crear entidad `Notification`
  - `id`, `userId`, `title`, `message`, `type`, `isRead`, `createdAt`, `metadata` (JSON)
- [ ] Crear `NotificationService` con métodos:
  - `create(userId, notification)` - Crear notificación
  - `getByUser(userId)` - Obtener notificaciones del usuario
  - `markAsRead(notificationId)` - Marcar como leída
  - `markAllAsRead(userId)` - Marcar todas como leídas
  - `getUnreadCount(userId)` - Contar no leídas
- [ ] Crear `NotificationController` con endpoints:
  - `GET /notifications` - Listar mis notificaciones
  - `GET /notifications/unread-count` - Contar no leídas
  - `PATCH /notifications/:id/read` - Marcar como leída
  - `PATCH /notifications/read-all` - Marcar todas como leídas

### Frontend
- [ ] Crear componente `NotificationBell` (campanita con badge)
- [ ] Crear componente `NotificationDrawer` o `NotificationModal` (lista de notificaciones)
- [ ] Agregar campanita al header/navbar
- [ ] Polling o WebSocket para actualizar contador en tiempo real (opcional)

### Tipos de notificaciones iniciales
| Tipo | Trigger | Destinatario |
|------|---------|--------------|
| `ROUTINE_ASSIGNED` | Coach asigna rutina | Alumno |
| `ROUTINE_UPDATED` | Coach modifica rutina | Alumno |
| `WEIGHT_LOGGED` | Alumno registra peso | Coach |
| `NEW_STUDENT` | Admin crea alumno | Coach |

---

## 📧 Fase 2: Email Notifications (Futuro)

### Backend
- [ ] Configurar servicio de email (SendGrid, Resend, Nodemailer)
- [ ] Crear templates de email HTML
- [ ] Agregar preferencias de notificación por usuario
- [ ] Crear job/queue para envío de emails

### Emails a implementar
- [ ] Bienvenida al registrarse
- [ ] Nueva rutina asignada
- [ ] Recordatorio semanal de registro de peso
- [ ] Resumen semanal para el coach

---

## 🚀 Fase 3: Push Notifications (Opcional/Futuro)

- [ ] Integrar Firebase Cloud Messaging o OneSignal
- [ ] Implementar Service Worker para recibir push
- [ ] UI para solicitar permisos
- [ ] Guardar tokens de suscripción

---

## 📊 Progreso

| Fase | Estado | Fecha inicio | Fecha fin |
|------|--------|--------------|-----------|
| Fase 1 - Campanita | 🔄 En progreso | - | - |
| Fase 2 - Emails | ⏳ Pendiente | - | - |
| Fase 3 - Push | ⏳ Pendiente | - | - |

---

## Notas
- Empezamos con la campanita porque es más fácil y funciona en todas las plataformas
- Los emails se agregan después para notificaciones importantes
- Push notifications tienen limitaciones en iOS, evaluar si vale la pena

