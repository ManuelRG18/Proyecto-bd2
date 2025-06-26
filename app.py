from flask import Flask, request, jsonify
from flask_cors import CORS
from neo4j import GraphDatabase

app = Flask(__name__)
CORS(app)  # Permite conexiones desde React (localhost:3000, etc.)

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
    
    # Obtener todas las conexiones para Dijkstra
    query_conexiones = '''
    MATCH (a:Zona)-[r:CONECTA]->(b:Zona)
    RETURN a.nombre AS desde, b.nombre AS hasta, 
           r.tiempo_minutos AS tiempo_minutos
    '''
    conexiones = run_query(query_conexiones)
    
    # Implementar Dijkstra en Python
    def dijkstra(conexiones, origen, destino):
        # Crear grafo
        grafo = {}
        nodos = set()
        
        for conn in conexiones:
            desde, hasta, tiempo = conn['desde'], conn['hasta'], conn['tiempo_minutos']
            nodos.add(desde)
            nodos.add(hasta)
            
            if desde not in grafo:
                grafo[desde] = {}
            if hasta not in grafo:
                grafo[hasta] = {}
                
            # Grafo bidireccional
            grafo[desde][hasta] = tiempo
            grafo[hasta][desde] = tiempo
        
        if origen not in nodos or destino not in nodos:
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
        
        return ruta if ruta[0] == origen else [], distancias[destino]
    
    ruta, tiempo = dijkstra(conexiones, origen, destino)
    
    return jsonify({
        "ruta": ruta,
        "tiempo": tiempo,
        "algoritmo": "dijkstra"
    })

# También actualiza el endpoint original para usar Dijkstra por defecto:
@app.route("/ruta")
def calcular_ruta():
    origen = request.args.get("origen")
    destino = request.args.get("destino")
    
    # Usar el nuevo endpoint de Dijkstra
    import requests
    response = requests.get(f"http://localhost:5000/ruta-dijkstra?origen={origen}&destino={destino}")
    return response.json()

if __name__ == "__main__":
    app.run(debug=True)