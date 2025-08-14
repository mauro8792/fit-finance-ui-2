import ReactDOM from 'react-dom/client';
import { FitFinanceApp } from './FitFinanceApp.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './styles.css';
import './mobile-styles.css'; // Estilos optimizados para mobile
import { SidebarProvider } from './contexts/SideBarContext';

import ThemeProvider from './theme/ThemeProvider';

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
