document.querySelectorAll("[data-toaster-code]").forEach((toaster) => {
    const id = toaster.getAttribute("data-toaster-code");

    toaster
    .querySelector("[data-toaster-close]")
    .addEventListener("click", async (event) => {
      toaster.remove();
    });
});