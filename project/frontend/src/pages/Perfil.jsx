import { useEffect, useState } from "react";
import Navbar from "../components/navbar.jsx";
import './Perfil.css';

const Perfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
        
        if (storedUser.id_usuario) {
            fetch(`${import.meta.env.VITE_API_URL}api/auth/perfil/${storedUser.id_usuario}`)
                .then(res => res.json())
                .then(data => {
                    setUsuario(data);
                    
                    // ✅ NUEVO: Solo actualizar localStorage si tiene todos los datos
                    if (data && data.id_usuario) {
                        // Mantener datos existentes que no vengan del servidor
                        const usuarioCompleto = {
                            ...storedUser, // Mantener datos previos
                            ...data        // Sobrescribir con datos nuevos
                        };
                        localStorage.setItem("usuario", JSON.stringify(usuarioCompleto));
                        
                        // Notificar al Navbar
                        window.dispatchEvent(
                            new CustomEvent('usuarioActualizado', { detail: usuarioCompleto })
                        );
                    }
                    setCargando(false);
                })
                .catch(err => {
                    console.error("Error cargando perfil:", err);
                    setCargando(false);
                });
        }
    }, []);

    if (cargando) return <div>Cargando...</div>;
    if (!usuario) return <div>Usuario no encontrado</div>;

    return (
        <div className="Perfil">
            <Navbar />
            <div className="Cuerpo">
                <div className="perfil-container">
                    <h2>Mi Perfil</h2>
                    
                    <div className="perfil-info">
                        <div className="info-item">
                            <label>Usuario:</label>
                            <span>{usuario.nombre_usuario}</span>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{usuario.email}</span>
                        </div>
                        <div className="info-item">
                            <label>Dirección:</label>
                            <span>{usuario.direccion_usuario || "No especificada"}</span>
                        </div>
                    </div>

                    <div className="kg-rescatados-card">
                        <div className="kg-icon">🥕</div>
                        <div className="kg-content">
                            <h3>Kg Rescatados</h3>
                            <div className="kg-numero">{usuario.kg_rescatados}</div>
                            <p className="kg-subtexto">kilogramos de comida rescatada</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;