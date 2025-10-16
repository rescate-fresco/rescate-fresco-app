// ...existing code...

Cypress.Commands.add('setLocalUser', (user = {}) => {
    const defaultUser = {
        id_usuario: 1,
        nombre_usuario: 'cypress',
        email: 'cypress@gmail.com',
        token: 'fake-jwt-token',
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