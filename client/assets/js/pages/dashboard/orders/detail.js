import('../partials/navbar.js');

const id = document.querySelector("[data-order-code]").getAttribute("data-order-code");

/**
 * Open modal when delete button is pressed
 */
document.querySelector("[data-order-delete]").addEventListener("click", () => {
    document.getElementsByTagName("html")[0].classList.add("overflow-hidden");
    document.querySelector("[data-modal-overlay]").classList.remove("invisible");

    document.querySelector("[data-modal-screen]").classList.remove("invisible");
    document.querySelector("[data-modal-screen]").querySelector("[data-modal-delete]").setAttribute("data-order-code", id);
});

/**
 * Close modal on cancel
 */
document.querySelector("[data-modal-cancel]").addEventListener("click", () => {
    document.getElementsByTagName("html")[0].classList.remove("overflow-hidden");
    document.querySelector("[data-modal-overlay]").classList.add("invisible");
    document.querySelector("[data-modal-screen]").classList.add("invisible");
});

/**
 * Delete order on modal delete click
 */
document.querySelector("[data-modal-delete]").addEventListener("click", async () => {
    document.getElementsByTagName("html")[0].classList.remove("overflow-hidden");

    if(id) {
        await fetch(`/api/orders/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        window.location.replace("/dashboard/overview");
    } else {
        alert("Failed to delete the order.");
    }
});