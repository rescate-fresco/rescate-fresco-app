import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
// Importación de las páginas
import Home from './pages/home'
import Login from './pages/login'
import Ofertas from './pages/ofertas'
import DetalleLote from './pages/detalle_lote.jsx'
import Carrito from './pages/carrito.jsx'
import MetodoPago from './pages/metodo_pago.jsx'

// Definición de las rutas
const router = createBrowserRouter([
  {
    path: '/', // Ruta principal
    element: <App />, // Componente principal de la aplicación
    errorElement: <div>Error al cargar la aplicación</div>, // Componente de error
    children: [
      {
        index: true,          // Ruta por defecto
        element: <Home />,    // Componente para la ruta principal
      },
      {
        path: 'login',        // Ruta para iniciar sesión
        element: <Login />,   // Componente para iniciar sesión
      },
      {
        path: 'ofertas',
        element: <Ofertas />,
      },
      {
        path: 'ofertas/:id_lote',
        element: <DetalleLote />,
      },
      {
        path: 'carrito',
        element: <Carrito />,
      },
      { 
        path: 'carrito/pago',
        element: <MetodoPago />,
      }
      // Otras rutas pueden ser añadidas aquí

    ],
  },
])


const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);