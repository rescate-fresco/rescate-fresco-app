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
PORT = 5000 # Se recomienda 5000
DATABASE_URL = postgres://usuario:contraseña@localhost:5432/rescate_db # Modificar ususario y contraseña de Postgres
```

Finalmente, pegar el siguiente contenido en el archivo creado en frontend:
```bash
VITE_API_URL=http://localhost:5000/
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



------
### 🛡️ Configuración de Google reCAPTCHA v3

El proyecto utiliza Google reCAPTCHA v3 en el formulario de inicio de sesión para protegerlo contra bots. Para que funcione en un entorno de producción, necesitas obtener tus propias claves de API de Google.

**1. Obtener Claves de reCAPTCHA**

1.  Ve a la [consola de administración de reCAPTCHA](https://www.google.com/recaptcha/admin/create).
2.  Inicia sesión con tu cuenta de Google.
3.  Registra un nuevo sitio:
    *   **Etiqueta:** Elige un nombre descriptivo (ej. `Rescate Fresco App`).
    *   **Tipo de reCAPTCHA:** Selecciona **reCAPTCHA v3** (por puntuación) o **reCAPTCHA v2** (por desafío).
    *   **Dominios:** Agrega los dominios donde se ejecutará tu aplicación. Para desarrollo local, puedes agregar `localhost`.
4.  Acepta los términos del servicio y haz clic en "Enviar".
5.  En la siguiente página, se te proporcionarán la **Clave del sitio** y la **Clave secreta**.

**2. Configurar Variables de Entorno**

Ahora, debes agregar estas claves a los archivos `.env` correspondientes.

*   **Backend:** Agrega la **Clave secreta** al archivo `project/backend/.env`.
    ```bash
    RECAPTCHA_SECRET_KEY=TU_CLAVE_SECRETA_AQUI
    ```

*   **Frontend:** Agrega la **Clave del sitio** al archivo `project/frontend/.env`.
    ```bash
    VITE_RECAPTCHA_SITE_KEY=TU_CLAVE_DEL_SITIO_AQUI
    ```

> **Nota:** La validación de reCAPTCHA en el backend está configurada para ejecutarse únicamente en el entorno de producción (`NODE_ENV=production`). Esto facilita las pruebas durante el desarrollo sin necesidad de un token de CAPTCHA válido.


### 💳 Configuración de Stripe

El proyecto utiliza Stripe para procesar los pagos de las reservas de productos. Para habilitar esta funcionalidad, necesitas obtener tus propias claves de API desde el dashboard de Stripe.

**1. Obtener Claves de API de Stripe**

1.  Crea una cuenta o inicia sesión en el Dashboard de Stripe.
2.  Asegúrate de que estás en **modo de prueba** (el interruptor suele estar en la parte superior izquierda).
3.  Ve a la sección de **Desarrolladores > Claves de API**.
4.  Allí encontrarás dos claves que necesitas:
    *   **Clave publicable (Publishable key):** Empieza con `pk_test_...`. Se usa en el frontend.
    *   **Clave secreta (Secret key):** Empieza con `sk_test_...`. Se usa en el backend. Haz clic en "Revelar clave de prueba" para verla.

**2. Configurar Variables de Entorno**

Agrega estas claves a tus archivos `.env` para que la aplicación pueda usarlas.

*   **Backend:** Agrega la **Clave secreta** al archivo `project/backend/.env`.
    ```bash
    STRIPE_SECRET_KEY=TU_CLAVE_SECRETA_AQUI
    ```

*   **Frontend:** Agrega la **Clave publicable** al archivo `project/frontend/.env`.
    ```bash
    VITE_STRIPE_PUBLIC_KEY=TU_CLAVE_PUBLICABLE_AQUI
    ```

> **Nota:** Los comandos `npm install` que ejecutaste anteriormente en las carpetas `frontend` y `backend` ya se encargaron de instalar los paquetes necesarios de Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js` y `stripe`).

**3. Configurar Webhooks para Desarrollo Local (con Stripe CLI)**

Para probar el flujo de pago completo localmente, necesitas que Stripe pueda notificar a tu backend cuando un pago es exitoso. Para ello, se utiliza la CLI de Stripe.

1.  **Descarga la CLI de Stripe:** Ve a la página de lanzamientos de la [CLI en GitHub](https://github.com/stripe/stripe-cli/releases/tag/v1.32.0) y descarga el archivo para tu sistema operativo (ej. `stripe_1.32.0_windows_i386.zip`).

2.  **Inicia sesión (solo una vez):** Descomprime el archivo y abre una terminal en la carpeta donde está el ejecutable `stripe.exe`. Ejecuta el siguiente comando para vincular la CLI con tu cuenta de Stripe. **Este paso solo se hace una vez.**
    ```bash
    ./stripe login
    ```
    Esto abrirá tu navegador para que confirmes el acceso.

    > **Importante:** Si recibes un error de "comando no encontrado", asegúrate de que la terminal esté abierta **dentro de la carpeta** donde se encuentra `stripe.exe`. El comando `./` le indica a la terminal que ejecute el programa desde el directorio actual.

3.  **Escucha y reenvía eventos (para cada sesión de desarrollo):** Con tu servidor backend corriendo, ejecuta el siguiente comando en la terminal de la CLI de Stripe. **Debes hacer esto cada vez que inicies una sesión de desarrollo para probar los pagos.**
    ```bash
    .\stripe.exe listen --forward-to http://localhost:5000/api/payments/stripe-webhook
    ```

4.  **Configura el Webhook Secret:** Al ejecutar el comando `listen`, la terminal te mostrará un **secreto de firma de webhook** (empieza con `whsec_...`).

    Copia este valor y agrégalo a tu archivo `project/backend/.env`:
    ```bash
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

### Configuración para correo electronico
1. Ir a [resent.com](https://resend.com) y crear una cuenta
2. Obtener las API Keys y crear una nueva clave
3. Instalar con npm install en el backend las dependencias de resend
4. En el .env, colocar RESEND_API_KEY = 'clave'