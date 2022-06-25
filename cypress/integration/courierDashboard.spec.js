/**
 * Defines a cypress test of the courier dashboard. To be
 * ran with the 'npm run cypress_run' command.
 *
 * @Author: Thomas Linssen
 */

//Description of what is being tested
describe('Test of the courier dashboard', () => {

    //Defines what the test actually does
    it('Logs in and plays around with the options', () => {

        //Guessed estimate of an avery phone's viewport
        const MOBILE_VIEWPORT = {
            horizontal: 440,
            vertical: 851
        }

        //Sets the resolution to a normal phone resolution
        cy.viewport(MOBILE_VIEWPORT.horizontal,MOBILE_VIEWPORT.vertical);

        //Navigates to the dashboard of the site
        cy.visit("http://localhost:3000/dashboard");

        //Enters the username 'bokko'
        cy.get('#username-input').type("bob")
            .should('have.value', 'bob');

        cy.get('#submitSign').click();

        //Enters the password 'Abracadabra123!'
        cy.get('#password-input').type("test")
            .should('have.value', 'test');

        //Pressed login
        cy.get('.gap-2').click();

        //Checks whether we are now on the courier page
        cy.url().should('include', '/dashboard/overview');

        //Intercept the API call to get the navigational route and returns a mock response instead
        cy.intercept('GET', '/api/ors/coords/*/*',{fixture: 'navigationalRoute.json'}).as('getNavigationalRoute');

        //Check whether any API call has actually been fired by checking whether a mock response has been returned
        cy.wait('@getNavigationalRoute').then((interception) => {
            assert.isNotNull(interception.response.body, 'Received mock response for the navigational route.');
        });

        //List of names of the columns of the checkpoint table
        const checkpointColumns = ['indexContainer',
            'typeContainer', 'addressContainer', 'postalCodeContainer',
            'cityContainer', 'countryContainer', 'orderIdContainer',
            'timeContainer'];

        //Loop through the values of the checkpoints table to check whether
        // the values of all rows and columns are properly displayed
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 8; j++) {
                cy.get(`:nth-child(${i+1}) > :nth-child(${j+1}) > .flex > .${checkpointColumns[j]}`)
                    .should(($dataCell) => {
                    const text = $dataCell.text();
                    expect(text).to.match(/[0-9a-z-A-Z]/);
                });
            }
        }

        //Scroll around on the page
        cy.scrollTo('top', {duration: 1000});
        cy.wait(1500);
        cy.scrollTo('center', {duration: 1000});
        cy.wait(1500);

        //Scoll the checkpoints table so that we
        // can check if everything is there
        cy.get('#checkpointsTableContainer')
            .scrollTo('right', {duration: 1000});
        cy.wait(1500);
        cy.get('#checkpointsTableContainer')
            .scrollTo('left', {duration: 1000});

        //Scroll below to the orders table
        cy.scrollTo('bottom', {duration: 1000});
        cy.wait(1500);

        //Scroll the orders table from left to right and
        // back so we can check if everything is there
        cy.get('#ordersTableContainer').scrollTo('right',
            {duration: 1000});
        cy.wait(1500);
        cy.get('#ordersTableContainer').scrollTo('left',
            {duration: 1000});

        //Scroll back to the top
        cy.scrollTo('top', {duration: 1000});
        cy.wait(1500);

        //Go to the scanning page by pressing the
        // 'update shipment' button and wait a bit
        cy.get('#updateShipmentButton').click();
        cy.wait(3000);

        //Go back
        cy.go('back');
        cy.wait(1000);

        //Open the google maps route to check
        // if the checkpoints are all there
        cy.get("#viewRouteButton").click();
    });

});