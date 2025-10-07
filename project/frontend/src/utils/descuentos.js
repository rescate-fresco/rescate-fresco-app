
export const calcularDiasRestantes = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    // Si la fecha no es válida, devolvemos un número grande para evitar errores
    if (isNaN(vencimiento.getTime())) return 999; 
    
    // Ajustamos la hora para comparar solo días (evitar problemas por la hora)
    hoy.setHours(0, 0, 0, 0); 
    vencimiento.setHours(0, 0, 0, 0);

    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};


export const aplicarDescuentoPorVencimiento = (precioBase, fechaVencimiento) => {
    const diasRestantes = calcularDiasRestantes(fechaVencimiento);
    
    let descuentoExtraPorVencimiento = 0;
    
    // Lógica de descuento escalonado
    if (diasRestantes <= 7 && diasRestantes > 0) {
        descuentoExtraPorVencimiento = 30; // 30% adicional si vence en una semana
    } else if (diasRestantes > 7 && diasRestantes <= 14) {
        descuentoExtraPorVencimiento = 15; // 15% adicional si vence en 1-2 semanas
    }
    
    const precioFinal = precioBase * (1 - descuentoExtraPorVencimiento / 100);
    
    return {
        precioFinal,
        descuentoExtraPorVencimiento,
        diasRestantes,
    };
};