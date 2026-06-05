describe("Tutor - Sesiones", () => {

    beforeEach(() => {

        cy.session("Login", () => {

            cy.visit("/");

            cy.get('[data-cy="username-input"]')
                .type("A01425755");

            cy.get('[data-cy="password-input"]')
                .type("DArI1607#$");

            cy.get('[data-cy="login-btn"]')
                .click();

            cy.url().should("not.include", "/login");
        });

        cy.visit("/tutor/sesiones");

        cy.contains("Horario Fijo de Clases")
            .should("be.visible");
    });

    it("TC-TUTOR-SESIONES-01 - Guardar horario válido", () => {

        cy.contains("Lunes").click();
        cy.contains("Jueves").click();

        cy.get('input[type="time"]')
            .eq(0)
            .type("15:10");

        cy.get('input[type="time"]')
            .eq(1)
            .should("have.value", "16:10");

        cy.contains("Guardar Horario")
            .click();

        cy.contains("¡Horario guardado correctamente!")
            .should("be.visible");
    });

    it("TC-TUTOR-SESIONES-02 - No permitir horario sin hora de inicio", () => {

        cy.contains("Jueves").click();

        cy.contains("Guardar Horario")
            .click();

        cy.contains("Ingresa hora de inicio y fin")
            .should("be.visible");
    });

    it("TC-TUTOR-SESIONES-03 - Hora fin menor a hora inicio", () => {

        cy.contains("Jueves").click();

        cy.get('input[type="time"]')
            .eq(0)
            .type("16:50");

        cy.get('input[type="time"]')
            .eq(1)
            .clear()
            .type("15:10");

        cy.contains("Guardar Horario")
            .click();
            
        cy.contains("La hora de fin debe ser posterior a la hora de inicio")
            .should("be.visible");
    });

});