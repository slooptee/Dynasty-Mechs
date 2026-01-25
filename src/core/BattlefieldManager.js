import { GameState } from './GameState.js';

export class BattlefieldManager {
  generateBattlefield() {
    const { rows, cols } = GameState.battle;
    const grid = [];
    const tileTypes = ['normal', 'fortress', 'swamp'];

    for (let y = 0; y < cols; y++) {
      const row = [];
      for (let x = 0; x < rows; x++) {
        const randomTile = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        row.push({ type: randomTile });
      }
      grid.push(row);
    }
    GameState.battle.grid = grid;
  }
}
