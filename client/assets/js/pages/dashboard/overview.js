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

  order
    .querySelector("[data-order-edit]")
    .addEventListener("click", async (event) => {
      window.location.href = `/dashboard/orders/${id}/edit`;
      event.stopPropagation();
    });

  order.addEventListener("click", () => {
    window.location.href = `/dashboard/orders/${id}`;
  });
});
const ctx = document.getElementById('myChart').getContext('2d');
const ordersAmount= document.getElementById("ordersAmount").innerText
const deliveredAmount= document.getElementById("deliveredAmount").innerText
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["Januari"],
        datasets: [
            {

                label: 'Orders Amount',
                data: [ ordersAmount],
                borderColor: '#4dc9f6',
                backgroundColor: '#f67019',
            },
            {
                label: 'Delivered Amount',
                data: [deliveredAmount],
                borderColor: '#4dc9f6',
                backgroundColor: '#f67019',
            }
        ],
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Chart.js Line Chart'
                }
            }
        },
    }


});
