import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
// Importación de las páginas
import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Publish from './pages/publish_product'

// Definición de las rutas
const router = createBrowserRouter([
  {
    path: '/', // Ruta principal
    element: <App />, // Componente principal de la aplicación
    errorElement: <div>Error al cargar la aplicación</div>, // Componente de error
    children: [
      {
        index: true,               // Ruta por defecto
        element: <Home />,         // Componente para la ruta principal
      },
      {
        path: 'Inicio',            // Ruta para la página de inicio
        element: <Home />,         // Componente para la página de inicio
      },
      {
        path: 'Inicio/Publicar',   // Ruta para publicar un producto
        element: <Publish />,      // Componente para publicar un producto
      },
      {
        path: 'Iniciar-Sesion',    // Ruta para iniciar sesión
        element: <Login />,        // Componente para iniciar sesión
      },
      {
        path: 'Registrarse',       // Ruta para registrarse
        element: <Register />,     // Componente para registrarse
      }
    ],
  },
])


const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);