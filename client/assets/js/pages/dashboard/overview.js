import('./partials/navbar.js');

let nextLink = document.getElementById("nextLink")
let prevLink = document.getElementById("prevLink")

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let page = urlParams.get('page')

if (page == null) {
    page = 1;
}

nextLink.href = "?page=" + (parseInt(page) + 1);

if (page > 1) {
    prevLink.href = "?page=" + (parseInt(page) - 1)
}


console.log(document.querySelectorAll(".clickableArrow").length);

document.querySelectorAll(".clickableArrow").forEach((arrowButton) => {
    arrowButton.addEventListener("click", () => {

        if(arrowButton.id === "id")
            urlParams.set("col", "id");
        else if(arrowButton.id === "mail")
            urlParams.set("col", "mail");
        else if(arrowButton.id === "state")
            urlParams.set("col", "state");
        else if(arrowButton.id === "created_at")
            urlParams.set("col", "created_at");

        urlParams.set("order", "asc");

      window.location.search = urlParams.toString();
    })
})

document.querySelectorAll("[data-order-code]").forEach((order) => {

    const id = order.getAttribute("data-order-code");

    order.querySelector("[data-order-delete]").addEventListener("click", async () => {
        console.log(id);
        document.getElementsByTagName("html")[0].classList.add("overflow-hidden");
        document.getElementsByTagName("html")[0].classList.add("invisible");
        document.querySelectorAll("[data-modal-overlay]").forEach((overlay) => {
            overlay.classList.remove("opacity-0");
        });
        document.querySelectorAll("[data-modal-screen]").forEach((screen) => {
            screen.classList.remove("opacity-0");
            screen.querySelector("[data-modal-delete]").setAttribute("data-order-code", id);
        });
    });

});

document.querySelectorAll("[data-modal-screen]").forEach((screen) => {

    screen.querySelector("[data-modal-cancel]").addEventListener("click", async () => {
        document.getElementsByTagName("html")[0].classList.remove("overflow-hidden");
        document.getElementsByTagName("html")[0].classList.remove("invisible");
        document.querySelectorAll("[data-modal-overlay]").forEach((overlay) => {
            overlay.classList.add("opacity-0");
        });
        document.querySelectorAll("[data-modal-screen]").forEach((screen) => {
            screen.classList.add("opacity-0");
        }); 
    });

    const deleteButton = screen.querySelector("[data-modal-delete]");

    deleteButton.addEventListener("click", async () => {
        const id = deleteButton.getAttribute("data-order-code");

        document.getElementsByTagName("html")[0].classList.remove("overflow-hidden");

        document.querySelectorAll("[data-modal-overlay]").forEach((overlay) => {
            overlay.classList.add("opacity-0");
        });
        document.querySelectorAll("[data-modal-screen]").forEach((screen) => {
            screen.classList.add("opacity-0");
        }); 

        if(id) {
            console.log(id);
            await fetch(`/api/orders/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            // await fetch({
            //     url: `/api/orders/${id}`,
            //     method: "DELETE"
            // });
            window.location.reload();
        } else {
            alert("Failed to delete the order.");
        }
    });
});