import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import { useAppStore } from './store/appStore';
import { AuthProvider } from './contexts/AuthContext';

useAppStore.getState().hydrate();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
