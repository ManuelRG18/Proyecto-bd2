from flask import Flask, request, jsonify
from flask_cors import CORS
from neo4j import GraphDatabase
import json

app = Flask(__name__)
CORS(app)

# Conexión con Neo4j
URI = "neo4j://127.0.0.1:7687"
USER = "neo4j"
PASSWORD = "clinica_delivery"

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

def run_query(query, parameters=None):
    with driver.session() as session:
        result = session.run(query, parameters or {})
        return [record.data() for record in result]

@app.route("/zonas")
def obtener_zonas():
    query = "MATCH (z:Zona) RETURN z.nombre AS nombre ORDER BY nombre"
    result = run_query(query)
    return jsonify(result)

@app.route("/conexiones")
def obtener_conexiones():
    query = '''
    MATCH (a:Zona)-[r:CONECTA]->(b:Zona)
    RETURN a.nombre AS desde, b.nombre AS hasta, 
           r.tiempo_minutos AS tiempo_minutos,
           r.trafico_actual AS trafico_actual,
           r.distancia_km AS distancia_km
    ORDER BY desde, hasta
    '''
    result = run_query(query)
    return jsonify(result)

@app.route("/zonas-completas")
def obtener_zonas_completas():
    query = '''
    MATCH (z:Zona)
    RETURN z.nombre AS nombre, 
           z.estado AS estado, 
           z.tipo_zona AS tipo_zona
    ORDER BY z.estado, z.nombre
    '''
    result = run_query(query)
    return jsonify(result)

@app.route("/ruta-dijkstra")
def calcular_ruta_dijkstra():
    origen = request.args.get("origen")
    destino = request.args.get("destino")
    calles_bloqueadas_param = request.args.get("calles_bloqueadas", "[]")
    
    print(f"🔍 Calculando ruta de {origen} a {destino}")
    print(f"🚧 Parámetro calles bloqueadas: {calles_bloqueadas_param}")
    
    try:
        calles_bloqueadas = json.loads(calles_bloqueadas_param)
        print(f"🚧 Calles bloqueadas procesadas: {calles_bloqueadas}")
    except Exception as e:
        print(f"❌ Error procesando calles bloqueadas: {e}")
        calles_bloqueadas = []
    
    # Obtener todas las conexiones para Dijkstra
    query_conexiones = '''
    MATCH (a:Zona)-[r:CONECTA]->(b:Zona)
    RETURN a.nombre AS desde, b.nombre AS hasta, 
           r.tiempo_minutos AS tiempo_minutos
    '''
    conexiones = run_query(query_conexiones)
    print(f"📊 Total conexiones obtenidas: {len(conexiones)}")
    
    # Implementar Dijkstra en Python con calles bloqueadas
    def dijkstra_con_bloqueos(conexiones, origen, destino, calles_bloqueadas):
        print(f"🚀 Iniciando Dijkstra con {len(calles_bloqueadas)} bloqueos")
        
        # Crear grafo
        grafo = {}
        nodos = set()
        
        # Convertir calles bloqueadas a set para búsqueda rápida
        bloqueos = set()
        for calle_id in calles_bloqueadas:
            if '-' in calle_id:
                partes = calle_id.split('-', 1)
                if len(partes) == 2:
                    desde, hasta = partes[0], partes[1]
                    bloqueos.add((desde, hasta))
                    bloqueos.add((hasta, desde))
                    print(f"🚧 Bloqueando: {desde} ↔ {hasta}")
        
        conexiones_activas = 0
        conexiones_bloqueadas = 0
        
        for conn in conexiones:
            desde, hasta, tiempo = conn['desde'], conn['hasta'], conn['tiempo_minutos']
            
            # Verificar si esta conexión está bloqueada
            if (desde, hasta) in bloqueos or (hasta, desde) in bloqueos:
                conexiones_bloqueadas += 1
                print(f"🚫 Conexión bloqueada: {desde} → {hasta}")
                continue  # Saltar conexiones bloqueadas
            
            conexiones_activas += 1
            nodos.add(desde)
            nodos.add(hasta)
            
            if desde not in grafo:
                grafo[desde] = {}
            if hasta not in grafo:
                grafo[hasta] = {}
                
            # Grafo bidireccional
            grafo[desde][hasta] = tiempo
            grafo[hasta][desde] = tiempo
        
        print(f"📈 Conexiones activas: {conexiones_activas}, bloqueadas: {conexiones_bloqueadas}")
        
        if origen not in nodos or destino not in nodos:
            print(f"❌ Nodos no encontrados: origen={origen in nodos}, destino={destino in nodos}")
            return [], 0
        
        # Algoritmo de Dijkstra
        distancias = {nodo: float('inf') for nodo in nodos}
        distancias[origen] = 0
        previos = {nodo: None for nodo in nodos}
        visitados = set()
        cola = list(nodos)
        
        while cola:
            # Encontrar nodo con menor distancia
            nodo_actual = min(cola, key=lambda x: distancias[x])
            cola.remove(nodo_actual)
            visitados.add(nodo_actual)
            
            if nodo_actual == destino:
                print(f"🎯 Destino alcanzado con distancia: {distancias[destino]}")
                break
                
            # Actualizar distancias de vecinos
            if nodo_actual in grafo:
                for vecino, peso in grafo[nodo_actual].items():
                    if vecino not in visitados:
                        nueva_distancia = distancias[nodo_actual] + peso
                        if nueva_distancia < distancias[vecino]:
                            distancias[vecino] = nueva_distancia
                            previos[vecino] = nodo_actual
        
        # Reconstruir ruta
        ruta = []
        actual = destino
        while actual is not None:
            ruta.insert(0, actual)
            actual = previos[actual]
        
        ruta_valida = ruta if len(ruta) > 0 and ruta[0] == origen else []
        tiempo_total = distancias[destino] if distancias[destino] != float('inf') else 0
        
        print(f"🛣️ Ruta encontrada: {' → '.join(ruta_valida)}")
        print(f"⏱️ Tiempo total: {tiempo_total} minutos")
        
        return ruta_valida, tiempo_total
    
    ruta, tiempo = dijkstra_con_bloqueos(conexiones, origen, destino, calles_bloqueadas)
    
    return jsonify({
        "ruta": ruta,
        "tiempo": tiempo,
        "algoritmo": "dijkstra_con_bloqueos",
        "calles_bloqueadas": len(calles_bloqueadas),
        "debug": {
            "origen": origen,
            "destino": destino,
            "bloqueos_aplicados": calles_bloqueadas
        }
    })

@app.route("/ruta")
def calcular_ruta():
    origen = request.args.get("origen")
    destino = request.args.get("destino")
    calles_bloqueadas = request.args.get("calles_bloqueadas", "[]")
    
    # Usar el nuevo endpoint de Dijkstra con bloqueos
    import requests
    try:
        response = requests.get(f"http://localhost:5000/ruta-dijkstra?origen={origen}&destino={destino}&calles_bloqueadas={calles_bloqueadas}")
        return response.json()
    except Exception as e:
        print(f"❌ Error en cálculo de ruta: {e}")
        return jsonify({"ruta": [], "tiempo": 0, "error": str(e)})

if __name__ == "__main__":
    print("Iniciando servidor...")
    app.run(debug=True)