import { delay } from "../../../util.js";

const API_KEY = "5b3ce3597851110001cf62482d328da4ad724df196a3e2f0af3e15f3";

const emailInput = document.getElementById("email");
const postalCodeInput = document.getElementById("postal_code");
const streetInput = document.getElementById("street");
const houseNumberInput = document.getElementById("house_number");
const cityInput = document.getElementById("city");
const addressInput = document.getElementById("address");
const countryInput = document.getElementById("country");
const weightInput = document.getElementById("weight");
const sizeFormatInput = document.getElementById("sizeFormat");
const priceInput = document.getElementById("price");
const pickupInput = document.getElementById("is_pickup");

let coordinates = [];

document.getElementById("submitButton").addEventListener("click", async (event) => {
    event.preventDefault();

    let wrongInputs = [];

    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
        input.classList.remove(
            "bg-red-50",
            "border-red-500");
        if(input.id !== "address" && input.type !== "checkbox") {
            document.getElementById(`${input.id}_p`).innerHTML = "";
            if(input.value === "") {
                wrongInputs.push(input);
            }
        }
    });

    // check if format is selected
    if (sizeFormatInput.value === "") {
        sizeFormatInput.classList.add(
            "bg-red-50",
            "border-red-500");
            wrongInputs.push(sizeFormatInput);
    } else {
        sizeFormatInput.classList.remove(
            "bg-red-50",
            "border-red-500");
    }
    
    if(wrongInputs.length === 0) {
        const values = {
            email: emailInput.value,
            weight: weightInput.value,
            street: streetInput.value,
            house_number: houseNumberInput.value,
            postal_code: postalCodeInput.value,
            city: cityInput.value,
            country: countryInput.value,
            format_id: sizeFormatInput.value,
            is_pickup: pickupInput.checked,
            price: priceInput.value,
            coordinates : JSON.stringify(coordinates)
        }

        await fetch(`/api/orders/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        }).then((response) => {
            if(response.status === 200) {
                window.location.href = `/dashboard/overview`;
            }
        }).catch((error) => {
            console.error(`Fetch error: could not fulfill post request
             to create order. Errormessage: ${error}`);
        });

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

sizeFormatInput.addEventListener("change", () => {
    // check if format is selected
    if (sizeFormatInput.value === "") {
        sizeFormatInput.classList.add(
            "bg-red-50",
            "border-red-500");
            wrongInputs.push(sizeFormatInput);
    } else {
        sizeFormatInput.classList.remove(
            "bg-red-50",
            "border-red-500");
    }
});

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



     fetch(`https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${addressInput.value}&boundary.country=NL`)
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