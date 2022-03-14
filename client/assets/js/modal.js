import { toggleClasses, toggleScroll } from "./util.js";

const toggleVisibility = (modal) =>
  toggleClasses(modal, ["pointer-events-none", "opacity-0"]);

export const openModal = (id, options = {}) => {
  const modal = document.querySelector(`[data-modal="${id}"]`);

  if (!modal) throw new Error(`Modal with id ${id} couldn't be found`);

  // Setting the modal to active state
  toggleVisibility(modal);
  toggleScroll();

  // Closing the modal
  const closers = [];

  modal.querySelectorAll("[data-modal-close]").forEach((closer) => {
    closers.push(closer);

    const close = () => {
      toggleVisibility(modal);
      toggleScroll();

      closers.forEach((closer) => closer.removeEventListener("click", close));
    };

    closer.addEventListener("click", close);
  });

  // Check if clicking outside of the modal
  window.addEventListener("click", (e) => {});

  // Defining actions
  if (options.actions) {
    const { actions } = options;

    modal.querySelectorAll("[data-modal-action]").forEach((actionTrigger) => {
      const actionName = actionTrigger.getAttribute("data-modal-action");
      const action = actions[actionName];

      if (action)
        actionTrigger.addEventListener("click", async () => await action());
    });
  }
};
