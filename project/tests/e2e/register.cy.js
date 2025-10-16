describe('Registro E2E', () => {
    beforeEach(() => {  
        cy.visit('/Registrarse');
    });

    it('Registro de usuario', () => {
        cy.on('window:alert', (str) => {
            expect(str).to.equal('Usuario registrado con éxito');
        });
        cy.get('input[name="nombre_usuario"]').type('Usuario Nuevo');
        cy.get('input[name="email"]').type('nuevo_usuario@test.com');
        cy.get('input[name="contrasena"]').type('contraseñaFuerte123');
        cy.get('select[name="rol"]').select('Tienda');
        cy.get('textarea[name="direccion_usuario"]').type('Calle Falsa 123, Ciudad, País');
        cy.get('button[data-cy="submit-register"]').click();
    });

    it('Registro de usuario existente', () => {
        cy.on('window:alert', (str) => {
            expect(str).to.equal('Error: Email ya registrado');
        });
        cy.get('input[name="nombre_usuario"]').type('Otro Usuario');
        cy.get('input[name="email"]').type('oso@oso.oso');
        cy.get('input[name="contrasena"]').type('contraseñaCualquiera');
        cy.get('select[name="rol"]').select('Tienda');
        cy.get('textarea[name="direccion_usuario"]').type('Calle Falsa 123, Ciudad, País');
        cy.get('button[data-cy="submit-register"]').click();
    });
});