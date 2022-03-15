import "./navbar.js";
import { openModal } from "../../modal.js";
import "../../ordering.js";
import "../../pagination.js";

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
