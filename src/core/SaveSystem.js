export class SaveSystem {
  static save(slot, data) {
    if (slot < 1 || slot > 3) throw new Error('Invalid slot');
    localStorage.setItem(`dynmech_save_${slot}`, JSON.stringify(data));
  }
  static load(slot) {
    if (slot < 1 || slot > 3) throw new Error('Invalid slot');
    const raw = localStorage.getItem(`dynmech_save_${slot}`);
    return raw ? JSON.parse(raw) : null;
  }
  static clear(slot) {
    if (slot < 1 || slot > 3) throw new Error('Invalid slot');
    localStorage.removeItem(`dynmech_save_${slot}`);
  }
  static list() {
    return [1,2,3].map(slot => this.load(slot));
  }
}
