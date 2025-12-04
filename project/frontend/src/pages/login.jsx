import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Navbar from "../components/navbar";
import './login.css';


function LoginForm() {
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();
    
    const [form, setForm] = useState({ /* Bien */
        email: "",
        contrasena: ""
    });

    const handleChange = (e) => { /* Bien */
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => { /* Bien */
        e.preventDefault();
        
        let tokenParaEnviar = null;

        // asegurar que executeRecaptcha esté disponible (protegemos en dev)
        if (!executeRecaptcha) {
            console.warn("reCAPTCHA no inicializado; continuar sin token (solo dev).");
        } else {
            try {
                tokenParaEnviar = await executeRecaptcha("login");
            } catch (err) {
                console.error("Error al ejecutar reCAPTCHA:", err);
                alert("Error al verificar CAPTCHA. Intenta nuevamente.");
                return;
            }
        }

        const emailLimpio = form.email.trim().toLowerCase().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailLimpio,
                    contrasena: form.contrasena,
                    captcha: tokenParaEnviar
                }),
            });
            

            const data = await res.json();

            if (res.ok) {
                alert("Login exitoso");
                localStorage.setItem("token", data.token);
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
                                minLength={5}
                                maxLength={50}
                                placeholder="ejemplo@correo.com"
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
                                minLength={8}
                                maxLength={20}
                                placeholder="Mínimo 8 caracteres"
                            />
                        </label>
                        
                        <button type="submit" data-cy="submit-login">Iniciar Sesión</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default function Login() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
            <LoginForm />
        </GoogleReCaptchaProvider>
    );
}