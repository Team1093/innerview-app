import './globals.css'

// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DeviceProvider } from './lib/DeviceContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
    <DeviceProvider>
      <App/>
    </DeviceProvider>
  //</React.StrictMode> 
)
