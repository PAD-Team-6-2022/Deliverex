import "../toaster.js";

// send to track page if order code is filled in
document.querySelector("#submit").addEventListener("click", () => {
    let formIsValid = true;

    const postal_code_regex = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;

    const orderCode = document.querySelector("#orderCode");
    const postalCode = document.querySelector("#postalCode");

    if (orderCode.value.trim() === "") {
        orderCode.classList.add("bg-red-100");
        orderCode.classList.add("border-red-500");
        document.querySelector("#trackingError").classList.remove("hidden");
        formIsValid = false;
    } else {
        orderCode.classList.remove("bg-red-100");
        orderCode.classList.remove("border-red-500");
        document.querySelector("#trackingError").classList.add("hidden");
    }

    if (postalCode.value.trim() === "" || !postal_code_regex.test(postalCode.value)) {
        postalCode.classList.add("bg-red-100");
        postalCode.classList.add("border-red-500");
        document.querySelector("#postalError").classList.remove("hidden");
        formIsValid = false;
    } else {
        postalCode.classList.remove("bg-red-100");
        postalCode.classList.remove("border-red-500");
        document.querySelector("#postalError").classList.add("hidden");
    }

    if (formIsValid) {
        window.location.href = `/track/${orderCode.value.trim()}&${postalCode.value.trim()}`;
    }
});