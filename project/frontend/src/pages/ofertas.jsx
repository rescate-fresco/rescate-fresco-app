import React, { useState, useEffect } from 'react';

import ProductoCard from '../components/cartas_productos.jsx'; 
import { Outlet } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/lotes/ofertas`;

const Ofertas = () => {
    const [productosOferta, setProductosOferta] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Log al iniciar la carga
        console.log("Iniciando fetch a:", API_URL); 
        
        const fetchOfertas = async () => {
            try {
                const respuesta = await fetch(API_URL);

                if (!respuesta.ok) {
                    const errorText = await respuesta.text();
                    // Log de error si el estado HTTP no es 2xx
                    console.error("Fallo en la respuesta HTTP:", respuesta.status, errorText);
                    throw new Error(`Error HTTP: ${respuesta.status} - ${errorText}`);
                }

                const datos = await respuesta.json();
                
                // Log de datos recibidos (¡Revisa esto en la Consola!)
                console.log("Datos recibidos (cantidad):", datos.length, datos); 

                setProductosOferta(datos);
                setError(null);

            } catch (err) {
                console.error("Error en el fetch de ofertas:", err);
                setError(`No se pudieron cargar las ofertas: ${err.message}`);
                setProductosOferta([]);
            } finally {
                setCargando(false);
                console.log("Fetch finalizado.");
            }
        };

        fetchOfertas();
    }, []); 

    if (cargando) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold text-gray-400">Cargando lotes en oferta... ⏳</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500">
                <h2 className="text-2xl font-bold">¡Error de Conexión!</h2>
                <p className="text-lg mt-2">{error}</p>
                <p className="text-sm mt-1">Asegúrate de que tu servidor backend esté corriendo en http://localhost:5000.</p>
            </div>
        );
    }
    
    if (productosOferta.length === 0) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold">Lo sentimos, no hay lotes disponibles.</h2>
                <p className="text-gray-500 mt-2">Parece que todos los lotes ya se vendieron o están vencidos.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 text-yellow-400 border-b-2 border-yellow-500 pb-2">
                Ofertas de Rescate Fresco
            </h1>
            <p className="mb-8 text-lg text-gray-300">
                ¡Aprovecha los lotes con descuento antes de que expiren!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productosOferta.map(lote => (
                    <ProductoCard key={lote.id_lote} lote={lote} /> 
                ))}
            </div>
            <Outlet /> 
        </div>
    );
};

export default Ofertas;
