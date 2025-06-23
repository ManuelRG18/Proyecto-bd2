import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [zonas, setZonas] = useState<string[]>([])

  useEffect(() => {
    axios.get('http://localhost:5000/zonas')
      .then(res => setZonas(res.data))
      .catch(err => console.error('Error al obtener zonas:', err))
  }, [])

  return (
    <div className="app-container">
      <h1>Sistema de Rutas de Delivery</h1>
      <p>Lista de zonas de entrega disponibles:</p>
      <ul>
        {zonas.map((zona, index) => (
          <li key={index}>{zona}</li>
        ))}
      </ul>
    </div>
  )
}

export default App