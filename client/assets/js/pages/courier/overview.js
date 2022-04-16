/**
 * Adds an event that takes all location data from the checkpoints table
 * and produces a new Google Map link as a new route
 */
document.addEventListener("DOMContentLoaded", () => {

    //Temporarily hard-coded. In the future, the travelmode should be
    //obtained from the back-end as the page loads.
    const travelMode = 'bicycling';

    //Creates a string representing all the locations from the first to
    //second-to-last
    let waypoints = '';
    const checkpoints = document.querySelectorAll(".checkpoint");
    checkpoints.forEach((checkpoint, index) => {
        if(!checkpoint.classList.contains('hasCompleted') && index !== (checkpoints.length-1)){
            const address = checkpoint.querySelector(".addressContainer").textContent;
            const postalCode = checkpoint.querySelector(".postalCodeContainer").textContent;
            const city = checkpoint.querySelector(".cityContainer").textContent;

            waypoints += `${address},${postalCode},${city}|`;
        }
    });

    //Retrieve the location data from the last checkpoint
    const lastCheckpoint = checkpoints[checkpoints.length-1];
    lastCheckpoint.location = {
        address: lastCheckpoint.querySelector(".addressContainer").textContent,
        postal_code: lastCheckpoint.querySelector(".postalCodeContainer").textContent,
        city: lastCheckpoint.querySelector(".cityContainer").textContent
    };

    //Destination. This is simply the last checkpoint. To be potentially changed later to a defined end location.
    const destination = `${lastCheckpoint.location.address},${lastCheckpoint.location.postal_code},${lastCheckpoint.location.city}`;
    const url = encodeURI(`https://www.google.com/maps/dir/?api=1&travelmode=${travelMode}&waypoints=${waypoints}&destination=${destination}`
        .replaceAll(',', '+'));
    console.log(url);

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