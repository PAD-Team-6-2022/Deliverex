import {openModal} from "../../modal.js";

// get all form inputs
const formatInputs = document
    .querySelector("#formatForm")
    .querySelectorAll("input");

const accountInputs = document
    .querySelector("#formAccount")
    .querySelectorAll("input");

document.getElementById("saveGoal").addEventListener("click", async (event) => {
    event.preventDefault();
    const values = {
        percentage: document.getElementById("rangeDoel").value,
    };

    await fetch(`/api/orders/editDoelPercentage`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values)
    }).then((response) => {
        if (response.status === 200) {
            window.location.href = "/dashboard/settings";
        }
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
             to update order. Errormessage: ${error}`);
    });

})

document.getElementById("saveAccount").addEventListener("click", async(req, res)  => {
    event.preventDefault();

    const values = {
        username: document.getElementById("account-username").value,
        email: document.getElementById("acount-email").value,
        acountOldPassword: document.getElementById("acount-old-password").value,
        acountNewPassword: document.getElementById("acount-new-password").value,
        acountConfirmNewPassword: document.getElementById("acount-confirm-new-password").value
    };

    await fetch(`/api/orders/editAccount`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values)
    }).then((response) => {
        if (response.status === 200) {
            window.location.href = "/dashboard/settings";
        }
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
             to update order. Errormessage: ${error}`);
    });

})

document.getElementById("saveStore").addEventListener("click", async (event) => {
    event.preventDefault();

    const values = {
        name: document.getElementById("Store_name").value,
        email: document.getElementById("Store_email").value,
        streethouseNumber: document.getElementById("Street_house_number").value,
        postalCode: document.getElementById("Postal_code").value,
        city: document.getElementById("City").value,
        country: document.getElementById("Country").value
    };

    await fetch(`/api/orders/editStore`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values)
    }).then((response) => {
        if (response.status === 200) {
            window.location.href = "/dashboard/settings";
        }
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
             to update order. Errormessage: ${error}`);
    });
})


/**
 * Handle the format submit button and try to save the inputs
 */
document
    .getElementById("saveFormat")
    .addEventListener("click", async (event) => {
        event.preventDefault();

        const values = {};
        const formatname1 = document.getElementById("name").value
        const height = document.getElementById("height").value
        const width = document.getElementById("width").value
        const length = document.getElementById("length").value


        if (formatname1 === "") {
            document.getElementById("error2").innerHTML = "Format name can't be empty"
            return false;
        }
        if (length === "") {
            document.getElementById("error3").innerHTML = "Length can't be empty"
            return false;
        }
        if (width === "") {
            document.getElementById("error4").innerHTML = "Width can't be empty"
            return false;
        }

        if (height === "") {
            document.getElementById("error5").innerHTML = "Height can't be empty"
            return false;
        }
        if (height === "") {
            document.getElementById("error5").innerHTML = "Height can't be empty"
            return false;
        }


        // add all input values and names to the values object
        formatInputs.forEach((input) => {
            values[input.name] = input.value;
        });
        // needs validation
        await fetch(`/api/orders/setting`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        })
            .then((response) => {
                if (response.status === 200) {
                    location.reload();
                }
            })
            .catch((error) => {
                console.error(`Fetch error: could not fulfill post request
         to update order assignment. Errormessage: ${error}`);
            });
    });

document.querySelectorAll("[data-format-code]").forEach((format) => {
    const id = format.getAttribute("data-format-code");


    format
        .querySelector("[data-format-delete]")
        .addEventListener("click", async (event) => {
            openModal("delete-format", {
                actions: {
                    confirm: async () => {
                        await fetch(`/api/orders/settings/${id}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        });
                        window.location.reload();
                    },
                },
            });
        });
});

var slider = document.getElementById("rangeDoel");
var output = document.getElementById("rangeDoelInfo");
output.innerHTML = slider.value + "%";

slider.oninput = function () {
    output.innerHTML = this.value + "%";
};
