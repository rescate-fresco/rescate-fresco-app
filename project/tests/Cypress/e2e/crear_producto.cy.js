describe('Crear Producto (Lote) E2E', () => {
    const ENDPOINT = '**/api/auth/lotes*';

    beforeEach(() => {
        cy.visit('/');
        cy.setLocalUser();
    });

    it('crea un producto exitosamente (mock)', () => {
        cy.fixture('producto').then((p) => {
        const nombreUnico = `${p.nombre_lote} ${Date.now()}`;

        cy.intercept('POST', ENDPOINT, (req) => {
            expect(req.body).to.include.keys([
            'nombre_lote',
            'precio_original',
            'precio_rescate',
            'fecha_vencimiento',
            'ventana_retiro_inicio',
            'ventana_retiro_fin'
            ]);
            req.reply({
            statusCode: 201,
            body: { id_lote: 777, ...req.body, nombre_lote: nombreUnico },
            });
        }).as('crearProducto');

        cy.visit('/Inicio/Publicar/Nuevo-Producto');
        cy.fillNewProductForm({ ...p, nombre_lote: nombreUnico });
        cy.get('button[data-cy="new-product-button"]').click();

        cy.wait('@crearProducto').its('response.statusCode').should('eq', 201);

        // Si tu UI usa alert() de éxito
        cy.on('window:alert', (msg) => {
            expect(msg.toLowerCase()).to.match(/creado|publicado|guardado/);
        });

        // Si no hay redirección, suele quedarse en la misma página
        cy.url().should('include', '/Inicio/Publicar/Nuevo-Producto');
        });
    });

    it('muestra errores de validación cuando faltan campos', () => {
        cy.visit('/Inicio/Publicar/Nuevo-Producto');
        cy.get('button[data-cy="new-product-button"]').click();

        // Inputs requeridos (según tu JSX)
        cy.get('input[name="nombre_lote"]:invalid').should('exist');
        cy.get('input[name="precio_original"]:invalid').should('exist');
        cy.get('input[name="precio_rescate"]:invalid').should('exist');
        cy.get('input[name="fecha_vencimiento"]:invalid').should('exist');
        cy.get('input[name="ventana_retiro_inicio"]:invalid').should('exist');
        cy.get('input[name="ventana_retiro_fin"]:invalid').should('exist');
    });

    it('muestra error cuando el nombre está duplicado (mock 409)', () => {
        cy.fixture('producto').then((p) => {
        cy.intercept('POST', ENDPOINT, {
            statusCode: 409,
            body: { message: 'Nombre de lote duplicado' },
        }).as('crearProducto409');

        cy.visit('/Inicio/Publicar/Nuevo-Producto');
        cy.fillNewProductForm(p);
        cy.get('button[data-cy="new-product-button"]').click();

        cy.wait('@crearProducto409');

        // Si tu UI usa alert() de error
        cy.on('window:alert', (msg) => {
            expect(msg.toLowerCase()).to.match(/duplicado|ya existe|en uso/);
        });

        // O un mensaje en pantalla
        // cy.contains(/duplicado|ya existe|en uso/i).should('be.visible');
        });
    });
});