from neo4j import GraphDatabase

class Neo4jConnection:
    def __init__(self):
        self.uri = "neo4j://127.0.0.1:7687"
        self.user = "neo4j"
        self.password = "clinica_delivery"
        self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))

    def close(self):
        self.driver.close()

    def query(self, query, parameters=None):
        with self.driver.session() as session:
            return list(session.run(query, parameters or {}))