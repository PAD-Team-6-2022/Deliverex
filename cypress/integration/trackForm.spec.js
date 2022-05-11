import order from '../fixtures/order.json';

// check if track form shows all errors and finally submits correctly and shows tracking page
describe('Check if the tracking form on the homepage works', () => {
    it('Shows all form errors', () => {
        cy.visit('/');
        cy.get('#submit').click();
        cy.get('[data-input-error]').each(($errorField) => {
            cy.wrap($errorField).should('be.visible');
        });
    });

    it('Removes tracking code error after valid input', () => {
        cy.get('#orderCode').type(order.orderId);

        cy.get('#submit').click();
        cy.get('[data-input-tracking_code]>[data-input-error]').should('have.class', 'hidden');
        cy.get('#orderCode').clear();
    });

    it('Removes postal code error after valid input', () => {
        cy.get('#postalCode').type(order.postalCode);

        cy.get('#submit').click();
        cy.get('[data-input-postal_code]>[data-input-error]').should('have.class', 'hidden');
        cy.get('#postalCode').clear();
    });

    it('Checks if the package not found taoster shows after invalid tracking code', () => {
        cy.get('#orderCode').type('-2');
        cy.get('#postalCode').type(order.postalCode);

        cy.get('#submit').click();
        cy.contains("Oops! We couldn't find your package");
    });

    it('Fills in valid information and goes to the tracking page', () => {
        cy.get('#orderCode').type(order.orderId);
        cy.get('#postalCode').type(order.postalCode);

        cy.get('#submit').click();

        cy.url().should('eq', `${Cypress.config().baseUrl}/track/${order.postalCode}/${order.orderId}`);
    });
});