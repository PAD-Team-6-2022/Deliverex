/**
 * Adds an event that takes all location data from the checkpoints table
 * and produces a new Google Map link as a new route
 */
document.addEventListener("DOMContentLoaded", () => {

    //First gather all the location data
    const addresses = [];
    document.querySelectorAll(".addressContainer").forEach((container) => {
        addresses.push(container.textContent);
    });
    const postalCodes = [];
    document.querySelectorAll(".postalCodeContainer").forEach((container) => {
        postalCodes.push(container.textContent);
    });
    const cities = [];
    document.querySelectorAll(".cityContainer").forEach((container) => {
        cities.push(container.textContent);
    });

    //Temporarily hard-coded. In the future, the travelmode should be
    //obtained from the back-end as the page loads.
    const travelMode = 'bicycling';

    //Creates a string representing all the locations from the first to
    //second-to-last
    let waypoints = '';
    for (let i = 0; i < addresses.length - 1; i++) {
        waypoints += `${addresses[i]},${postalCodes[i]},${cities[i]}|`;
    }

    //Destination. This is simply the last checkpoint. To be potentially changed later to a defined end location.
    const destination = `${addresses[addresses.length - 1]},${postalCodes[addresses.length - 1]},${cities[addresses.length - 1]}`;
    const url = encodeURI(`https://www.google.com/maps/dir/?api=1&travelmode=${travelMode}&waypoints=${waypoints}&destination=${destination}`
        .replaceAll(',', '+'));

    //Adds a click event to a button that opens the google maps url in a new window
    document.querySelector("#viewRouteButton").addEventListener("click", () => {
        window.open(url);
    });
});


/**
 * [Most likely deprecated. Keeping it here for potential need for reference.]
 *
 * For every loaded order in the table on the dashboard, put an eventlistener
 * on it that will submit a POST request of the form that will update the state
 * of the order from 'TRANSIT' to 'DELIVERED'.
 *//*
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
});*/