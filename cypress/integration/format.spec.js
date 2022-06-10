import order from '../fixtures/order.json';

// check if track form shows all errors and finally submits correctly and shows tracking page
describe('Hij logt in en dan gaat die naar settings', () => {
    it('Logs into the website and tests the formats page', () => {
        cy.visit('http://localhost:3000/dashboard/signin')
        //bij de sign page pakt hij de inloggegevens en daar vult hij de inloggegevens
        cy.get('#username-input').type("Ondernemer");
        cy.get('#submitSign').click();
        cy.get('#password-input').type("test");
        cy.get('#submitSign').click();
        cy.wait(1500);
        //na dat het ingelogd is gaat hij naar settings pagina en voert hij hier de formaten
        cy.visit('http://localhost:3000/dashboard/settings')
        cy.wait(1500);
        //hier kijkt hij of hij een error geeft als het de rest niet ingevuld wordt
        cy.get('#name').type("XS");
        cy.get('#saveFormat').click();
        cy.scrollTo('top', {duration: 3500});
        cy.get('#length').type("12");
        cy.wait(500);
        cy.get('#width').type("10");
        cy.wait(500);
        cy.get('#height').type("5");
        cy.wait(500);
        //hier kijkt hij of het na invullen van alle gegevens of hij nu wel werkt.
        cy.get('#saveFormat').click();
        //hier gaat hij terug naar de settings pagina en kijkt of het formaten opslaan gelukt is
        cy.visit('http://localhost:3000/dashboard/settings')
    });
});