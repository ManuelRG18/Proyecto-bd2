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
  onRecalcularRuta?: (callesBloquedas: string[]) => void
}

interface Nodo {
  id: string
  x: number
  y: number
  tipo: "normal" | "origen" | "destino" | "ruta"
  estado: string
}

interface CalleBloqueda {
  desde: string
  hasta: string
  id: string
}

export default function MapViewCroquis({
  zonas,
  conexiones,
  origen,
  destino,
  ruta,
  loading,
  estadoFiltro,
  onRecalcularRuta,
}: MapViewCroquisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [callesBloquedas, setCallesBloquedas] = useState<CalleBloqueda[]>([])
  const [modoBloqueo, setModoBloqueo] = useState(false)

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

  const calcularDistanciaALinea = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = px - xx
    const dy = py - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Mejorar la función obtenerConexionEnPunto para detectar correctamente las conexiones específicas
  const obtenerConexionEnPunto = (x: number, y: number): Conexion | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    // Convertir coordenadas del canvas a coordenadas del mundo
    const rect = canvas.getBoundingClientRect()
    const canvasX = x - rect.left
    const canvasY = y - rect.top

    // Aplicar transformaciones inversas
    const worldX = (canvasX - pan.x) / zoom
    const worldY = (canvasY - pan.y) / zoom

    const tolerancia = 20 / zoom

    // Buscar la conexión más cercana al punto de clic
    let conexionMasCercana: Conexion | null = null
    let distanciaMinima = Number.POSITIVE_INFINITY

    // Solo buscar en conexiones que realmente existen entre zonas visibles
    const zonasVisibles = new Set(zonas.map((z) => z.nombre))

    for (const conexion of conexiones) {
      // Verificar que ambas zonas estén visibles
      if (!zonasVisibles.has(conexion.desde) || !zonasVisibles.has(conexion.hasta)) {
        continue
      }

      const posDesde = POSICIONES_ZONAS[conexion.desde]
      const posHasta = POSICIONES_ZONAS[conexion.hasta]

      if (posDesde && posHasta) {
        const distancia = calcularDistanciaALinea(worldX, worldY, posDesde.x, posDesde.y, posHasta.x, posHasta.y)

        if (distancia <= tolerancia && distancia < distanciaMinima) {
          distanciaMinima = distancia
          conexionMasCercana = conexion
        }
      }
    }

    // Debug: mostrar qué conexión se detectó
    if (conexionMasCercana) {
      console.log(`🎯 Conexión detectada: ${conexionMasCercana.desde} ↔ ${conexionMasCercana.hasta}`)
    }

    return conexionMasCercana
  }

  const estaCalleBloqueda = (desde: string, hasta: string): boolean => {
    return callesBloquedas.some(
      (calle) => (calle.desde === desde && calle.hasta === hasta) || (calle.desde === hasta && calle.hasta === desde),
    )
  }

  const toggleBloqueCalle = (conexion: Conexion) => {
    const id = `${conexion.desde}-${conexion.hasta}`
    const yaBloqueda = estaCalleBloqueda(conexion.desde, conexion.hasta)

    if (yaBloqueda) {
      // Desbloquear
      setCallesBloquedas((prev) =>
        prev.filter(
          (calle) =>
            !(
              (calle.desde === conexion.desde && calle.hasta === conexion.hasta) ||
              (calle.desde === conexion.hasta && calle.hasta === conexion.desde)
            ),
        ),
      )
    } else {
      // Bloquear
      setCallesBloquedas((prev) => [
        ...prev,
        {
          desde: conexion.desde,
          hasta: conexion.hasta,
          id,
        },
      ])
    }
  }

  const limpiarBloqueos = () => {
    setCallesBloquedas([])
    if (onRecalcularRuta) {
      onRecalcularRuta([])
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!modoBloqueo) return

    console.log("🖱️ Click detectado en modo bloqueo")
    const conexion = obtenerConexionEnPunto(e.clientX, e.clientY)

    if (conexion) {
      console.log(`🚧 Intentando bloquear: ${conexion.desde} ↔ ${conexion.hasta}`)
      toggleBloqueCalle(conexion)

      // Recalcular ruta si hay origen y destino
      if (origen && destino && onRecalcularRuta) {
        // Crear nueva lista de calles bloqueadas
        const nuevasCallesBloquedas = [...callesBloquedas]
        const yaBloqueda = estaCalleBloqueda(conexion.desde, conexion.hasta)

        if (!yaBloqueda) {
          nuevasCallesBloquedas.push({
            desde: conexion.desde,
            hasta: conexion.hasta,
            id: `${conexion.desde}-${conexion.hasta}`,
          })
        } else {
          // Remover el bloqueo
          const index = nuevasCallesBloquedas.findIndex(
            (calle) =>
              (calle.desde === conexion.desde && calle.hasta === conexion.hasta) ||
              (calle.desde === conexion.hasta && calle.hasta === conexion.desde),
          )
          if (index > -1) nuevasCallesBloquedas.splice(index, 1)
        }

        const callesBloquedaIds = nuevasCallesBloquedas.map((c) => c.id)
        console.log(`📤 Enviando calles bloqueadas: ${JSON.stringify(callesBloquedaIds)}`)
        onRecalcularRuta(callesBloquedaIds)
      }
    } else {
      console.log("❌ No se detectó ninguna conexión en el punto clickeado")
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (modoBloqueo) {
      handleCanvasClick(e)
      return
    }
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !modoBloqueo) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y // Cambiar e.clientX por e.clientY
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

  // Mejorar la función para mostrar visualmente las calles bloqueadas en el lugar correcto
  const dibujarCallesBloquedas = (ctx: CanvasRenderingContext2D) => {
    callesBloquedas.forEach((calleBloqueda) => {
      const posDesde = POSICIONES_ZONAS[calleBloqueda.desde]
      const posHasta = POSICIONES_ZONAS[calleBloqueda.hasta]

      if (posDesde && posHasta) {
        // Dibujar línea roja gruesa para calle bloqueada
        ctx.beginPath()
        ctx.moveTo(posDesde.x, posDesde.y)
        ctx.lineTo(posHasta.x, posHasta.y)
        ctx.strokeStyle = "#dc2626"
        ctx.lineWidth = 8
        ctx.setLineDash([8, 8])
        ctx.stroke()
        ctx.setLineDash([])

        // Dibujar X en el medio de la conexión bloqueada
        const midX = (posDesde.x + posHasta.x) / 2
        const midY = (posDesde.y + posHasta.y) / 2

        // Fondo blanco para la X
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(midX, midY, 12, 0, 2 * Math.PI)
        ctx.fill()

        // Dibujar X roja
        ctx.strokeStyle = "#dc2626"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(midX - 8, midY - 8)
        ctx.lineTo(midX + 8, midY + 8)
        ctx.moveTo(midX + 8, midY - 8)
        ctx.lineTo(midX - 8, midY + 8)
        ctx.stroke()

        // Agregar texto indicativo
        ctx.fillStyle = "#dc2626"
        ctx.font = "bold 8px Arial"
        ctx.textAlign = "center"
        ctx.fillText("BLOQUEADA", midX, midY + 20)
        ctx.fillText(`${calleBloqueda.desde}`, midX, midY + 30)
        ctx.fillText(`↕`, midX, midY + 38)
        ctx.fillText(`${calleBloqueda.hasta}`, midX, midY + 46)
      }
    })
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

    // En la vista de calles, solo mostramos las rutas que siguen las calles
    // Las conexiones directas del grafo no se dibujan aquí

    // Dibujar calles bloqueadas ANTES de dibujar la ruta
    dibujarCallesBloquedas(ctx)

    ctx.setLineDash([])

    // Dibujar ruta siguiendo las calles cuando hay ruta activa
    if (ruta.length > 1) {
      ctx.strokeStyle = "#16a34a"
      ctx.lineWidth = 6
      ctx.setLineDash([8, 4])

      for (let i = 0; i < ruta.length - 1; i++) {
        const actual = POSICIONES_ZONAS[ruta[i]]
        const siguiente = POSICIONES_ZONAS[ruta[i + 1]]

        if (actual && siguiente) {
          // Dibujar ruta siguiendo las calles (rectangular, no diagonal)
          ctx.beginPath()

          // Si las posiciones son diferentes, dibujar en forma de L
          if (actual.x !== siguiente.x && actual.y !== siguiente.y) {
            // Movimiento horizontal primero
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

            // Luego movimiento vertical
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
          } else if (actual.x !== siguiente.x) {
            // Solo movimiento horizontal
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
      const texto = zona.id
      ctx.fillText(texto, zona.x, zona.y - size / 2 - 8)
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
    dibujarVistaCroquis()
  }, [zonas, conexiones, origen, destino, ruta, loading, estadoFiltro, zoom, pan, callesBloquedas])

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
          <div className="legend-item">
            <div style={{ width: 12, height: 12, background: "#dc2626", borderRadius: "50%" }}></div>
            <span>Calles Bloqueadas</span>
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
        <button
          onClick={() => setModoBloqueo(!modoBloqueo)}
          className={`control-btn ${modoBloqueo ? "primary" : "secondary"}`}
        >
          {modoBloqueo ? "🚧 Modo Bloqueo ON" : "🚧 Activar Bloqueo"}
        </button>
        <button onClick={limpiarBloqueos} className="control-btn secondary" disabled={callesBloquedas.length === 0}>
          🗑 Limpiar Bloqueos ({callesBloquedas.length})
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
          style={{ cursor: modoBloqueo ? "crosshair" : "move" }}
        />
      </div>

      <div className="map-info">
        <p>
          💡 Vista de croquis con calles.{" "}
          {modoBloqueo
            ? "Haz clic en las calles para bloquearlas/desbloquearlas."
            : "Las líneas verdes siguen las calles de la ruta óptima."}
        </p>
        <p>
          🔗 Zonas mostradas: {zonas.length} | Conexiones: {conexiones.length} | Calles bloqueadas:{" "}
          {callesBloquedas.length} | Estado: {estadoFiltro === "todos" ? "Todos" : estadoFiltro} |{" "}
          {modoBloqueo ? "Modo bloqueo activo" : "Arrastra para mover, rueda para zoom"}
        </p>
      </div>
    </div>
  )
}