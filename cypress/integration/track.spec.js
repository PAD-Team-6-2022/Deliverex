// check if track form shows all errors
describe('Go to home', () => {
    it('Visits home page', () => {
        cy.visit('/');
        cy.get('#submit').click();
        cy.get('[data-input-error]')
            .eq(0)
            .should('not.have.class', 'hidden');
        cy.get('[data-input-error]')
            .eq(1)
            .should('not.have.class', 'hidden');
    })
})

// check tracking code error
describe('Check tracking code error', () => {
    it('Checks if error is removed after filling in tracking code', () => {
        // check tracking code
        cy.get('input')
            .eq(0)
            .type('100000');

        cy.get('#submit').click();
        cy.get('[data-input-error]')
            .eq(0)
            .should('have.class', 'hidden');
        cy.get('input')
            .eq(0)
            .clear();
    })
})

// // check postal code error
describe('Check postal code error', () => {
    it('Checks if error is removed after filling in postal code', () => {
        // check postal code
        cy.get('input')
            .eq(1)
            .type('1000AA');

        cy.get('#submit').click();
        cy.get('[data-input-error]')
            .eq(1)
            .should('have.class', 'hidden');
        cy.get('input')
            .eq(1)
            .clear();
    })
})

// ❌ test no package found
// describe('Test the no package found toaster', () => {
//     it('tries to go to the tracking page', () => {
//         cy.get('input')
//             .eq(0)
//             .type('-2');
//         cy.get('input')
//             .eq(1)
//             .type('1000AA');

//         cy.get('#submit').click();
//         cy.get('body').should('contain', '[data-toaster-code]');
//     })
// })


// Fill in and submit the tracking form
describe('Fill in and submit the tracking form', () => {
    it('tries to go to the tracking page', () => {
        cy.get('input')
            .eq(0)
            .type('100000');
        cy.get('input')
            .eq(1)
            .type('1000AA');

        cy.get('#submit').click();

        cy.url().should('not.eq', 'http://localhost:3000/')
    })
})