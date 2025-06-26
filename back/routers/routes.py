from fastapi import APIRouter
from db.neo4j_conn import get_driver

router = APIRouter()

@router.get("/zonas")
def get_zonas():
    driver = get_driver()
    with driver.session() as session:
        result = session.run("MATCH (z:Zona) RETURN z.nombre AS nombre, z.estado AS estado, z.tipo_zona AS tipo_zona")
        return [record.data() for record in result]
