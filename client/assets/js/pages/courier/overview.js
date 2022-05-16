
const loadCompletedCheckpoints = () => {
    if(document.cookie === 'empty' || !document.cookie)
        return;

    const checkpointsMetadata = JSON.parse(document.cookie);

    const currentDate = new Date();
    const today = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate();

    //Clear the cookie in case the data is not from today
    if(checkpointsMetadata.date.length)
    if(checkpointsMetadata.date !== today){
        document.cookie = 'empty';
        return;
    }

    const tableContainer = document.querySelector("#checkpointsTable");
    tableContainer.classList.remove("animate-pulse");
    tableContainer.classList.replace("bg-slate-100", "bg-white");

    if(checkpointsMetadata.completedCheckpoints.length){
        checkpointsMetadata.completedCheckpoints.forEach((completedCheckpoint, index) => {

            const checkpointElement = tableContainer.children[index];
            checkpointElement.classList.remove("bg-slate-300");
            checkpointElement.querySelectorAll(".loading-pulse")
                .forEach(loadingPulse => loadingPulse.remove());

            const checkpointIndex = checkpointElement.querySelector(".indexContainer");
            checkpointIndex.textContent = index+1;

            const checkpointType = checkpointElement.querySelector(".typeContainer");
            checkpointType.textContent = completedCheckpoint.type;

            const checkpointAddress = checkpointElement.querySelector(".addressContainer");
            checkpointAddress.textContent = completedCheckpoint.location.address;

            const checkpointPostalCode = checkpointElement.querySelector(".postalCodeContainer")
            checkpointPostalCode.textContent = completedCheckpoint.location.postal_code;

            const checkpointCity = checkpointElement.querySelector(".cityContainer");
            checkpointCity.textContent = completedCheckpoint.location.city;

            const checkpointCountry = checkpointElement.querySelector(".countryContainer");
            checkpointCountry.textContent = completedCheckpoint.location.country;

            const checkpointOrderId = checkpointElement.querySelector(".orderIdContainer");
            checkpointOrderId.textContent = completedCheckpoint.order_id;

            const checkpointTime = checkpointElement.querySelector(".timeContainer");
            checkpointTime.textContent = completedCheckpoint.time;

            checkpointIndex.classList.add('line-through');
            checkpointType.classList.add('line-through');
            checkpointAddress.classList.add('line-through');
            checkpointPostalCode.classList.add('line-through');
            checkpointCity.classList.add('line-through');
            checkpointCountry.classList.add('line-through');
            checkpointOrderId.classList.add('line-through');
            checkpointTime.classList.add('line-through');
        })
    }
}

navigator.geolocation.getCurrentPosition((success) => {

    //TODO: Use the 'pending' state of the fetch request
    // to give a loading effect to the checkpoints table

    //TODO: Place more comments

    fetch(`/api/ORS/${success.coords.longitude}/${success.coords.latitude}`, {
        method: 'GET',
        headers: {
            "Content-Type" : "application/json"
        }
    }).then(response => response.json())
        .then((data) => {

            loadCompletedCheckpoints();

            document.querySelector("#button-container").classList.remove("hidden");

            const checkpointsTable = document.querySelector("#checkpointsTable");
            checkpointsTable.classList.remove("animate-pulse");
            checkpointsTable.classList.replace("bg-slate-100", "bg-white");

            if(data.checkpoints.length !== 0)
            data.checkpoints.forEach((checkpointData, index) => {

                //Move the checkpoints to a lower point in the table. This way, we take
                //into account the rows occupied by the completed checkpoints
                if(document.cookie !== 'empty' && document.cookie.length){
                    index += JSON.parse(document.cookie).completedCheckpoints.length;
                }
                const checkpointElement = checkpointsTable.children[index];
                checkpointElement.classList.remove("bg-slate-300");
                checkpointElement.querySelectorAll(".loading-pulse")
                    .forEach(loadingPulse => loadingPulse.remove());

                const checkpointIndex = checkpointElement.querySelector(".indexContainer");
                checkpointIndex.textContent = index+1;

                const checkpointType = checkpointElement.querySelector(".typeContainer");
                checkpointType.textContent = checkpointData.type;

                const checkpointAddress = checkpointElement.querySelector(".addressContainer");
                checkpointAddress.textContent = checkpointData.location.address;

                const checkpointPostalCode = checkpointElement.querySelector(".postalCodeContainer")
                checkpointPostalCode.textContent = checkpointData.location.postal_code;

                const checkpointCity = checkpointElement.querySelector(".cityContainer");
                    checkpointCity.textContent = checkpointData.location.city;

                const checkpointCountry = checkpointElement.querySelector(".countryContainer");
                    checkpointCountry.textContent = checkpointData.location.country;

                const checkpointOrderId = checkpointElement.querySelector(".orderIdContainer");
                    checkpointOrderId.textContent = checkpointData.order_id;

                const checkpointTime = checkpointElement.querySelector(".timeContainer");
                checkpointTime.textContent = checkpointData.time;
            });

            for (let i = 0; i < checkpointsTable.children.length; i++) {
                if (checkpointsTable.children[i].children[0].children[0].classList.contains('animate-pulse')){
                    checkpointsTable.children[i].setAttribute("style", "background-color: rgb(248 113 113);");

                    checkpointsTable.children[i].querySelector(".indexContainer").textContent = 'FAILED';
                    checkpointsTable.children[i].querySelector(".typeContainer").textContent = '-';
                    checkpointsTable.children[i].querySelector(".addressContainer").textContent = '-';
                    checkpointsTable.children[i].querySelector(".postalCodeContainer").textContent = '-';
                    checkpointsTable.children[i].querySelector(".cityContainer").textContent = '-';
                    checkpointsTable.children[i].querySelector(".countryContainer").textContent = '-';
                    checkpointsTable.children[i].querySelector(".orderIdContainer").textContent = '-';
                    checkpointsTable.children[i].querySelector(".timeContainer").textContent = '-';

                    for (let j = 0; j < checkpointsTable.children[i].children.length; j++) {
                        checkpointsTable.children[i].children[j].children[0].remove();
                    }
                }
            }

            const ordersTable = document.querySelector("#ordersTable");
            const orders = ordersTable.children;

            for (let i = 0; i < orders.length; i++) {
                const id = orders[i].querySelector(".order-id-attribute").textContent;
                const status = orders[i].querySelector(".status-attribute");

                const checkpoints = checkpointsTable.children;
                let sum = 0;
                for (let j = 0; j < checkpoints.length; j++) {
                    if(checkpoints[j].querySelector(".orderIdContainer").textContent === id)
                        sum++;
                }
                if(sum !== 2){
                    status.classList.remove('bg-green-100');
                    status.classList.remove('text-green-800');
                    status.classList.remove('bg-yellow-100');
                    status.classList.remove('text-yellow-800');
                    status.classList.remove('bg-slate-100');
                    status.classList.remove('text-slate-800');
                    status.classList.remove('bg-slate-100');
                    status.classList.remove('text-slate-800');
                    status.classList.add('bg-red-100');
                    status.classList.add('text-red-800');
                    status.textContent = 'FAILED';
                }
            }

            //Temporarily hard-coded. In the future, the travelmode should be
            //obtained from the back-end as the page loads.
            const travelMode = 'bicycling';

            //Creates a string representing all the locations from the first to
            //second-to-last
            let waypoints = '';
            const checkpoints = document.querySelectorAll(".checkpoint");
            checkpoints.forEach((checkpoint, index) => {
                const checkpointIndex = checkpoint.querySelector(".indexContainer");
                if(!checkpointIndex.classList.contains('line-through') && index !== (checkpoints.length-1) && checkpointIndex.textContent !== 'FAILED'){
                    const address = checkpoint.querySelector(".addressContainer").textContent;
                    const postalCode = checkpoint.querySelector(".postalCodeContainer").textContent;
                    const city = checkpoint.querySelector(".cityContainer").textContent;

                    waypoints += `${address},${postalCode},${city}|`;
                }
            });

            let i = 0;

            for (let j = 0; j < checkpoints.length; j++) {
                if(checkpoints[j].querySelector(".indexContainer").textContent === 'FAILED'){
                    i = j-1;
                    break;
                }
            }

            //Retrieve the location data from the last checkpoint
            const lastCheckpoint = checkpoints[i];

            lastCheckpoint.location = {
                address: lastCheckpoint.querySelector(".addressContainer").textContent,
                postal_code: lastCheckpoint.querySelector(".postalCodeContainer").textContent,
                city: lastCheckpoint.querySelector(".cityContainer").textContent
            };

            //Destination. This is simply the last checkpoint. To be potentially changed later to a defined end location.
            const destination = `${lastCheckpoint.location.address},${lastCheckpoint.location.postal_code},${lastCheckpoint.location.city}`;
            const url = encodeURI(`https://www.google.com/maps/dir/?api=1&travelmode=${travelMode}&waypoints=${waypoints}&destination=${destination}`
                .replaceAll(',', '+'));


            //Adds a click event to a button that opens the google maps url in a new window
            document.querySelector("#viewRouteButton").addEventListener("click", () => {
                window.open(url);
            });

        }).catch((err) => {
            console.log(`Fetch error: could not retrieve routing
             data from the server. Errormessage: ${err}`);
            //TODO: Display the error in the UI
        });

}, (error) => {
    console.log(`Caught error while trying to get position. Error message: ${error}`);
});

const publicVapidKey = 'BLxVvjwWFJLXU0nqPOxRB_cZZiDMMTeD6c-7gTDvatl3gak50_jM9AhpWMwmn3sOkd8Ga-xhnzhq-zYpVqueOnI';

//Converts an base64 string to an unsigned 8 bit array
//Source: https://github.com/bradtraversy/node_push_notifications/blob/master/client/client.js
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = self.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

//Register the serviceWorker
if('serviceWorker' in navigator){
    await navigator.serviceWorker.register('../assets/js/pages/courier/sw.js', {
        scope: "../assets/js/pages/courier/"
    }).then(async (registrationObject) => {

        const currentSubscription = await registrationObject.pushManager.getSubscription();
        if(currentSubscription !== null)
            return;

        const subscribeButtonContainer = document.querySelector("#subscribeButtonContainer");
        const subscribeButton = document.querySelector("#subscribeButton");

        subscribeButtonContainer.classList.remove("hidden");
        subscribeButton.addEventListener("click", () => {
            registrationObject.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            }).then(async (subscriptionObject) => {
                await fetch('/api/ORS/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subscriptionObject)
                }).then((response) => response.json())
                    .then((data) => {
                        console.log('Response data: ' + data);
                        subscribeButtonContainer.classList.add("hidden");
                    }).catch((err) => console.error(`Fetch error: ${err}`));

            }).catch((err) => console.error(`Error: could not
         subscribe service worker. Error message: ${err}`));
        })
    }).catch((err) => {
        console.error(`Error: could not
         register service worker. Error message: ${err}`);
        return;
    });
}








