import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import './navbar.css';

function Navbar() {
    const [usuario, setUsuario] = useState(null);
    const isLoggedIn = !!usuario;

    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
            try {
                setUsuario(JSON.parse(storedUser));
            } catch (err) {
                console.error("Error parsing usuario:", err);
                localStorage.removeItem("usuario");
            }
        }
    }, []);

    const handleLogout = () => { /* Bien */
        localStorage.removeItem("usuario");
        setUsuario(null); 
        navigate("/");
    };

    const toggleMenu = () => { /* Bien */
        setMenuAbierto(!menuAbierto);
    };

    useEffect(() => { /* Bien */
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
                <form className="search-form" role="search">
                    <input type="search" placeholder="Search" aria-label="Search"/>
                    <button className="button_search" type="submit">Search</button>
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
                <Link to="/carrito"> | Carrito</Link>
            </div>
        </nav>
    );
}

export default Navbar;
