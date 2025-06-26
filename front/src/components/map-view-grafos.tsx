"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

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

interface MapViewGrafosProps {
  zonas: Zona[]
  conexiones: Conexion[]
  origen: string
  destino: string
  ruta: string[]
  loading: boolean
  estadoFiltro: string
}

interface Nodo {
  id: string
  x: number
  y: number
  tipo: "normal" | "origen" | "destino" | "ruta"
  estado: string
}

interface ConexionVisual {
  desde: string
  hasta: string
  activa: boolean
  trafico: string
}

export default function MapViewGrafos({
  zonas,
  conexiones,
  origen,
  destino,
  ruta,
  loading,
  estadoFiltro,
}: MapViewGrafosProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  const generarNodosGrafo = (): Nodo[] => {
    const nodos: Nodo[] = []
    const centerX = 300
    const centerY = 225
    const radius = 320 // AUMENTADO de 180 a 320 para más separación

    // Agrupar zonas por estado
    const zonasPorEstado: { [key: string]: Zona[] } = {}
    zonas.forEach((zona) => {
      if (!zonasPorEstado[zona.estado]) {
        zonasPorEstado[zona.estado] = []
      }
      zonasPorEstado[zona.estado].push(zona)
    })

    const estados = Object.keys(zonasPorEstado)
    const anguloEstado = (2 * Math.PI) / estados.length

    estados.forEach((estado, estadoIndex) => {
      const zonasEstado = zonasPorEstado[estado]
      const centroEstadoX = centerX + Math.cos(estadoIndex * anguloEstado) * radius
      const centroEstadoY = centerY + Math.sin(estadoIndex * anguloEstado) * radius

      zonasEstado.forEach((zona, index) => {
        const anguloZona = (2 * Math.PI * index) / Math.max(zonasEstado.length, 1)
        const radioZona = 140 // AUMENTADO de 60 a 140 para más separación
        const x = centroEstadoX + Math.cos(anguloZona) * radioZona
        const y = centroEstadoY + Math.sin(anguloZona) * radioZona

        let tipo: "normal" | "origen" | "destino" | "ruta" = "normal"

        if (ruta.length > 0) {
          if (zona.nombre === origen) tipo = "origen"
          else if (zona.nombre === destino) tipo = "destino"
          else if (ruta.includes(zona.nombre)) tipo = "ruta"
        }

        nodos.push({
          id: zona.nombre,
          x,
          y,
          tipo,
          estado: zona.estado,
        })
      })
    })

    return nodos
  }

  const generarConexionesVisuales = (): ConexionVisual[] => {
    return conexiones.map((conexion) => {
      let activa = false

      if (ruta.length > 1) {
        for (let i = 0; i < ruta.length - 1; i++) {
          if (
            (ruta[i] === conexion.desde && ruta[i + 1] === conexion.hasta) ||
            (ruta[i] === conexion.hasta && ruta[i + 1] === conexion.desde)
          ) {
            activa = true
            break
          }
        }
      }

      return {
        desde: conexion.desde,
        hasta: conexion.hasta,
        activa,
        trafico: conexion.trafico_actual,
      }
    })
  }

  const calcularPosicionEtiqueta = (nodo: Nodo, todosNodos: Nodo[]): { x: number; y: number } => {
  const radioDeteccion = 110
  const offsetBase = 50

  const posicionesPosibles = [
  { x: nodo.x, y: nodo.y - offsetBase }, // arriba
  { x: nodo.x + offsetBase, y: nodo.y - offsetBase / 2 },
  { x: nodo.x + offsetBase, y: nodo.y + offsetBase / 2 },
  { x: nodo.x, y: nodo.y + offsetBase },
  { x: nodo.x - offsetBase, y: nodo.y + offsetBase / 2 },
  { x: nodo.x - offsetBase, y: nodo.y - offsetBase / 2 },
  { x: nodo.x + offsetBase * 1.5, y: nodo.y },
  { x: nodo.x - offsetBase * 1.5, y: nodo.y },
  { x: nodo.x, y: nodo.y - offsetBase * 1.5 },
  { x: nodo.x, y: nodo.y + offsetBase * 1.5 },
  // NUEVAS POSICIONES
  { x: nodo.x + offsetBase * 1.2, y: nodo.y - offsetBase * 0.8 },
  { x: nodo.x - offsetBase * 1.2, y: nodo.y + offsetBase * 0.8 },
  { x: nodo.x + offsetBase * 0.8, y: nodo.y + offsetBase * 1.2 },
  { x: nodo.x - offsetBase * 0.8, y: nodo.y - offsetBase * 1.2 },
]

  for (const pos of posicionesPosibles) {
    const conflicto = todosNodos.some((otro) => {
      if (otro.id === nodo.id) return false
      const dist = Math.hypot(pos.x - otro.x, pos.y - otro.y)
      return dist < radioDeteccion
    })
    if (!conflicto) return pos
  }

  // fallback por si no se consigue espacio
  return { x: nodo.x, y: nodo.y - offsetBase }
}

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y
      setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * zoomFactor)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const dibujarVistaGrafo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 450

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Aplicar transformaciones
    ctx.save()
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y)
    ctx.scale(zoom, zoom)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    const nodos = generarNodosGrafo()
    const conexionesVisuales = generarConexionesVisuales()

    // Fondo con cuadrícula sutil
    ctx.strokeStyle = "#f8fafc"
    ctx.lineWidth = 1
    for (let x = -200; x <= 800; x += 30) {
      ctx.beginPath()
      ctx.moveTo(x, -200)
      ctx.lineTo(x, 650)
      ctx.stroke()
    }
    for (let y = -200; y <= 650; y += 30) {
      ctx.beginPath()
      ctx.moveTo(-200, y)
      ctx.lineTo(800, y)
      ctx.stroke()
    }

    // Dibujar conexiones
    conexionesVisuales.forEach((conexion) => {
      const nodoDesde = nodos.find((n) => n.id === conexion.desde)
      const nodoHasta = nodos.find((n) => n.id === conexion.hasta)

      if (nodoDesde && nodoHasta) {
        ctx.beginPath()
        ctx.moveTo(nodoDesde.x, nodoDesde.y)
        ctx.lineTo(nodoHasta.x, nodoHasta.y)

        if (conexion.activa && ruta.length > 0) {
          ctx.strokeStyle = "#22c55e"
          ctx.lineWidth = 5
          ctx.setLineDash([])
        } else {
          switch (conexion.trafico) {
            case "bajo":
              ctx.strokeStyle = "#10b981"
              ctx.lineWidth = 2
              break
            case "medio":
              ctx.strokeStyle = "#f59e0b"
              ctx.lineWidth = 2
              break
            case "alto":
              ctx.strokeStyle = "#ef4444"
              ctx.lineWidth = 3
              break
            default:
              ctx.strokeStyle = "#d1d5db"
              ctx.lineWidth = 1
          }
          ctx.setLineDash([])
        }

        ctx.stroke()

        // Flecha direccional para rutas activas
        if (conexion.activa && ruta.length > 0) {
          const angle = Math.atan2(nodoHasta.y - nodoDesde.y, nodoHasta.x - nodoDesde.x)
          const arrowSize = 8
          const midX = (nodoDesde.x + nodoHasta.x) / 2
          const midY = (nodoDesde.y + nodoHasta.y) / 2

          ctx.save()
          ctx.translate(midX, midY)
          ctx.rotate(angle)
          ctx.fillStyle = "#16a34a"
          ctx.beginPath()
          ctx.moveTo(arrowSize, 0)
          ctx.lineTo(-arrowSize / 2, -arrowSize / 2)
          ctx.lineTo(-arrowSize / 2, arrowSize / 2)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
      }
    })

    // Dibujar nodos
    nodos.forEach((nodo) => {
      ctx.beginPath()
      ctx.arc(nodo.x, nodo.y, 15, 0, 2 * Math.PI)

      switch (nodo.tipo) {
        case "origen":
          ctx.fillStyle = "#3b82f6"
          break
        case "destino":
          ctx.fillStyle = "#ef4444"
          break
        case "ruta":
          ctx.fillStyle = "#22c55e"
          break
        default:
          ctx.fillStyle = "#6b7280"
      }

      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 3
      ctx.stroke()
    })

    // Dibujar etiquetas con posicionamiento inteligente
    nodos.forEach((nodo) => {
      const posEtiqueta = calcularPosicionEtiqueta(nodo, nodos)
      // MOSTRAR NOMBRE COMPLETO - remover truncamiento
      const texto = nodo.id

      // Línea conectora si la etiqueta está lejos
      const distancia = Math.sqrt(Math.pow(posEtiqueta.x - nodo.x, 2) + Math.pow(posEtiqueta.y - nodo.y, 2))

      if (distancia > 25) {
        ctx.beginPath()
        ctx.moveTo(nodo.x, nodo.y)
        ctx.lineTo(posEtiqueta.x, posEtiqueta.y)
        ctx.strokeStyle = "#9ca3af"
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Fondo de etiqueta - AUMENTAR PADDING
      ctx.font = "bold 10px Arial"
      ctx.textAlign = "center"
      const medidas = ctx.measureText(texto)
      const padding = 6 // AUMENTADO de 4 a 6

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(posEtiqueta.x - medidas.width / 2 - padding / 2, posEtiqueta.y - 8, medidas.width + padding, 16)

      // Borde de etiqueta
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1
      ctx.strokeRect(posEtiqueta.x - medidas.width / 2 - padding / 2, posEtiqueta.y - 8, medidas.width + padding, 16)

      // Texto - NOMBRE COMPLETO
      ctx.fillStyle = "#1f2937"
      ctx.fillText(texto, posEtiqueta.x, posEtiqueta.y + 3)

      // Estado en texto más pequeño
      ctx.font = "8px Arial"
      ctx.fillStyle = "#6b7280"
      ctx.fillText(nodo.estado, posEtiqueta.x, posEtiqueta.y + 18)
    })

    ctx.restore()

    if (loading) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.font = "18px Arial"
      ctx.textAlign = "center"
      ctx.fillText("🔄 Calculando ruta óptima...", canvas.width / 2, canvas.height / 2)
    }
  }

  useEffect(() => {
    dibujarVistaGrafo()
  }, [zonas, conexiones, origen, destino, ruta, loading, estadoFiltro, zoom, pan])

  return (
    <div className="map-view">
      <div className="map-header">
        <h3>
          🗺️ Red de Distribución - Vista Grafo
          {estadoFiltro !== "todos" && ` - ${estadoFiltro}`}
        </h3>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-color origen"></div>
            <span>Origen</span>
          </div>
          <div className="legend-item">
            <div className="legend-color destino"></div>
            <span>Destino</span>
          </div>
          <div className="legend-item">
            <div className="legend-color ruta"></div>
            <span>Ruta Óptima</span>
          </div>
          <div className="legend-item">
            <div className="legend-color normal"></div>
            <span>Otras Zonas</span>
          </div>
        </div>
      </div>

      <div className="map-controls">
        <button onClick={() => setZoom((prev) => Math.min(3, prev * 1.2))} className="control-btn primary">
          🔍+ Zoom
        </button>
        <button onClick={() => setZoom((prev) => Math.max(0.5, prev * 0.8))} className="control-btn primary">
          🔍- Zoom
        </button>
        <button onClick={resetView} className="control-btn secondary">
          ⟳ Reset Vista
        </button>
        <span className="zoom-info">⛶ Zoom: {(zoom * 100).toFixed(0)}%</span>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="map-canvas"
          width={600}
          height={450}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      <div className="map-info">
        <p>💡 Vista de grafo con conexiones. Las líneas verdes muestran la ruta óptima cuando se calcula.</p>
        <p>
          🔗 Zonas mostradas: {zonas.length} | Conexiones: {conexiones.length} | Estado:{" "}
          {estadoFiltro === "todos" ? "Todos" : estadoFiltro} | Arrastra para mover, rueda para zoom
        </p>
      </div>
    </div>
  )
}