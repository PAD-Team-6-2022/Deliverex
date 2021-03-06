import { delay } from '../../../util.js';
import '../../../tooltip.js';

const id = document.querySelector('[name="id"]').value;
const emailInput = document.getElementById('email');
const postalCodeInput = document.getElementById('postal_code');
const streetInput = document.getElementById('street');
const houseNumberInput = document.getElementById('house_number');
const cityInput = document.getElementById('city');
const addressInput = document.getElementById('address');
const countryInput = document.getElementById('country');
const weightInput = document.getElementById('weight');
const sizeFormatInput = document.getElementById('sizeFormat');
const pickupInput = document.getElementById('is_pickup');
const priceInput = document.getElementById('price');
const statusInput = document.getElementById('status');

let coordinates = [];

// adds an eventlistener to validate the form before submitting
document.getElementById('submitButton').addEventListener('click', async () => {
    let wrongInputs = [];

    const inputs = document.querySelectorAll('input');

    // checks for wrong inputs
    inputs.forEach((input) => {
        input.classList.remove('bg-red-50', 'border-red-500');
        if (
            input.id !== 'address' &&
            input.type !== 'checkbox' &&
            input.type !== 'hidden'
        ) {
            document.getElementById(`${input.id}_p`).innerHTML = '';
            if (input.value === '') {
                wrongInputs.push(input);
            }
        }
    });

    // check if format is selected
    if (sizeFormatInput.value === '') {
        sizeFormatInput.classList.add('bg-red-50', 'border-red-500');
        wrongInputs.push(sizeFormatInput);
    } else {
        sizeFormatInput.classList.remove('bg-red-50', 'border-red-500');
    }

    if (wrongInputs.length === 0) {
        const values = {
            id: id,
            email: emailInput.value,
            weight: weightInput.value,
            street: streetInput.value,
            house_number: houseNumberInput.value,
            postal_code: postalCodeInput.value,
            city: cityInput.value,
            country: countryInput.value,
            format_id: sizeFormatInput.value,
            is_pickup: pickupInput.checked,
            status: statusInput.value,
            price: priceInput.value,
            coordinates: JSON.stringify(coordinates),
        };

        // edits an existing order
        await fetch('/api/orders/edit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then((response) => {
                if (response.status === 200) {
                    window.location.href = '/dashboard';
                }
            })
            .catch((error) => {
                console.error(`Fetch error: could not fulfill post request
             to update order. Errormessage: ${error}`);
            });
    } else {
        // adds a red border, background and error message to wrong inputs
        wrongInputs.forEach((input) => {
            input.classList.add('bg-red-50', 'border-red-500');
            document.getElementById(`${input.id}_p`).innerHTML =
                "This field can't be empty!";
        });
    }
});
// check if a format is selected
sizeFormatInput.addEventListener('change', () => {
    if (sizeFormatInput.value === '') {
        sizeFormatInput.classList.add('bg-red-50', 'border-red-500');
        wrongInputs.push(sizeFormatInput);
    } else {
        sizeFormatInput.classList.remove('bg-red-50', 'border-red-500');
    }
});

// checks if the postal code input is in dutch postal code format
postalCodeInput.addEventListener(
    'keyup',
    delay((e) => {
        console.log('change detected');
        const postal_code_regex = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
        document.getElementById('postal_code_p').classList.add('invisible');
        postalCodeInput.classList.remove(
            'bg-red-50',
            'focus:border-red-500',
            'focus:ring-red-500',
            'border-red-500',
        );
        document.getElementById('postal_code_p').innerHTML = '';

        if (
            !postal_code_regex.test(postalCodeInput.value) &&
            postalCodeInput.value !== ''
        ) {
            postalCodeInput.classList.add(
                'bg-red-50',
                'focus:border-red-500',
                'focus:ring-red-500',
                'border-red-500',
            );
            document.getElementById('postal_code_p').innerHTML =
                'Invalid postal code!';
        }
    }, 500),
);

// adds address suggestions under the input to choose from
addressInput.addEventListener(
    'keyup',
    delay(async (e) => {
        if (addressInput.value === '') return;

        // look up all addresses that match the address input query/value
        await fetch(`/api/ors/find/${addressInput.value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json())
            .then((data) => {
                const table = document.getElementById("addresses");
                table.innerHTML = "";

                if(data.features.length > 0) {

                    // adds all addresses under the input
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
            }).catch((error) => {
                console.error(`Fetch error: could not fulfill get request
        to get addresses. Errormessage: ${error}`);
            });

    }, 500),
);
