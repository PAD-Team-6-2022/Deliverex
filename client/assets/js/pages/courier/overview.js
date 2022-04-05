
document.querySelectorAll(".order").forEach((order) => {
    console.log(order.getAttribute('data-order-code'));

    const form = document.querySelector("form");
    const orderInput = form.querySelector('input[name="selectedOrder"]');

    if(order.classList.contains('cursor-pointer'))
    order.addEventListener("click", () => {
        console.log('clicked')
        orderInput.value = order.getAttribute('data-order-code');
        form.submit();
    });
})