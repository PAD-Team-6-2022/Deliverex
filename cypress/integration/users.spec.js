import { username, password } from '../fixtures/ondernemer.json';

/**
 * @author Milan de Kruijf
 */
describe("Log in to 'ondernemer', make a new user and log in to that user", () => {
    it("Logs in to 'ondernemer'", () => {
      cy.visit("/dashboard/signin")

      cy.get("#username-input").type(username)
      cy.get("#submitSign").click()

      cy.get("#password-input").type(password)
      cy.get("#submitSign").click()
    });

    it("Navigates to the users page", () => {
      cy.get("#users-button").click();
    });

    it("Navigates to the users add page", () => {
      cy.get("#add-user-button").click();
    });

    it("Creates a new user", () => {
      cy.get("#username-input").type("new_test_user");
      cy.get("#email-input").type("new_test_user@new_test_user.com");
      cy.get("#password-input").type("password");
      cy.get("#confirm-password-input").type("password");
      cy.get("#submit-button").click();
    });

    it("Logs out of the current user", () => {
      cy.get("#signout-button").click();
    });

    if("Logs in to the new user", () => {
      cy.visit("/dashboard/signin");

      cy.get("#username-input").type("new_test_user");
      cy.get("#submitSign").click();

      cy.get("#password-input").type("password");
      cy.get("#submitSign").click();

      cy.url().should('eq', '/dashboard/overview');
    });
});