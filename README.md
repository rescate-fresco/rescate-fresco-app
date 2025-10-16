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
* PostgreSQL (v13+ recomendado) → https://www.postgresql.org/download/  

Verificar instalaciones (Terminal): 
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
* dotenv → Librería para cargar variables de entorno.
* nodemon → Herramienta para reiniciar automáticamente la aplicación cada vez que detecta cambios
* pg → Cliente para PostgreSQL.
* bcrypt → Hasheo de contraseña.
* jsonwebtoken → Token para sesión.
* Otros módulos → Dependencias adicionales según el proyecto.

Instalación (Terminal):
```bash
cd project/backend
npm install
.env
```

**Frontend (package.json)**

* react → Biblioteca principal para interfaces de usuario.
* react-dom → Gestión del DOM.
* react-scripts → Scripts para desarrollo y construcción.
* react-router-dom → Biblioteca que permite la navegación entre vistas.
* cypress → Pruebas de interfaz de ususario (UI).
* mocha-junit-reporter -> 
* Otros módulos → Dependencias adicionales según el proyecto.

Instalación (Terminal):
```bash
cd project/frontend
npm install
npm install react-icons
```

### ⚙️ Configuración del entorno

⚠️ IMPORTANTE: para configurar el entorno se debe crear un archivo .env en la carpeta backend/. Luego, pegar el siguiente contenido en el archivo creado:
```bash
PORT = 5000 # Se recomienda 5000
DATABASE_URL = postgres://usuario:contraseña@localhost:5432/rescate_db # Modificar ususario y contraseña de Postgres
```

### 💾 Configuración de la Base de Datos

⚠️ IMPORTANTE: se debe tener PostgreSQL instalado y configurado con un **usuario y contraseña válidos**, los cuales deben ser agregados en el archivo .env (**Configuración del entorno**).

Creae tablas: Antes de ejecutar el siguiente código en terminal, se debe modificar el usuario:
```bash
psql -U usuario -d rescate_db -f project/backend/src/database/init.sql
# Pedirá la contraseña de Postgres por terminal
```

### 🏆 Ejecución del Proyecto

Asegurar de tener ambos servidores corriendo para que el frontend pueda comunicarse con el backend.

**Backend (Terminal)**
```bash
# Para Desarrollo
cd project/backend
npm run dev

# Para Producción 
cd project/backend
npm run start
```

**Frontend (Terminal)**
```bash
cd project/frontend
npm run dev
```
