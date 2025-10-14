import Navbar from "../components/navbar.jsx";
import React, { useState } from "react";
import './new_store.css';

function NewStore() {
    const [form, setForm] = useState({
        nombre_tienda: "",
        direccion_tienda: "",
        telefono_tienda: "",
        lat: "",
        lng: "",
    });

    const handleChange = (e) => {
    const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const storedUser = localStorage.getItem("usuario");
    const usuario = storedUser ? JSON.parse(storedUser) : null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar formato de teléfono chileno (+569XXXXXXXX)
        const telefonoRegex = /^\+569\d{8}$/;
        if (form.telefono_tienda && !telefonoRegex.test(form.telefono_tienda)) {
        alert("El número debe tener el formato +569XXXXXXXX 📱");
        return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/auth/tiendas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            nombre_tienda: form.nombre_tienda,
            direccion_tienda: form.direccion_tienda,
            telefono_tienda: form.telefono_tienda,
            lat: form.lat || null,
            lng: form.lng || null,
            id_usuario: usuario.id_usuario,
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("Tienda creada correctamente ✅");
            setForm({
            nombre_tienda: "",
            direccion_tienda: "",
            telefono_tienda: "",
            lat: "",
            lng: "",
            });
        } else {
            alert("Error: " + data.message);
        }
        } catch (error) {
        console.error("Error al crear tienda:", error);
        alert("No se pudo conectar con el servidor ❌");
        }
    };

    return (
        <div className="NewStore">
        <Navbar />
        <div className="Cuerpo">
            <div className="tienda-container">
            <h2>Registrar Tienda</h2>
            <form onSubmit={handleSubmit} className="tienda-form">
                <label>
                Nombre de la tienda:
                <input
                    type="text"
                    name="nombre_tienda"
                    value={form.nombre_tienda}
                    onChange={handleChange}
                    required
                />
                </label>

                <label>
                Dirección:
                <input
                    type="text"
                    name="direccion_tienda"
                    value={form.direccion_tienda}
                    onChange={handleChange}
                />
                </label>

                <label>
                Teléfono (+569XXXXXXXX):
                <input
                    type="tel"
                    name="telefono_tienda"
                    value={form.telefono_tienda}
                    onChange={handleChange}
                    placeholder="+56912345678"
                    required
                />
                </label>
                <button type="submit">Crear Tienda</button>
            </form>
            </div>
        </div>
        </div>
    );
}
export default NewStore;