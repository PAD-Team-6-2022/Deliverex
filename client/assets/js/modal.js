import { toggleClasses, toggleScroll } from "./util.js";

const toggleVisibility = (modal) =>
  toggleClasses(modal, ["pointer-events-none", "opacity-0"]);

export const openModal = (id, options = {}) => {
  const modal = document.querySelector(`[data-modal="${id}"]`);

  if (!modal) throw new Error(`Modal with id ${id} couldn't be found`);

  // Setting the modal to active state
  toggleVisibility(modal);
  toggleScroll();

  // Set action handlers
  const actionTriggers = modal.querySelectorAll("[data-modal-action]");
  const actionHandlers = {};

  if (options.actions) {
    const { actions } = options;

    actionTriggers.forEach((actionTrigger) => {
      const actionName = actionTrigger.getAttribute("data-modal-action");
      const action = actions[actionName];

      actionHandlers[actionTrigger] = action;

      if (action) actionTrigger.addEventListener("click", action, true);
    });
  }

  // Closing the modal
  const closeTriggers = modal.querySelectorAll("[data-modal-close]");

  const close = () => {
    toggleVisibility(modal);
    toggleScroll();

    // Remove close trigger events
    closeTriggers.forEach((closeTrigger) =>
      closeTrigger.removeEventListener("click", close, true)
    );

    // Remove all action handlers
    actionTriggers.forEach((actionTrigger) => {
      actionTrigger.removeEventListener(
        "click",
        actionHandlers[actionTrigger],
        true
      );
    });
  };

  // Register close handlers
  closeTriggers.forEach((closer) =>
    closer.addEventListener("click", close, true)
  );
};
