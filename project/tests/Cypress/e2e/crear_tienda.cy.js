describe('Funcionalidad de Creación de Tienda', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.setLocalUser();
    });

    it('debería permitir a un usuario crear una nueva tienda exitosamente', () => {
        cy.fixture('tienda').then((tiendaData) => {
            // Genera nombre único para evitar conflictos
            const nombreUnico = `${tiendaData.nombre_tienda} ${Date.now()}`;

            // Mock del POST con el endpoint correcto
            cy.intercept('POST', '**/api/auth/tiendas*', {
                statusCode: 201,
                body: { 
                    id_tienda: 999, 
                    nombre_tienda: nombreUnico,
                    direccion_tienda: tiendaData.direccion_tienda,
                    telefono_tienda: tiendaData.telefono_tienda
                }
            }).as('crearTienda');
            cy.on('window:alert', (str) => {
                expect(str).to.include('Tienda creada correctamente ✅');
            });
            cy.visit('/Inicio/Crear-Tienda');

            // Llenar formulario con nombre único
            cy.get('input[name="nombre_tienda"]').clear().type(nombreUnico);
            cy.get('input[name="direccion_tienda"]').clear().type(tiendaData.direccion_tienda);
            cy.get('input[name="telefono_tienda"]').clear().type(tiendaData.telefono_tienda);
            
            // Enviar formulario
            cy.get('button[data-cy="submit-tienda"]').click();

            // Verificar que se hizo la petición
            cy.wait('@crearTienda').its('response.statusCode').should('eq', 201);
        });
    });

    it('debería mostrar error si el nombre ya existe', () => {
        cy.fixture('tienda').then((tiendaData) => {
            // Mock respuesta de conflicto (409)
            cy.intercept('POST', '**/api/auth/tiendas*', {
                statusCode: 409,
                body: { message: 'Ya existe una tienda con ese nombre o usuario.' }
            }).as('crearTiendaDuplicada');

            // Listener de alert para capturar el error
            cy.on('window:alert', (str) => {
                expect(str).to.include('Ya existe una tienda con ese nombre');
            });

            cy.visit('/Inicio/Crear-Tienda');

            cy.get('input[name="nombre_tienda"]').clear().type(tiendaData.nombre_tienda);
            cy.get('input[name="direccion_tienda"]').clear().type(tiendaData.direccion_tienda);
            cy.get('input[name="telefono_tienda"]').clear().type(tiendaData.telefono_tienda);
            cy.get('button[data-cy="submit-tienda"]').click();

            cy.wait('@crearTiendaDuplicada');
            
            // El alert se validó arriba con cy.on('window:alert')
        });
    });

    it('debería mostrar error si falta información requerida', () => {
        cy.visit('/Inicio/Crear-Tienda');

        // Intentar enviar formulario vacío
        cy.get('button[data-cy="submit-tienda"]').click();

        // Verificar validación HTML5 o mensaje de tu app
        cy.get('input[name="nombre_tienda"]:invalid').should('exist');
    });
});