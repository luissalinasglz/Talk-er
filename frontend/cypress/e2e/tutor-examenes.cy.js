describe("Tutor-examenes", () => {
    beforeEach(() => {

        // Mantiene la sesión iniciada entre pruebas.
        cy.session("Login", () => {

            cy.visit("/");

            // Campos de frontend para iniciar sesión
            cy.get('[data-cy="username-input"]').type("A01425755");
            cy.get('[data-cy="password-input"]').type("DArI1607#$");

            // Botón de iniciar sesión
            cy.get('[data-cy="login-btn"]').click();

            // Validación de redireccion
            cy.url().should("not.include", "/login");
        });

        // Ruta de tutor - examenes
        cy.visit("/tutor/examenes");

        // Assertion de texto visible.
        cy.contains("Exámenes Activos").should("be.visible");

        cy.contains(" + Crear Examen")
            .click();
        cy.contains("Crear Examen").should("be.visible");
    });

    it("TC-EXAMEN-01 - Crear y publicar examen"), () => {
    }
})