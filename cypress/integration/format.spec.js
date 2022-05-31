import order from '../fixtures/order.json';

describe('Log in to see the dashboard', () => {
    it('Shows all form errors', () => {
        cy.visit('/')
        cy.visit('/dashboard/signin')
        cy.get('#username').type("Ondernemer");
        cy.get('#password').type("test");
        cy.get('.gap-2').click();
    });

});