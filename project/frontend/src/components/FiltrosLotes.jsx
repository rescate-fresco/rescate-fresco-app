import React, { useState, useEffect } from 'react';
import './FiltrosLotes.css'; 

const FiltrosLotes = ({ onFilterChange }) => {
    const [categorias, setCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [errorCategorias, setErrorCategorias] = useState(null);

    const [filtros, setFiltros] = useState({
        categoria: '',
        sortBy: 'fecha_vencimiento',
        order: 'ASC',
    });

    
    useEffect(() => {
        const fetchCategorias = async () => {
        setCargandoCategorias(true);
        setErrorCategorias(null);
        try {
            
            const apiUrl = `${import.meta.env.VITE_API_URL}api/lotes/categorias`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
            throw new Error('No se pudieron cargar las categorías.');
            }
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            setErrorCategorias(error.message);
        }
        setCargandoCategorias(false);
        };
        fetchCategorias();
    }, []);

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const nuevosFiltros = { ...filtros, [name]: value };
        setFiltros(nuevosFiltros);
        onFilterChange(nuevosFiltros); 
    };

    
    const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <div className="filtros-container">
        {/* Filtro por Categoría */}
        <select 
            name="categoria" 
            value={filtros.categoria} 
            onChange={handleInputChange} 
            className="filtro-select"
            disabled={cargandoCategorias || errorCategorias}
        >
            {errorCategorias && <option value="">Error al cargar</option>}
            {cargandoCategorias && <option value="">Cargando categorías...</option>}
            {!cargandoCategorias && !errorCategorias && (
            <>
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                <option key={cat} value={cat}>{capitalizar(cat)}</option>
                ))}
            </>
            )}
        </select>

        {/* Ordenar por */}
        <select name="sortBy" value={filtros.sortBy} onChange={handleInputChange} className="filtro-select">
            <option value="fecha_vencimiento">Más próximo a vencer</option>
            <option value="precio_rescate">Precio (más bajo)</option>
        </select>

        {/* Dirección del orden */}
        <select name="order" value={filtros.order} onChange={handleInputChange} className="filtro-select">
            <option value="ASC">Ascendente</option>
            <option value="DESC">Descendente</option>
        </select>
        </div>
    );
};

export default FiltrosLotes;
