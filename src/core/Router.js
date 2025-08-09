import { mountUI } from '../ui/ui.js';

export const Router = {
  mount(el) {
    this.el = el;
  },
  show(content) {
    if (this.el) {
      if (typeof content === 'string') {
        this.el.textContent = content;
      } else {
        this.el.innerHTML = '';
        this.el.appendChild(content);
      }
    }
  }
};

export function goToMainMenu() {
  mountUI(Router.el);
}
