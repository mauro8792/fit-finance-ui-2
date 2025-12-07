# 🏃 Feature: Activity Tracker (GPS + Tiempo Real)

## 📋 Descripción

Sistema de tracking en tiempo real para actividades aeróbicas (caminata, running, ciclismo) usando GPS del dispositivo. Permite al usuario iniciar una actividad, ver su recorrido en un mapa, y guardar los datos automáticamente.

---

## 🎯 Objetivo

Transformar el módulo de Cardio en una herramienta completa de tracking, similar a apps como Strava, Nike Run Club, etc., pero integrada en nuestra PWA.

---

## 💰 Costos

| Tecnología | Costo | Descripción |
|------------|-------|-------------|
| Geolocation API | 🆓 GRATIS | API nativa del navegador |
| Leaflet.js | 🆓 GRATIS | Librería de mapas open source |
| OpenStreetMap | 🆓 GRATIS | Proveedor de tiles gratuito |
| Cálculos (distancia, calorías) | 🆓 GRATIS | Fórmulas matemáticas |

**Total: $0** ✅

---

## ⚠️ Limitaciones de PWA vs App Nativa

| Feature | PWA | App Nativa |
|---------|-----|------------|
| GPS mientras app activa | ✅ Funciona bien | ✅ |
| GPS en background | 🟡 Limitado (especialmente iOS) | ✅ |
| Contador de pasos | ❌ No disponible en navegadores | ✅ |
| Precisión GPS | 🟡 Buena (3-10m) | ✅ Excelente (1-3m) |
| Consumo batería | 🟡 Medio-alto | ✅ Optimizado |
| Funciona offline | 🟡 Parcial (sin mapa tiles) | ✅ |

### Workarounds:
- **Pasos**: Estimarlos basados en distancia y tipo de actividad
- **Background**: Avisar al usuario que mantenga la app abierta
- **Offline**: Cachear tiles del mapa para zonas frecuentes

---

## 🛠️ Stack Técnico

```
Frontend:
├── React + Vite (ya tenemos)
├── Leaflet.js (mapas)
├── react-leaflet (wrapper React)
└── Geolocation API (nativa)

Backend:
├── NestJS (ya tenemos)
├── Nueva entidad ActivityTrack
└── Endpoints para guardar recorridos

Base de datos:
├── Tabla activity_track (metadata)
└── Tabla activity_track_point (puntos GPS)
```

---

## 📊 Modelo de Datos

### Tabla: `activity_track`
```sql
CREATE TABLE activity_track (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id),
  activity_type VARCHAR(20) NOT NULL, -- walk, run, bike
  started_at TIMESTAMP NOT NULL,
  finished_at TIMESTAMP,
  duration_seconds INT,
  distance_meters DECIMAL(10,2),
  avg_speed_kmh DECIMAL(5,2),
  max_speed_kmh DECIMAL(5,2),
  calories_burned INT,
  elevation_gain DECIMAL(6,2),
  status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `activity_track_point`
```sql
CREATE TABLE activity_track_point (
  id SERIAL PRIMARY KEY,
  activity_track_id INT NOT NULL REFERENCES activity_track(id) ON DELETE CASCADE,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  altitude DECIMAL(7,2),
  accuracy DECIMAL(6,2),
  speed DECIMAL(5,2),
  timestamp TIMESTAMP NOT NULL,
  point_index INT NOT NULL -- orden del punto
);

CREATE INDEX idx_track_point_activity ON activity_track_point(activity_track_id);
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/activity-track/:studentId/start` | Iniciar nueva actividad |
| `POST` | `/activity-track/:trackId/point` | Agregar punto GPS |
| `POST` | `/activity-track/:trackId/points` | Agregar múltiples puntos (batch) |
| `PUT` | `/activity-track/:trackId/finish` | Finalizar actividad |
| `PUT` | `/activity-track/:trackId/cancel` | Cancelar actividad |
| `GET` | `/activity-track/:studentId` | Listar actividades |
| `GET` | `/activity-track/detail/:trackId` | Detalle con puntos |
| `DELETE` | `/activity-track/:trackId` | Eliminar actividad |

---

## 📱 Diseño UI

### Pantalla de Inicio de Actividad
```
┌─────────────────────────────────────┐
│         🏃 NUEVA ACTIVIDAD          │
│                                     │
│  Selecciona el tipo:                │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 🚶  │ │ 🏃  │ │ 🚴  │           │
│  │Walk │ │ Run │ │Bike │           │
│  └─────┘ └─────┘ └─────┘           │
│                                     │
│  📍 Esperando señal GPS...          │
│     Precisión: 5m ✅                │
│                                     │
│      [ 🟢 INICIAR ACTIVIDAD ]       │
│                                     │
└─────────────────────────────────────┘
```

### Pantalla de Actividad en Curso
```
┌─────────────────────────────────────┐
│  🏃 RUNNING                    ⏸️ ⏹️ │
├─────────────────────────────────────┤
│                                     │
│           ⏱️ 00:15:32               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      🗺️ MAPA RECORRIDO      │   │
│  │       (Leaflet Map)         │   │
│  │         📍 ← tu posición    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ 2.34  │ │ 6:42  │ │  156  │    │
│  │  km   │ │ /km   │ │ kcal  │    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  Velocidad actual: 8.9 km/h         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     [ 🛑 FINALIZAR ]        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Pantalla de Resumen (Post-Actividad)
```
┌─────────────────────────────────────┐
│  ✅ ACTIVIDAD COMPLETADA            │
├─────────────────────────────────────┤
│  🏃 Running - 15 Jun 2025           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    🗺️ MAPA DEL RECORRIDO    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⏱️ Tiempo:     00:32:15            │
│  📏 Distancia:  4.2 km              │
│  ⚡ Ritmo:      7:41 /km            │
│  🔥 Calorías:   312 kcal            │
│  📈 Vel. máx:   12.3 km/h           │
│                                     │
│  Notas: [_____________________]     │
│                                     │
│  [ 💾 GUARDAR ]  [ 🗑️ DESCARTAR ]   │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Fase 1: MVP - Tracking Básico
- [ ] Instalar Leaflet y react-leaflet
- [ ] Crear componente `ActivityTracker`
- [ ] Implementar Geolocation API
- [ ] Temporizador en tiempo real
- [ ] Cálculo de distancia (fórmula Haversine)
- [ ] Mapa básico mostrando posición actual
- [ ] Backend: entidades y endpoints básicos
- [ ] Guardar actividad al finalizar

### Fase 2: Mejoras Visuales
- [ ] Dibujar recorrido en el mapa (polyline)
- [ ] Mostrar velocidad/ritmo en tiempo real
- [ ] Estadísticas en vivo (distancia, tiempo, calorías)
- [ ] Pantalla de resumen post-actividad
- [ ] Historial de actividades con mapas miniatura

### Fase 3: Features Avanzados
- [ ] Pausar/Reanudar actividad
- [ ] Alertas por voz cada km (Web Speech API)
- [ ] Modo oscuro para el mapa
- [ ] Exportar a GPX
- [ ] Compartir recorrido (imagen)
- [ ] Objetivos de distancia/tiempo
- [ ] Integración con el módulo de Cardio existente

### Fase 4: Optimizaciones
- [ ] Cachear tiles de mapa (offline parcial)
- [ ] Optimizar puntos GPS (reducir ruido)
- [ ] Background tracking mejorado (donde sea posible)
- [ ] Compresión de datos de recorrido

---

## 🧮 Fórmulas Útiles

### Distancia entre 2 puntos GPS (Haversine)
```javascript
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
}
```

### Calorías Quemadas (estimación)
```javascript
function estimateCalories(activityType, durationMinutes, weightKg) {
  // MET values aproximados
  const MET = {
    walk: 3.5,      // Caminata normal
    walk_fast: 5.0, // Caminata rápida
    run: 9.8,       // Running 8 km/h
    run_fast: 12.0, // Running 10+ km/h
    bike: 7.5,      // Ciclismo moderado
  };
  
  const met = MET[activityType] || 5;
  // Fórmula: Calorías = MET × peso(kg) × tiempo(horas)
  return Math.round(met * weightKg * (durationMinutes / 60));
}
```

### Ritmo (pace) en min/km
```javascript
function calculatePace(distanceKm, durationMinutes) {
  if (distanceKm === 0) return null;
  const paceMinutes = durationMinutes / distanceKm;
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## 📦 Dependencias Nuevas

```bash
# Frontend
npm install leaflet react-leaflet

# Tipos (si usamos TypeScript en el futuro)
npm install -D @types/leaflet
```

---

## 🔒 Permisos Necesarios

El navegador pedirá permiso de ubicación. Debemos:
1. Explicar al usuario por qué lo necesitamos ANTES de pedirlo
2. Manejar el caso de permiso denegado
3. Mostrar indicador de GPS activo

---

## 🚀 Estado del Feature

**Fecha inicio**: Pendiente  
**Estado**: 📋 Planificado

---

## 📝 Notas

- Empezar con tracking solo mientras la app está abierta
- Para iOS, el usuario debe mantener la pantalla encendida o usar el Wake Lock API
- Considerar agregar un "modo bolsillo" que use menos batería (menos actualizaciones de mapa)
- El mapa se puede ocultar durante la actividad para ahorrar batería y mostrar solo stats

