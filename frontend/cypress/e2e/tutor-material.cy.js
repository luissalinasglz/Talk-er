describe("tutor-materiales", () => {

    beforeEach(() => {

        // Mantiene la sesión iniciada entre pruebas
        cy.session("Login", () => {

            cy.visit("/");

            cy.get('[data-cy="username-input"]').type("A01425755");
            cy.get('[data-cy="password-input"]').type("DArI1607#$");

            cy.get('[data-cy="login-btn"]').click();

            cy.url().should("not.include", "/login");
        });

        // Ruta de tutor materiales
        cy.visit("/tutor/material");

        // Assertion de texto visible
        cy.contains("Material Publicado").should("be.visible");
        cy.contains("Subir Nuevo Material").should("be.visible");
    });

    it("TC-TUTOR-MATERIALES-01 - Publicar un material de tipo PDF con todos los campos correctamente llenados", () => {

        // Ingresar título
        cy.get('input[placeholder="Ej: Lesson 3"]')
            .type("Guía unidad 3");

        // Seleccionar alumno: Wicho Ponce
        cy.contains(".checkbox-label", "Wicho Ponce")
            .find('input[type="checkbox"]')
            .check();

        // Seleccionar tipo PDF (ya viene por defecto, pero lo forzamos)
        cy.get(".input-field").filter("select").select("PDF");

        // Subir archivo PDF válido
        cy.get('input[type="file"]').selectFile("cypress/fixtures/tarea_prueba.pdf", { force: true });

        // Presionar "Publicar Material"
        cy.contains("Publicar Material").click();

        // Resultado esperado: mensaje de éxito y aparece en la lista
        cy.contains("Material publicado exitosamente.").should("be.visible");
        cy.contains("Guía unidad 3").should("be.visible");
    });

    it("TC-TUTOR-MATERIALES-02 - Intentar publicar un material sin seleccionar ningún alumno", () => {

        // Ingresar título
        cy.get('input[placeholder="Ej: Lesson 3"]')
            .type("Guía unidad 4");

        // No seleccionar ningún alumno

        // Seleccionar tipo PDF
        cy.get(".input-field").filter("select").select("PDF");

        // Subir archivo
        cy.get('input[type="file"]').selectFile("cypress/fixtures/tarea_prueba.pdf", { force: true });

        // Presionar "Publicar Material"
        cy.contains("Publicar Material").click();

        // Resultado esperado: mensaje de error
        cy.contains("Selecciona al menos un alumno.").should("be.visible");

        // El material NO debe aparecer en la lista
        cy.contains("Guía unidad 4").should("not.exist");
    });

    it("TC-TUTOR-MATERIALES-03 - Intentar publicar un material de tipo enlace con una URL inaccesible", () => {

        // Ingresar título
        cy.get('input[placeholder="Ej: Lesson 3"]')
            .type("Recurso externo");

        // Seleccionar alumno: Wicho Ponce
        cy.contains(".checkbox-label", "Wicho Ponce")
            .find('input[type="checkbox"]')
            .check();

        // Seleccionar tipo "Enlace"
        cy.get(".input-field").filter("select").select("LINK");

        // Ingresar URL inválida
        cy.get('input[type="url"]')
            .type("htp:/enlace-roto");

        // Presionar "Publicar Material"
        cy.contains("Publicar Material").click();

        // Resultado esperado: mensaje de enlace no accesible
        cy.contains("El enlace no es accesible. Verifica que sea correcto.").should("be.visible");

        // El material NO debe aparecer en la lista
        cy.contains("Recurso externo").should("not.exist");
    });

});