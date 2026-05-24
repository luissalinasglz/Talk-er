describe("Login", () => {

    beforeEach(() => {

        // Ruta principal de login
        cy.visit("/");

        // Assertion de texto visible
        cy.contains("Bienvenido").should("be.visible");
    });

    it("TC-LOGIN-01 - Login exitoso", () => {

        // Usuario de tutor
        cy.get('[data-cy="username-input"]')
            .type("A01425755");

        // Password de tutor
        cy.get('[data-cy="password-input"]')
            .type("DArI1607#$");

        // Botón para iniciar sesión
        cy.get('[data-cy="login-btn"]')
            .click();

        // Validación de redirección a tutor
        cy.url().should("include", "/tutor");
    });

    it("TC-LOGIN-02 - Login Negativo por credenciales", () => {

        // Usuario válido
        cy.get('[data-cy="username-input"]')
            .type("A01425755");

        // Password inválido
        cy.get('[data-cy="password-input"]')
            .type("Password");

        // Botón de iniciar sesión
        cy.get('[data-cy="login-btn"]')
            .click();

        // Permanecer en login
        cy.url().should("include", "/");
    });

    it("TC-LOGIN-03 - Login sin credenciales", () => {

        // Botón de iniciar sesión
        cy.get('[data-cy="login-btn"]')
            .click();

        // Validación del navegador
        cy.get("input:invalid")
            .should("exist");

        // Permanecer en login
        cy.url().should("include", "/");
    });

});