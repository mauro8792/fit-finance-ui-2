import ReactDOM from 'react-dom/client';
import { FitFinanceApp } from './FitFinanceApp.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './styles.css';
import './mobile-styles.css'; // Estilos optimizados para mobile
import { SidebarProvider } from './contexts/SideBarContext';

import ThemeProvider from './theme/ThemeProvider';

// 🚀 PWA: Registro del Service Worker (automático con vite-plugin-pwa)
// El plugin inyecta automáticamente el registro del SW

// 📱 PWA: Capturar evento de instalación para Android/Chrome
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🚀 PWA: Prompt de instalación disponible');
  // Prevenir que el navegador muestre el prompt automáticamente
  e.preventDefault();
  // Guardar el evento para mostrarlo más tarde
  deferredPrompt = e;
  // Guardar en localStorage para que la app sepa que puede mostrar el botón
  localStorage.setItem('pwa-installable', 'true');
});

// 📱 Detectar cuando la PWA ya fue instalada
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalada exitosamente');
  localStorage.setItem('pwa-installed', 'true');
  deferredPrompt = null;
});

// 🍎 Para iOS: Detectar si ya está instalada como standalone
if (window.navigator.standalone === true) {
  console.log('✅ PWA ya instalada en iOS');
  localStorage.setItem('pwa-installed', 'true');
}

// Exponer función global para mostrar el prompt de instalación
window.showInstallPrompt = async () => {
  if (!deferredPrompt) {
    console.log('⚠️ No hay prompt de instalación disponible');
    return false;
  }
  
  // Mostrar el prompt
  deferredPrompt.prompt();
  
  // Esperar la respuesta del usuario
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`👤 Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
  
  deferredPrompt = null;
  return outcome === 'accepted';
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider>
      <BrowserRouter>
       <SidebarProvider>
         <FitFinanceApp />
       </SidebarProvider>
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
