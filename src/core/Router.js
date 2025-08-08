export const Router = {
  mount(el) {
    this.el = el;
  },
  show(content) {
    if (this.el) this.el.textContent = content;
  }
};

export function goToMainMenu() {
  Router.show('Main Menu');
}
