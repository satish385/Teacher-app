import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    });
  });
}

ReactDOM.render(<App />, document.getElementById('root'));