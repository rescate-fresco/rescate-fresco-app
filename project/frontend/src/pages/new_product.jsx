import Navbar from "../components/navbar.jsx";
import React, { useState, useRef, useEffect } from "react";
import './new_product.css';

function NewProduct() {

    const [form, setForm] = useState({
        nombre_lote: "",
        descripcion: "",
        peso_qty: "",
        precio_original: "",
        precio_rescate: "",
        fecha_vencimiento: "",
        ventana_retiro_inicio: "",
        ventana_retiro_fin: ""
    });

    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([
        { tipo: "new", valor: "" }
    ]);
    const [categoriasExistentes, setCategoriasExistentes] = useState([]);
    const [files, setFiles] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}api/lotes/categorias`);
                const data = await res.json();
                setCategoriasExistentes(data);
            } catch (err) {
                console.error("Error cargando categorías:", err);
            }
        };
        fetchCategorias();
    }, []);

    const agregarCategoria = () => {
        setCategoriasSeleccionadas([
            ...categoriasSeleccionadas,
            { tipo: "new", valor: "" }
        ]);
    };

    const handleCategoriaChange = (index, valor) => {
        const nuevas = [...categoriasSeleccionadas];

        if (valor === "new") {
            nuevas[index] = { tipo: "new", valor: "" };
        } else {
            nuevas[index] = { tipo: "existing", valor };
        }
        setCategoriasSeleccionadas(nuevas);
    };

    const handleInputCategoria = (index, valor) => {
        const nuevas = [...categoriasSeleccionadas];
        nuevas[index].valor = valor;
        setCategoriasSeleccionadas(nuevas);
    };

    const eliminarCategoria = (index) => {
        const nuevas = categoriasSeleccionadas.filter((_, i) => i !== index);
        setCategoriasSeleccionadas(nuevas.length ? nuevas : [{ tipo: "new", valor: "" }]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!files || files.length === 0) {
            alert("Se requiere al menos una imagen.");
            return;
        }
        if (files.length > 5) {
            alert("Puedes subir un máximo de 5 imágenes.");
            return;
        }

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
        for (const c of categoriasSeleccionadas) {
            if (c.tipo === "new" && !c.valor.trim()) {
                alert("Debes ingresar un nombre para cada categoría nueva.");
                return;
            }
            if (c.tipo === "existing" && !c.valor.trim()) {
                alert("Selecciona una categoría válida.");
                return;
            }
        }

        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        formData.append("id_tienda", usuario.id_tienda);
        for (const file of files) formData.append('imagenes', file);

        // Separar categorías existentes y nuevas
        const categoriasExistentesIds = categoriasSeleccionadas
            .filter(c => c.tipo === "existing")
            .map(c => c.valor); // aquí valor debe ser ID, no nombre
        const categoriasNuevas = categoriasSeleccionadas
            .filter(c => c.tipo === "new")
            .map(c => c.valor);

        formData.append("categorias", JSON.stringify(categoriasExistentesIds));
        formData.append("categorias_nuevas", JSON.stringify(categoriasNuevas));

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/lotes`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (response.ok) {
                alert("Producto publicado exitosamente ✅");
                setForm({
                    nombre_lote: "",
                    descripcion: "",
                    peso_qty: "",
                    precio_original: "",
                    precio_rescate: "",
                    fecha_vencimiento: "",
                    ventana_retiro_inicio: "",
                    ventana_retiro_fin: ""
                });
                setCategoriasSeleccionadas([{ tipo: "new", valor: "" }]);
                setFiles(null);
                if (fileInputRef.current) fileInputRef.current.value = null;
            } else {
                alert(`Error: ${data.mensaje || "Error desconocido"}`);
            }

        } catch (error) {
            console.error("Error al publicar el producto:", error);
            alert("Ocurrió un error al publicar el producto.");
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
                            Nombre del lote:{' '}
                            <input type="text" name="nombre_lote" value={form.nombre_lote} onChange={handleChange} required />
                        </label>

                        <label>Categorías:</label>

                        {categoriasSeleccionadas.map((cat, index) => (
                            <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>

                                <select
                                    value={cat.tipo === "new" ? "new" : cat.valor || ""}
                                    onChange={(e) => handleCategoriaChange(index, e.target.value)}
                                >
                                    <option value="new">➕ Nueva categoría</option>

                                    {categoriasExistentes.map(c => (
                                        <option key={c.id_categoria} value={c.id_categoria}>
                                            {c.nombre_categoria}
                                        </option>
                                    ))}
                                </select>

                                {cat.tipo === "new" && (
                                    <input
                                        type="text"
                                        placeholder="Ingresa nueva categoría"
                                        value={cat.valor}
                                        onChange={(e) => handleInputCategoria(index, e.target.value)}
                                        required
                                    />
                                )}

                                {categoriasSeleccionadas.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => eliminarCategoria(index)}
                                        style={{
                                            background: "#ff4d4d",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "5px",
                                            padding: "2px 6px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" onClick={agregarCategoria}>+ Agregar categoría</button>

                        <label>
                            Descripción:{' '}
                            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}></textarea>
                        </label>

                        <label>
                            Peso/Cantidad:{' '}
                            <input type="number" step="any" name="peso_qty" value={form.peso_qty} onChange={handleChange} />
                        </label>

                        <label>
                            Precio original:{' '}
                            <input type="number" step="any" name="precio_original" value={form.precio_original} onChange={handleChange} required />
                        </label>

                        <label>
                            Precio rescate:{' '}
                            <input type="number" step="any" name="precio_rescate" value={form.precio_rescate} onChange={handleChange} required />
                        </label>

                        <label>
                            Fecha de vencimiento:{' '}
                            <input type="datetime-local" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange} required />
                        </label>

                        <label>
                            Inicio ventana de retiro:{' '}
                            <input type="datetime-local" name="ventana_retiro_inicio" value={form.ventana_retiro_inicio} onChange={handleChange} required />
                        </label>

                        <label>
                            Fin ventana de retiro:{' '}
                            <input type="datetime-local" name="ventana_retiro_fin" value={form.ventana_retiro_fin} onChange={handleChange} required />
                        </label>

                        <label>
                            Imágenes (máx 5):{' '}
                            <input
                                type="file"
                                name="imagenes"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                multiple
                                accept="image/*"
                                required
                            />
                        </label>

                        <button type="submit" data-cy="new-product-button">
                            Publicar
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default NewProduct;
