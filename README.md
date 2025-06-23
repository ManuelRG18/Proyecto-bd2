# Proyecto Frontend - React + Vite + TypeScript

Este proyecto es el frontend de la aplicación, construido con React, Vite y TypeScript.

## Tecnologías principales

- React
- Vite
- TypeScript
- Axios (para llamadas HTTP)

## Requisitos previos

- Node.js (recomendado versión 16 o superior)
- npm (viene con Node.js) o yarn si prefieres

## Instalación

1. Clona el repositorio (o descarga el proyecto):

   ```bash
   git clone https://github.com/ManuelRG18/Proyecto-bd2/tree/front_react
   cd front_react
2. Instala las dependencias:

   ```bash
   npm install

3. Instala axios (si no está incluido en package.json):

   ```bash
   npm install axios
   Si axios ya está en package.json, este paso no es necesario.

4. Ejecución en modo desarrollo
Para levantar el servidor de desarrollo con recarga en caliente:

   ```bash
   npm run dev

Luego abre tu navegador en http://localhost:5173 (o la URL que indique la consola).

5. Construcción para producción
Para generar los archivos optimizados para producción:

   ```bash
   npm run build
   
Los archivos compilados se guardarán en la carpeta dist/.

## Notas adicionales
- Asegúrate de tener un archivo .env con las variables de entorno necesarias si tu proyecto las usa.
- Revisa el archivo .gitignore para que no se suban dependencias ni archivos temporales.
- Para más información sobre Vite, React o TypeScript, consulta la documentación oficial.
