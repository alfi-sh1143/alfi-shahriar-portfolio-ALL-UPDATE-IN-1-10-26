import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully catch residual iframe WebSocket drop errors so they never interrupt the application state or console logs
if (typeof window !== 'undefined') {
  const isWsError = (err: any) => 
    err?.message?.includes('WebSocket') || 
    err?.toString()?.includes('WebSocket') || 
    err?.reason?.message?.includes('WebSocket');

  window.addEventListener('unhandledrejection', (event) => {
    if (isWsError(event) || isWsError(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (isWsError(event) || isWsError(event.error)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
