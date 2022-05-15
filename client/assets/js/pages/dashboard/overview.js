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
const deliveredApril= document.getElementById("aprilDelivered").innerText
const deliveredMay= document.getElementById("meiDelivered").innerText
const deliveredJune= document.getElementById("juniDelivered").innerText
const SortingApril= document.getElementById("aprilSorting").innerText
const SortingMay= document.getElementById("meiSorting").innerText
const SortingJune= document.getElementById("juniSorting").innerText
const ReadyApril= document.getElementById("aprilReady").innerText
const ReadyMay= document.getElementById("meiReady").innerText
const ReadyJune= document.getElementById("juniReady").innerText
const TransitApril= document.getElementById("aprilTransit").innerText
const TransitMay= document.getElementById("meiTransit").innerText
const TransitJune= document.getElementById("juniTransit").innerText
const FailedApril= document.getElementById("aprilFailed").innerText
const FailedMay= document.getElementById("meiFailed").innerText
const FailedJune= document.getElementById("juniFailed").innerText
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        datasets: [
            {

                label: 'Number of Deliveries per month',
                data: [0, 0, 0, deliveredApril, deliveredMay, deliveredJune],
                borderColor: '#4dc9f6',
                backgroundColor: '#f67019',
            },
            {
                label: 'Number of Sorting per month',
                data: [0, 0, 0, SortingApril,SortingMay,SortingJune],
                borderColor: '#4dc9f6',
                backgroundColor: '#f67019',
            },
            {
                label: 'Number of Ready per month',
                data: [0, 0, 0, ReadyApril,ReadyMay,ReadyJune],
                borderColor: '#4dc9f6',
                backgroundColor: '#f67019',
            },
            {
                label: 'Number of Transit per month',
                data: [0, 0, 0, TransitApril,TransitMay,TransitJune],
                borderColor: '#4dc9f6',
                backgroundColor: '#f67019',
            },
            {
                label: 'Number of Failed per month',
                data: [0, 0, 0, FailedApril,FailedMay,FailedJune],
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
