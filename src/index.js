import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
import { BrowserRouter } from 'react-router-dom';
=======
import { HashRouter } from 'react-router-dom';
>>>>>>> 714a100 (Tamara's feedback changes)
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
<<<<<<< HEAD
    <BrowserRouter basename="/scrolli-telli">
      <App />
    </BrowserRouter>
=======
    <HashRouter>
      <App />
    </HashRouter>
>>>>>>> 714a100 (Tamara's feedback changes)
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
