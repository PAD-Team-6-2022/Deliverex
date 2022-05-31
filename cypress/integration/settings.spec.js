import order from '../fixtures/order.json';

describe('Login to go to dashboard', () => {
    it('Shows all form errors', () => {
        cy.visit('/')
        cy.visit('/dashboard/signin')
        cy.get('#username-input').type("Ondernemer");
        cy.get('#password-input').type("test");
        cy.get('.gap-2').click();
    });
});