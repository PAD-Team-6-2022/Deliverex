import "../toaster.js";

// form fields
const trackCode = document.querySelector("[data-input-tracking_code]");
const postalCode = document.querySelector("[data-input-postal_code]");

/**
 * Show an error for the given field with the given message
 * 
 * @author Dylan Weijgertze
 * @param {Element} elem the input wrapper element
 * @param {boolean} error if it should display the error
 * @param {string} message what you want the error to say
 */
const showError = (elem, error, message) => {
    const input = elem.querySelector("input");
    const errorMessage = elem.querySelector("[data-input-error]");

    if (error) {
        input.classList.remove("bg-slate-50", "border-slate-200");
        input.classList.add("bg-red-100", "border-red-500");
        errorMessage.innerText = message;
        errorMessage.classList.remove("hidden");
    } else {
        input.classList.remove("bg-red-100", "border-red-500");
        errorMessage.classList.add("hidden");
    }
}

// send to track page if order code is filled in
document.querySelector("#submit").addEventListener("click", (e) => {
    e.preventDefault();

    // trim all inputs
    document.querySelectorAll("input").forEach(input => {
        input.value = input.value.trim();
    });

    let formIsValid = true;
    const postal_code_regex = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
    const trackCodeValue = trackCode.querySelector("input").value;
    const postalCodeValue = postalCode.querySelector("input").value;

    // tracking code validation
    if (trackCodeValue === "") {
        showError(trackCode, true, "Please fill in a tracking code");
        formIsValid = false;
    } else {
        showError(trackCode, false, "");
    }

    // postal code validation
    if (postalCodeValue === "") {
        showError(postalCode, true, "Please fill in a postal code");
        formIsValid = false;
    } else if (!postal_code_regex.test(postalCodeValue)) {
        showError(postalCode, true, "Postal code is not valid");
        formIsValid = false;
    } else {
        showError(postalCode, false, "");
    }

    // redirect if form is valid
    if (formIsValid) {
        window.location.href = `/track/${postalCodeValue}/${trackCodeValue}`;
    }
});