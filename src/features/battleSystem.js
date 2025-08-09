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
import { SynergyManager } from '../core/SynergyManager.js';
import { ItemManager } from '../core/ItemManager.js';
import { BattlefieldManager } from '../core/BattlefieldManager.js';

const skinManager = new SkinManager();
const synergyManager = new SynergyManager();
const itemManager = new ItemManager();
const battlefieldManager = new BattlefieldManager();

battlefieldManager.generateBattlefield();

function createBots() {
  // Player bots
  GameState.player.bots = [
    new Bot({ id: 'p1', team: 'player', name: 'Guan Yu', type: 'assault', faction: 'Shu', class: 'Assault', health: 22, maxHealth: 22, attack: 7, defense: 3, speed: 3, x: 1, y: 2 }),
    new Bot({ id: 'p2', team: 'player', name: 'Guan Yu', type: 'assault', faction: 'Shu', class: 'Assault', health: 22, maxHealth: 22, attack: 7, defense: 3, speed: 3, x: 1, y: 4 }),
    new Bot({ id: 'p3', team: 'player', name: 'Guan Yu', type: 'assault', faction: 'Shu', class: 'Assault', health: 22, maxHealth: 22, attack: 7, defense: 3, speed: 3, x: 1, y: 3 })
  ];
  // Enemy bots
  GameState.enemy.bots = [
    Object.assign(new Bot({ id: 'e1', team: 'enemy', name: 'Cao Cao', type: 'defender', faction: 'Wei', class: 'Defender', health: 24, maxHealth: 24, attack: 6, defense: 4, speed: 2, x: 8, y: 2 }), { personality: 'defensive' }),
    Object.assign(new Bot({ id: 'e2', team: 'enemy', name: 'Sun Quan', type: 'sniper', faction: 'Wu', class: 'Sniper', health: 18, maxHealth: 18, attack: 8, defense: 1, speed: 4, x: 8, y: 4 }), { personality: 'aggressive' }),
    Object.assign(new Bot({ id: 'e3', team: 'enemy', name: 'Zhuge Liang', type: 'engineer', faction: 'Shu', class: 'Engineer', health: 20, maxHealth: 20, attack: 5, defense: 3, speed: 2, x: 8, y: 3 }), { personality: 'opportunist' })
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

      const tile = GameState.battle.grid[y - 1][x - 1];
      if (tile.type === 'fortress') {
        cell.style.backgroundColor = '#a1887f';
      } else if (tile.type === 'swamp') {
        cell.style.backgroundColor = '#4caf50';
      }

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

  botEl.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  botEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const itemName = e.dataTransfer.getData('text/plain');
    const item = GameState.inventory.find(i => i.name === itemName);
    if (item) {
      itemManager.equipItem(item, bot);
      emit('battle:render');
    }
  });

  // Bot name
  const nameDiv = document.createElement('div');
  nameDiv.textContent = bot.name + ' ' + '★'.repeat(bot.level);
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
  statsDiv.textContent = `HP:${bot.health}/${bot.maxHealth} ATK:${bot.finalAttack} DEF:${bot.finalDefense} SPD:${bot.finalSpeed}`;
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
        let dmg = Math.round(selectedBot.finalAttack * mult);
        if (selectedBot.crit) {
          dmg *= 2;
          selectedBot.crit = false; // Crit is consumed
        }
        bot.takeDamage(dmg);
        if (selectedBot.attackAgainChance && Math.random() < selectedBot.attackAgainChance) {
          bot.takeDamage(dmg); // Attack again
        }
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

  // Synergy UI
  const synergyContainer = document.createElement('div');
  synergyContainer.className = 'synergy-container';
  const playerSynergies = synergyManager.calculateSynergies(GameState.player.bots.filter(b => b.alive));
  synergyManager.applySynergies(GameState.player.bots, playerSynergies, GameState.battle.grid);
  const enemySynergies = synergyManager.calculateSynergies(GameState.enemy.bots.filter(b => b.alive));
  synergyManager.applySynergies(GameState.enemy.bots, enemySynergies, GameState.battle.grid);

  const createSynergyList = (title, synergies) => {
    const list = document.createElement('div');
    const titleEl = document.createElement('h4');
    titleEl.textContent = title;
    list.appendChild(titleEl);
    for (const faction in synergies.factions) {
      const syn = synergies.factions[faction];
      const el = document.createElement('div');
      el.textContent = `${faction} (${syn.count}): ${syn.description}`;
      list.appendChild(el);
    }
    for (const botClass in synergies.classes) {
      const syn = synergies.classes[botClass];
      const el = document.createElement('div');
      el.textContent = `${botClass} (${syn.count}): ${syn.description}`;
      list.appendChild(el);
    }
    return list;
  };

  synergyContainer.appendChild(createSynergyList('Player Synergies', playerSynergies));
  synergyContainer.appendChild(createSynergyList('Enemy Synergies', enemySynergies));
  container.appendChild(synergyContainer);

  // Inventory UI
    const inventoryContainer = document.createElement('div');
    inventoryContainer.className = 'inventory-container';
    const inventoryTitle = document.createElement('h4');
    inventoryTitle.textContent = 'Inventory';
    inventoryContainer.appendChild(inventoryTitle);
    GameState.inventory.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.textContent = `${item.name} (${item.description})`;
        itemEl.draggable = true;
        itemEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.name);
        });
        inventoryContainer.appendChild(itemEl);
    });
    container.appendChild(inventoryContainer);
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

function enemyTurn(container) {
  // For engineer turret deploy, pass all bots as grid
  const allBots = [...GameState.player.bots, ...GameState.enemy.bots];
  for (const bot of GameState.enemy.bots) {
    if (!bot.alive) continue;
    bot.tickCooldown();
    let acted = false;
    // AI personality logic
    if (bot.personality === 'defensive') {
      // Use shield/heal if any ally is below 60% HP
      const lowAlly = GameState.enemy.bots.find(a => a.alive && a.health < a.maxHealth * 0.6);
      if (lowAlly) {
        acted = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
        if (acted) continue;
      }
    } else if (bot.personality === 'aggressive') {
      // Use area attack if available, else attack weakest
      if (bot.type === 'assault' && bot.abilityCooldown === 0) {
        acted = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
        if (acted) continue;
      }
      // Use snipe if sniper
      if (bot.type === 'sniper' && bot.abilityCooldown === 0) {
        acted = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
        if (acted) continue;
      }
      const target = GameState.player.bots.filter(b => b.alive).sort((a, b) => a.health - b.health)[0];
      if (target) {
        let dmg = bot.finalAttack;
        if (bot.crit) {
          dmg *= 2;
          bot.crit = false;
        }
        target.takeDamage(dmg);
        if (bot.attackAgainChance && Math.random() < bot.attackAgainChance) {
          target.takeDamage(dmg); // Attack again
        }
        acted = true;
        continue;
      }
    } else if (bot.personality === 'opportunist') {
      // Use ability if off cooldown, else attack lowest HP
      if (bot.abilityCooldown === 0) {
        acted = bot.useAbility(GameState.enemy.bots, GameState.player.bots, allBots);
        if (acted) continue;
      }
      const target = GameState.player.bots.filter(b => b.alive).sort((a, b) => a.health - b.health)[0];
      if (target) {
        let dmg = bot.finalAttack;
        if (bot.crit) {
          dmg *= 2;
          bot.crit = false;
        }
        target.takeDamage(dmg);
        acted = true;
        continue;
      }
    }

    // Fallback: default AI
    if (!acted) {
      ai.act({
        self: bot,
        enemies: GameState.player.bots.filter(b => b.alive)
      });
    }
  }
  checkVictory();
  GameState.battle.phase = 'player';
  emit('battle:render');
  playerTurn(container);
}
