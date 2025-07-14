# 🏋️‍♂️ FitFinance - Frontend

Sistema de gestión para gimnasios y centros deportivos. Interfaz moderna construida con React, Vite y Material-UI.

## 🚀 Enlaces de la Aplicación

- **🌐 Frontend Live**: [Vercel Deploy](https://fit-finance-ui-2.vercel.app)
- **⚙️ Backend API**: [https://fit-finance-backend-8lhp.onrender.com](https://fit-finance-backend-8lhp.onrender.com)
- **📚 API Docs**: [https://fit-finance-backend-8lhp.onrender.com/api](https://fit-finance-backend-8lhp.onrender.com/api)

## 🔑 Usuarios de Prueba

Para probar la aplicación, puedes usar estos usuarios creados con el seed:

### 👨‍💼 Administrador

- **Email**: `admin@fitfinance.com`
- **Contraseña**: `Admin123!`
- **Permisos**: Acceso completo al sistema

### 👤 Usuario Regular

- **Email**: `user@fitfinance.com`
- **Contraseña**: `User123!`
- **Permisos**: Acceso básico

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaces de usuario
- **Vite** - Herramienta de build rápida
- **Material-UI (MUI)** - Componentes de diseño
- **Redux Toolkit** - Gestión de estado
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **SweetAlert2** - Alertas y modales
- **MercadoPago SDK** - Integración de pagos

## 🏗️ Estructura del Proyecto

```
src/
├── api/                 # Configuración de API (Axios)
├── components/          # Componentes reutilizables
├── pages/              # Páginas principales
├── store/              # Redux store y slices
├── hooks/              # Custom hooks
├── utils/              # Utilidades
└── assets/             # Recursos estáticos
```

## 🚀 Desarrollo Local

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/mauro8792/fit-finance-ui-2.git
   cd fit-finance-ui-2
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   # Crear archivo .env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Ejecutar en desarrollo**

   ```bash
   npm run dev
   ```

5. **Abrir navegador**
   ```
   http://localhost:5173
   ```

## 🏭 Producción

### Build

```bash
npm run build
```

### Preview local

```bash
npm run preview
```

## 🌐 Deploy

### Variables de Entorno en Producción

```bash
VITE_API_URL=https://fit-finance-backend-8lhp.onrender.com/api
VITE_APP_TITLE=FitFinance - Demo Cliente
VITE_APP_ENV=production
```

### Plataformas Soportadas

- ✅ **Vercel** (Recomendado)
- ✅ **Netlify**
- ✅ **Render**

## 📊 Funcionalidades

### 🔐 Autenticación

- Login con email y contraseña
- Autenticación JWT
- Roles de usuario (admin, user, super-admin)

### 👥 Gestión de Estudiantes

- CRUD completo de estudiantes
- Asignación de deportes
- Seguimiento de estado (activo/inactivo)

### 🏃‍♂️ Gestión de Deportes

- Registro de diferentes disciplinas
- Configuración de cuotas mensuales
- Descripciones detalladas

### 💰 Sistema de Pagos

- Gestión de cuotas mensuales
- Estados de pago (pendiente, parcial, completado)
- Integración con MercadoPago

### 📈 Dashboard

- Estadísticas en tiempo real
- Resúmenes financieros
- Métricas de estudiantes activos

## 🔧 Configuración de API

El frontend se conecta al backend mediante variables de entorno:

```javascript
// src/api/fitFinanceApi.js
const financeApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Verificar código
```

## 🐛 Problemas Conocidos

- El primer deploy puede tardar unos minutos en cargar (Render free tier)
- Refresh de página en rutas anidadas requiere configuración de servidor

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades:

- 📧 Crear issue en GitHub
- 📱 Contactar al desarrollador

## 📄 Licencia

Este proyecto es de uso privado y educativo.

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐
