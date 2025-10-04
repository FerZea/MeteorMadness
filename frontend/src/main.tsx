import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 👇 OBLIGATORIO para que el viewer tenga tamaño correcto
import 'cesium/Build/Cesium/Widgets/widgets.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
