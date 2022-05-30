/**
 *Uses the front-end camera of a mobile device to scan a QR code. The data
 * from the QR code is then subsequently sent to the server to fetch the order
 * details that come with it.
 *
 * Uses module 'html5-qrcode'.
 */
Html5Qrcode.getCameras().then((cameras) => {

    //If at least one camera is present..
    if (cameras && cameras.length) {

        //Length of the 'box' within the scanner
        const boxLength = 190;

        //Make a new instance of 'Html5QrCode' using
        // the 'qrcode-container' div
        const qrCodeScanner = new Html5Qrcode("qrcode-container");

        //Start the scanner with certain options defined
        qrCodeScanner.start(
            { facingMode: "environment" },
            {
                fps: 60,
                qrbox: { width: boxLength, height: boxLength },
                aspectRatio: 1.0
            },
            async (decodedText, decodedResult) => {

                //Get the order from the server based on its ID
                await fetch(`/api/orders/${decodedText}/scan`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(async (response) => {

                    //Pause the scanner after having received a response
                    qrCodeScanner.pause();

                    //In case no order was found, display a 'not found' message
                    if (response.status === 404){
                        document.querySelector("#not-found-message")
                            .classList.remove("hidden");
                        document.querySelector("#button-container")
                            .classList.remove("hidden");

                        //Hide the 'add order' button and center the 'scan again' button
                        document.querySelector("#button-container").classList
                            .replace("justify-between", "justify-center");
                        document.querySelector("#update-order-button")
                            .classList.add("hidden");
                    }
                    else {
                        //Get the JSON body from the response
                        const order = await response.json();

                        //Hide the instruction message to make room for the loaded data
                        document.querySelector("#instruction-msg")
                            .classList.add("hidden");

                        //In case this order is already assigned to a certain user,
                        // show the extra information
                        if (order.isNotAuthorized){
                            document.querySelector("#occupied-order-message")
                                .classList.remove("hidden");
                            document.querySelector("#order-id-container-occupied")
                                .textContent = order.order.id;
                            document.querySelector("#order-status-container-occupied")
                                .textContent = order.order.status;
                            document.querySelector("#courier-id-container")
                                .textContent = order.order.courier_id;

                            //Hide the 'add order' button and center the 'scan again' button
                            document.querySelector("#button-container").classList
                                .replace("justify-between", "justify-center");
                            document.querySelector("#update-order-button").classList.add("hidden");
                        }

                        document.querySelector("#button-container")
                            .classList.remove("hidden");
                        document.querySelector("#loaded-order")
                            .classList.remove("hidden");

                        //Select the container of order info and make it visible
                        const orderInfoContainer
                            = document.querySelector("#order-info");

                        //String values representing the containers of the order data
                        const orderDataContainers = ['#order-id-container', '#order-status-container',
                            '#order-format-container', '#order-weight-container',
                            '#order-address-container', '#order-city-container',
                            '#order-country-container', '#order-postal-code-container',];

                        //String values representing the data that should be put into the container
                        const orderValues = [order.order.id, order.order.status,
                            order.order.formatId, `${order.order.weight} grams`,
                            (`${order.order.street}  ${order.order.house_number}`),
                            order.order.city, order.order.country, order.order.postal_code];

                        //Uses the above two arrays to put the order data in the corresponding container
                        orderDataContainers.forEach((orderColumn, index) => {
                            orderInfoContainer.querySelector(orderColumn)
                                .textContent = orderValues[index] || '[Unavailable]';
                        });

                        //Select the container of customer info and make it visible
                        const customerInfoContainer = document
                            .querySelector("#customer-info");

                        //Load customer data in the UI:
                        //Show the email adres of the customer
                        customerInfoContainer.querySelector(
                            "#customer-email-container").textContent
                            = order.order.email || '[Unavailable]';

                        //Show the phone number of the customer
                        customerInfoContainer.querySelector(
                            "#customer-phone-number-container").textContent =
                            (order.order.phone_number.toString()
                                .length === 9 ? '0' + order.order.phone_number.toString()
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
    console.error(`Error in trying to obtain camera's: ${err}`);
    document.querySelector("#no-camera-message")
        .classList.remove("hidden");
});

/**
 * Defines the actions that are taken once the user presses the 'post order'
 * button. The client will send a PUT request to the server carrying the ID
 * of the scanned order. If it receives an 'OK' status back, it will redirect
 * to the courier dashboard. Otherwise, an error message will be shown.
 */
document.querySelector("#update-order-button")
    .addEventListener("click", async () => {

        //Get the ID of the clicked order
        const id = document.querySelector(
            "#order-id-container").textContent;

        //Attempt to update the scanned order
        await fetch(`/api/orders/${id}/scan`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id}),
    }).then((response) => {
        if(response.status === 200){

            //Get the current date
            const currentDate = new Date();
            const today = currentDate.getFullYear()+'-'+
                (currentDate.getMonth()+1)+'-'+
                currentDate.getDate();

            //List to keep track of the loaded checkpoints (in the cookie)
            let completedCheckpoints = [];

            //Clear the cookie in case the data is not from today
            if(document.cookie !== 'empty' && document.cookie.length){

                //In case the date mentioned in the cookie is from today, fill
                // the array with the checkpoint data that is included in it
                const cookieData = JSON.parse(document.cookie);
                if(cookieData.date === today)
                    completedCheckpoints = completedCheckpoints.concat(cookieData.completedCheckpoints);
            }

            //Get the checkpoints status
            const status = document.querySelector("#order-status-container").textContent;

            //Set a 'type' property based on whether the status is 'READY' or 'DELIVERY'
            let type;
            if(status === 'READY')
                type = 'pickup';
            else if (status === 'TRANSIT')
                type = 'delivery';

            //Get the information about this checkpoint
            const address = document.querySelector(
                "#order-address-container").textContent;
            const city = document.querySelector(
                "#order-city-container").textContent;
            const postal_code = document.querySelector(
                "#order-postal-code-container").textContent;
            const country = document.querySelector(
                "#order-country-container").textContent;

            //Obtain the current time
            const time = (() => {
                const hours = currentDate.getHours() < 10 ? '0'+
                    currentDate.getHours() : currentDate.getHours();
                const minutes = currentDate.getMinutes() < 10 ? '0'+
                    currentDate.getMinutes() : currentDate.getMinutes();
                const seconds = currentDate.getSeconds() < 10 ? '0'+
                    currentDate.getSeconds() : currentDate.getSeconds();
                return `${hours}:${minutes}:${seconds}`;
            })();

            //Take all the above-calculated information and push it to the
            // 'completedCheckpoints' array as a newly created record
            completedCheckpoints.push({
                order_id: id,
                type,
                location: {
                    address,
                    city,
                    postal_code,
                    country
                },
                time
            });

            //Update/overwrite the cookie data with the completedCheckpoints array
            document.cookie = JSON.stringify({date: today, completedCheckpoints});

            //Change the page back to the previous page (presumably the dashboard)
            location.href = location.href.replace("/scan", "");
        }
        else if(response.status === 500)
            document.querySelector("#server-error-message")
                .classList.remove("hidden");
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
         to update order assignment. Errormessage: ${error}`)
    });
})

/**
 * Reloads the page if the user presses on 'scan again'.
 */
document.querySelector("#scan-again-button")
    .addEventListener("click",() => {
    location.reload();
});