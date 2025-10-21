

describe('Login E2E', () => {
    beforeEach(() => {
        cy.visit('/Iniciar-Sesion');
    });

    it('Carga la página de login', () => {
        cy.contains(/iniciar sesión|login/i).should('exist');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button[data-cy="submit-login"]').should('be.visible');
    });

    it('Muestra error con credenciales inválidas', () => {
        cy.on('window:alert', (str) => {
            expect(str).to.equal('Error: Email o contraseña incorrectos');
        });

        cy.get('input[type="email"]').type('invalido@test.com');
        cy.get('input[type="password"]').type('wrongpass');
        cy.get('button[data-cy="submit-login"]').click();
    });
    it('Login exitoso redirige a Home', () => {
        // Ajusta email/pass según datos reales en tu DB
        cy.get('input[type="email"]').type('oso@oso.oso');
        cy.get('input[type="password"]').type('oso');
        cy.get('button[data-cy="submit-login"]').click();
        cy.url({ timeout: 10000 }).should('include', '/Inicio');
        cy.contains(/bienvenido|productos|rescate/i).should('exist');
    });
});