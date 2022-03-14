document.querySelectorAll("form").forEach((form) => {
  form.querySelectorAll("[data-order-toggle]").forEach((orderToggle) => {
    const col = orderToggle.getAttribute("data-order-toggle");

    orderToggle.addEventListener("click", () => {
      const sort = form.querySelector('input[name="sort"]');
      const order = form.querySelector('input[name="order"]');

      sort.value = col;
      order.value = order.value === "asc" ? "desc" : "asc";

      form.submit();
    });
  });
});
