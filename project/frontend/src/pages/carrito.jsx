import { useEffect, useState } from "react";

const Carrito = () => {
    const [carrito, setCarrito] = useState([]);

    // Cargar el carrito desde localStorage al montar el componente
    useEffect(() => {
        const carritoGuardado = localStorage.getItem("carrito");
        if (carritoGuardado) {
        setCarrito(JSON.parse(carritoGuardado));
        }
    }, []);

    // Eliminar un producto del carrito
    const eliminarDelCarrito = (id_lote) => {
        const nuevoCarrito = carrito.filter(item => item.id_lote !== id_lote);
        setCarrito(nuevoCarrito);
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    };

    // Vaciar el carrito
    const vaciarCarrito = () => {
        setCarrito([]);
        localStorage.removeItem("carrito");
    };

    if (carrito.length === 0) {
        return <div className="p-8 text-center">El carrito está vacío.</div>;
    }

    return (
        <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Carrito de compras</h2>
        <ul>
            {carrito.map(item => (
            <li key={item.id_lote} className="mb-4 border-b pb-2">
                <span className="font-semibold">{item.nombre_lote}</span> - ${Number(item.precio_rescate).toFixed(2)}
                <button
                className="ml-4 text-red-500"
                onClick={() => eliminarDelCarrito(item.id_lote)}
                >
                Quitar
                </button>
            </li>
            ))}
        </ul>
        <button
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            onClick={vaciarCarrito}
        >
            Vaciar carrito
        </button>
        </div>
    );
};

export default Carrito;