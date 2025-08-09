// Main menu and UI
import { startBattle } from '../features/battleSystem.js';
import { mountCustomizationUI } from '../features/skinManager.js';
import { SkinManager } from '../cosmetics/SkinManager.js';
import { SaveSystem } from '../core/SaveSystem.js';
import { GameState } from '../core/GameState.js';
import { UpgradeManager } from '../core/UpgradeManager.js';
import { Bot } from '../core/Bot.js';
import { Item } from '../core/Item.js';
import { ItemManager } from '../core/ItemManager.js';

const upgradeManager = new UpgradeManager();
const itemManager = new ItemManager();

// Temp function to give player some items
function createTestItems() {
    itemManager.addItem(new Item({ name: 'Power Sword', description: '+5 Attack', effects: { attack: 5 } }));
    itemManager.addItem(new Item({ name: 'Iron Shield', description: '+5 Defense', effects: { defense: 5 } }));
    itemManager.addItem(new Item({ name: 'Speed Boots', description: '+2 Speed', effects: { speed: 2 } }));
}

createTestItems();

export function mountUI(container) {
  container.innerHTML = '';
  const menu = document.createElement('div');
  menu.className = 'main-menu';
  const quickBtn = document.createElement('button');
  quickBtn.textContent = 'Quick Battle';
  quickBtn.onclick = () => {
    container.innerHTML = '';
    const battleDiv = document.createElement('div');
    battleDiv.id = 'battle-container';
    container.appendChild(battleDiv);
    startBattle(battleDiv);
    // Add customization overlay (hidden by default)
    const customOverlay = document.createElement('div');
    customOverlay.id = 'custom-overlay';
    customOverlay.style.display = 'none';
    customOverlay.style.position = 'fixed';
    customOverlay.style.top = '0';
    customOverlay.style.left = '0';
    customOverlay.style.width = '100vw';
    customOverlay.style.height = '100vh';
    customOverlay.style.background = 'rgba(0,0,0,0.7)';
    customOverlay.style.zIndex = '1000';
    container.appendChild(customOverlay);
    // Expose for later
    window._customOverlay = customOverlay;
  };
  menu.appendChild(quickBtn);
  // Upgrade button
    const upgradeBtn = document.createElement('button');
    upgradeBtn.textContent = 'Upgrade Bots';
    upgradeBtn.onclick = () => {
        if (GameState.player && GameState.player.bots) {
            const availableUpgrades = upgradeManager.checkForUpgrades(GameState.player.bots);
            if (availableUpgrades.length > 0) {
                availableUpgrades.forEach(upgrade => {
                    GameState.player.bots = upgradeManager.performUpgrade(GameState.player.bots, upgrade);
                });
                alert('Bots upgraded!');
            } else {
                alert('No upgrades available.');
            }
        } else {
            alert('Start a battle to get some bots first!');
        }
    };
    menu.appendChild(upgradeBtn);
  // Customization button
  const customBtn = document.createElement('button');
  customBtn.textContent = 'Customization';
  customBtn.onclick = () => {
    let overlay = window._customOverlay;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'custom-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.7)';
      overlay.style.zIndex = '1000';
      container.appendChild(overlay);
      window._customOverlay = overlay;
    }
    overlay.style.display = 'block';
    // Use player bots and SkinManager
    import('../core/GameState.js').then(({ GameState }) => {
      import('../cosmetics/SkinManager.js').then(({ SkinManager }) => {
        const skinManager = new SkinManager();
        mountCustomizationUI({
          container: overlay,
          bots: GameState.player.bots,
          skinManager
        });
      });
    });
  };
  menu.appendChild(customBtn);
  // Save/Load menu
  const saveMenu = document.createElement('div');
  saveMenu.className = 'save-menu';
  saveMenu.style.display = 'flex';
  saveMenu.style.gap = '1em';
  saveMenu.style.justifyContent = 'center';
  saveMenu.style.margin = '1em 0';
  for (let slot = 1; slot <= 3; slot++) {
    const saveBtn = document.createElement('button');
    saveBtn.textContent = `Save ${slot}`;
    saveBtn.onclick = () => {
      SaveSystem.save(slot, GameState);
      alert(`Game saved to slot ${slot}`);
    };
    saveMenu.appendChild(saveBtn);
    const loadBtn = document.createElement('button');
    loadBtn.textContent = `Load ${slot}`;
    loadBtn.onclick = () => {
      const data = SaveSystem.load(slot);
      if (data) {
        Object.assign(GameState, data);
        alert(`Game loaded from slot ${slot}`);
        // Re-render if in battle
        if (document.getElementById('battle-container')) {
          document.getElementById('battle-container').innerHTML = '';
          startBattle(document.getElementById('battle-container'));
        }
      } else {
        alert('No save in this slot.');
      }
    };
    saveMenu.appendChild(loadBtn);
  }
  container.appendChild(saveMenu);
  container.appendChild(menu);
}
