// Archivo: project/test/e2e/login.cy.js

describe('Prueba básica de la página de inicio', () => {
    it('Debe cargar la página y verificar el título', () => {
        // Comando para visitar tu frontend (ajusta la URL base si es necesario)
        cy.visit('http://localhost:5173'); 

        // Verifica que el título de la página (o algún elemento clave) existe
        cy.title().should('include', 'Rescate Fresco'); 
    });
});