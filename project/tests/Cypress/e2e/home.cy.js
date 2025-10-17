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

    it('Ordenar los productos por precio de menor a mayor', () => {
        cy.intercept('GET', '**/api/lotes*').as('getLotesInicial');
        cy.visit('/');
        cy.wait('@getLotesInicial');

        cy.intercept('GET', '**/api/lotes?*sortBy=precio_rescate*order=ASC*').as('getLotesOrdenadosAsc');

        // Seleccionar precio y orden ascendente
        cy.get('select[name="sortBy"]').select('precio_rescate');
        cy.get('select[name="order"]').select('ASC');

        cy.wait('@getLotesOrdenadosAsc')
        cy.get('.producto-card').should('have.length.greaterThan', 1);

        cy.get('.precio-oferta').should('have.length.greaterThan', 1).then(($els) => {
            const pricesText = [...$els].map(el => el.innerText);
            const prices = pricesText.map(price =>
                parseFloat(price.replace(/[$.\s]/g, '').replace(',', '.'))
            );
            const sortedPrices = [...prices].sort((a, b) => a - b);
            expect(prices).to.deep.equal(sortedPrices);
        });
    });

    it('Ordenar los productos por precio de mayor a menor', () => {
        cy.intercept('GET', '**/api/lotes*').as('getLotesInicial');
        cy.visit('/');
        cy.wait('@getLotesInicial');
        
        cy.intercept('GET', '**/api/lotes?*sortBy=precio_rescate*order=DESC*').as('getLotesOrdenadosDesc');
        
        cy.get('select[name="sortBy"]').select('precio_rescate');
        cy.get('select[name="order"]').select('DESC');
        
        cy.wait('@getLotesOrdenadosDesc')        
        cy.get('.producto-card').should('have.length.greaterThan', 1);

        cy.get('.precio-oferta').should('have.length.greaterThan', 1).then(($els) => {
            const pricesText = [...$els].map(el => el.innerText);
            const prices = pricesText.map(price =>
                parseFloat(price.replace(/[$.\s]/g, '').replace(',', '.'))
            );
            const sortedPrices = [...prices].sort((a, b) => b - a);
            expect(prices).to.deep.equal(sortedPrices);
        });
    });

    it('Debería ordenar por fecha de vencimiento ascendente', () => {
        cy.intercept('GET', '**/api/lotes?*sortBy=fecha_vencimiento*order=ASC*').as('porFecha');

        cy.visit('/');

        cy.get('select[name="sortBy"]').select('fecha_vencimiento');
        cy.get('select[name="order"]').select('ASC');

        cy.wait('@porFecha').then(({ response }) => {
            expect(response.statusCode).to.be.oneOf([200, 304]);

            // Si el servidor devuelve 304 (cache), haz un request directo para validar el orden
            if (response.statusCode === 304 || !Array.isArray(response.body)) {
            cy.request('http://localhost:5000/api/lotes?sortBy=fecha_vencimiento&order=ASC').then(({ status, body }) => {
                expect(status).to.eq(200);
                expect(body).to.be.an('array').and.to.have.length.greaterThan(1);
                const fechas = body.map(l => new Date(l.fecha_vencimiento).getTime());
                const sorted = [...fechas].sort((a, b) => a - b);
                expect(fechas).to.deep.equal(sorted);
            });
            return;
            }

            // Caso 200 con body presente
            const lotes = response.body;
            expect(lotes).to.be.an('array').and.to.have.length.greaterThan(1);
            const fechas = lotes.map(l => new Date(l.fecha_vencimiento).getTime());
            const sorted = [...fechas].sort((a, b) => a - b);
            expect(fechas).to.deep.equal(sorted);
        });
    });
});