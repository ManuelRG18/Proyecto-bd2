import MapViewGrafos from "./map-view-grafos"
import MapViewCroquis from "./map-view-croquis"
import "./map-view.css"

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

interface MapViewProps {
  zonas: Zona[]
  conexiones: Conexion[]
  origen: string
  destino: string
  ruta: string[]
  loading: boolean
  tipoVista: "grafo" | "calles"
  estadoFiltro: string
  onRecalcularRuta?: (callesBloquedas: string[]) => void
}

export default function MapView({
  zonas,
  conexiones,
  origen,
  destino,
  ruta,
  loading,
  tipoVista,
  estadoFiltro,
  onRecalcularRuta,
}: MapViewProps) {
  // Componente wrapper que decide qué vista mostrar
  if (tipoVista === "grafo") {
    return (
      <MapViewGrafos
        zonas={zonas}
        conexiones={conexiones}
        origen={origen}
        destino={destino}
        ruta={ruta}
        loading={loading}
        estadoFiltro={estadoFiltro}
      />
    )
  } else {
    return (
      <MapViewCroquis
        zonas={zonas}
        conexiones={conexiones}
        origen={origen}
        destino={destino}
        ruta={ruta}
        loading={loading}
        estadoFiltro={estadoFiltro}
        onRecalcularRuta={onRecalcularRuta}
      />
    )
  }
}