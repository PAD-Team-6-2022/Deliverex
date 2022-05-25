import order from '../fixtures/order.json';

// check if track form shows all errors and finally submits correctly and shows tracking page
describe('Hij logt in en dan gaat die naar settings', () => {
    it('Shows all form errors', () => {
        cy.visit('/')
        cy.visit('/dashboard/signin')
        cy.get('#username').type("Ondernemer");
        cy.get('#password').type("test");
        cy.get('#submitSign').click();

    });
    it('Checks if the package not found taoster shows after invalid tracking code', () => {
        cy.visit('/dashboard/settings')
        cy.get('#name').type("XS");
        cy.get('#length').type("12");
        cy.get('#width').type("10");
        cy.get('#height').type("5");
        cy.get('#saveFormat').click();

    });


});