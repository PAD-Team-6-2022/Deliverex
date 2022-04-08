/**
 * For every loaded order in the table on the dashboard, put an eventlistener
 * on it that will submit a POST request of the form that will update the state
 * of the order from 'TRANSIT' to 'DELIVERED'.
 */
document.querySelectorAll(".order").forEach((order) => {

    const form = document.querySelector("form");
    form.setAttribute("action", `/api/orders/${order.getAttribute('data-order-code')}/scan`);
    const orderInput = form.querySelector('input[name="selectedOrder"]');

    if(order.classList.contains('cursor-pointer'))
    order.addEventListener("click", () => {
        console.log('clicked')
        orderInput.value = order.getAttribute('data-order-code');
        form.submit();
    });
});