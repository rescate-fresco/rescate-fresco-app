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
# 🎥 Videos

[**Tutorial para levevantar el proyecto**](https://youtu.be/ARGkUSNoyf8)

[**Entrega Final**](https://www.youtube.com/watch?v=zRNs_3XpyyI)

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
│   ├── backend/       
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── database/ 
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── instrument.js 
│   │   │   └── server.js
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/ 
│   │   │   ├── pages/ 
│   │   │   ├── utils/
│   │   │   ├── App.css 
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   └── package.json
│   └── test/
│       ├── .scannerwork/
│       ├── Cypress/
│       ├── Python/
│       ├── Selenium/
│       └── jmeter/
├── .gitignore
└── README.md        
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
* react-google-recaptcha-v3 → Hook de React para integrar Google reCAPTCHA v3.
* nodemon → Herramienta para reiniciar automáticamente la aplicación cada vez que detecta cambios
* pg → Cliente para PostgreSQL.
* bcrypt → Hasheo de contraseña.
* jsonwebtoken → Token para sesión.
* resend → Servicio de email.
* @aws-sdk/client-s3 → cliente s3 aws.
* multer → gestionar carga de archivos.
* stripe → SDK oficial de Stripe para interactuar con la API desde Node.js.
* Otros módulos → Dependencias adicionales según el proyecto.

Instalación (Terminal):
```bash
cd project/backend
npm install
```

**Frontend (package.json)**
* react → Biblioteca principal para interfaces de usuario.
* react-dom → Gestión del DOM.
* react-scripts → Scripts para desarrollo y construcción.
* react-router-dom → Biblioteca que permite la navegación entre vistas.
* @stripe/react-stripe-js → Componentes y hooks de React para Stripe.
* @stripe/stripe-js → Librería base para interactuar con la API de Stripe en el cliente.
* react-google-recaptcha-v3 → hook de React para integrar Google reCAPTCHA v3.
* react-icons → Librería de iconos propia de React   
* cypress → Pruebas de interfaz de ususario (UI).
* mocha-junit-reporter → Formatear en un archivo de salida con el formato JUnit XML
* Otros módulos → Dependencias adicionales según el proyecto.

Instalación (Terminal):
```bash
cd project/frontend
npm install
```

### ⚙️ Configuración del entorno

⚠️ IMPORTANTE: para configurar el entorno se debe crear un archivo .env en la carpeta backend/ y  frontend/. 

Luego, pegar el siguiente contenido en el archivo creado en backend:
```bash
PORT=5000

# --- Configuración de la base de datos local ---
DATABASE_URL
JWT_SECRET

# --- Credenciales de AWS S3 (Del usuario IAM) ---
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_BUCKET_NAME
AWS_REGION

# --- Credenciales de AWS RDS (PostgreSQL) ---
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME

# --- Credenciales Jenkins ---
JENKINS_USER
JENKINS_PASSWORD
JENKINS_HOST
# Correr docker en PuTTY: docker start c8640771ed33

# --- Credenciales de Stripe ---
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

RESEND_API_KEY
```

Finalmente, pegar el siguiente contenido en el archivo creado en frontend:
```bash
VITE_API_URL

# --- Credenciales de Stripe ---
VITE_STRIPE_PUBLIC_KEY
```

### ⚙️ Configuraciones de dependencias

**Stripe:** haz click [AQUÍ](https://github.com/rescate-fresco/rescate-fresco-app/wiki/Stripe) para configurar Stripe.

**reCAPTCHA:** haz click [AQUÍ](https://github.com/rescate-fresco/rescate-fresco-app/wiki/reCAPTCHA-V3) para configurar reCAPTCHA.

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