import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import './navbar.css';

function Navbar() {
    const [usuario, setUsuario] = useState(null);
    const isLoggedIn = !!usuario;
    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        
        const updateCartCount = () => {
            const carritoGuardado = localStorage.getItem("carrito");
            if (carritoGuardado) {
                setCartCount(JSON.parse(carritoGuardado).length);
            } else {
                setCartCount(0);
            }
        };
        updateCartCount();

        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
            try {
                setUsuario(JSON.parse(storedUser));
            } catch (err) {
                console.error("Error parsing usuario:", err);
                localStorage.removeItem("usuario");
            }
        }
        window.addEventListener("storage", updateCartCount);
        return () => {
            window.removeEventListener("storage", updateCartCount);
        };

    }, []);

    const handleLogout = () => { /* Bien */
        localStorage.removeItem("usuario");
        setUsuario(null); 
        navigate("/");
    };

    
    const handleSearchSubmit = (e) => {
        e.preventDefault(); 
        const term = searchTerm.trim();
        if (term) {
            navigate(`/Inicio?q=${encodeURIComponent(term)}`); 
        } else {
            navigate('/Inicio'); 
        }
    };

    const toggleMenu = () => { 
        setMenuAbierto(!menuAbierto);
    };

    useEffect(() => { 
        const handleClickFuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickFuera);
        return () => {
            document.removeEventListener("mousedown", handleClickFuera);
        };
    }, []);

    
    return (
        <nav className="navbar">
            <div className="nav-izq">
                <div className="logo">
                    <Link to="/Inicio">RescateFresco</Link>
                </div>
                <ul className="nav-links">
                    <li><Link to="/Inicio">Inicio</Link></li>
                    {isLoggedIn && (usuario.rol === 'admin' || usuario.rol === 'tienda') && (usuario.tienda === true) && (
                        <>
                        <li><Link to="/Inicio/Tienda">Mi Tienda</Link></li>
                        <li><Link to="/Inicio/Publicar/Nuevo-Producto">Publicar Producto</Link></li>
                        </>
                    )}
                    {isLoggedIn && (usuario.rol === 'admin' || usuario.rol === 'tienda') && (usuario.tienda === false) && (
                        <li><Link to="/Inicio/Crear-Tienda">Crear Tienda</Link></li>
                    )}
                </ul>
            </div>

            <div className="nav-der">
                <form className="search-form" role="search" onSubmit={handleSearchSubmit}>
                    <input type="search" placeholder="Buscar" aria-label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button className="button_search" type="submit">Buscar</button>
                </form>

                <div className="auth-buttons">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/Iniciar-Sesion" className="btn-login">Iniciar Sesión</Link>
                            <Link to="/Registrarse" className="btn-register">Registrarse</Link>
                        </>
                    ) : (
                        <div className="perfil-container" ref={menuRef}>
                            <button className="usuario-nombre"onClick={toggleMenu}>
                                Hola, {usuario.nombre_usuario}!! ▼
                            </button>
                            {menuAbierto && (
                                <div className="menu-desplegable">
                                    <Link to="/perfil">Mi Perfil</Link>
                                    <Link to="/historial">Historial</Link>
                                    <button onClick={handleLogout} className="btn-logout">Cerrar sesión</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <Link to="/carrito" className="cart-link">
                    <img src="https://images.falabella.com/v3/assets/blt7c5c2f2f888a7cc3/bltee24e879d497dc04/65b2492a1be7ff13e55d90c6/carritodesk.svg" alt="Carrito" />
                    {cartCount >= 0 && (
                        <span className="cart-count">{cartCount}</span>
                    )
                        
                    }
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;
