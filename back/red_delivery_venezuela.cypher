CREATE (:Zona:CentroDistribucion {nombre: "Altamira", estado: "Distrito Capital", tipo_zona: "comercial"});
CREATE (:Zona:CentroDistribucion {nombre: "Chacao", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "La Candelaria", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Catia", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "El Paraíso", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "La Vega", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "El Valle", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "San Bernardino", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Sabana Grande", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Petare", estado: "Distrito Capital", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Los Teques", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Guarenas", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Guatire", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Baruta", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "El Hatillo", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "San Antonio de Los Altos", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Ocumare del Tuy", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Charallave", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Santa Teresa del Tuy", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Higuerote", estado: "Miranda", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Maracaibo Centro", estado: "Zulia", tipo_zona: "comercial"});
CREATE (:Zona:CentroDistribucion {nombre: "San Francisco", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "La Limpia", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "El Milagro", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Sabaneta", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Pomona", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Circunvalación 2", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Ciudad Ojeda", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "La Lago", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Bella Vista", estado: "Zulia", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Valencia Centro", estado: "Carabobo", tipo_zona: "comercial"});
CREATE (:Zona {nombre: "El Trigal", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Naguanagua", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Flor Amarillo", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "San Diego", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Los Guayos", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "La Isabelica", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Parque Valencia", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "La Quizanda", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Tocuyito", estado: "Carabobo", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "Barquisimeto Centro", estado: "Lara", tipo_zona: "comercial"});
CREATE (:Zona:CentroDistribucion {nombre: "Cabudare", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Santa Rosa", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "El Ujano", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Pueblo Nuevo", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona:CentroDistribucion {nombre: "La Carucieña", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "La Hacienda", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Tamaca", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Las Trinitarias", estado: "Lara", tipo_zona: "residencial"});
CREATE (:Zona {nombre: "Macuto", estado: "Lara", tipo_zona: "residencial"});
MATCH (a:Zona {nombre: "Altamira"}), (b:Zona {nombre: "Chacao"}) CREATE (a)-[:CONECTA {tiempo_minutos: 5.6, trafico_actual: "medio", distancia_km: 2.5}]->(b);
MATCH (a:Zona {nombre: "Chacao"}), (b:Zona {nombre: "La Candelaria"}) CREATE (a)-[:CONECTA {tiempo_minutos: 6.7, trafico_actual: "medio", distancia_km: 3.0}]->(b);
MATCH (a:Zona {nombre: "La Candelaria"}), (b:Zona {nombre: "San Bernardino"}) CREATE (a)-[:CONECTA {tiempo_minutos: 3.8, trafico_actual: "bajo", distancia_km: 2.0}]->(b);
MATCH (a:Zona {nombre: "San Bernardino"}), (b:Zona {nombre: "Catia"}) CREATE (a)-[:CONECTA {tiempo_minutos: 11.7, trafico_actual: "alto", distancia_km: 4.2}]->(b);
MATCH (a:Zona {nombre: "Catia"}), (b:Zona {nombre: "El Paraíso"}) CREATE (a)-[:CONECTA {tiempo_minutos: 9.8, trafico_actual: "alto", distancia_km: 3.5}]->(b);
MATCH (a:Zona {nombre: "El Paraíso"}), (b:Zona {nombre: "La Vega"}) CREATE (a)-[:CONECTA {tiempo_minutos: 6.2, trafico_actual: "medio", distancia_km: 2.8}]->(b);
MATCH (a:Zona {nombre: "La Vega"}), (b:Zona {nombre: "El Valle"}) CREATE (a)-[:CONECTA {tiempo_minutos: 8.7, trafico_actual: "alto", distancia_km: 3.1}]->(b);
MATCH (a:Zona {nombre: "El Valle"}), (b:Zona {nombre: "Sabana Grande"}) CREATE (a)-[:CONECTA {tiempo_minutos: 14.0, trafico_actual: "alto", distancia_km: 5.0}]->(b);
MATCH (a:Zona {nombre: "Sabana Grande"}), (b:Zona {nombre: "Altamira"}) CREATE (a)-[:CONECTA {tiempo_minutos: 7.8, trafico_actual: "medio", distancia_km: 3.5}]->(b);
MATCH (a:Zona {nombre: "Petare"}), (b:Zona {nombre: "Altamira"}) CREATE (a)-[:CONECTA {tiempo_minutos: 16.8, trafico_actual: "alto", distancia_km: 6.0}]->(b);
MATCH (a:Zona {nombre: "Petare"}), (b:Zona {nombre: "La Candelaria"}) CREATE (a)-[:CONECTA {tiempo_minutos: 23.7, trafico_actual: "alto", distancia_km: 8.5}]->(b);
MATCH (a:Zona {nombre: "Petare"}), (b:Zona {nombre: "El Valle"}) CREATE (a)-[:CONECTA {tiempo_minutos: 16.1, trafico_actual: "medio", distancia_km: 7.2}]->(b);
MATCH (a:Zona {nombre: "Chacao"}), (b:Zona {nombre: "San Bernardino"}) CREATE (a)-[:CONECTA {tiempo_minutos: 8.5, trafico_actual: "medio", distancia_km: 3.8}]->(b);
MATCH (a:Zona {nombre: "La Vega"}), (b:Zona {nombre: "Catia"}) CREATE (a)-[:CONECTA {tiempo_minutos: 6.2, trafico_actual: "bajo", distancia_km: 3.3}]->(b);
MATCH (a:Zona {nombre: "El Paraíso"}), (b:Zona {nombre: "Sabana Grande"}) CREATE (a)-[:CONECTA {tiempo_minutos: 10.1, trafico_actual: "medio", distancia_km: 4.5}]->(b);
MATCH (a:Zona {nombre: "Los Teques"}), (b:Zona {nombre: "Guarenas"}) CREATE (a)-[:CONECTA {tiempo_minutos: 40.2, trafico_actual: "medio", distancia_km: 18.0}]->(b);
MATCH (a:Zona {nombre: "Guarenas"}), (b:Zona {nombre: "Guatire"}) CREATE (a)-[:CONECTA {tiempo_minutos: 14.9, trafico_actual: "bajo", distancia_km: 8.0}]->(b);
MATCH (a:Zona {nombre: "Guatire"}), (b:Zona {nombre: "Baruta"}) CREATE (a)-[:CONECTA {tiempo_minutos: 44.6, trafico_actual: "alto", distancia_km: 16.0}]->(b);
MATCH (a:Zona {nombre: "Baruta"}), (b:Zona {nombre: "El Hatillo"}) CREATE (a)-[:CONECTA {tiempo_minutos: 20.1, trafico_actual: "medio", distancia_km: 9.0}]->(b);
MATCH (a:Zona {nombre: "El Hatillo"}), (b:Zona {nombre: "San Antonio de Los Altos"}) CREATE (a)-[:CONECTA {tiempo_minutos: 26.8, trafico_actual: "medio", distancia_km: 12.0}]->(b);
MATCH (a:Zona {nombre: "San Antonio de Los Altos"}), (b:Zona {nombre: "Ocumare del Tuy"}) CREATE (a)-[:CONECTA {tiempo_minutos: 66.9, trafico_actual: "alto", distancia_km: 24.0}]->(b);
MATCH (a:Zona {nombre: "Ocumare del Tuy"}), (b:Zona {nombre: "Charallave"}) CREATE (a)-[:CONECTA {tiempo_minutos: 11.2, trafico_actual: "bajo", distancia_km: 6.0}]->(b);
MATCH (a:Zona {nombre: "Charallave"}), (b:Zona {nombre: "Santa Teresa del Tuy"}) CREATE (a)-[:CONECTA {tiempo_minutos: 20.1, trafico_actual: "medio", distancia_km: 9.0}]->(b);
MATCH (a:Zona {nombre: "Santa Teresa del Tuy"}), (b:Zona {nombre: "Higuerote"}) CREATE (a)-[:CONECTA {tiempo_minutos: 139.6, trafico_actual: "alto", distancia_km: 50.0}]->(b);
MATCH (a:Zona {nombre: "Los Teques"}), (b:Zona {nombre: "Baruta"}) CREATE (a)-[:CONECTA {tiempo_minutos: 22.3, trafico_actual: "medio", distancia_km: 10.0}]->(b);
MATCH (a:Zona {nombre: "Maracaibo Centro"}), (b:Zona {nombre: "San Francisco"}) CREATE (a)-[:CONECTA {tiempo_minutos: 26.8, trafico_actual: "medio", distancia_km: 12.0}]->(b);
MATCH (a:Zona {nombre: "San Francisco"}), (b:Zona {nombre: "La Limpia"}) CREATE (a)-[:CONECTA {tiempo_minutos: 13.1, trafico_actual: "bajo", distancia_km: 7.0}]->(b);
MATCH (a:Zona {nombre: "La Limpia"}), (b:Zona {nombre: "El Milagro"}) CREATE (a)-[:CONECTA {tiempo_minutos: 11.2, trafico_actual: "medio", distancia_km: 5.0}]->(b);
MATCH (a:Zona {nombre: "El Milagro"}), (b:Zona {nombre: "Sabaneta"}) CREATE (a)-[:CONECTA {tiempo_minutos: 8.3, trafico_actual: "bajo", distancia_km: 4.5}]->(b);
MATCH (a:Zona {nombre: "Sabaneta"}), (b:Zona {nombre: "Pomona"}) CREATE (a)-[:CONECTA {tiempo_minutos: 13.8, trafico_actual: "medio", distancia_km: 6.2}]->(b);
MATCH (a:Zona {nombre: "Pomona"}), (b:Zona {nombre: "Circunvalación 2"}) CREATE (a)-[:CONECTA {tiempo_minutos: 22.3, trafico_actual: "alto", distancia_km: 8.0}]->(b);
MATCH (a:Zona {nombre: "Circunvalación 2"}), (b:Zona {nombre: "Ciudad Ojeda"}) CREATE (a)-[:CONECTA {tiempo_minutos: 55.8, trafico_actual: "alto", distancia_km: 20.0}]->(b);
MATCH (a:Zona {nombre: "Ciudad Ojeda"}), (b:Zona {nombre: "La Lago"}) CREATE (a)-[:CONECTA {tiempo_minutos: 22.3, trafico_actual: "medio", distancia_km: 10.0}]->(b);
MATCH (a:Zona {nombre: "La Lago"}), (b:Zona {nombre: "Bella Vista"}) CREATE (a)-[:CONECTA {tiempo_minutos: 5.6, trafico_actual: "bajo", distancia_km: 3.0}]->(b);
MATCH (a:Zona {nombre: "San Francisco"}), (b:Zona {nombre: "Sabaneta"}) CREATE (a)-[:CONECTA {tiempo_minutos: 12.2, trafico_actual: "medio", distancia_km: 5.5}]->(b);
MATCH (a:Zona {nombre: "Valencia Centro"}), (b:Zona {nombre: "El Trigal"}) CREATE (a)-[:CONECTA {tiempo_minutos: 6.5, trafico_actual: "bajo", distancia_km: 3.5}]->(b);
MATCH (a:Zona {nombre: "El Trigal"}), (b:Zona {nombre: "Naguanagua"}) CREATE (a)-[:CONECTA {tiempo_minutos: 11.2, trafico_actual: "medio", distancia_km: 5.0}]->(b);
MATCH (a:Zona {nombre: "Naguanagua"}), (b:Zona {nombre: "Flor Amarillo"}) CREATE (a)-[:CONECTA {tiempo_minutos: 18.3, trafico_actual: "medio", distancia_km: 8.2}]->(b);
MATCH (a:Zona {nombre: "Flor Amarillo"}), (b:Zona {nombre: "San Diego"}) CREATE (a)-[:CONECTA {tiempo_minutos: 27.9, trafico_actual: "alto", distancia_km: 10.0}]->(b);
MATCH (a:Zona {nombre: "San Diego"}), (b:Zona {nombre: "Los Guayos"}) CREATE (a)-[:CONECTA {tiempo_minutos: 12.1, trafico_actual: "bajo", distancia_km: 6.5}]->(b);
MATCH (a:Zona {nombre: "Los Guayos"}), (b:Zona {nombre: "La Isabelica"}) CREATE (a)-[:CONECTA {tiempo_minutos: 15.7, trafico_actual: "medio", distancia_km: 7.0}]->(b);
MATCH (a:Zona {nombre: "La Isabelica"}), (b:Zona {nombre: "Parque Valencia"}) CREATE (a)-[:CONECTA {tiempo_minutos: 12.9, trafico_actual: "medio", distancia_km: 5.8}]->(b);
MATCH (a:Zona {nombre: "Parque Valencia"}), (b:Zona {nombre: "La Quizanda"}) CREATE (a)-[:CONECTA {tiempo_minutos: 8.6, trafico_actual: "bajo", distancia_km: 4.6}]->(b);
MATCH (a:Zona {nombre: "La Quizanda"}), (b:Zona {nombre: "Tocuyito"}) CREATE (a)-[:CONECTA {tiempo_minutos: 41.9, trafico_actual: "alto", distancia_km: 15.0}]->(b);
MATCH (a:Zona {nombre: "Valencia Centro"}), (b:Zona {nombre: "San Diego"}) CREATE (a)-[:CONECTA {tiempo_minutos: 21.2, trafico_actual: "medio", distancia_km: 9.5}]->(b);
MATCH (a:Zona {nombre: "Barquisimeto Centro"}), (b:Zona {nombre: "Cabudare"}) CREATE (a)-[:CONECTA {tiempo_minutos: 19.0, trafico_actual: "medio", distancia_km: 8.5}]->(b);
MATCH (a:Zona {nombre: "Cabudare"}), (b:Zona {nombre: "Santa Rosa"}) CREATE (a)-[:CONECTA {tiempo_minutos: 9.6, trafico_actual: "bajo", distancia_km: 5.2}]->(b);
MATCH (a:Zona {nombre: "Santa Rosa"}), (b:Zona {nombre: "El Ujano"}) CREATE (a)-[:CONECTA {tiempo_minutos: 6.2, trafico_actual: "bajo", distancia_km: 3.3}]->(b);
MATCH (a:Zona {nombre: "El Ujano"}), (b:Zona {nombre: "Pueblo Nuevo"}) CREATE (a)-[:CONECTA {tiempo_minutos: 9.2, trafico_actual: "medio", distancia_km: 4.1}]->(b);
MATCH (a:Zona {nombre: "Pueblo Nuevo"}), (b:Zona {nombre: "La Carucieña"}) CREATE (a)-[:CONECTA {tiempo_minutos: 14.5, trafico_actual: "medio", distancia_km: 6.5}]->(b);
MATCH (a:Zona {nombre: "La Carucieña"}), (b:Zona {nombre: "La Hacienda"}) CREATE (a)-[:CONECTA {tiempo_minutos: 15.9, trafico_actual: "alto", distancia_km: 5.7}]->(b);
MATCH (a:Zona {nombre: "La Hacienda"}), (b:Zona {nombre: "Tamaca"}) CREATE (a)-[:CONECTA {tiempo_minutos: 22.3, trafico_actual: "medio", distancia_km: 10.0}]->(b);
MATCH (a:Zona {nombre: "Tamaca"}), (b:Zona {nombre: "Las Trinitarias"}) CREATE (a)-[:CONECTA {tiempo_minutos: 22.3, trafico_actual: "alto", distancia_km: 8.0}]->(b);
MATCH (a:Zona {nombre: "Las Trinitarias"}), (b:Zona {nombre: "Macuto"}) CREATE (a)-[:CONECTA {tiempo_minutos: 8.3, trafico_actual: "bajo", distancia_km: 4.5}]->(b);
MATCH (a:Zona {nombre: "Cabudare"}), (b:Zona {nombre: "Macuto"}) CREATE (a)-[:CONECTA {tiempo_minutos: 20.5, trafico_actual: "medio", distancia_km: 9.2}]->(b);
