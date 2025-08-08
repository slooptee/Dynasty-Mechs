import { mountEffectsOverlay, playHitEffect } from './effects.js';
// Type advantage matrix: assault > sniper, sniper > engineer, engineer > assault
const typeAdvantage = {
  assault: { sniper: 1.2, engineer: 0.8, assault: 1 },
  sniper: { engineer: 1.2, assault: 0.8, sniper: 1 },
  engineer: { assault: 1.2, sniper: 0.8, engineer: 1 }
};

function getTypeMultiplier(attacker, defender) {
  return typeAdvantage[attacker.type]?.[defender.type] || 1;
}
// Minimal battle system: 8x6 grid, 2 player + 2 enemy bots, player turn, enemy AI, SkinManager integration
import { GameState } from '../core/GameState.js';
import { Bot } from '../core/Bot.js';
import { BehaviorTreeAI } from '../ai/AIController.js';
import { emit } from '../core/eventBus.js';
import { SkinManager } from '../cosmetics/SkinManager.js';

const skinManager = new SkinManager();

function createBots() {
  // Player bots: assault, medic, scout
  GameState.player.bots = [
    new Bot({ id: 'p1', team: 'player', name: 'Alpha', type: 'assault', health: 20, maxHealth: 20, attack: 6, defense: 2, speed: 3, x: 1, y: 2 }),
    new Bot({ id: 'p2', team: 'player', name: 'Bravo', type: 'medic', health: 16, maxHealth: 16, attack: 4, defense: 1, speed: 4, x: 1, y: 4 }),
    new Bot({ id: 'p3', team: 'player', name: 'Scout', type: 'scout', health: 14, maxHealth: 14, attack: 5, defense: 1, speed: 6, x: 1, y: 3 })
  ];
  // Enemy bots: defender, sniper, engineer
  GameState.enemy.bots = [
    Object.assign(new Bot({ id: 'e1', team: 'enemy', name: 'Omega', type: 'defender', health: 22, maxHealth: 22, attack: 5, defense: 4, speed: 2, x: 8, y: 2 }), { personality: 'defensive' }),
    Object.assign(new Bot({ id: 'e2', team: 'enemy', name: 'Delta', type: 'sniper', health: 16, maxHealth: 16, attack: 8, defense: 1, speed: 4, x: 8, y: 4 }), { personality: 'aggressive' }),
    Object.assign(new Bot({ id: 'e3', team: 'enemy', name: 'Engi', type: 'engineer', health: 18, maxHealth: 18, attack: 5, defense: 3, speed: 2, x: 8, y: 3 }), { personality: 'opportunist' })
  ];
}

let selectedBot = null;
let validMoves = [];
let validAttacks = [];
let lastAttackCell = null;
function renderGrid(container) {
  // Mount PixiJS overlay if not present
  let overlay = container.querySelector('.pixi-overlay');
  if (!overlay) {
    const gridRect = container.getBoundingClientRect();
    const pixiDiv = document.createElement('div');
    pixiDiv.className = 'pixi-overlay';
    pixiDiv.style.position = 'absolute';
    pixiDiv.style.top = '0';
    pixiDiv.style.left = '0';
    pixiDiv.style.width = '320px';
    pixiDiv.style.height = '240px';
    pixiDiv.style.pointerEvents = 'none';
    container.style.position = 'relative';
    container.appendChild(pixiDiv);
    mountEffectsOverlay(pixiDiv);
  }
  container.innerHTML = '';
  const { rows, cols } = GameState.battle;
  const grid = document.createElement('div');
  grid.className = 'battle-grid';
  for (let y = 1; y <= cols; y++) {
    for (let x = 1; x <= rows; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      // Highlight valid moves/attacks
      if (selectedBot && validMoves.some(m => m.x === x && m.y === y)) {
        cell.style.background = '#2e7d32';
      }
      if (selectedBot && validAttacks.some(a => a.x === x && a.y === y)) {
        cell.style.background = '#c62828';
      }
      // Animate last attack
      if (lastAttackCell && lastAttackCell.x === x && lastAttackCell.y === y) {
        cell.style.animation = 'flash 0.5s';
      }
      cell.onclick = () => {
        if (selectedBot && validMoves.some(m => m.x === x && m.y === y)) {
          selectedBot.x = x;
          selectedBot.y = y;
          selectedBot = null;
          validMoves = [];
          validAttacks = [];
          emit('battle:render');
        }
      };
      grid.appendChild(cell);
    }
  }
  // Place bots
  [...GameState.player.bots, ...GameState.enemy.bots].forEach(bot => {
    if (!bot.alive) return;
  const botEl = document.createElement('div');
  botEl.className = `bot ${bot.team}`;
  botEl.dataset.botId = bot.id;
  // Bot name
  const nameDiv = document.createElement('div');
  nameDiv.textContent = bot.name;
  nameDiv.style.fontWeight = 'bold';
  nameDiv.style.fontSize = '0.8em';
  botEl.appendChild(nameDiv);
  // Health bar
  const hpBar = document.createElement('div');
  hpBar.className = 'hp-bar';
  hpBar.style.height = '6px';
  hpBar.style.width = '32px';
  hpBar.style.background = '#333';
  hpBar.style.borderRadius = '3px';
  hpBar.style.margin = '2px auto';
  const hpFill = document.createElement('div');
  hpFill.style.height = '100%';
  hpFill.style.width = `${Math.max(0, (bot.health / bot.maxHealth) * 100)}%`;
  hpFill.style.background = bot.team === 'player' ? '#4caf50' : '#e53935';
  hpFill.style.borderRadius = '3px';
  hpBar.appendChild(hpFill);
  botEl.appendChild(hpBar);
  // Stats
  const statsDiv = document.createElement('div');
  statsDiv.style.fontSize = '0.7em';
  statsDiv.style.textAlign = 'center';
  statsDiv.textContent = `HP:${bot.health}/${bot.maxHealth} ATK:${bot.attack} DEF:${bot.defense} ${bot.type}`;
  botEl.appendChild(statsDiv);
    // Position in grid
    const selector = `.cell[data-x="${bot.x}"][data-y="${bot.y}"]`;
    const cell = grid.querySelector(selector);
    if (cell) cell.appendChild(botEl);
    // Apply skin
    if (bot.team === 'player') skinManager._apply(bot.id);
    // Player bot selection
    if (bot.team === 'player') {
      botEl.onclick = e => {
        e.stopPropagation();
        selectedBot = bot;
        // Calculate valid moves (adjacent empty cells)
        validMoves = [];
        validAttacks = [];
        const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
        dirs.forEach(([dx,dy]) => {
          const nx = bot.x + dx;
          const ny = bot.y + dy;
          if (nx >= 1 && nx <= rows && ny >= 1 && ny <= cols) {
            // Check if cell is empty
            const occupied = [...GameState.player.bots, ...GameState.enemy.bots].some(b => b.alive && b.x === nx && b.y === ny);
            if (!occupied) validMoves.push({ x: nx, y: ny });
            // Check for adjacent enemy
            const enemy = GameState.enemy.bots.find(b => b.alive && b.x === nx && b.y === ny);
            if (enemy) validAttacks.push({ x: nx, y: ny, bot: enemy });
          }
        });
        emit('battle:render');
      };
    }
    // Attack by clicking enemy
    if (bot.team === 'enemy' && selectedBot && validAttacks.some(a => a.bot === bot)) {
      botEl.onclick = e => {
        e.stopPropagation();
        // Attack with type advantage
        const mult = getTypeMultiplier(selectedBot, bot);
        const dmg = Math.round(selectedBot.attack * mult);
        bot.takeDamage(dmg);
        lastAttackCell = { x: bot.x, y: bot.y };
        // PixiJS hit effect
        playHitEffect(bot.x, bot.y);
        selectedBot = null;
        validMoves = [];
        validAttacks = [];
        emit('battle:render');
        setTimeout(() => { lastAttackCell = null; emit('battle:render'); }, 500);
        checkVictory();
      };
    }
  });
  container.appendChild(grid);
}

function checkVictory() {
  const playerAlive = GameState.player.bots.some(b => b.alive);
  const enemyAlive = GameState.enemy.bots.some(b => b.alive);
  if (!playerAlive) showBattleModal('Defeat!');
  if (!enemyAlive) showBattleModal('Victory!');
}

function showBattleModal(text) {
  let modal = document.getElementById('battle-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'battle-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.style.fontSize = '2em';
    modal.style.color = '#fff';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div style='background:#23272e;padding:2em 3em;border-radius:12px;text-align:center;'>${text}<br><br><button id='modal-close-btn' style='font-size:1em;padding:0.5em 2em;margin-top:1em;'>OK</button></div>`;
  modal.style.display = 'flex';
  document.getElementById('modal-close-btn').onclick = () => {
    modal.style.display = 'none';
    window.location.reload();
  };
}

function playerTurn(container) {
  // Wait for player to move/attack, then End Turn button
  const endBtn = document.createElement('button');
  endBtn.textContent = 'End Turn';
  endBtn.style.display = 'block';
  endBtn.style.margin = '1em auto';
  endBtn.onclick = () => {
    selectedBot = null;
    validMoves = [];
    validAttacks = [];
    GameState.battle.phase = 'enemy';
    emit('battle:render');
    enemyTurn(container);
  };
  container.appendChild(endBtn);
}

  const ai = new BehaviorTreeAI();
  GameState.enemy.bots.forEach(bot => {
    if (!bot.alive) return;
    bot.tickCooldown();
    // AI personality logic
    if (bot.personality === 'defensive') {
      // Use shield/heal if any ally is below 60% HP
      const lowAlly = GameState.enemy.bots.find(a => a.alive && a.health < a.maxHealth * 0.6);
      if (lowAlly) {
        const ability = bot.useAbility(GameState.enemy.bots, GameState.player.bots);
        if (ability) return;
      }
    }
    if (bot.personality === 'aggressive') {
      // Always attack weakest player
      const target = GameState.player.bots.filter(b => b.alive).sort((a, b) => a.health - b.health)[0];
      if (target) {
        target.takeDamage(bot.attack);
        return;
      }
    }
    if (bot.personality === 'opportunist') {
      // Use ability if off cooldown, else attack lowest HP
      if (bot.abilityCooldown === 0) {
        const ability = bot.useAbility(GameState.enemy.bots, GameState.player.bots);
        if (ability) return;
      }
      const target = GameState.player.bots.filter(b => b.alive).sort((a, b) => a.health - b.health)[0];
      if (target) {
        target.takeDamage(bot.attack);
        return;
      }
    }
    // Fallback: default AI
    ai.act({
      self: bot,
      enemies: GameState.player.bots.filter(b => b.alive)
    });
  });
  checkVictory();
  GameState.battle.phase = 'player';
  emit('battle:render');
  function enemyTurn(container) {
    const ai = new BehaviorTreeAI();
    // For engineer turret deploy, pass all bots as grid
    const allBots = [...GameState.player.bots, ...GameState.enemy.bots];
    GameState.enemy.bots.forEach(bot => {
      if (!bot.alive) return;
      bot.tickCooldown();
      // AI personality logic
      if (bot.personality === 'defensive') {
        // Use shield/heal if any ally is below 60% HP
        const lowAlly = GameState.enemy.bots.find(a => a.alive && a.health < a.maxHealth * 0.6);
        if (lowAlly) {
          const ability = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
          if (ability) return;
        }
      }
      if (bot.personality === 'aggressive') {
        // Use area attack if available, else attack weakest
        if (bot.type === 'assault' && bot.abilityCooldown === 0) {
          const ability = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
          if (ability) return;
        }
        // Use snipe if sniper
        if (bot.type === 'sniper' && bot.abilityCooldown === 0) {
          const ability = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
          if (ability) return;
        }
        const target = GameState.player.bots.filter(b => b.alive).sort((a, b) => a.health - b.health)[0];
        if (target) {
          target.takeDamage(bot.attack);
          return;
        }
      }
      if (bot.personality === 'opportunist') {
        // Use ability if off cooldown, else attack lowest HP
        if (bot.abilityCooldown === 0) {
          const ability = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
          if (ability) return;
        }
        const target = GameState.player.bots.filter(b => b.alive).sort((a, b) => a.health - b.health)[0];
        if (target) {
          target.takeDamage(bot.attack);
          return;
        }
      }
      // Fallback: default AI
      ai.act({
        self: bot,
        enemies: GameState.player.bots.filter(b => b.alive)
      });
    });
    checkVictory();
    GameState.battle.phase = 'player';
    emit('battle:render');
    playerTurn(container);
  }
