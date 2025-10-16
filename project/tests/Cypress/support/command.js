// ...existing code...

Cypress.Commands.add('setLocalUser', (user = {}) => {
    const defaultUser = {
        id_usuario: 1,
        nombre_usuario: 'cypress',
        email: 'cypress@gmail.com',
        token: 'fake-jwt-token',
        tienda: { id_tienda: 1, nombre_tienda: 'Tienda Cypress' },
        ...user,
    };
    cy.window().then((win) => {
        win.localStorage.setItem('usuario', JSON.stringify(defaultUser));
    });
});

Cypress.Commands.add('login', (email, password) => {
    const api = Cypress.env('API_URL') || 'http://localhost:5000';
    return cy.request({
        method: 'POST',
        url: `${api}/api/auth/login`,
        body: { email, password },
        failOnStatusCode: false,
    }).then(({ status, body }) => {
        if (status >= 200 && status < 300) {
        cy.window().then((win) => win.localStorage.setItem('usuario', JSON.stringify(body)));
        return { authenticated: true, user: body };
        }
        return { authenticated: false, status };
    });
});
Cypress.Commands.add('fillNewProductForm', (p) => {
    if (p.nombre_lote) cy.get('[name="nombre_lote"]').clear().type(p.nombre_lote);
    if (p.categoria) cy.get('[name="categoria"]').clear().type(p.categoria);
    if (p.descripcion) cy.get('[name="descripcion"]').clear().type(p.descripcion);
    if (p.peso_qty !== undefined) cy.get('[name="peso_qty"]').clear().type(String(p.peso_qty));
    if (p.precio_original !== undefined) cy.get('[name="precio_original"]').clear().type(String(p.precio_original));
    if (p.precio_rescate !== undefined) cy.get('[name="precio_rescate"]').clear().type(String(p.precio_rescate));
    if (p.fecha_vencimiento) cy.get('[name="fecha_vencimiento"]').clear().type(p.fecha_vencimiento);
    if (p.ventana_retiro_inicio) cy.get('[name="ventana_retiro_inicio"]').clear().type(p.ventana_retiro_inicio);
    if (p.ventana_retiro_fin) cy.get('[name="ventana_retiro_fin"]').clear().type(p.ventana_retiro_fin);
});