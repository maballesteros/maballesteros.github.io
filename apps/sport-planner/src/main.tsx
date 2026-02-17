import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './index.css';
import { useAppStore } from './store/appStore';
import { AuthProvider } from './contexts/AuthProvider';

if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

useAppStore.getState().hydrate();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
