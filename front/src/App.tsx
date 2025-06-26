import { useState, useEffect } from "react"
import MapView from "./components/map-view"
import "./app.css"

interface Zona {
  nombre: string
  estado: string
  tipo_zona: string
}

interface Conexion {
  desde: string
  hasta: string
  tiempo_minutos: number
  trafico_actual: string
  distancia_km: number
}

export default function DeliveryApp() {
  const [zonas, setZonas] = useState<Zona[]>([])
  const [conexiones, setConexiones] = useState<Conexion[]>([])
  const [origen, setOrigen] = useState<string>("")
  const [destino, setDestino] = useState<string>("")
  const [ruta, setRuta] = useState<string[]>([])
  const [tiempoTotal, setTiempoTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [tipoVista, setTipoVista] = useState<"grafo" | "calles">("grafo")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos")

  // Estados disponibles
  const estados = ["Distrito Capital", "Miranda", "Zulia", "Carabobo", "Lara"]

  // Obtener zonas desde el backend
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await fetch("http://localhost:5000/zonas-completas")
        const data = await response.json()
        setZonas(data)
      } catch (err) {
        console.error("Error cargando zonas:", err)
        // Datos de fallback con estados
        const zonasDefault: Zona[] = [
          // Distrito Capital
          { nombre: "Altamira", estado: "Distrito Capital", tipo_zona: "comercial" },
          { nombre: "Chacao", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "La Candelaria", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "Catia", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "El Paraíso", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "La Vega", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "El Valle", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "San Bernardino", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "Sabana Grande", estado: "Distrito Capital", tipo_zona: "residencial" },
          { nombre: "Petare", estado: "Distrito Capital", tipo_zona: "residencial" },

          // Miranda
          { nombre: "Los Teques", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "Guarenas", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "Guatire", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "Baruta", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "El Hatillo", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "San Antonio de Los Altos", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "Ocumare del Tuy", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "Charallave", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "Santa Teresa del Tuy", estado: "Miranda", tipo_zona: "residencial" },
          { nombre: "Higuerote", estado: "Miranda", tipo_zona: "residencial" },

          // Zulia
          { nombre: "Maracaibo Centro", estado: "Zulia", tipo_zona: "comercial" },
          { nombre: "San Francisco", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "La Limpia", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "El Milagro", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "Sabaneta", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "Pomona", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "Circunvalación 2", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "Ciudad Ojeda", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "La Lago", estado: "Zulia", tipo_zona: "residencial" },
          { nombre: "Bella Vista", estado: "Zulia", tipo_zona: "residencial" },

          // Carabobo
          { nombre: "Valencia Centro", estado: "Carabobo", tipo_zona: "comercial" },
          { nombre: "El Trigal", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "Naguanagua", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "Flor Amarillo", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "San Diego", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "Los Guayos", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "La Isabelica", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "Parque Valencia", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "La Quizanda", estado: "Carabobo", tipo_zona: "residencial" },
          { nombre: "Tocuyito", estado: "Carabobo", tipo_zona: "residencial" },

          // Lara
          { nombre: "Barquisimeto Centro", estado: "Lara", tipo_zona: "comercial" },
          { nombre: "Cabudare", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "Santa Rosa", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "El Ujano", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "Pueblo Nuevo", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "La Carucieña", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "La Hacienda", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "Tamaca", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "Las Trinitarias", estado: "Lara", tipo_zona: "residencial" },
          { nombre: "Macuto", estado: "Lara", tipo_zona: "residencial" },
        ]
        setZonas(zonasDefault)
      }
    }

    const fetchConexiones = async () => {
      try {
        const response = await fetch("http://localhost:5000/conexiones")
        const data = await response.json()
        setConexiones(data)
      } catch (err) {
        console.error("Error cargando conexiones:", err)
      }
    }

    fetchZonas()
    fetchConexiones()
  }, [])

  // Filtrar zonas según el estado seleccionado
  const zonasFiltradas = estadoFiltro === "todos" ? zonas : zonas.filter((zona) => zona.estado === estadoFiltro)

  const buscarRuta = async () => {
    if (origen && destino && origen !== destino) {
      setLoading(true)
      try {
        const res = await fetch(
          `http://localhost:5000/ruta?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}`,
        )
        const data = await res.json()
        setRuta(data.ruta || [])
        setTiempoTotal(data.tiempo || 0)
      } catch (err) {
        console.error("Error buscando ruta:", err)
        setRuta([])
        setTiempoTotal(0)
      } finally {
        setLoading(false)
      }
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
        <p className="subtitle">Optimización de Red de Entrega con Neo4j</p>
      </header>

      <div className="controles-superiores">
        {/* Filtro por Estado */}
        <div className="filtro-estados">
          <label className="filtro-label">🗺️ Filtrar por Estado:</label>
          <div className="estado-buttons">
            <button
              onClick={() => setEstadoFiltro("todos")}
              className={`estado-btn ${estadoFiltro === "todos" ? "active" : ""}`}
            >
              Todos los Estados ({zonas.length})
            </button>
            {estados.map((estado) => {
              const count = zonas.filter((z) => z.estado === estado).length
              return (
                <button
                  key={estado}
                  onClick={() => setEstadoFiltro(estado)}
                  className={`estado-btn ${estadoFiltro === estado ? "active" : ""}`}
                >
                  {estado} ({count})
                </button>
              )
            })}
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="origen">
            📍 Origen:
            <select id="origen" value={origen} onChange={(e) => setOrigen(e.target.value)} className="select-zona">
              <option value="">Seleccionar zona de origen</option>
              {zonasFiltradas.map((zona, i) => (
                <option key={i} value={zona.nombre}>
                  {zona.nombre} ({zona.estado})
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="destino">
            🚩 Destino:
            <select id="destino" value={destino} onChange={(e) => setDestino(e.target.value)} className="select-zona">
              <option value="">Seleccionar zona de destino</option>
              {zonasFiltradas.map((zona, i) => (
                <option key={i} value={zona.nombre}>
                  {zona.nombre} ({zona.estado})
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
            {loading ? "🔄 Calculando..." : "🔍︎ Buscar Ruta Óptima"}
          </button>

          <button onClick={limpiarRuta} className="btn-secondary" disabled={loading}>
            🗑 Limpiar
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
          zonas={zonasFiltradas}
          conexiones={conexiones}
          origen={origen}
          destino={destino}
          ruta={ruta}
          loading={loading}
          tipoVista={tipoVista}
          estadoFiltro={estadoFiltro}
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
              🕒 Tiempo estimado: <strong>{tiempoTotal?.toFixed(1)} minutos</strong>
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