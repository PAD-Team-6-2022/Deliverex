// get all form inputs
const formatInputs = document.querySelector("#formatForm").querySelectorAll("input");;

/**
 * Handle the format submit button and try to save the inputs
 */
document.getElementById("saveFormat").addEventListener("click", async (event) => {
    event.preventDefault();

    const values = {};
    
    // add all input values and names to the values object
    formatInputs.forEach(input => {
        values[input.name] = input.value;
    });

    // needs validation
    await fetch(`/api/orders/setting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
    }).then((response) => {
        if(response.status === 200) {
            location.reload();
        }
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
         to update order assignment. Errormessage: ${error}`)
    });
});

