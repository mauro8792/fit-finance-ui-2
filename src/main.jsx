import React from 'react';
import ReactDOM from 'react-dom/client';
import { FitFinanceApp } from './FitFinanceApp.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>

    <BrowserRouter>
      <FitFinanceApp />
    </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
