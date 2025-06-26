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

interface MapViewCroquisProps {
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

export default function MapViewCroquis({
  zonas,
  conexiones,
  origen,
  destino,
  ruta,
  loading,
  estadoFiltro,
}: MapViewCroquisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Posiciones alineadas con intersecciones de calles
  const POSICIONES_ZONAS: { [key: string]: { x: number; y: number } } = {
    // Distrito Capital - POSICIONES CORREGIDAS SIN SUPERPOSICIONES
    Altamira: { x: 380, y: 180 },
    Chacao: { x: 460, y: 140 },
    "La Candelaria": { x: 300, y: 180 },
    Catia: { x: 220, y: 240 },
    "El Paraíso": { x: 300, y: 240 },
    "La Vega": { x: 220, y: 180 },
    "El Valle": { x: 220, y: 140 },
    "San Bernardino": { x: 380, y: 140 },
    "Sabana Grande": { x: 300, y: 300 },
    Petare: { x: 460, y: 180 },

    // Miranda - POSICIONES CORREGIDAS SIN SUPERPOSICIONES
    "Los Teques": { x: 460, y: 240 },
    Guarenas: { x: 540, y: 140 },
    Guatire: { x: 540, y: 180 },
    Baruta: { x: 380, y: 300 },
    "El Hatillo": { x: 460, y: 300 },
    "San Antonio de Los Altos": { x: 380, y: 240 },
    "Ocumare del Tuy": { x: 460, y: 360 },
    Charallave: { x: 380, y: 360 },
    "Santa Teresa del Tuy": { x: 540, y: 300 },
    Higuerote: { x: 540, y: 100 },

    // Resto de estados igual...
    "Maracaibo Centro": { x: 150, y: 100 },
    "San Francisco": { x: 150, y: 160 },
    "La Limpia": { x: 220, y: 100 },
    "El Milagro": { x: 80, y: 160 },
    Sabaneta: { x: 80, y: 200 },
    Pomona: { x: 80, y: 260 },
    "Circunvalación 2": { x: 150, y: 200 },
    "Ciudad Ojeda": { x: 80, y: 320 },
    "La Lago": { x: 80, y: 380 },
    "Bella Vista": { x: 150, y: 380 },

    "Valencia Centro": { x: 300, y: 380 },
    "El Trigal": { x: 380, y: 100 },
    Naguanagua: { x: 220, y: 320 },
    "Flor Amarillo": { x: 460, y: 100 },
    "San Diego": { x: 300, y: 100 },
    "Los Guayos": { x: 220, y: 380 },
    "La Isabelica": { x: 540, y: 260 },
    "Parque Valencia": { x: 540, y: 380 },
    "La Quizanda": { x: 540, y: 100 },
    Tocuyito: { x: 150, y: 320 },

    "Barquisimeto Centro": { x: 150, y: 260 },
    Cabudare: { x: 220, y: 200 },
    "Santa Rosa": { x: 300, y: 160 },
    "El Ujano": { x: 80, y: 100 },
    "Pueblo Nuevo": { x: 150, y: 100 },
    "La Carucieña": { x: 380, y: 200 },
    "La Hacienda": { x: 460, y: 380 },
    Tamaca: { x: 220, y: 160 },
    "Las Trinitarias": { x: 460, y: 260 },
    Macuto: { x: 540, y: 200 },
  }

  const generarNodosCroquis = (): Nodo[] => {
    return zonas.map((zona) => {
      const pos = POSICIONES_ZONAS[zona.nombre] || { x: 300, y: 200 }
      let tipo: "normal" | "origen" | "destino" | "ruta" = "normal"

      if (ruta.length > 0) {
        if (zona.nombre === origen) tipo = "origen"
        else if (zona.nombre === destino) tipo = "destino"
        else if (ruta.includes(zona.nombre)) tipo = "ruta"
      }

      return {
        id: zona.nombre,
        x: pos.x,
        y: pos.y,
        tipo,
        estado: zona.estado,
      }
    })
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

  const dibujarSeparadoresEstados = (ctx: CanvasRenderingContext2D) => {
    // Separadores entre regiones de estados
    ctx.strokeStyle = "#374151"
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])

    // Separador vertical entre Distrito Capital/Miranda y Zulia/Carabobo/Lara
    ctx.beginPath()
    ctx.moveTo(400, 50)
    ctx.lineTo(400, 450)
    ctx.stroke()

    // Separador horizontal entre norte y sur
    ctx.beginPath()
    ctx.moveTo(50, 250)
    ctx.lineTo(600, 250)
    ctx.stroke()

    ctx.setLineDash([])

    // Etiquetas de regiones MOVIDAS HACIA ARRIBA
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"

    // Región Centro-Este (DC + Miranda) - MOVIDA ARRIBA
    ctx.fillText("REGIÓN CENTRO-ESTE", 500, 0)
    ctx.font = "10px Arial"
    ctx.fillText("(Distrito Capital + Miranda)", 500, 12)

    // Región Occidente (Zulia) - MOVIDA ARRIBA
    ctx.font = "bold 12px Arial"
    ctx.fillText("REGIÓN OCCIDENTE", 200, 0)
    ctx.font = "10px Arial"
    ctx.fillText("(Zulia)", 200, 12)

    // Región Centro (Carabobo) - MOVIDA ABAJO
    ctx.font = "bold 12px Arial"
    ctx.fillText("REGIÓN CENTRO", 180, 460)
    ctx.font = "10px Arial"
    ctx.fillText("(Carabobo)", 180, 472)

    // Región Centro-Occidente (Lara) - MOVIDA ABAJO
    ctx.font = "bold 12px Arial"
    ctx.fillText("REGIÓN CENTRO-OCCIDENTE", 500, 460)
    ctx.font = "10px Arial"
    ctx.fillText("(Lara)", 500, 472)
  }

  const dibujarVistaCroquis = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 450
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Aplicar transformaciones
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Fondo tipo mapa
    ctx.fillStyle = "#f1f5f9"
    ctx.fillRect(-100, -100, 800, 650)

    // Definir calles principales
    const callesHorizontales = [
      { y: 100, nombre: "Av. Norte", color: "#e2e8f0" },
      { y: 160, nombre: "Av. Libertador", color: "#e2e8f0" },
      { y: 200, nombre: "Av. Central", color: "#e2e8f0" },
      { y: 260, nombre: "Av. Universidad", color: "#e2e8f0" },
      { y: 320, nombre: "Av. Sur", color: "#e2e8f0" },
      { y: 380, nombre: "Av. Industrial", color: "#e2e8f0" },
    ]

    const callesVerticales = [
      { x: 80, nombre: "Av. Oeste", color: "#e2e8f0" },
      { x: 150, nombre: "Av. Barquisimeto", color: "#e2e8f0" },
      { x: 220, nombre: "Av. Valencia", color: "#e2e8f0" },
      { x: 300, nombre: "Av. Principal", color: "#e2e8f0" },
      { x: 380, nombre: "Av. Caracas", color: "#e2e8f0" },
      { x: 460, nombre: "Av. Miranda", color: "#e2e8f0" },
      { x: 540, nombre: "Av. Este", color: "#e2e8f0" },
    ]

    // Dibujar calles horizontales
    callesHorizontales.forEach((calle) => {
      ctx.beginPath()
      ctx.moveTo(-50, calle.y)
      ctx.lineTo(650, calle.y)
      ctx.strokeStyle = calle.color
      ctx.lineWidth = 8
      ctx.stroke()

      // Nombre de la calle
      ctx.fillStyle = "#475569"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(calle.nombre, 10, calle.y - 10)
    })

    // Dibujar calles verticales
    callesVerticales.forEach((calle) => {
      ctx.beginPath()
      ctx.moveTo(calle.x, -50)
      ctx.lineTo(calle.x, 500)
      ctx.strokeStyle = calle.color
      ctx.lineWidth = 8
      ctx.stroke()

      // Nombre de la calle (rotado)
      ctx.save()
      ctx.translate(calle.x + 10, 20)
      ctx.rotate(Math.PI / 2)
      ctx.fillStyle = "#475569"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(calle.nombre, 0, 0)
      ctx.restore()
    })

    // Dibujar separadores de estados si es vista general
    if (estadoFiltro === "todos") {
      dibujarSeparadoresEstados(ctx)
    }

    // Dibujar edificios/zonas
    const nodos = generarNodosCroquis()
    nodos.forEach((zona) => {
      let color = "#64748b"
      let size = 18

      if (ruta.length > 0) {
        if (zona.tipo === "origen") {
          color = "#3b82f6"
          size = 24
        } else if (zona.tipo === "destino") {
          color = "#ef4444"
          size = 24
        } else if (zona.tipo === "ruta") {
          color = "#22c55e"
          size = 20
        }
      }

      // Dibujar edificio
      ctx.fillStyle = color
      ctx.fillRect(zona.x - size / 2, zona.y - size / 2, size, size)
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.strokeRect(zona.x - size / 2, zona.y - size / 2, size, size)

      // Etiqueta - MOSTRAR NOMBRE COMPLETO
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 9px Arial"
      ctx.textAlign = "center"
      // REMOVER el truncamiento - mostrar nombre completo
      const texto = zona.id
      ctx.fillText(texto, zona.x, zona.y - size / 2 - 8)
    })

    // Dibujar ruta siguiendo las calles cuando hay ruta activa
    if (ruta.length > 1) {
      ctx.strokeStyle = "#16a34a"
      ctx.lineWidth = 6
      ctx.setLineDash([8, 4])

      for (let i = 0; i < ruta.length - 1; i++) {
        const actual = POSICIONES_ZONAS[ruta[i]]
        const siguiente = POSICIONES_ZONAS[ruta[i + 1]]

        if (actual && siguiente) {
          ctx.beginPath()

          // Movimiento horizontal primero
          if (actual.x !== siguiente.x) {
            ctx.moveTo(actual.x, actual.y)
            ctx.lineTo(siguiente.x, actual.y)
            ctx.stroke()

            // Flecha horizontal
            const midX = (actual.x + siguiente.x) / 2
            const arrowSize = 10
            ctx.save()
            ctx.translate(midX, actual.y)
            ctx.rotate(actual.x < siguiente.x ? 0 : Math.PI)
            ctx.fillStyle = "#16a34a"
            ctx.beginPath()
            ctx.moveTo(arrowSize, 0)
            ctx.lineTo(-arrowSize / 2, -arrowSize / 2)
            ctx.lineTo(-arrowSize / 2, arrowSize / 2)
            ctx.closePath()
            ctx.fill()
            ctx.restore()

            // Luego movimiento vertical si es necesario
            if (actual.y !== siguiente.y) {
              ctx.beginPath()
              ctx.moveTo(siguiente.x, actual.y)
              ctx.lineTo(siguiente.x, siguiente.y)
              ctx.stroke()

              // Flecha vertical
              const midY = (actual.y + siguiente.y) / 2
              ctx.save()
              ctx.translate(siguiente.x, midY)
              ctx.rotate(actual.y < siguiente.y ? Math.PI / 2 : -Math.PI / 2)
              ctx.fillStyle = "#16a34a"
              ctx.beginPath()
              ctx.moveTo(arrowSize, 0)
              ctx.lineTo(-arrowSize / 2, -arrowSize / 2)
              ctx.lineTo(-arrowSize / 2, arrowSize / 2)
              ctx.closePath()
              ctx.fill()
              ctx.restore()
            }
          } else if (actual.y !== siguiente.y) {
            // Solo movimiento vertical
            ctx.moveTo(actual.x, actual.y)
            ctx.lineTo(actual.x, siguiente.y)
            ctx.stroke()

            // Flecha vertical
            const midY = (actual.y + siguiente.y) / 2
            const arrowSize = 10
            ctx.save()
            ctx.translate(actual.x, midY)
            ctx.rotate(actual.y < siguiente.y ? Math.PI / 2 : -Math.PI / 2)
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
      }
      ctx.setLineDash([])
    }

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
    dibujarVistaCroquis()
  }, [zonas, conexiones, origen, destino, ruta, loading, estadoFiltro, zoom, pan])

  return (
    <div className="map-view">
      <div className="map-header">
        <h3>
          🗺️ Mapa de Calles - Vista Croquis
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
        <p>💡 Vista de croquis con calles. Las líneas verdes siguen las calles de la ruta óptima.</p>
        <p>
          🔗 Zonas mostradas: {zonas.length} | Conexiones: {conexiones.length} | Estado:{" "}
          {estadoFiltro === "todos" ? "Todos" : estadoFiltro} | Arrastra para mover, rueda para zoom
        </p>
      </div>
    </div>
  )
}