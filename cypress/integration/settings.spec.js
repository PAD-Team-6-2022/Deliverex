import order from '../fixtures/order.json';

// check if track form shows all errors and finally submits correctly and shows tracking page
describe('Hij logt in en dan gaat die naar settings', () => {
    it('Shows all form errors', () => {
        cy.visit('/')
        cy.visit('/dashboard/signin')
        cy.get('#username-input').type("Ondernemer");
        cy.get('#password-input').type("test");
        cy.get('form').submit();

    });
    it('Checks if the package not found taoster shows after invalid tracking code', () => {
        cy.visit('/dashboard/settings')
        cy.get('#name').invoke('val', 25).trigger('change');
        cy.get('#length').type("12");
        cy.get('#width').type("10");
        cy.get('#height').type("5");

    });
});