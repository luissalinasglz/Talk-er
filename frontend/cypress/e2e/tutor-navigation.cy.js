context('Tutor navigation', () => {
    Cypress.Commands.add('login', (username='A01425755', password='DArI1607#$') => {
        cy.visit('http://localhost:5173/')
        cy.get('input[type=text]').type(username)
        cy.get('input[type=password]').type(password)
        cy.get('button[type=submit]').click()
        cy.url().should('include', '/tutor')
        cy.getCookie('SessionID').should('exist')
    })

    it('TC-TUTOR-NAVIGATION-01 - Navegacion correcta con el sidebar', () => {
        cy.login()
        cy.get('.sidebar').contains('Sesiones').click()
        cy.url().should('include', '/tutor/sesiones')

        cy.get('.sidebar').contains('Ligas').click()
        cy.url().should('include', '/tutor/ligas')
    
        cy.get('.sidebar').contains('Tareas').click()
        cy.url().should('include', '/tutor/tareas')

        cy.get('.sidebar').contains('Exámenes').click()
        cy.url().should('include', '/tutor/examenes')

        cy.get('.sidebar').contains('Material').click()
        cy.url().should('include', '/tutor/material')

        cy.get('.sidebar').contains('Bitácora').click()
        cy.url().should('include', '/tutor/bitacora')

        cy.get('.sidebar').contains('Horas').click()
        cy.url().should('include', '/tutor/horas')
    })

    it('TC-TUTOR-NAVIGATION-02 - Usuario no autenticado', () => {
        cy.visit('http://localhost:5173/tutor')
        cy.url().should('eq', 'http://localhost:5173/')
    })

    it('TC-TUTOR-NAVIGATION-03 - Ruta inexistente', () => {
        cy.login()
        cy.visit('http://localhost:5173/tutor/inexistente')
        cy.url().should('include', 'http://localhost:5173/tutor')
    })
})