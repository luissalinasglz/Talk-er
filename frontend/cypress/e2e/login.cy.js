describe("Login", () => {
    beforeEach(() => {
        // Login route
        cy.visit("/");

        // Message to confirm login page rendered
        cy.contains("Bienvenido").should("be.visible");
    });
    

    it("TC-LOGIN-01 - Login exitoso", () => {
        cy.get('[data-cy="username-input"]').type("A01425755");
        cy.get('[data-cy="password-input"]').type("DArI1607#$");
        cy.get('[data-cy="login-btn"]').click();
        cy.url().should("include", "/tutor");
    })

    it("TC-LOGIN-02 - Login Negativo por credenciales", () => {
        cy.get('[data-cy="username-input"]').type("A01425755");
        cy.get('[data-cy="password-input"]').type("Password");
        cy.get('[data-cy="login-btn"]').click();
        cy.url().should("include", "/");
    })

    it("TC-LOGIN-03 - Login sin credenciales", () => {
        cy.get('[data-cy="login-btn"]').click();
        cy.get("input:invalid").should("exist");
        cy.url().should("include", "/");
    })

})