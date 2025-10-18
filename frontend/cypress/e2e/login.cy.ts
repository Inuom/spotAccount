describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('[data-cy=email]').should('be.visible');
    cy.get('[data-cy=password]').should('be.visible');
    cy.get('[data-cy=login-button]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-cy=email]').type('invalid@example.com');
    cy.get('[data-cy=password]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=error-message]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.login('admin@example.com', 'password123');
    cy.url().should('include', '/dashboard');
  });
});
