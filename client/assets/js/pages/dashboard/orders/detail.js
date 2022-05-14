import { openModal } from "../../../modal.js";

document.querySelectorAll("[data-order-code]").forEach((order) => {
  const id = order.getAttribute("data-order-code");

  const qrCodeObject = document.querySelector("#qrcode");

  //QR Code is added to the 'qrcode' div element
  new QRCode(qrCodeObject, qrCodeObject.getAttribute("qrHash"));

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

