import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SimpleApp from './SimpleApp';

// Initialize PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

ReactDOM.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>,
  document.getElementById('root')
);