

const postal_code_input = document.getElementById("postal_code");
postal_code_input.addEventListener("change", async () => {
    console.log("change detected");
    const postal_code_regex = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
    if(!postal_code_regex.test(postal_code_input.value)) {
        postal_code_input.classList.remove("border-2");
        postal_code_input.classList.add("border-red-500");
        postal_code_input.classList.add("border-2");
        document.getElementById("postal_code_p").classList.remove("invisible");
    } else {
        document.getElementById("postal_code_p").classList.add("invisible");
        postal_code_input.classList.remove("border-red-500");
        postal_code_input.classList.remove("border-2");
        postal_code_input.classList.add("border");
    }
});

document.getElementById("submit").addEventListener("click", async () => {
    const street = document.getElementById("street").value;
    const house_number = document.getElementById("houseNumber").value;
    fetch(`https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf62482d328da4ad724df196a3e2f0af3e15f3&text=${street}%20${house_number},%20${postal_code_input.value}&boundary.country=NL`)
        .then(response => response.json())
        .then(data => {
            if(data.features.length > 0) {
                data.features.forEach((address) => {
                    const select = document.getElementById("city");
                    select.removeAttribute("disabled");
                    let option = document.createElement("option");
                    option.value = address.properties.locality;
                    option.innerHTML = address.properties.locality;
                    select.appendChild(option);
                    console.log(address.properties.locality);
                });
            }

        })
        .catch(err => console.log(err));
});