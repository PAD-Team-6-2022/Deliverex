export class Router {
  map = new Map();
  root;

  constructor(root) {
    this.root = document.getElementById(root);

    if (!this.root) {
      throw new Error(
        `Could not initialize router: root element (#${root}) could not be found`
      );
    }
  }

  /**
   * Map a view to a specific url
   *
   * @param {string} url url of the view
   * @param {string} view name of the view
   */
  set(url, view) {
    this.map.set(location.pathname + url, view);
  }

  /**
   * Switch to a specific view
   * by specifying the set url
   *
   * @param {string} url url of the view
   */
  switch(url) {
    const view = this.map.get(url);
    alert(view);
  }
}
