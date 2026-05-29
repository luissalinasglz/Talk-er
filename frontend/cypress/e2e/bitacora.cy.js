describe("Bitácora", () => {

    beforeEach(() => {
        cy.visit("/");

        cy.contains("Bienvenido").should("be.visible");

        cy.get('[data-cy="username-input"]').type("A01425755");
        cy.get('[data-cy="password-input"]').type("DArI1607#$");
        cy.get('[data-cy="login-btn"]').click();

        cy.url().should("include", "/tutor");

        cy.visit("/tutor/bitacora");

        cy.contains("Mis Bitácoras", { timeout: 10000 })
            .should("be.visible");

        // Seleccionar la primera bitácora disponible
        cy.get(".bitacora-item", { timeout: 10000 })
            .first()
            .click();

        // Verificar que el formulario cargó
        cy.get('input[type="text"].bitacora-input-real', { timeout: 10000 })
            .should("exist");
    });

    it("TC-BITACORA-01 - Envío exitoso de bitácora", () => {
        cy.get('input[type="text"].bitacora-input-real')
            .should("be.enabled")
            .clear()
            .type("Unidad 3 - Pasado simple");

        cy.get("textarea.bitacora-text-real")
            .eq(0)
            .should("be.enabled")
            .clear()
            .type("Se practicó conversación usando pasado simple.");

        cy.get("textarea.bitacora-text-real")
            .eq(1)
            .should("be.enabled")
            .clear()
            .type("La siguiente sesión se enfocará en vocabulario de viajes.");

        cy.contains(".incidencia-btn", "No")
            .click();

        cy.contains("button", "Enviar a Revisión")
            .click();

        cy.contains("¡Bitácora enviada a revisión con éxito!", { timeout: 10000 })
            .should("be.visible");

        cy.get(".logout-btn").click()
        cy.get('[data-cy="username-input"]').type("A01425602");
        cy.get('[data-cy="password-input"]').type("Beto258369$");
        cy.get('[data-cy="login-btn"]').click();

        cy.url().should("include", "/supervisor");

        cy.visit("/supervisor/bitacora");

        cy.contains("Mis Bitácoras", { timeout: 10000 })
            .should("be.visible");

        cy.get('[data-cy="supervisor-correction-input"]').type("a");
        cy.get('[data-cy="supervisor-correction-button"]').click();

    });

    it("TC-BITACORA-02 - Bitácora sin título", () => {
        cy.get('input[type="text"].bitacora-input-real')
            .should("be.enabled")
            .clear();

        cy.get("textarea.bitacora-text-real")
            .eq(0)
            .should("be.enabled")
            .clear()
            .type("Se trabajó lectura y pronunciación.");

        cy.get("textarea.bitacora-text-real")
            .eq(1)
            .should("be.enabled")
            .clear()
            .type("Se continuará con ejercicios de conversación.");

        cy.contains(".incidencia-btn", "No")
            .click();

        cy.contains("button", "Enviar a Revisión")
            .click();

        cy.contains("El título/tema de la sesión es obligatorio.", { timeout: 10000 })
            .should("be.visible");
    });

    it("TC-BITACORA-03 - Evidencia con archivo inválido", () => {
        cy.get('input[type="file"]', { timeout: 10000 })
            .selectFile("cypress/fixtures/evidencia-invalida.txt", { force: true });

        cy.contains("Solo se permiten archivos PDF, JPG, JPEG o PNG.", { timeout: 10000 })
            .should("be.visible");
    });

});
