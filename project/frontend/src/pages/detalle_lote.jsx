import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}api/lotes`;

const DetalleLote = () => {
    const { id_lote } = useParams();
    const [lote, setLote] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLote = async () => {
        try {
            const resp = await fetch(`${API_URL}/${id_lote}`);
            if (!resp.ok) throw new Error("No se pudo cargar el lote");
            const data = await resp.json();
            setLote(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
        };
        fetchLote();
    }, [id_lote]);

    if (cargando) return <div>Cargando detalles del lote...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!lote) return <div>No se encontró el lote.</div>;

    return (
        <div className="detalle-lote">
            <h2>{lote.nombre_lote}</h2>
            <p>Precio original: ${Number(lote.precio_original).toFixed(2)}</p>
            <p>Precio de rescate: ${Number(lote.precio_rescate).toFixed(2)}</p>
            <p>Fecha de vencimiento: {lote.fecha_vencimiento}</p>
            {/* Puedes agregar más detalles aquí */}
        </div>
    );
};

export default DetalleLote;