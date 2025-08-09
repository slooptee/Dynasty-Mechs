// Main menu and UI
import { startBattle } from '../features/battleSystem.js';
import { mountCustomizationUI } from '../features/skinManager.js';
import { SkinManager } from '../cosmetics/SkinManager.js';
import { SaveSystem } from '../core/SaveSystem.js';
import { GameState } from '../core/GameState.js';
import { UpgradeManager } from '../core/UpgradeManager.js';
import { Bot } from '../core/Bot.js';
import { MechCustomizationSystem } from '../features/mechCustomization.js';

const upgradeManager = new UpgradeManager();
const mechCustomization = new MechCustomizationSystem();

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
    
  // Mech Customization button (NEW!)
  const mechCustomBtn = document.createElement('button');
  mechCustomBtn.textContent = 'Mech Customization';
  mechCustomBtn.style.background = '#805ad5';
  mechCustomBtn.style.border = '2px solid #9f7aea';
  mechCustomBtn.onclick = () => {
    // Create sample bots if none exist
    if (!GameState.player || !GameState.player.bots || GameState.player.bots.length === 0) {
      if (!GameState.player) GameState.player = {};
      GameState.player.bots = [
        new Bot({ id: 'demo1', team: 'player', name: 'Guan Yu', type: 'assault', faction: 'Shu', class: 'Assault', health: 22, maxHealth: 22, attack: 7, defense: 3, speed: 3, x: 1, y: 2 }),
        new Bot({ id: 'demo2', team: 'player', name: 'Zhang Fei', type: 'defender', faction: 'Shu', class: 'Defender', health: 26, maxHealth: 26, attack: 6, defense: 5, speed: 2, x: 1, y: 3 }),
        new Bot({ id: 'demo3', team: 'player', name: 'Zhao Yun', type: 'sniper', faction: 'Shu', class: 'Sniper', health: 18, maxHealth: 18, attack: 9, defense: 2, speed: 4, x: 1, y: 4 })
      ];
    }
    showMechCustomizationModal(container);
  };
  menu.appendChild(mechCustomBtn);
  
  // Original Customization button
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

function showMechCustomizationModal(parentContainer) {
  // Create modal
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.9)';
  modal.style.zIndex = '2000';
  modal.style.overflow = 'auto';
  modal.style.padding = '20px';
  
  // Modal content
  const content = document.createElement('div');
  content.style.maxWidth = '1200px';
  content.style.margin = '0 auto';
  content.style.background = '#1a202c';
  content.style.borderRadius = '10px';
  content.style.position = 'relative';
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '15px';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#white';
  closeBtn.style.fontSize = '30px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = () => parentContainer.removeChild(modal);
  content.appendChild(closeBtn);
  
  // Bot selection
  const botSelector = document.createElement('div');
  botSelector.style.padding = '20px';
  botSelector.style.borderBottom = '1px solid #4a5568';
  
  const selectorTitle = document.createElement('h3');
  selectorTitle.textContent = 'Select Mech to Customize';
  selectorTitle.style.color = 'white';
  selectorTitle.style.marginBottom = '15px';
  botSelector.appendChild(selectorTitle);
  
  const botButtons = document.createElement('div');
  botButtons.style.display = 'flex';
  botButtons.style.gap = '10px';
  botButtons.style.flexWrap = 'wrap';
  
  GameState.player.bots.forEach((bot, index) => {
    const botBtn = document.createElement('button');
    botBtn.textContent = `${bot.name} (${bot.type})`;
    botBtn.style.padding = '10px 15px';
    botBtn.style.background = '#4299e1';
    botBtn.style.color = 'white';
    botBtn.style.border = 'none';
    botBtn.style.borderRadius = '5px';
    botBtn.style.cursor = 'pointer';
    
    botBtn.onclick = () => {
      // Clear previous customization UI
      const customizationArea = content.querySelector('.customization-area');
      if (customizationArea) {
        customizationArea.innerHTML = '';
        mechCustomization.renderCustomizationUI(customizationArea, bot, (customizedBot, config) => {
          alert(`${customizedBot.name} customization saved!`);
          console.log('Customization saved:', config);
        });
      }
      
      // Highlight selected button
      botButtons.querySelectorAll('button').forEach(btn => {
        btn.style.background = '#4299e1';
      });
      botBtn.style.background = '#38a169';
    };
    
    botButtons.appendChild(botBtn);
  });
  
  botSelector.appendChild(botButtons);
  content.appendChild(botSelector);
  
  // Customization area
  const customizationArea = document.createElement('div');
  customizationArea.className = 'customization-area';
  customizationArea.style.minHeight = '400px';
  content.appendChild(customizationArea);
  
  modal.appendChild(content);
  parentContainer.appendChild(modal);
  
  // Auto-select first bot
  if (GameState.player.bots.length > 0) {
    botButtons.firstChild.click();
  }
}
