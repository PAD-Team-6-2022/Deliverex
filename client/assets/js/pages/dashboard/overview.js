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
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050],
        datasets: [
            {

                label: 'Dataset 1',
                data: [86,114,106,106,107,111,133,221,783,2478],
                borderColor: '#4dc9f6',
                backgroundColor: '#f67019',
            },
            {
                label: 'Dataset 2',
                data: [86,114,106,106,107,111,133,221,783,2478],
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
