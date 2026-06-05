describe("tutor-tareas", () => {

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

        // Ruta de tutor tareas
        cy.visit("/tutor/tareas");

        // Assertion de texto visible
        cy.contains("Tareas Activas").should("be.visible");

        // Abrir formulario de creación
        cy.contains("Crear Tarea").click();
        cy.contains("Crear Tarea").should("be.visible");
    });

    it("TC-TUTOR_TAREAS-01 - Crear una tarea con todos los campos correctamente llenados", () => {

        // Seleccionar beneficiario
        cy.get(".select-input").first().select("Wicho Ponce — Inglés");

        // Escribir título
        cy.get('input[placeholder="Escribir título"]')
            .type("Práctica de pasado simple");

        // Escribir descripción
        cy.get('textarea[placeholder="Explicar actividad"]')
            .type("Completa los ejercicios de la imagen");

        // Subir archivo
        cy.get('input[type="file"]').selectFile("cypress/fixtures/tarea_prueba.pdf", { force: true });

        // Seleccionar fecha de entrega
        cy.get('input[type="date"]').type("2026-06-20");

        // Seleccionar hora límite
        cy.get('input[type="time"]').type("23:59");

        // Dar click en "Subir Tarea"
        cy.contains("button", "Subir Tarea").click();

        // Resultado esperado: la tarea aparece en la lista de tareas activas
        cy.contains("Tareas Activas").should("be.visible");
        cy.contains("Práctica de pasado simple").should("be.visible");
    });

    it("TC-TUTOR_TAREAS-02 - Intentar crear una tarea sin título", () => {

        // Seleccionar beneficiario
        cy.get(".select-input").first().select("Wicho Ponce — Inglés");

        // Dejar el título vacío (no se escribe nada)

        // Escribir descripción
        cy.get('textarea[placeholder="Explicar actividad"]')
            .type("Completa los ejercicios de la imagen");

        // Dar click en "Subir Tarea"
        cy.contains("button", "Subir Tarea").click();

        // Resultado esperado: mensaje de error por título vacío
        cy.contains("Por favor, ingresa un título.").should("be.visible");

        // La tarea NO debe aparecer en la lista
        cy.contains("Práctica de pasado simple").should("not.exist");
    });

    it("TC-TUTOR_TAREAS-03 - Intentar crear una tarea sin seleccionar un beneficiario", () => {

        // Dejar el selector de beneficiario sin seleccionar

        // Escribir título
        cy.get('input[placeholder="Escribir título"]')
            .type("Práctica de pasado simple");

        // Escribir descripción
        cy.get('textarea[placeholder="Explicar actividad"]')
            .type("Completa los ejercicios de la imagen");

        // Dar click en "Subir Tarea"
        cy.contains("button", "Subir Tarea").click();

        // Resultado esperado: mensaje de error por beneficiario no seleccionado
        cy.contains("Por favor, selecciona un beneficiario.").should("be.visible");

        // La tarea NO debe aparecer en la lista
        cy.contains("Práctica de pasado simple").should("not.exist");
    });

});