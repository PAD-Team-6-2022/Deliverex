
fetch('/api/ORS/', {
    method: "GET",
    headers: {
        "Content-Type" : "application/json"
    }
}).then((response) => {
    console.log(response.status);
}).catch((error) => {
    console.error(error);
})



/*
await fetch('https://api.openrouteservice.org/geocode/search/structured?api_key=' +
    '5b3ce3597851110001cf62482d328da4ad724df196a3e2f0af3e15f3' +
    '&address=Claes%20Boesserstraat%2014,%20Steenderenstraat%2013', {
    method: "GET",
    headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
    }
}).then(response => response.json())
    .then((data) => {
        console.log(data);
    })


fetch('https://api.openrouteservice.org/v2/directions/cycling-regular', {
    method: 'POST',
    headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': '5b3ce3597851110001cf62482d328da4ad724df196a3e2f0af3e15f3',
        'Content-Type': 'application/json; charset=utf-8'
    },
    body: '{"coordinates":[[8.681495,49.41461],[8.687872,49.420318],[8.686507,49.41943]],"preference":"fastest"}'
}).then(response => response.json()).then((data) => {
    console.log(data);
}).catch((err) => {
    console.error(err)
})

*/







/**
 * For every loaded order in the table on the dashboard, put an eventlistener
 * on it that will submit a POST request of the form that will update the state
 * of the order from 'TRANSIT' to 'DELIVERED'.
 */
document.querySelectorAll(".order").forEach((order) => {

    const form = document.querySelector("form");
    form.setAttribute("action", `/api/orders/${order.getAttribute('data-order-code')}/scan`);
    const orderInput = form.querySelector('input[name="selectedOrder"]');

    if(order.classList.contains('cursor-pointer'))
    order.addEventListener("click", () => {
        console.log('clicked')
        orderInput.value = order.getAttribute('data-order-code');
        form.submit();
    });
});