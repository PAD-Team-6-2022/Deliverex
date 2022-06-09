

import order from '../fixtures/order2.json'
import ondernemer from '../fixtures/ondernemer.json'

describe('Fill in create order form and click on create button', () => {

    const username = ondernemer.username
    const password = ondernemer.password

    beforeEach(() => {
        cy.visit("localhost:3000/dashboard")

        cy.get("#username-input").type(username)
        cy.get("#submitSign").click()

        cy.get("#password-input").type(password)
        cy.get("#submitSign").click()

    })

    it("Create an order with given data", () => {

        const date = new Date(Date.now())

        const month = date.getMonth() + 1;

        const dateStr = date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate())

        cy.get("#createOrderBtn").click()

        cy.get("#email").type(order.email)
        cy.get("#address").type(order.address)
        cy.get("td").contains("Ziggo Dome").click()
        cy.get("#weight").type(order.weight)
        cy.get("#price").type(order.price)
        cy.get("#sizeFormat").select(1)
        cy.get("#delivery_date").click()
        cy.get("#delivery_date").type(dateStr)
        cy.get("#submitButton").click()

        cy.url().should('eq', 'http://localhost:3000/dashboard/overview')

    })

    it("Create an order but with missing data", () => {

        cy.get("#createOrderBtn").click()

        cy.get("#email").type(order.email)
        cy.get("#weight").type(order.weight)
        cy.get("#price").type(order.price)
        cy.get("#sizeFormat").select(1)
        cy.get("#submitButton").click()

        cy.url().should('eq', 'http://localhost:3000/dashboard/orders/create')
        cy.get("#country_p").should('contain', 'empty')

    })

})