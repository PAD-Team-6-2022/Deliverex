const id = document.querySelector("[data-format-id]").getAttribute("data-format-id");
document.querySelector("#saveFormat").addEventListener("click", async (event) => {
    const formatname2 = document.getElementById("nameformat2").value
    const height = document.getElementById("height2").value
    const width = document.getElementById("width2").value
    const length = document.getElementById("length2").value


    if (formatname2 === "") {
        document.getElementById("error6").innerHTML = "Format name cant be empty"
        return false;
    }
    if (length === "") {
        document.getElementById("error7").innerHTML = "Length cant be empty"
        return false;
    }
    if (width === "") {
        document.getElementById("error8").innerHTML = "Width cant be empty"
        return false;
    }

    if (height === "") {
        document.getElementById("error9").innerHTML = "Height cant be empty"
        return false;
    }
    const values = {
        width: document.querySelector("#width").value,
        height: document.querySelector("#height").value,
        length: document.querySelector("#length").value,
        nameformat: document.querySelector("#nameformat").value,

    }
    await fetch(`/api/orders/editFormat/${id}`, {
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

});