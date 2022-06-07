import { delay } from '../../../util.js';
import '../../../tooltip.js';

const emailInput = document.getElementById('email');
const postalCodeInput = document.getElementById('postal_code');
const streetInput = document.getElementById('street');
const houseNumberInput = document.getElementById('house_number');
const cityInput = document.getElementById('city');
const addressInput = document.getElementById('address');
const countryInput = document.getElementById('country');
const weightInput = document.getElementById('weight');
const sizeFormatInput = document.getElementById('sizeFormat');
const priceInput = document.getElementById('price');
const pickupInput = document.getElementById('is_pickup');
const deliveryDateInput = document.getElementById('delivery_date');

let coordinates = [];

/**
 * Checks if date is within organisation opening days
 */
async function checkDate(dateStr) {

    if(dateStr === null || dateStr === "") return false;

    const today = Date.now();

    const date = new Date(dateStr);

    if(today > date) return false;

    await fetch(`/api/orders/deliveryDates`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json())
        .then((data) => {

            const day = date.getDay();

            const days = data.schedulingData.availableDays;

            switch(day) {
                case 1:
                    return days.monday;
                case 2:
                    return days.tuesday;
                case 3:
                    return days.wednesday;
                case 4:
                    return days.thursday;
                case 5:
                    return days.friday;
                case 6:
                    return days.saturday;
                case 0:
                    return days.sunday;
            }


        }).catch((error) => {
            console.error(`Fetch error: could not fulfill get request
        to get addresses. Errormessage: ${error}`);
            return false;
        });

}

document
    .getElementById('submitButton')
    .addEventListener('click', async (event) => {
        event.preventDefault();

        let wrongInputs = [];
        let wrongDateInput = [];

        const inputs = document.querySelectorAll('input');
        await inputs.forEach(async (input) => {
            input.classList.remove('bg-red-50', 'border-red-500');
            if (input.id !== 'address' && input.type !== 'checkbox' && input.type !== 'date') {
                document.getElementById(`${input.id}_p`).innerHTML = '';
                if (input.value === '') {
                    wrongInputs.push(input);
                }
            } else if(input.type === 'date') {
                document.getElementById(`${input.id}_p`).innerHTML = '';
                let isCorrectDate = await checkDate(input.value);
                if(input.value === null || input.value === "" || !isCorrectDate) {
                    wrongDateInput.push(input);
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

        if (wrongInputs.length === 0 && wrongDateInput.length === 0) {
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
                coordinates: JSON.stringify(coordinates),
                delivery_date: deliveryDateInput.value,
            };

            await fetch(`/api/orders/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })
                .then((response) => {
                    if (response.status === 200) {
                        window.location.href = `/dashboard/overview`;
                    } else if(response.status === 500) {
                        emailInput.classList.add("bg-red-50", "border-red-500");
                        document.querySelector("#email_p").innerHTML = "Wrong email-address!";
                    }
                })
                .catch((error) => {
                    console.error(`Fetch error: could not fulfill post request
             to create order. Errormessage: ${error}`);
                });
        } else {
            wrongInputs.forEach((input) => {
                console.log(input.id)
                input.classList.add('bg-red-50', 'border-red-500');
                document.getElementById(`${input.id}_p`).innerHTML =
                    "This field can't be empty!";
            });

            wrongDateInput.forEach(input => {
                input.classList.add('bg-red-50', 'border-red-500');
                document.getElementById(`${input.id}_p`).innerHTML =
                    "Date is either in the past or outside of opening days!";
            })

        }
    });

sizeFormatInput.addEventListener('change', () => {
    // check if format is selected
    if (sizeFormatInput.value === '') {
        sizeFormatInput.classList.add('bg-red-50', 'border-red-500');
        wrongInputs.push(sizeFormatInput);
    } else {
        sizeFormatInput.classList.remove('bg-red-50', 'border-red-500');
    }
});

postalCodeInput.addEventListener(
    'keyup',
    delay((e) => {
        const postal_code_regex = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
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

addressInput.addEventListener(
    'keyup',
    delay(async (e) => {
        if (addressInput.value === '') return;

        await fetch(`/api/ORS/find/${addressInput.value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json())
            .then((data) => {
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
            }).catch((error) => {
                console.error(`Fetch error: could not fulfill get request
        to get addresses. Errormessage: ${error}`);
            });
    }, 500),
);
