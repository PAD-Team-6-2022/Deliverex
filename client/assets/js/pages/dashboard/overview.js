import "./navbar.js";
import { openModal } from "../../modal.js";

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
      openModal("delete-order", {
        actions: {
          confirm: async () => {
            await fetch(`/api/orders/${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            });
            window.location.reload();
          },
        },
      });

      // stop event from going further than current object
      event.stopPropagation();
    });

  order.addEventListener("click", () => {
    window.location.href = `/dashboard/orders/${id}`;
  });
});
