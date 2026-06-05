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

        cy.contains("+ Crear Examen")
            .click();
        cy.contains("Crear Examen").should("be.visible");
    });

    it("TC-TUTOR-EXAMEN-01 - Crear y publicar examen", () => {

        cy.get('input[placeholder="Ej: Examen unidad 3"]')
            .type("Examen Unidad 3");

        cy.get("select")
            .select(1);

        cy.get('input[type="number"]')
            .type("45");

        cy.get('input[type="date"]')
            .type("2026-06-15");

        cy.get('input[type="time"]')
            .type("17:00");

        cy.get('input[placeholder="Escribe la pregunta"]')
            .type("¿Cuál es el pasado de go?");

        cy.get('input[placeholder="Opción A"]')
            .type("Went");

        cy.get('input[placeholder="Opción B"]')
            .type("Gone");

        cy.get('input[placeholder="Opción C"]')
            .type("Going");

        cy.get('input[placeholder="Opción D"]')
            .type("Go");

        // Marcar opción correcta (A)
        cy.get(".option-circle")
            .first()
            .click();

        cy.contains("Publicar examen")
            .click();
    });

    it("TC-TUTOR-EXAMEN-02 - No permitir examen sin título", () => {

        cy.get("select")
            .select(1);

        cy.get('input[type="number"]')
            .type("45");

        cy.get('input[type="date"]')
            .type("2026-06-15");

        cy.get('input[type="time"]')
            .type("17:00");

        cy.get('input[placeholder="Escribe la pregunta"]')
            .type("¿Cuál es el pasado de go?");

        cy.get('input[placeholder="Opción A"]')
            .type("Went");

        cy.get('input[placeholder="Opción B"]')
            .type("Gone");

        cy.get('input[placeholder="Opción C"]')
            .type("Going");

        cy.get('input[placeholder="Opción D"]')
            .type("Go");

        cy.get(".options")
            .first()
            .click();

        cy.contains("Publicar examen")
            .click();

        cy.contains("Completa todos los campos del encabezado.")
            .should("be.visible");
    });

    it("TC-TUTOR-EXAMEN-03 - No permitir publicar con pregunta vacía", () => {

        cy.get('input[placeholder="Ej: Examen unidad 3"]')
            .type("Examen Unidad 3");

        cy.get("select")
            .select(1);

        cy.get('input[type="number"]')
            .type("45");

        cy.get('input[type="date"]')
            .type("2026-06-15");

        cy.get('input[type="time"]')
            .type("17:00");

        // No se llena la pregunta

        cy.contains("Publicar examen")
            .click();

        cy.contains(
            "Completa todas las preguntas, sus opciones y marca la respuesta correcta."
        ).should("be.visible");
    });
})