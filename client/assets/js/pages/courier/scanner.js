
Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
        const cameraId = devices[1].id;
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
                console.log(decodedText);
                await fetch(`/courier/scan/${decodedText}`, {
                    method: 'GET', // or 'PUT'
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(response => response.json())
                    .then(data => {
                        html5QrCode.pause();

                        //Hide the instruction message to make room for the loaded data
                        document.querySelector("#instruction-msg").classList.add("hidden");

                        document.querySelector("#loaded-order").classList.remove("hidden");

                        //Select the container of order info and make it visible
                        const orderInfoContainer = document.querySelector("#order-info");

                        //Show the loaded order data to the user in the UI
                        orderInfoContainer.querySelector("#order-id-container").textContent = data.order.id || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-format-container").textContent = data.order.format || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-weight-container").textContent = data.order.weight || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-address-container").textContent
                            = (`${data.order.street}  ${data.order.house_number}`) || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-city-container").textContent = data.order.city || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-country-container").textContent = data.order.country || '[Unavailable]';
                        orderInfoContainer.querySelector("#order-postal-code-container").textContent = data.order.postal_code || '[Unavailable]';

                        //Select the container of customer info and make it visible
                        const customerInfoContainer = document.querySelector("#customer-info");

                        //Show the loaded customer data to the user in the UI
                        customerInfoContainer.querySelector("#customer-email-container").textContent = data.order.email || '[Unavailable]';
                        customerInfoContainer.querySelector("#customer-phone-number-container").textContent =
                            (data.order.phone_number.toString().length === 9 ? '0' + data.order.phone_number.toString()
                                : data.order.phone_number) || '[Unavailable]';
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            },
            (errorMessage) => {
                // parse error, ignore it.
            })
            .catch((err) => {
                // Start failed, handle it.
            });
    }
}).catch(err => {
    console.error(`Error in trying obtaining camera's: ${err}`)
});

document.querySelector("#add-order-button").addEventListener("click", async () => {

    const id = document.querySelector("#order-id-container").textContent;
    console.log('send');

    await fetch(`/courier/scan`, {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: id}),
    });
})




