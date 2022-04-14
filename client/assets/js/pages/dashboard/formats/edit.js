const id = document.querySelector("[data-format-id]").getAttribute("data-format-id");
document.querySelector("#saveFormat").addEventListener("click", async (event) => {
                const values= {
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
                    if(response.status === 200){
                        window.location.href = "/dashboard/settings";
                    }
                }).catch((error) => {
                    console.error(`Fetch error: could not fulfill post request
             to update order. Errormessage: ${error}`);
                });

});