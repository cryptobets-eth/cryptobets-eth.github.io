import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BookmakerProvider } from './context/BookmakerContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BookmakerProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </BookmakerProvider>
  
)
