import { useState, useEffect } from "react"
import MapView from "./components/map-view"
import "./app.css"

// Definir la estructura del grafo de zonas
const GRAFO_ZONAS = {
  Centro: ["Norte", "Sur", "Este", "Oeste", "Plaza Mayor", "Universidad"],
  Norte: ["Centro", "Este", "Aeropuerto"],
  Sur: ["Centro", "Universidad", "Puerto", "Aeropuerto"],
  Este: ["Centro", "Norte", "Hospital", "Aeropuerto"],
  Oeste: ["Centro", "Plaza Mayor"],
  "Plaza Mayor": ["Centro", "Oeste", "Universidad"],
  Universidad: ["Centro", "Plaza Mayor", "Sur"],
  Hospital: ["Este", "Aeropuerto"],
  Aeropuerto: ["Norte", "Sur", "Este", "Hospital"],
  Puerto: ["Sur"],
}

// Algoritmo de Dijkstra simplificado para encontrar la ruta más corta
const encontrarRutaOptima = (origen: string, destino: string): { ruta: string[]; tiempo: number } => {
  if (origen === destino) return { ruta: [origen], tiempo: 0 }

  const distancias: { [key: string]: number } = {}
  const anteriores: { [key: string]: string | null } = {}
  const visitados = new Set<string>()
  const cola = new Set<string>()

  // Inicializar distancias
  Object.keys(GRAFO_ZONAS).forEach((zona) => {
    distancias[zona] = zona === origen ? 0 : Number.POSITIVE_INFINITY
    anteriores[zona] = null
    cola.add(zona)
  })

  while (cola.size > 0) {
    // Encontrar el nodo con menor distancia
    let nodoActual = ""
    let menorDistancia = Number.POSITIVE_INFINITY

    for (const nodo of cola) {
      if (distancias[nodo] < menorDistancia) {
        menorDistancia = distancias[nodo]
        nodoActual = nodo
      }
    }

    if (nodoActual === destino) break

    cola.delete(nodoActual)
    visitados.add(nodoActual)

    // Actualizar distancias de vecinos
    const vecinos = GRAFO_ZONAS[nodoActual as keyof typeof GRAFO_ZONAS] || []
    vecinos.forEach((vecino) => {
      if (!visitados.has(vecino)) {
        const nuevaDistancia = distancias[nodoActual] + 1 // Peso uniforme de 1
        if (nuevaDistancia < distancias[vecino]) {
          distancias[vecino] = nuevaDistancia
          anteriores[vecino] = nodoActual
        }
      }
    })
  }

  // Reconstruir la ruta
  const ruta: string[] = []
  let actual: string | null = destino

  while (actual !== null) {
    ruta.unshift(actual)
    actual = anteriores[actual]
  }

  // Si no hay conexión, devolver ruta vacía
  if (ruta[0] !== origen) {
    return { ruta: [], tiempo: 0 }
  }

  const tiempo = (ruta.length - 1) * 5 + Math.floor(Math.random() * 10) // 5 min base + variación
  return { ruta, tiempo }
}

function App() {
  const [zonas, setZonas] = useState<string[]>([])
  const [origen, setOrigen] = useState<string>("")
  const [destino, setDestino] = useState<string>("")
  const [ruta, setRuta] = useState<string[]>([])
  const [tiempoTotal, setTiempoTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [tipoVista, setTipoVista] = useState<"grafo" | "calles">("grafo")

  useEffect(() => {
    const zonasDisponibles = Object.keys(GRAFO_ZONAS)
    setZonas(zonasDisponibles)
  }, [])

  const buscarRuta = async () => {
    if (origen && destino && origen !== destino) {
      setLoading(true)

      // Simular tiempo de cálculo
      setTimeout(() => {
        const resultado = encontrarRutaOptima(origen, destino)
        setRuta(resultado.ruta)
        setTiempoTotal(resultado.tiempo)
        setLoading(false)
      }, 800)
    }
  }

  const limpiarRuta = () => {
    setRuta([])
    setTiempoTotal(null)
    setOrigen("")
    setDestino("")
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>🛵 Sistema de Rutas de Delivery</h1>
        <p className="subtitle">Optimización de Red de Entrega con Algoritmo de Dijkstra</p>
      </header>

      <div className="controles-superiores">
        <div className="control-group">
          <label htmlFor="origen">
            📍 Origen:
            <select id="origen" value={origen} onChange={(e) => setOrigen(e.target.value)} className="select-zona">
              <option value="">Seleccionar zona de origen</option>
              {zonas.map((z, i) => (
                <option key={i} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="destino">
            🎯 Destino:
            <select id="destino" value={destino} onChange={(e) => setDestino(e.target.value)} className="select-zona">
              <option value="">Seleccionar zona de destino</option>
              {zonas.map((z, i) => (
                <option key={i} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="button-group">
          <button
            onClick={buscarRuta}
            disabled={!origen || !destino || origen === destino || loading}
            className="btn-primary"
          >
            {loading ? "🔄 Calculando..." : "🔍 Buscar Ruta Óptima"}
          </button>

          <button onClick={limpiarRuta} className="btn-secondary" disabled={loading}>
            🗑️ Limpiar
          </button>
        </div>

        <div className="vista-selector">
          <label className="vista-label">🗺️ Tipo de Vista:</label>
          <div className="vista-buttons">
            <button
              onClick={() => setTipoVista("grafo")}
              className={`vista-btn ${tipoVista === "grafo" ? "active" : ""}`}
            >
              📊 Vista Grafo
            </button>
            <button
              onClick={() => setTipoVista("calles")}
              className={`vista-btn ${tipoVista === "calles" ? "active" : ""}`}
            >
              🛣️ Vista Calles
            </button>
          </div>
        </div>
      </div>

      <div className="mapa-container">
        <MapView
          zonas={zonas}
          origen={origen}
          destino={destino}
          ruta={ruta}
          loading={loading}
          tipoVista={tipoVista}
          grafoZonas={GRAFO_ZONAS}
        />
      </div>

      {ruta.length > 0 && (
        <div className="resultado-ruta">
          <h3>📋 Ruta Óptima Encontrada</h3>
          <div className="ruta-path">
            {ruta.map((zona, index) => (
              <span key={index} className="zona-step">
                {zona}
                {index < ruta.length - 1 && <span className="arrow">➜</span>}
              </span>
            ))}
          </div>
          <div className="ruta-info">
            <span className="tiempo-total">
              🕒 Tiempo estimado: <strong>{tiempoTotal} minutos</strong>
            </span>
            <span className="distancia-info">📏 {ruta.length - 1} conexiones</span>
          </div>
        </div>
      )}

      {ruta.length === 0 && origen && destino && !loading && (
        <div className="no-ruta">
          <p>
            ❌ No se encontró una ruta entre {origen} y {destino}
          </p>
        </div>
      )}
    </div>
  )
}

export default App