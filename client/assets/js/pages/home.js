import "../toaster.js";

// send to track page if order code is filled in
document.querySelector("#submit").addEventListener("click", () => {
    const id = document.querySelector("#orderCode").value.trim();
    if(id !== "") {
        window.location.href = `/track/${id}`;
    }
});