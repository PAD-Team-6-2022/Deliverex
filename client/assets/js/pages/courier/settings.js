import { delay } from "../../util.js";

const API_KEY = "5b3ce3597851110001cf62482d328da4ad724df196a3e2f0af3e15f3";

// const id = document.querySelector("[data-user-id]").getAttribute("data-user-id");
const scheduleId = document.querySelector("[data-schedule-id]").getAttribute("data-schedule-id");

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

/**
 * check if t1 is before t2
 * @param t1 time 1
 * @param t2 time 2
 * @returns {boolean} if time 1 is before time 2
 */
function compareTime(t1, t2) {

    if(t1 === t2) return false;

    var time1 = t1.split(":");
    var hours1 = parseInt(time1[0]);
    var minutes1 = parseInt(time1[1]);

    var time2 = t2.split(":");
    var hours2 = parseInt(time2[0]);
    var minutes2 = parseInt(time2[1]);

    if(hours2 < hours1) return false;
    else {
        if(hours1 === hours2) {
            if(minutes2 <= minutes1) return false;
        }
    }

    return true;

}

/**
 * Check if t1 is the same or before t2
 * @param t1 time 1
 * @param t2 time 2
 * @returns {boolean} if time 1 is the same or before time 2
 */
function compareOrganisationTime(t1, t2) {

    if(t1 === t2) return true;

    var time1 = t1.split(":");
    var hours1 = parseInt(time1[0]);
    var minutes1 = parseInt(time1[1]);

    var time2 = t2.split(":");
    var hours2 = parseInt(time2[0]);
    var minutes2 = parseInt(time2[1]);

    if(hours2 < hours1) return false;
    else {
        if(hours1 === hours2) {
            if(minutes2 < minutes1) return false;
        }
    }

    return true;

}

const scheduleButton = document.getElementById("saveTimetable");

const scheduleInputs = document.querySelectorAll("[data-timetable-input]");

// add eventlisteners to checkbox
// so that if checkbox is unchecked it will set value of time to null
scheduleInputs.forEach(input => {
    let checkbox = document.getElementById(input.getAttribute("data-input-cb"));
    if(checkbox != null) checkbox.addEventListener("click", async () => {

        if(!checkbox.checked) {
            input.value = null;
        }

    })
})

// add eventlistener to save button of schedule
// and validate all inputs
scheduleButton.addEventListener("click", async (event) => {

    event.preventDefault();

    let wrongInputs = [];
    let wrongTimeInputs = [];
    let wrongOrganisationTimeInputs = [];

    scheduleInputs.forEach((input) => {
        input.classList.remove(
            "bg-red-50",
            "border-red-500");
        document.getElementById(`${input.id}_p`).innerHTML = "";
        let checkbox = document.getElementById(input.getAttribute("data-input-cb"));
        if(checkbox && checkbox.checked && !input.value) {
            wrongInputs.push(input);
        } else if(checkbox && checkbox.checked && document.getElementById(input.getAttribute("data-input-to")) != null) {

            let t2 = document.getElementById(input.getAttribute("data-input-to")).value;

            let orgTimeStart = input.getAttribute("data-org-time");

            if(!compareTime(input.value, t2)) wrongTimeInputs.push(input);
            else if(orgTimeStart != null && !compareOrganisationTime(orgTimeStart, input.value)) wrongOrganisationTimeInputs.push(input);

        } else if(checkbox && checkbox.checked && document.getElementById(input.getAttribute("data-input-from")) != null) {

            let t1 = document.getElementById(input.getAttribute("data-input-from")).value;

            let orgTimeEnd = input.getAttribute("data-org-time");

            console.log(orgTimeEnd);

            console.log(!compareOrganisationTime(input.value, orgTimeEnd));

            if(!compareTime(t1, input.value)) wrongTimeInputs.push(input);
            else if(orgTimeEnd != null && !compareOrganisationTime(input.value, orgTimeEnd)) wrongOrganisationTimeInputs.push(input);

        }
    });

    if(wrongInputs.length === 0 && wrongTimeInputs.length === 0 && wrongOrganisationTimeInputs.length === 0) {

        let mondayStart = document.getElementById("mondayStart").value;
        let mondayEnd = document.getElementById("mondayEnd").value;
        let tuesdayStart = document.getElementById("tuesdayStart").value;
        let tuesdayEnd = document.getElementById("tuesdayEnd").value;
        let wednesdayStart = document.getElementById("mondayStart").value;
        let wednesdayEnd = document.getElementById("wednesdayEnd").value;
        let thursdayStart = document.getElementById("thursdayStart").value;
        let thursdayEnd = document.getElementById("thursdayEnd").value;
        let fridayStart = document.getElementById("fridayStart").value;
        let fridayEnd = document.getElementById("fridayEnd").value;
        let saturdayStart = document.getElementById("saturdayStart").value;
        let saturdayEnd = document.getElementById("saturdayEnd").value;
        let sundayStart = document.getElementById("sundayStart").value;
        let sundayEnd = document.getElementById("sundayEnd").value;

        const values = {
            monday: {
                start: mondayStart,
                end: mondayEnd,
            },
            tuesday: {
                start: tuesdayStart,
                end: tuesdayEnd,
            },
            wednesday: {
                start: wednesdayStart,
                end: wednesdayEnd,
            },
            thursday: {
                start: thursdayStart,
                end: thursdayEnd,
            },
            friday: {
                start: fridayStart,
                end: fridayEnd,
            },
            saturday: {
                start: saturdayStart,
                end: saturdayEnd,
            },
            sunday: {
                start: sundayStart,
                end: sundayEnd,
            },
        }

        if(!mondayStart || !mondayEnd || document.getElementById("monday_span").innerHTML === "Closed") values.monday = null;
        if(!tuesdayStart || !tuesdayEnd || document.getElementById("tuesday_span").innerHTML === "Closed") values.tuesday = null;
        if(!wednesdayStart || !wednesdayEnd || document.getElementById("wednesday_span").innerHTML === "Closed") values.wednesday = null;
        if(!thursdayStart || !thursdayEnd || document.getElementById("thursday_span").innerHTML === "Closed") values.thursday = null;
        if(!fridayStart || !fridayEnd || document.getElementById("friday_span").innerHTML === "Closed") values.friday = null;
        if(!saturdayStart || !saturdayEnd || document.getElementById("saturday_span").innerHTML === "Closed") values.saturday = null;
        if(!sundayStart || !sundayEnd || document.getElementById("sunday_span").innerHTML === "Closed") values.sunday = null;

        console.log(values);

        console.log("Succes");

        await fetch(`/api/courier/schedule/${scheduleId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        }).then((response) => {
            if(response.status === 200) {
                window.location.href = `/dashboard/settings`;
            }
        }).catch((error) => {
            console.error(`Fetch error: could not fulfill post request
             to create order. Errormessage: ${error}`);
        });

    } else {
        console.log("wrong inputs!");
        wrongInputs.forEach((input) => {
            input.classList.add(
                "bg-red-50",
                "border-red-500"
            );
            document.getElementById(`${input.id}_p`).innerHTML = "This field can't be empty!";
        });

        wrongTimeInputs.forEach(input => {
            input.classList.add(
                "bg-red-50",
                "border-red-500"
            );
            document.getElementById(`${input.id}_p`).innerHTML = "From field can't be after To field!";
        });

        wrongOrganisationTimeInputs.forEach(input => {
            input.classList.add(
                "bg-red-50",
                "border-red-500"
            );
            document.getElementById(`${input.id}_p`).innerHTML = "Time must be within organisation opening hours!";
        })
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

