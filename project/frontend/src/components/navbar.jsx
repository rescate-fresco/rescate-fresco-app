import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import './navbar.css';
import { FaSearch, FaBell, FaCheck, FaTimes } from 'react-icons/fa';

function Navbar() {
    const [usuario, setUsuario] = useState(null);
    const isLoggedIn = !!usuario;
    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [notifAbierto, setNotifAbierto] = useState(false);
    const menuRef = useRef(null);
    const notifRef = useRef(null);
    const [notificaciones, setNotificaciones] = useState([]);
    const navigate = useNavigate();

    // ---------------- Cargar usuario, carrito y notificaciones ----------------
    useEffect(() => {
        const carritoGuardado = localStorage.getItem("carrito");
        setCartCount(carritoGuardado ? JSON.parse(carritoGuardado).length : 0);

        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
            try { setUsuario(JSON.parse(storedUser)); }
            catch { localStorage.removeItem("usuario"); }
        }
    }, []);

    useEffect(() => {
        if (usuario) {
            fetch(`http://localhost:5000/api/notificaciones?id_usuario=${usuario.id_usuario}`)
                .then(res => res.json())
                .then(data => {
                    const normalizadas = data.map(n => ({
                        ...n,
                        leida: n.leida === true || n.leida === "true" || n.leida === 1
                    }));
                    setNotificaciones(normalizadas);
                })
                .catch(err => console.error(err));
        }
    }, [usuario]);

    // ---------------- Manejadores ----------------
    const handleLogout = () => { localStorage.removeItem("usuario"); setUsuario(null); navigate("/"); };
    const handleSearchSubmit = e => { e.preventDefault(); navigate(searchTerm.trim() ? `/Inicio?q=${encodeURIComponent(searchTerm)}` : '/Inicio'); };
    const toggleMenu = () => setMenuAbierto(!menuAbierto);
    const toggleNotif = () => setNotifAbierto(!notifAbierto);

    const marcarLeida = (id) => {
        setNotificaciones(prev => prev.map(n => 
            n.id_notificacion === id ? { ...n, leida: true } : n
        ));

        // Llamada al backend (sin bloquear UI)
        fetch(`http://localhost:5000/api/notificaciones/marcar-leida/${id}`, { method: 'PATCH' })
            .catch(err => console.error(err));
    };


    const eliminarNotif = async (id) => {
        await fetch(`http://localhost:5000/api/notificaciones/${id}`, { method: 'DELETE' });
        setNotificaciones(prev => prev.filter(n => n.id_notificacion !== id));
    };

    useEffect(() => { 
        const handleClickFuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setMenuAbierto(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setNotifAbierto(false);
        };
        document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, []);

    const noLeidasCount = notificaciones.filter(n => !n.leida).length;

    // ---------------- Render ----------------
    return (
        <nav className="navbar">
            <div className="nav-izq">
                <div className="logo"><Link to="/Inicio">RescateFresco</Link></div>
                <ul className="nav-links">
                    <li><Link to="/Inicio">Inicio</Link></li>
                    {isLoggedIn && (usuario.rol === 'admin' || usuario.rol === 'tienda') && (
                        usuario.tienda 
                        ? <>
                            <li><Link to="/Inicio/Tienda">Mi Tienda</Link></li>
                            <li><Link to="/Inicio/Publicar/Nuevo-Producto">Publicar Producto</Link></li>
                          </>
                        : <li><Link to="/Inicio/Crear-Tienda">Crear Tienda</Link></li>
                    )}
                </ul>
            </div>

            <div className="nav-der">
                <form className="search-form" role="search" onSubmit={handleSearchSubmit}>
                    <input
                        type="search"
                        placeholder="Buscar productos"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                    <button className="search-button-icon" type="submit"><FaSearch /></button>
                </form>

                {isLoggedIn && (
                    <div className="notificaciones" ref={notifRef}>
                        <button className="bell-icon" onClick={toggleNotif}>
                            <FaBell />
                            {noLeidasCount > 0 && <span className="notif-count">{noLeidasCount}</span>}
                        </button>
                        {notifAbierto && (
                            <div className="notif-dropdown">
                                {notificaciones.length === 0 ? (
                                    <div className="notif-empty">Sin notificaciones</div>
                                ) : (
                                    notificaciones.map(n => (
                                        <div key={n.id_notificacion} className={`notif-item ${n.leida ? 'leida' : 'no-leida'}`}>
                                            <span className="notif-msg">{n.mensaje}</span>
                                            <div className="notif-actions">
                                                {!n.leida && <button onClick={() => marcarLeida(n.id_notificacion)} title="Marcar como leída"><FaCheck /></button>}
                                                <button onClick={() => eliminarNotif(n.id_notificacion)} title="Eliminar"><FaTimes /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                <Link to="/carrito" className="cart-link">
                    <img src="https://images.falabella.com/v3/assets/blt7c5c2f2f888a7cc3/bltee24e879d497dc04/65b2492a1be7ff13e55d90c6/carritodesk.svg" alt="Carrito" />
                    {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </Link>

                <div className="auth-buttons">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/Iniciar-Sesion" className="btn-login">Iniciar Sesión</Link>
                            <Link to="/Registrarse" className="btn-register">Registrarse</Link>
                        </>
                    ) : (

                        <div className="perfil-container-2" ref={menuRef}>
                            <button className="usuario-nombre"onClick={toggleMenu}>
                                Hola, {usuario.nombre_usuario}!! ▼
                            </button>
                            {menuAbierto && (
                                <div className="menu-desplegable">
                                    <Link to="/perfil">Mi Perfil</Link>
                                    <Link to="/mis-compras">Mis Compras</Link>
                                    <button onClick={handleLogout} className="btn-logout">Cerrar sesión</button>

                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
