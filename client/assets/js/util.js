const HTML_ELEMENT = document.getElementsByTagName("html")[0];

export const toggleClasses = (el, classes) => {
  classes.forEach((clazz) => {
    el.classList.toggle(clazz);
  });
};

export const toggleScroll = () => {
  toggleClasses(HTML_ELEMENT, ["overflow-hidden"]);
};

export const delay = (fn, ms) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  };
};
