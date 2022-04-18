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

            if(data.checkpoints.length === 0)
                return;

            document.querySelector("#button-container").classList.remove("hidden");

            const tableContainer = document.querySelector("#checkpointsTable");
            tableContainer.classList.remove("animate-pulse");
            tableContainer.classList.replace("bg-slate-100", "bg-white");
            data.checkpoints.forEach((checkpointData, index) => {
                const checkpointElement = tableContainer.children[index];
                checkpointElement.classList.remove("bg-slate-300");
                console.log(checkpointElement.querySelector(".loading-pulse"));
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

                if(checkpointData.hasCompleted){
                    checkpointIndex.classList.add('line-through');
                    checkpointType.classList.add('line-through');
                    checkpointAddress.classList.add('line-through');
                    checkpointPostalCode.classList.add('line-through');
                    checkpointCity.classList.add('line-through');
                    checkpointCountry.classList.add('line-through');
                    checkpointOrderId.classList.add('line-through');
                    checkpointTime.classList.add('line-through');
                }
            });

            //Temporarily hard-coded. In the future, the travelmode should be
            //obtained from the back-end as the page loads.
            const travelMode = 'bicycling';

            //Creates a string representing all the locations from the first to
            //second-to-last
            let waypoints = '';
            const checkpoints = document.querySelectorAll(".checkpoint");
            checkpoints.forEach((checkpoint, index) => {
                const checkpointIndex = checkpoint.querySelector(".indexContainer");
                if(!checkpointIndex.classList.contains('line-through') && index !== (checkpoints.length-1)){
                    const address = checkpoint.querySelector(".addressContainer").textContent;
                    const postalCode = checkpoint.querySelector(".postalCodeContainer").textContent;
                    const city = checkpoint.querySelector(".cityContainer").textContent;

                    waypoints += `${address},${postalCode},${city}|`;
                }
            });

            console.log(checkpoints);

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

        }).catch((err) => {
            console.log(`Fetch error: could not retrieve routing
             data from the server. Errormessage: ${err}`);
            //TODO: Display the error in the UI
        })

}, (error) => {
    console.log(`Caught error while trying to get position. Error message: ${error}`);
});