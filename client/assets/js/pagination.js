document.querySelectorAll("form[data-pagination-enabled]").forEach((form) => {
  const page = form.querySelector('input[name="page"]');

  form
    .querySelectorAll("[data-pagination-prev-trigger]")
    .forEach((prevTrigger) =>
      prevTrigger.addEventListener("click", () => {
        let num = Number(page.value) - 1;
        num = num < 1 ? 1 : num;
        page.value = num;

        form.submit();
      })
    );
  form
    .querySelectorAll("[data-pagination-next-trigger]")
    .forEach((nextTrigger) =>
      nextTrigger.addEventListener("click", () => {
        page.value = Number(page.value) + 1;

        form.submit();
      })
    );
});
