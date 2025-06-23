from reactpy import component, html
from reactpy.backend.fastapi import configure
from fastapi import FastAPI

@component
def HelloWorld():
    return html.div(
        html.h1("lista de compras"),
        html.ul(
            html.li("leche"),
            html.li("pan"),
            html.li("huevos"),
            html.li("queso"),
            html.li("tomates")
        )
    )




app = FastAPI()
configure(app,HelloWorld)
