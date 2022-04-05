const router = require("express").Router();
const Order = require("../../models/order");

router.get("/", async (req, res) => {
    res.render("courier/scanner.ejs", {title: "Courier - Scanner"});
});

router.post("/", (req, res) => {
    console.log('Decoded text:' + req.body.decodedText);

    //hier dus de data van de QR code vergeleken met de orders in de database. vergeet niet te checken
    //of een order niet al gepakt is door een andere bezorger.

    //Update de status van de order naar 'in transit'



    //Hier de data in de database zetten. De (bestaande) order moet d.m.v. de QR code data
    //worden geïdentificeerd en daarna in de database gekoppeld aan het account van deze bezorger.

    //Note: maak en gebruik wellicht een middleware om de data van de QR code te checken

    //Note: momenteel redirect hij. Zorg ervoor dat de 'scan' pagina een 'OK' knop heeft met daarop
    //een GET request die teruggaat naar de bezorger dashboard. Op die manier de ingeladen data eerst
    //nog aan de gebruiker worden getoond.

    res.redirect("/courier");
})

module.exports = router;