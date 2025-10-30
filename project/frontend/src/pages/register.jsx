import React, { useState } from "react";
import Navbar from "../components/navbar.jsx";
import './register.css';
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
    nombre_usuario: "",
    email: "",
    contrasena: "",
    rol: "consumidor",
    direccion_usuario: ""
    });

    const handleChange = (e) => { // e es el evento
        setForm({ ...form, [e.target.name]: e.target.value }); // e.target.name es el nombre del input y e.target.value es el valor del input (...form es el estado actual)
    };

    const handleSubmit = async (e) => { // e es el evento
        e.preventDefault(); // evita que se recargue la página
        const emailLimpio = form.email.trim().toLowerCase();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre_usuario: form.nombre_usuario,
                    email: emailLimpio,
                    contrasena: form.contrasena,
                    rol: form.rol,
                    direccion_usuario: form.direccion_usuario
                }),
            });
            
            const data = await res.json();

            if (res.ok) {
                alert("Usuario registrado con éxito");
                setForm({
                    nombre_usuario: "",
                    email: "",
                    contrasena: "",
                    rol: "consumidor",
                    direccion_usuario: ""
                });
                navigate("/Inicio");
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        }
    };

    return (
        <div className="Register">
            <Navbar />
            <div className="Cuerpo">
                
                <div className="register-container">
                    <h2>Registrarse</h2>
                    <form onSubmit={handleSubmit} className="register-form">
                        <label>
                            Nombre:
                            <input
                                type="text"
                                name="nombre_usuario"
                                value={form.nombre_usuario}
                                onChange={handleChange}
                                required
                                minLength={5}
                                maxLength={20}
                            />
                        </label>

                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                minLength={5}
                                maxLength={50}
                                placeholder="ejemplo@correo.com"
                            />
                        </label>
                        {form.email.length > 0 && form.email.length < 5 && (
                            <p style={{ color: "red" }}>El correo debe tener al menos 5 caracteres.</p>
                        )}

                        <label>
                            Contraseña:
                            <input
                                type="password"
                                name="contrasena"
                                value={form.contrasena}
                                onChange={handleChange}
                                requiredminLength={8}
                                maxLength={20}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </label>
                        {form.contrasena.length > 0 && form.contrasena.length < 8 && (
                            <p style={{ color: "red" }}>La contraseña debe tener al menos 8 caracteres.</p>
                        )}

                        <label>
                            Rol:
                            <select name="rol" value={form.rol} onChange={handleChange} required>
                                <option value="consumidor">Consumidor</option>
                                <option value="tienda">Tienda</option>
                            </select>
                        </label>

                        <label>
                            Dirección:
                            <textarea
                                name="direccion_usuario"
                                value={form.direccion_usuario}
                                onChange={handleChange}
                                required
                                minLength={5}
                                maxLength={50}
                            />
                        </label>

                        <button type="submit" data-cy="submit-register">Registrarse</button>
                    </form>
                </div>

            </div>
        </div>
    );
}
export default Register;