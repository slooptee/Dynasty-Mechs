import { GameState } from './GameState.js';

export class ItemManager {
  constructor() {
    GameState.inventory = [];
  }

  addItem(item) {
    GameState.inventory.push(item);
  }

  equipItem(item, bot) {
    if (bot.items.length < 3) { // Max 3 items per bot
      bot.items.push(item);
      const itemIndex = GameState.inventory.findIndex(i => i === item);
      if (itemIndex > -1) {
        GameState.inventory.splice(itemIndex, 1);
      }
      return true;
    }
    return false;
  }
}
