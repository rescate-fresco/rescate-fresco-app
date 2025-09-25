# 🥕 Rescate Fresco 

Marketplace de productos próximos a vencer o con defectos estéticos. Conectamos a tiendas locales con consumidores cercanos para reducir merma y ofrecer alimentos más baratos. Tiendas publican lotes con precio de rescate, fotos y horarios de retiro. Consumidores reservan lotes y reciben alertas de última hora.

## 🚨 El Problema

* Productos cercanos a vencimiento o imperfectos terminan como merma.
* Tiendas pequeñas no tienen un canal digital simple para publicar remates.
* Clientes no se enteran de las ofertas a tiempo ni pueden reservar fácilmente.
* No existe trazabilidad del impacto ni métricas claras.

## 💡 La Solución

Rescate Fresco permite a las tiendas publicar lotes de rescate con vencimiento y precio reducido, mientras los consumidores reservan con precios convenientes y retiran en horarios definidos.

* Publicación rápida de lotes con fotos, precio de rescate y vencimiento.
* Reserva express y confirmación de retiro vía QR o PIN.
* Notificaciones de “última hora” y recomendaciones personalizadas.
* Panel con KPIs de impacto: kg rescatados, % merma evitada, ahorro y más.

## 🎯 Misión
Reducir la merma en comercios locales y facilitar el acceso a alimentos más baratos, con una experiencia simple, medible y colaborativa.

## Estructura del Proyecto

El proyecto está organizado en una arquitectura de monorepo, con directorios separados para el front-end y el back-end dentro de la carpeta project.
```bash
rescate-fresco-app/
├── project/
│   ├── frontend/   # Aplicación de front-end con React
│   └── backend/    # Servidor de back-end con Node.js y Express
├── .gitignore      # Archivo para ignorar directorios y archivos de Git
└── README.md       # Este archivo
```

## Requisitos

Para poder ejecutar este proyecto, necesitas tener las siguientes herramientas instaladas en tu computadora:

* Node.js: Se recomienda la versión 14 o superior. Puedes verificarlo con node -v.

* npm: Se instala junto con Node.js. Puedes verificarlo con npm -v.

* Git: Para clonar el repositorio.

## Instalación y Configuración

### Clonar el repositorio

Abre tu terminal y ejecuta el siguiente comando para clonar el proyecto y navegar a la carpeta principal:

```bash
git clone https://github.com/rescate-fresco/rescate-fresco-app.git
cd rescate-fresco-app
```

### Instalar dependencias backend

Navega a la carpeta del backend e instala las librerías de Node.js, incluyendo Express y CORS.

```bash
cd project/backend
npm install
```

### Instalar dependencias frontend

Navega a la carpeta del frontend e instala las dependencias de React.

```bash
cd ../frontend
npm install
```

## Ejecutar proyecto

### Iniciar servidor backend

```bash
cd project/backend
node server.js
```

### Iniciar servidor frontend

```bash
cd project/frontend
npm run dev
```