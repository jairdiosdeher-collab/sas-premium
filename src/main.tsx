import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against unhandled rejections from background Firebase Installations or third-party telemetry
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (
      msg.includes('installations') ||
      msg.includes('API key not valid') ||
      msg.includes('request-failed') ||
      event?.reason?.code === 'installations/request-failed'
    ) {
      event.preventDefault();
      console.warn('Firebase background installation request silently handled:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);

