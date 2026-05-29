describe("Bitácora", () => {

    const seleccionarBitacoraEditable = (index) => {
        cy.get(".bitacora-item")
            .eq(index)
            .click();

        cy.contains("button", "Enviar a Revisión")
            .should("be.visible");
    };

    beforeEach(() => {

        cy.visit("/");

        cy.contains("Bienvenido").should("be.visible");

        cy.get('[data-cy="username-input"]').type("A01425755");
        cy.get('[data-cy="password-input"]').type("DArI1607#$");
        cy.get('[data-cy="login-btn"]').click();

        cy.url().should("include", "/tutor");

        cy.visit("/tutor/bitacora");

        cy.contains("Mis Bitácoras")
            .should("be.visible");
    });

    it("TC-BITACORA-01 - Envío exitoso de bitácora", () => {

        // Primera editable
        seleccionarBitacoraEditable(0);

        cy.get('input[type="text"].bitacora-input-real')
            .clear()
            .type("Unidad 3 - Pasado simple");

        cy.get("textarea.bitacora-text-real")
            .eq(0)
            .clear()
            .type("Se practicó conversación usando pasado simple.");

        cy.get("textarea.bitacora-text-real")
            .eq(1)
            .clear()
            .type("La sesión se enfocará en vocabulario de viajes.");

        cy.contains(".incidencia-btn", "No")
            .click();

        cy.contains("button", "Enviar a Revisión")
            .click();

        cy.contains("¡Bitácora enviada a revisión con éxito!")
            .should("be.visible");
    });

    it("TC-BITACORA-02 - Bitácora sin título", () => {

        // Segunda editable
        seleccionarBitacoraEditable(1);

        cy.get('input[type="text"].bitacora-input-real')
            .clear();

        cy.get("textarea.bitacora-text-real")
            .eq(0)
            .clear()
            .type("Se practicó conversación usando pasado simple.");

        cy.get("textarea.bitacora-text-real")
            .eq(1)
            .clear()
            .type("La sesión se enfocará");

        cy.contains(".incidencia-btn", "No")
            .click();

        cy.contains("button", "Enviar a Revisión")
            .click();

        cy.contains("El título/tema de la sesión es obligatorio.")
            .should("be.visible");
    });

    it("TC-BITACORA-03 - Evidencia con archivo inválido", () => {

        // Tercera editable
        seleccionarBitacoraEditable(2);

        cy.get('input[type="file"]')
            .selectFile(
                "cypress/fixtures/evidencia-invalida.txt",
                { force: true }
            );

        cy.contains("Solo se permiten archivos PDF, JPG, JPEG o PNG.")
            .should("be.visible");
    });

});