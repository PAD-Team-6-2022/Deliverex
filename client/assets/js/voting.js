// toggle the voting modal
document.querySelectorAll('[data-modal-toggle="voting-modal"]').forEach(toggle => {
    toggle.onclick = () => {
        document.querySelector("#voting-modal").classList.toggle("hidden");
    }
})

document.querySelector("#voting-form").onsubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const values = {}
    
    // store data in values
    for(let pair of data.entries()) {
        values[pair[0]] = pair[1];
    }

    // send form
    await fetch(`/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
    }).then((response) => {
        if(response.status === 200) {
            window.location.reload();
        }
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
         to create order. Error message: ${error}`);
    });
}