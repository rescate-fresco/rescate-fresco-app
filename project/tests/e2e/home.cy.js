describe('Home E2E', () => {
    it('Lista productos desde la API', () => {
        cy.visit('/');
        cy.intercept('GET', '**/api/lotes*').as('getLotes');
        cy.wait('@getLotes').its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.get('.productos-lista').should('exist');
    });

    it('Muestra mensaje cuando no hay productos', () => {
        cy.intercept('GET', '**/api/lotes*', { body: [] }).as('getLotesEmpty');
        cy.visit('/');
        cy.wait('@getLotesEmpty');
        cy.contains(/no hay productos|no se encontraron/i).should('exist');
    });

    it('Filtra por categoría', () => {
        cy.visit('/');
        cy.intercept('GET', '**/api/lotes*').as('getLotesInicial');
        cy.wait('@getLotesInicial');
        cy.intercept('GET', '**/api/lotes?categoria=Frutas*').as('getFrutas');
        cy.get('select[name="categoria"]').select('Frutas');
        cy.wait('@getFrutas').its('response.statusCode').should('be.oneOf', [200, 304]);
        cy.get('.productos-lista .producto-card').should('have.length.greaterThan', 0);
    });
});