import React from 'react';
import ReactDOM from 'react-dom/client';
import { FitFinanceApp } from './FitFinanceApp.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './styles.css';
import './mobile-styles.css'; // Estilos optimizados para mobile


import ThemeProvider from './theme/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <FitFinanceApp />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
