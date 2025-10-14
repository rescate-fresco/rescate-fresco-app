import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import './login.css';

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ /* Bien */
        email: "",
        contrasena: ""
    });

    const handleChange = (e) => { /* Bien */
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => { /* Bien */
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    contrasena: form.contrasena
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Login exitoso");
                //localStorage.setItem("token", data.token);
                localStorage.setItem("usuario", JSON.stringify(data.usuario)); 
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
        <div className="Login">
            <Navbar />
            <div className="Cuerpo">
                <div className="login-container">
                    <h2>Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit} className="login-form">
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Contraseña:
                            <input
                                type="password"
                                name="contrasena"
                                value={form.contrasena}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <button type="submit">Iniciar Sesión</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Login;