import { openModal } from "../../../modal.js";

document.querySelectorAll("[data-order-code]").forEach((order) => {
  const id = order.getAttribute("data-order-code");

  //QR Code is added to the 'qrcode' div element
  new QRCode(document.querySelector("#qrcode"), order.getAttribute("data-order-code"));

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
    });
});

