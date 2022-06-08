import order from '../fixtures/order.json';

describe('Login and checks if settings page works', () => {
    it('Logs into the website', () => {
        cy.visit('/dashboard/signin')
        cy.get('#username-input').type("Ondernemer");
        cy.get('#password-input').type("test");
        cy.get('.gap-2').click();

        //Checks if cypress is on dashbaord
        cy.get('.settingButton').click();
        cy.get('#rangeDoel').invoke('val', 50)
            .trigger('change')
        cy.wait(2000)

        cy.get('#account-username').clear();
        cy.get('#account-username').type("Cypress acount name");

        cy.get('#saveAccount').click()

        cy.get('#Store_name').clear();
        cy.get('#Store_name').type("Cypress store name");

        cy.get('#saveAccount').click()

        cy.get('#Store_name').clear();
        cy.get('#Store_name').type("Cypress store name");

        cy.get('#saveAccount').click()

    });


    // it('Logs into the website', () => {
    //     cy.visit('/')
    //     cy.visit('/dashboard/signin')
    //     cy.get('#username-input').type("Ondernemer");
    //     cy.get('#password-input').type("test");
    //     cy.get('.gap-2').click();
    // });
});