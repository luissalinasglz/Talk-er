describe("tutor-ligas", () => {

    beforeEach(() => {

        // Mantiene la sesión iniciada entre pruebas.
        cy.session("Login", () => {

            cy.visit("/");

            // Campos de frontend para iniciar sesión
            cy.get('[data-cy="username-input"]').type("A01425755");
            cy.get('[data-cy="password-input"]').type("DArI1607#$");

            // Botón de iniciar sesión
            cy.get('[data-cy="login-btn"]').click();

            // Validación de redirección
            cy.url().should("not.include", "/login");
        });

        // Ruta de tutor ligas
        cy.visit("/tutor/ligas");

        // Assertion de texto visible
        cy.contains("Clases de la semana").should("be.visible");
    });

    it("TC-TUTOR_LIGAS-01 - Enviar liga correctamente", () => {

        // Busca el contenedor del formulario
        cy.get(".schedule-box")
            .should("exist");

        // Input en base al placeholder
        cy.get('input[placeholder*="123"]')
            .clear()
            .type("123 456 7890");

        // Botón de guardar
        cy.contains("Guardar Liga")
            .click();

        // Mensaje de confirmación
        cy.contains("Sesión guardada")
            .should("be.visible");
    });

    it("TC-TUTOR_LIGAS-02 - Enviar liga vacía", () => {

        // Busca el contenedor del formulario
        cy.get(".schedule-box")
            .should("exist");

        // Limpiar input para simular envío vacío
        cy.get('input[placeholder*="123"]')
            .clear();

        // Botón de guardar
        cy.contains("Guardar Liga")
            .click();

        // Mensaje de error
        cy.contains("La liga o ID de reunión no es válido")
            .should("be.visible");
    });

    it("TC-TUTOR_LIGAS-03 - Enviar liga inválida", () => {

        // Busca el contenedor del formulario
        cy.get(".schedule-box")
            .should("exist");

        // Input en base a placeholder
        cy.get('input[placeholder*="123"]')
            .clear()
            .type("abc@@123");

        // Texto del botón
        cy.contains("Guardar Liga")
            .click();

        // Mensaje de error
        cy.contains("La liga o ID de reunión no es válido")
            .should("be.visible");
    });

});