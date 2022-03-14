import("./partials/navbar.js");

let nextLink = document.getElementById("nextLink");
let prevLink = document.getElementById("prevLink");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let page = urlParams.get("page");

if (page == null) {
  page = 1;
}

nextLink.href = "?page=" + (parseInt(page) + 1);

if (page > 1) {
  prevLink.href = "?page=" + (parseInt(page) - 1);
}

document.querySelectorAll(".clickableArrow").forEach((arrowButton) => {
  arrowButton.addEventListener("click", () => {
    urlParams.set("sort", arrowButton.id);
    urlParams.set(
      "order",
      document.getElementById(arrowButton.id).classList.contains("rotate-180")
        ? "desc"
        : "asc"
    );

    window.location.search = urlParams.toString();
  });
});

document.querySelectorAll("[data-order-code]").forEach((order) => {
  const id = order.getAttribute("data-order-code");

  order
    .querySelector("[data-order-delete]")
    .addEventListener("click", async (event) => {
      console.log(id);
      document.getElementsByTagName("html")[0].classList.add("overflow-hidden");
      document.querySelectorAll("[data-modal-overlay]").forEach((overlay) => {
        overlay.classList.remove("invisible");
      });
      document.querySelectorAll("[data-modal-screen]").forEach((screen) => {
        screen.classList.remove("invisible");
        screen
          .querySelector("[data-modal-delete]")
          .setAttribute("data-order-code", id);
      });
      // stop event from going further than current object
      event.stopPropagation();
    });

  order.addEventListener("click", async (event) => {
    window.location.href = `/dashboard/orders/${id}`;
  });
});

document.querySelectorAll("[data-modal-screen]").forEach((screen) => {
  screen
    .querySelector("[data-modal-cancel]")
    .addEventListener("click", async () => {
      document
        .getElementsByTagName("html")[0]
        .classList.remove("overflow-hidden");
      document.querySelectorAll("[data-modal-overlay]").forEach((overlay) => {
        overlay.classList.add("invisible");
      });
      document.querySelectorAll("[data-modal-screen]").forEach((screen) => {
        screen.classList.add("invisible");
      });
    });

  const deleteButton = screen.querySelector("[data-modal-delete]");

  deleteButton.addEventListener("click", async () => {
    const id = deleteButton.getAttribute("data-order-code");

    document
      .getElementsByTagName("html")[0]
      .classList.remove("overflow-hidden");

    document.querySelectorAll("[data-modal-overlay]").forEach((overlay) => {
      overlay.classList.add("invisible");
    });
    document.querySelectorAll("[data-modal-screen]").forEach((screen) => {
      screen.classList.add("invisible");
    });

    if (id) {
      console.log(id);
      await fetch(`/api/orders/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.reload();
    } else {
      alert("Failed to delete the order.");
    }
  });
});
