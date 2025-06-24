import { useEffect, useRef } from "react"
import "./map-view.css"

interface Nodo {
  id: string
  x: number
  y: number
  tipo: "normal" | "origen" | "destino" | "ruta"
}

interface Conexion {
  desde: string
  hasta: string
  activa: boolean
}

interface MapViewProps {
  zonas: string[]
  origen: string
  destino: string
  ruta: string[]
  loading: boolean
  tipoVista: "grafo" | "calles"
  grafoZonas: { [key: string]: string[] }
}

const MapView = ({ zonas, origen, destino, ruta, loading, tipoVista, grafoZonas }: MapViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Posiciones fijas para cada zona
  const POSICIONES_ZONAS: { [key: string]: { x: number; y: number } } = {
    Centro: { x: 300, y: 200 },
    Norte: { x: 300, y: 80 },
    Sur: { x: 300, y: 320 },
    Este: { x: 480, y: 200 },
    Oeste: { x: 120, y: 200 },
    "Plaza Mayor": { x: 180, y: 140 },
    Universidad: { x: 220, y: 260 },
    Hospital: { x: 520, y: 280 },
    Aeropuerto: { x: 420, y: 320 },
    Puerto: { x: 180, y: 360 },
  }

  const generarNodosGrafo = (): Nodo[] => {
    return zonas.map((zona) => {
      const pos = POSICIONES_ZONAS[zona] || { x: 300, y: 200 }
      let tipo: "normal" | "origen" | "destino" | "ruta" = "normal"

      if (zona === origen) tipo = "origen"
      else if (zona === destino) tipo = "destino"
      else if (ruta.includes(zona) && zona !== origen && zona !== destino) tipo = "ruta"

      return {
        id: zona,
        x: pos.x,
        y: pos.y,
        tipo,
      }
    })
  }

  const generarConexionesGrafo = (_nodos: Nodo[]): Conexion[] => {
    const conexiones: Conexion[] = []
    const conexionesExistentes = new Set<string>()

    // Generar conexiones basadas en el grafo definido
    Object.entries(grafoZonas).forEach(([zona, vecinos]) => {
      vecinos.forEach((vecino) => {
        const key1 = `${zona}-${vecino}`
        const key2 = `${vecino}-${zona}`

        if (!conexionesExistentes.has(key1) && !conexionesExistentes.has(key2)) {
          // Verificar si esta conexión está en la ruta activa
          let activa = false
          for (let i = 0; i < ruta.length - 1; i++) {
            if ((ruta[i] === zona && ruta[i + 1] === vecino) || (ruta[i] === vecino && ruta[i + 1] === zona)) {
              activa = true
              break
            }
          }

          conexiones.push({
            desde: zona,
            hasta: vecino,
            activa,
          })
          conexionesExistentes.add(key1)
        }
      })
    })

    return conexiones
  }

  const dibujarVistaGrafo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 400

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const nodos = generarNodosGrafo()
    const conexiones = generarConexionesGrafo(nodos)

    // Fondo con cuadrícula sutil
    ctx.strokeStyle = "#f8fafc"
    ctx.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += 30) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += 30) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Dibujar conexiones
    conexiones.forEach((conexion) => {
      const nodoDesde = nodos.find((n) => n.id === conexion.desde)
      const nodoHasta = nodos.find((n) => n.id === conexion.hasta)

      if (nodoDesde && nodoHasta) {
        ctx.beginPath()
        ctx.moveTo(nodoDesde.x, nodoDesde.y)
        ctx.lineTo(nodoHasta.x, nodoHasta.y)

        if (conexion.activa) {
          ctx.strokeStyle = "#22c55e"
          ctx.lineWidth = 5
          ctx.setLineDash([])
        } else {
          ctx.strokeStyle = "#d1d5db"
          ctx.lineWidth = 2
          ctx.setLineDash([])
        }

        ctx.stroke()
      }
    })

    // Dibujar ruta con flechas direccionales
    if (ruta.length > 1) {
      ctx.strokeStyle = "#16a34a"
      ctx.lineWidth = 3
      ctx.setLineDash([8, 4])

      for (let i = 0; i < ruta.length - 1; i++) {
        const nodoActual = nodos.find((n) => n.id === ruta[i])
        const nodoSiguiente = nodos.find((n) => n.id === ruta[i + 1])

        if (nodoActual && nodoSiguiente) {
          ctx.beginPath()
          ctx.moveTo(nodoActual.x, nodoActual.y)
          ctx.lineTo(nodoSiguiente.x, nodoSiguiente.y)
          ctx.stroke()

          // Dibujar flecha
          const angle = Math.atan2(nodoSiguiente.y - nodoActual.y, nodoSiguiente.x - nodoActual.x)
          const arrowSize = 12
          const midX = (nodoActual.x + nodoSiguiente.x) / 2
          const midY = (nodoActual.y + nodoSiguiente.y) / 2

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
      ctx.setLineDash([])
    }

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

      // Etiqueta
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 11px Arial"
      ctx.textAlign = "center"
      ctx.fillText(nodo.id, nodo.x, nodo.y - 22)
    })

    if (loading) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.font = "18px Arial"
      ctx.textAlign = "center"
      ctx.fillText("🔄 Calculando ruta óptima...", canvas.width / 2, canvas.height / 2)
    }
  }

  const dibujarVistaCalles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 600
    canvas.height = 400
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fondo tipo mapa
    ctx.fillStyle = "#f1f5f9"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Definir calles principales
    const callesHorizontales = [
      { y: 80, nombre: "Av. Norte", activa: false },
      { y: 140, nombre: "Calle Plaza", activa: false },
      { y: 200, nombre: "Av. Central", activa: false },
      { y: 260, nombre: "Calle Universidad", activa: false },
      { y: 320, nombre: "Av. Sur", activa: false },
      { y: 360, nombre: "Calle Puerto", activa: false },
    ]

    const callesVerticales = [
      { x: 120, nombre: "Av. Oeste", activa: false },
      { x: 180, nombre: "Calle Mayor", activa: false },
      { x: 220, nombre: "Av. Universidad", activa: false },
      { x: 300, nombre: "Av. Principal", activa: false },
      { x: 420, nombre: "Calle Aeropuerto", activa: false },
      { x: 480, nombre: "Av. Este", activa: false },
      { x: 520, nombre: "Calle Hospital", activa: false },
    ]

    // Dibujar calles horizontales
    callesHorizontales.forEach((calle) => {
      ctx.beginPath()
      ctx.moveTo(0, calle.y)
      ctx.lineTo(canvas.width, calle.y)
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 6
      ctx.stroke()

      // Nombre de la calle
      ctx.fillStyle = "#475569"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(calle.nombre, 10, calle.y - 8)
    })

    // Dibujar calles verticales
    callesVerticales.forEach((calle) => {
      ctx.beginPath()
      ctx.moveTo(calle.x, 0)
      ctx.lineTo(calle.x, canvas.height)
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 6
      ctx.stroke()

      // Nombre de la calle (rotado)
      ctx.save()
      ctx.translate(calle.x + 8, 15)
      ctx.rotate(Math.PI / 2)
      ctx.fillStyle = "#475569"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(calle.nombre, 0, 0)
      ctx.restore()
    })

    // Dibujar edificios/zonas
    const nodos = generarNodosGrafo()
    nodos.forEach((zona) => {
      let color = "#64748b"
      let size = 18

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

      // Dibujar edificio
      ctx.fillStyle = color
      ctx.fillRect(zona.x - size / 2, zona.y - size / 2, size, size)
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.strokeRect(zona.x - size / 2, zona.y - size / 2, size, size)

      // Etiqueta
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(zona.id, zona.x, zona.y - size / 2 - 6)
    })

    // Dibujar SOLO la ruta real siguiendo las calles
    if (ruta.length > 1) {
      ctx.strokeStyle = "#16a34a"
      ctx.lineWidth = 4
      ctx.setLineDash([6, 3])

      for (let i = 0; i < ruta.length - 1; i++) {
        const actual = POSICIONES_ZONAS[ruta[i]]
        const siguiente = POSICIONES_ZONAS[ruta[i + 1]]

        if (actual && siguiente) {
          // Dibujar el recorrido real paso a paso
          ctx.beginPath()

          // Si hay diferencia en X (movimiento horizontal)
          if (actual.x !== siguiente.x) {
            // Movimiento horizontal primero
            ctx.moveTo(actual.x, actual.y)
            ctx.lineTo(siguiente.x, actual.y)
            ctx.stroke()

            // Flecha horizontal
            const midX = (actual.x + siguiente.x) / 2
            const arrowSize = 8
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
            const arrowSize = 8
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
    if (tipoVista === "grafo") {
      dibujarVistaGrafo()
    } else {
      dibujarVistaCalles()
    }
  }, [zonas, origen, destino, ruta, loading, tipoVista])

  return (
    <div className="map-view">
      <div className="map-header">
        <h3>🗺️ {tipoVista === "grafo" ? "Red de Distribución - Vista Grafo" : "Mapa de Calles - Vista Croquis"}</h3>
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

      <div className="canvas-container">
        <canvas ref={canvasRef} className="map-canvas" width={600} height={400} />
      </div>

      <div className="map-info">
        <p>
          💡{" "}
          {tipoVista === "grafo"
            ? "Las líneas verdes muestran las conexiones de la ruta óptima"
            : "Las calles verdes están en la ruta óptima"}
        </p>
        <p>🔗 Total de zonas: {zonas.length} | Algoritmo: Dijkstra</p>
      </div>
    </div>
  )
}

export default MapView