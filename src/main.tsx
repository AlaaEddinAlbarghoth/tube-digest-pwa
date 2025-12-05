import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { registerSW } from './pwa/registerSW';
import './styles/globals.css';

// Register service worker
registerSW();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
