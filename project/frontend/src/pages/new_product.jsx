import Navbar from "../components/navbar.jsx";
import React, { useState } from "react";
import './new_product.css';
function NewProduct() {
    const [form, setForm] = useState({
        nombre_lote: "",
        categoria: "",
        descripcion: "",
        peso_qty: "",
        precio_original: "",
        precio_rescate: "",
        fecha_vencimiento: "",
        ventana_retiro_inicio: "",
        ventana_retiro_fin: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const storedUser = localStorage.getItem("usuario");
        const usuario = storedUser ? JSON.parse(storedUser) : null;

        if (!usuario?.tienda) {
            alert("Debes tener una tienda para publicar productos.");
            return;
        }

        if (parseFloat(form.precio_rescate) >= parseFloat(form.precio_original)) {
            alert("El precio de rescate debe ser menor al precio original 💰");
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}api/auth/lotes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            id_usuario: usuario.id_usuario,
            ...form
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Producto publicado exitosamente ✅");
            setForm({
            nombre_lote: "",
            categoria: "",
            descripcion: "",
            peso_qty: "",
            precio_original: "",
            precio_rescate: "",
            fecha_vencimiento: "",
            ventana_retiro_inicio: "",
            ventana_retiro_fin: ""
            });
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="NewProduct">
            <Navbar />
            <div className="Cuerpo">
                <div className="lote-container">
                    <h2>Publicar Producto</h2>
                    <form onSubmit={handleSubmit} className="lote-form">
                        <label>
                        Nombre del lote:
                        <input type="text" name="nombre_lote" value={form.nombre_lote} onChange={handleChange} required />
                        </label>

                        <label>
                        Categoría:
                        <input type="text" name="categoria" value={form.categoria} onChange={handleChange} />
                        </label>

                        <label>
                        Descripción:
                        <textarea name="descripcion" value={form.descripcion} onChange={handleChange}></textarea>
                        </label>

                        <label>
                        Peso/Cantidad:
                        <input type="number" step="any" name="peso_qty" value={form.peso_qty} onChange={handleChange} />
                        </label>

                        <label>
                        Precio original:
                        <input type="number" step="any" name="precio_original" value={form.precio_original} onChange={handleChange} required />
                        </label>

                        <label>
                        Precio rescate:
                        <input type="number" step="any" name="precio_rescate" value={form.precio_rescate} onChange={handleChange} required />
                        </label>

                        <label>
                        Fecha de vencimiento:
                        <input type="datetime-local" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange} required />
                        </label>

                        <label>
                        Inicio ventana de retiro:
                        <input type="datetime-local" name="ventana_retiro_inicio" value={form.ventana_retiro_inicio} onChange={handleChange} required />
                        </label>

                        <label>
                        Fin ventana de retiro:
                        <input type="datetime-local" name="ventana_retiro_fin" value={form.ventana_retiro_fin} onChange={handleChange} required />
                        </label>

                        <button type="submit" data-cy="new-product-button">Publicar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default NewProduct;