describe("Supervisor-bitacoras", () => {

    beforeEach(() => {

        // Mantiene la sesión iniciada entre pruebas.
        cy.session("Login", () => {

            cy.visit("/");

            // Campos de frontend para iniciar sesión
            cy.get('[data-cy="username-input"]').type("A01425602");
            cy.get('[data-cy="password-input"]').type("Beto258369$");

            // Botón de iniciar sesión
            cy.get('[data-cy="login-btn"]').click();

            // Validación de redireccion
            cy.url().should("not.include", "/login");
        });

        // Ruta de supervisor bitacoras
        cy.visit("/supervisor/bitacora");

        // Assertion de texto visible.
        cy.contains("Mis Bitácoras").should("be.visible");
    });

    it("TC-SUPERVISOR_BITACORAS-01 - Aprobar bitácora", () => {

        // Siempre tiene que haber al menos una bitácora pendiente
        cy.get(".bitacora-item")
            .should("have.length.greaterThan", 0)
            .first()
            .click();

        // Texto del botón de aprobar
        cy.contains("Aprobar Bitácora")
            .click();

        // Mensaje de confirmación
        cy.contains("¡Bitácora aprobada!")
            .should("be.visible");
    });

    it("TC-SUPERVISOR_BITACORAS-02 - Mandar a revisión sin comentarios", () => {

        cy.get(".bitacora-item")
            .should("have.length.greaterThan", 0)
            .first()
            .click();

        // Classname del campo de comentarios
        cy.get(".review-comments-area")
            .clear();

        // Texto del botón
        cy.contains("Enviar a Corrección")
            .click();

        // Mensaje de error
        cy.contains("Debes escribir una observación para solicitar corrección")
            .should("be.visible");
    });

    it("TC-SUPERVISOR_BITACORAS-03 - Mandar a revisión con comentarios", () => {

        cy.get(".bitacora-item")
            .should("have.length.greaterThan", 0)
            .first()
            .click();

        // Escribir en el campo de comentarios
        cy.get(".review-comments-area")
            .clear()
            .type("La bitácora requiere más detalle en la descripción de la sesión.");

        // Texto del botón
        cy.contains("Enviar a Corrección")
            .click();

        // Mensaje de confirmación
        cy.contains("Corrección enviada al tutor")
            .should("be.visible");
    });
});