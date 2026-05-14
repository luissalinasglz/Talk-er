describe('Login Tests', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('TC-LOGIN-01 (positivo): Inicio de sesión con credenciales válidas', () => {
        cy.get('[data-cy="username-input"]').type('A01425755');
        cy.get('[data-cy="password-input"]').type('DArI1607#$');
        cy.get('[data-cy="login-btn"]').click();
        cy.url().should('include', '/tutor');
    });

    it('TC-LOGIN-02 (negativo): Inicio de sesión con credenciales incorrectas', () => {
        cy.get('[data-cy="username-input"]').type('A01425755');
        cy.get('[data-cy="password-input"]').type('password');
        cy.get('[data-cy="login-btn"]').click();
        cy.url().should('eq', 'http://localhost:5173/'); // Asumiendo baseUrl es localhost:5173
        cy.get('[data-cy="error-message"]').should('be.visible').and('contain', 'Invalid');
    });

    it('TC-LOGIN-03 (negativo): Inicio de sesión con campos vacíos', () => {
        cy.get('[data-cy="login-btn"]').click();
        cy.url().should('eq', 'http://localhost:5173/'); // Permanece en login
        // Para campos requeridos, el navegador podría mostrar validación nativa, pero asumiendo que se muestra un mensaje
        // Si no hay mensaje específico, verificar que no redirige
        cy.get('[data-cy="error-message"]').should('not.exist'); // O ajustar según validación
        // Nota: Para validación HTML5, podría necesitar verificar mensajes nativos, pero para este caso, asumimos que se queda
    });
});