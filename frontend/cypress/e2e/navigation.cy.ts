describe('SPA navigation', () => {
  it('visits each route via client-side navigation without full reload', () => {
    cy.visit('/')

    cy.contains('h2', 'Notes').should('be.visible')

    cy.get('nav a[href="/editor"]').click()
    cy.url().should('include', '/editor')
    cy.contains('h2', 'Editor').should('be.visible')

    cy.get('nav a[href="/settings"]').click()
    cy.url().should('include', '/settings')
    cy.contains('h2', 'Settings').should('be.visible')

    cy.get('nav a[href="/"]').click()
    cy.url().should('match', /\/$/)
    cy.contains('h2', 'Notes').should('be.visible')
  })
})
