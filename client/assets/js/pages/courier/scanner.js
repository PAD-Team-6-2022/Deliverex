/**
 *Uses the front-end camera of a mobile device to scan a QR code. The data
 * from the QR code is then subsequently sent to the server to fetch the order
 * details that come with it.
 *
 * Uses module 'html5-qrcode'.
 */
Html5Qrcode.getCameras().then((cameras) => {
    if (cameras && cameras.length) {
        const cameraId = cameras[1].id;
        const boxLength = screen.width / 3;

        const html5QrCode = new Html5Qrcode("qrcode-container");
        html5QrCode.start(
            cameraId,
            {
                fps: 60,
                qrbox: { width: boxLength, height: boxLength },
                aspectRatio: 1.0
            },
            async (decodedText, decodedResult) => {
                await fetch(`/api/orders/${decodedText}/scan`, {
                    method: 'GET', // or 'PUT'
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(async (response) => {
                    html5QrCode.pause();

                    //In case no order was found, display a 'not found' message
                    if (response.status === 404){
                        document.querySelector("#not-found-message").classList.remove("hidden");

                        document.querySelector("#button-container").classList.remove("hidden");

                        //Hide the 'add order' button and center the 'scan again' button
                        document.querySelector("#button-container").classList
                            .replace("justify-between", "justify-center");
                        document.querySelector("#add-order-button").classList.add("hidden");
                    }
                    else {
                        const order = await response.json();

                        //Hide the instruction message to make room for the loaded data
                        document.querySelector("#instruction-msg").classList.add("hidden");

                        //In case this order is already assigned to a certain user, show the extra information
                        if (order.isAlreadyAssigned){
                            document.querySelector("#occupied-order-message").classList.remove("hidden");
                            document.querySelector("#order-id-container-occupied").textContent = order.order.id;
                            document.querySelector("#order-status-container").textContent = order.order.status;
                            document.querySelector("#courier-id-container").textContent = order.order.courier_id;

                            //Hide the 'add order' button and center the 'scan again' button
                            document.querySelector("#button-container").classList
                                .replace("justify-between", "justify-center");
                            document.querySelector("#add-order-button").classList.add("hidden");
                        }

                        document.querySelector("#button-container").classList.remove("hidden");
                        document.querySelector("#loaded-order").classList.remove("hidden");

                        //Select the container of order info and make it visible
                        const orderInfoContainer = document.querySelector("#order-info");

                        //Show the loaded order data to the user in the UI
                        orderInfoContainer.querySelector("#order-id-container")
                            .textContent = order.order.id || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-format-container")
                            .textContent = order.order.format || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-weight-container")
                            .textContent = `${order.order.weight} grams` || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-address-container")
                            .textContent
                            = (`${order.order.street}  ${order.order.house_number}`) || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-city-container")
                            .textContent = order.order.city || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-country-container")
                            .textContent = order.order.country || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-postal-code-container")
                            .textContent = order.order.postal_code || '[Unavailable]';

                        //Select the container of customer info and make it visible
                        const customerInfoContainer = document.querySelector("#customer-info");

                        //Show the loaded customer data to the user in the UI
                        customerInfoContainer.querySelector("#customer-email-container").textContent = order.order.email || '[Unavailable]';
                        customerInfoContainer.querySelector("#customer-phone-number-container").textContent =
                            (order.order.phone_number.toString().length === 9 ? '0' + order.order.phone_number.toString()
                                : order.order.phone_number) || '[Unavailable]';
                    }
                })
            },
            (errorMessage) => {
                // parse error, ignore it.
            })
            .catch((error) => {
                console.error(`Could not start the QR code scanner. Error: ${error}`);
            });
    }
}).catch(err => {
    console.error(`Error in trying to obtain camera's: ${err}`)
});

/**
 * Defines the actions that are taken once the user presses the 'add order'
 * button. The client will send a PUT request to the server carrying the ID
 * of the scanned order. If it receives an 'OK' status back, it will redirect
 * to the courier dashboard. Otherwise, an error message will be shown.
 */
document.querySelector("#add-order-button")
    .addEventListener("click", async () => {

    const id = document.querySelector("#order-id-container").textContent;

    await fetch(`/api/orders/${id}/scan`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id}),
    }).then((response) => {
        if(response.status === 200)
            location.href = location.href.replace("/scan", "");
        else if(response.status === 500)
            document.querySelector("#server-error-message").classList.remove("hidden");
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
         to update order assignment. Errormessage: ${error}`)
    });
})

//Reload the page if the user presses on 'scan again'.
document.querySelector("#scan-again-button").addEventListener("click",() => {
    location.reload();
});