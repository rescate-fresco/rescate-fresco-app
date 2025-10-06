const MetodoPago = () => {
    const handlePago = (metodo) => {
        alert(`¡Pago realizado con ${metodo}!`);
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Selecciona tu método de pago</h2>
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
                onClick={() => handlePago("tarjeta de crédito")}
            >
                Tarjeta de crédito
            </button>
            <button
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={() => handlePago("transferencia")}
            >
                Transferencia
            </button>
        </div>
    );
};

export default MetodoPago;