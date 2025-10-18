// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy=email]').type(email);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=login-button]').click();
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=logout-button]').click();
});
