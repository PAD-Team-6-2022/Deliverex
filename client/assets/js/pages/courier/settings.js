import { delay } from "../../util.js";

const API_KEY = "5b3ce3597851110001cf62482d328da4ad724df196a3e2f0af3e15f3";

const id = document.querySelector("[data-user-id]").getAttribute("data-user-id");

const postalCodeInput = document.getElementById("postal_code");
const streetInput = document.getElementById("street");
const houseNumberInput = document.getElementById("house_number");
const cityInput = document.getElementById("city");
const addressInput = document.getElementById("address");
const countryInput = document.getElementById("country");

const addressButton = document.getElementById("saveAddress");

const addressInputs = document.querySelectorAll("[data-input-address]");

addressButton.addEventListener("click", async (event) => {

   event.preventDefault();

   let wrongInputs = [];

   addressInputs.forEach(input => {

       input.classList.remove(
           "bg-red-50",
           "border-red-500");
       document.getElementById(`${input.id}_p`).innerHTML = "";
       if(input.value === "") {
           wrongInputs.push(input);
       }

   });

   if(wrongInputs.length === 0) {

       console.log("sucess")

       // TODO: change address in db

   } else {
       wrongInputs.forEach((input) => {
           input.classList.add(
               "bg-red-50",
               "border-red-500"
           );
           document.getElementById(`${input.id}_p`).innerHTML = "This field can't be empty!";
       });
   }

});

const scheduleButton = document.getElementById("saveTimetable");

const scheduleInputs = document.querySelectorAll("[data-timetable-input]");

scheduleButton.addEventListener("click", async (event) => {

    event.preventDefault();

    let wrongInputs = [];

    scheduleInputs.forEach((input) => {
        input.classList.remove(
            "bg-red-50",
            "border-red-500");
        document.getElementById(`${input.id}_p`).innerHTML = "";
        let checked = document.getElementById(input.getAttribute("data-input-cb")).checked;
        if(checked && !input.value) {
            wrongInputs.push(input);
        }
    });

    if(wrongInputs.length === 0) {

        console.log(scheduleInputs);

        const values = {
            monday: {
                start: document.getElementById("mondayStart").value,
                end: document.getElementById("mondayEnd").value,
            },
            tuesday: {
                start: document.getElementById("tuesdayStart").value,
                end: document.getElementById("tuesdayEnd").value,
            },
            wednesday: {
                start: document.getElementById("wednesdayStart").value,
                end: document.getElementById("wednesdayEnd").value,
            },
            thursday: {
                start: document.getElementById("thursdayStart").value,
                end: document.getElementById("thursdayEnd").value,
            },
            friday: {
                start: document.getElementById("fridayStart").value,
                end: document.getElementById("fridayEnd").value,
            },
            saturday: {
                start: document.getElementById("saturdayStart").value,
                end: document.getElementById("saturdayEnd").value,
            },
            sunday: {
                start: document.getElementById("sundayStart").value,
                end: document.getElementById("sundayEnd").value,
            },
        }

        console.log(values);

        console.log("Succes");

        // await fetch(`/api/courier/timetable/${id}`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(values),
        // }).then((response) => {
        //     if(response.status === 200) {
        //         window.location.href = `/dashboard/settings`;
        //     }
        // }).catch((error) => {
        //     console.error(`Fetch error: could not fulfill post request
        //      to create order. Errormessage: ${error}`);
        // });

    } else {
        wrongInputs.forEach((input) => {
            input.classList.add(
                "bg-red-50",
                "border-red-500"
            );
            document.getElementById(`${input.id}_p`).innerHTML = "This field can't be empty!";
        });
    }

})

let coordinates = [];

postalCodeInput.addEventListener("keyup", delay((e) => {
    const postal_code_regex = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
    postalCodeInput.classList.remove(
        "bg-red-50",
        "focus:border-red-500",
        "focus:ring-red-500",
        "border-red-500"
    );
    document.getElementById("postal_code_p").innerHTML = "";

    if(!postal_code_regex.test(postalCodeInput.value) && postalCodeInput.value !== "") {
        postalCodeInput.classList.add(
            "bg-red-50",
            "focus:border-red-500",
            "focus:ring-red-500",
            "border-red-500"
        );
        document.getElementById("postal_code_p").innerHTML = "Invalid postal code!";
    }
}, 500));

addressInput.addEventListener("keyup", delay((e) => {

    if(addressInput.value === "") return;

    fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=${API_KEY}&text=${addressInput.value}&boundary.country=NL`)
        .then(res => res.json())
        .then(data => {

            const table = document.getElementById("addresses");
            table.innerHTML = "";

            if(data.features.length > 0) {

                data.features.forEach((address) => {
                    if(address.properties.housenumber && address.properties.postalcode) {
                        let tr = document.createElement("tr");
                        tr.classList.add("hover:bg-gray-200", "hover:cursor-pointer");
                        tr.addEventListener("click", async () => {
                            postalCodeInput.value = address.properties.postalcode;
                            streetInput.value = address.properties.street;
                            houseNumberInput.value = address.properties.housenumber;
                            cityInput.value = address.properties.locality;
                            countryInput.value = address.properties.country;
                            table.innerHTML = "";
                            coordinates = {long: address.geometry.coordinates[1], lat: address.geometry.coordinates[0]};
                        });
                        let newAddress = document.createElement("td");
                        newAddress.innerHTML = address.properties.label;
                        newAddress.classList.add("py-1", "px-3");
                        tr.appendChild(newAddress);
                        table.appendChild(tr);
                    }
                });

            }

        }).catch(err => console.log(err));
}, 500));

