# 🥕 Rescate Fresco 

Marketplace de productos próximos a vencer o con defectos estéticos. Conectamos a tiendas locales con consumidores cercanos para reducir merma y ofrecer alimentos más baratos. Tiendas publican lotes con precio de rescate, fotos y horarios de retiro. Consumidores reservan lotes y reciben alertas de última hora.

### 🚨 El Problema

* Productos cercanos a vencimiento o imperfectos terminan como merma.
* Tiendas pequeñas no tienen un canal digital simple para publicar remates.
* Clientes no se enteran de las ofertas a tiempo ni pueden reservar fácilmente.
* No existe trazabilidad del impacto ni métricas claras.

### 💡 La Solución

Rescate Fresco permite a las tiendas publicar lotes de rescate con vencimiento y precio reducido, mientras los consumidores reservan con precios convenientes y retiran en horarios definidos.

* Publicación rápida de lotes con fotos, precio de rescate y vencimiento.
* Reserva express y confirmación de retiro vía QR o PIN.
* Notificaciones de “última hora” y recomendaciones personalizadas.
* Panel con KPIs de impacto: kg rescatados, % merma evitada, ahorro y más.

### 🎯 Misión
Reducir la merma en comercios locales y facilitar el acceso a alimentos más baratos, con una experiencia simple, medible y colaborativa.

# 📚 Documentación del Proyecto

### ⏱️ Requisitos Previos

Para poder ejecutar este proyecto, necesitas tener las siguientes herramientas instaladas en tu computadora:

* Node.js (v16+ recomendado) → https://nodejs.org
* npm (v8+ recomendado, incluido con Node.js)
* git → https://git-scm.com/
* Editor de código (recomendado: VSCode)

Verificar instalaciones: 
```bash
node -v
npm -v
git --version
```

### 🗂️ Estructura del Proyecto

El proyecto está organizado con directorios separados para el front-end y el back-end dentro de la carpeta project.
```bash
rescate-fresco-app/
├── project/
│   ├── frontend/   # Aplicación de front-end con React
│   └── backend/    # Servidor de back-end con Node.js y Express
├── tests/
│   └── test.py
├── .gitignore      # Archivo para ignorar directorios y archivos de Git
└── README.md       # Este archivo
```
### 🏛️ Dependencias

**Clonar Repositorio**

Abrir una terminal y ejecutar el siguiente comando para clonar el proyecto:
```bash
git clone https://github.com/rescate-fresco/rescate-fresco-app.git
cd rescate-fresco-app
```

**Backend (package.json)**

* express → Framework para crear el servidor y gestionar rutas HTTP.
* cors → Middleware para habilitar peticiones cross-origin.
* Otros módulos → Dependencias adicionales según el proyecto.

Instalación:
```bash
cd project/backend
npm install
```

**Frontend (package.json)**

* react → Biblioteca principal para interfaces de usuario.
* react-dom → Gestión del DOM.
* react-scripts → Scripts para desarrollo y construcción.
* Otros módulos → Dependencias adicionales según el proyecto.

Instalación:
```bash
cd project/frontend
npm install
```

### 🏆 Ejecución del Proyecto

Asegurar de tener ambos servidores corriendo para que el frontend pueda comunicarse con el backend.

**Backend**
```bash
cd project/backend
npm run dev
```

**Frontend**
```bash
cd project/frontend
npm start
```
