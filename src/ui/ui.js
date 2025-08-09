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
import { SoundSystem } from '../core/SoundSystem.js';
import { createTestItems } from '../data/testItems.js';

const upgradeManager = new UpgradeManager();
const itemManager = new ItemManager();
const soundSystem = new SoundSystem();

// Initialize test items
createTestItems(itemManager);

// Cache for overlay element
let customOverlay = null;

/**
 * Creates and returns the customization overlay element
 * @param {HTMLElement} container - Parent container
 * @returns {HTMLElement} The overlay element
 */
function createCustomizationOverlay(container) {
  if (customOverlay) {
    return customOverlay;
  }
  
  customOverlay = document.createElement('div');
  customOverlay.className = 'custom-overlay';
  customOverlay.id = 'custom-overlay';
  container.appendChild(customOverlay);
  
  return customOverlay;
}

/**
 * Shows a user message using a better UI than alert
 * @param {string} message - Message to display
 * @param {string} type - Type of message ('success', 'error', 'info')
 */
function showMessage(message, type = 'info') {
  // For now, still using alert but this can be replaced with a toast or modal system
  alert(message);
}

/**
 * Handles the quick battle button click
 * @param {HTMLElement} container - Main container element
 */
function handleQuickBattle(container) {
  container.innerHTML = '';
  const battleDiv = document.createElement('div');
  battleDiv.id = 'battle-container';
  container.appendChild(battleDiv);
  startBattle(battleDiv);
  
  // Add customization overlay for later use
  createCustomizationOverlay(container);
}

/**
 * Handles the upgrade bots button click
 */
function handleUpgradeBots() {
  if (GameState.player && GameState.player.bots) {
    const availableUpgrades = upgradeManager.checkForUpgrades(GameState.player.bots);
    if (availableUpgrades.length > 0) {
      availableUpgrades.forEach(upgrade => {
        GameState.player.bots = upgradeManager.performUpgrade(GameState.player.bots, upgrade);
      });
      soundSystem.playSound('upgrade');
      showMessage('Bots upgraded!', 'success');
    } else {
      showMessage('No upgrades available.', 'info');
    }
  } else {
    showMessage('Start a battle to get some bots first!', 'info');
  }
}

/**
 * Handles the customization button click
 * @param {HTMLElement} container - Main container element
 */
function handleCustomization(container) {
  const overlay = createCustomizationOverlay(container);
  overlay.classList.add('visible');
  
  // Use already imported modules directly
  const skinManager = new SkinManager();
  mountCustomizationUI({
    container: overlay,
    bots: GameState.player.bots,
    skinManager
  });
}

/**
 * Creates the save/load menu
 * @returns {HTMLElement} The save menu element
 */
function createSaveMenu() {
  const saveMenu = document.createElement('div');
  saveMenu.className = 'save-menu';
  
  for (let slot = 1; slot <= 3; slot++) {
    const saveBtn = document.createElement('button');
    saveBtn.textContent = `Save ${slot}`;
    saveBtn.onclick = () => {
      SaveSystem.save(slot, GameState);
      showMessage(`Game saved to slot ${slot}`, 'success');
    };
    saveMenu.appendChild(saveBtn);
    
    const loadBtn = document.createElement('button');
    loadBtn.textContent = `Load ${slot}`;
    loadBtn.onclick = () => {
      const data = SaveSystem.load(slot);
      if (data) {
        Object.assign(GameState, data);
        showMessage(`Game loaded from slot ${slot}`, 'success');
        // Re-render if in battle
        const battleContainer = document.getElementById('battle-container');
        if (battleContainer) {
          battleContainer.innerHTML = '';
          startBattle(battleContainer);
        }
      } else {
        showMessage('No save in this slot.', 'info');
      }
    };
    saveMenu.appendChild(loadBtn);
  }
  
  return saveMenu;
}

/**
 * Creates the pilot selection UI
 * @returns {HTMLElement} The pilot container element
 */
function createPilotSelection() {
  const pilotContainer = document.createElement('div');
  pilotContainer.className = 'pilot-container';
  
  const pilotTitle = document.createElement('h4');
  pilotTitle.textContent = 'Available Pilots';
  pilotContainer.appendChild(pilotTitle);
  
  GameState.pilots.forEach(pilot => {
    const pilotEl = document.createElement('div');
    pilotEl.className = 'pilot';
    pilotEl.textContent = `${pilot.name} (${pilot.description})`;
    pilotEl.draggable = true;
    pilotEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', pilot.name);
    });
    pilotContainer.appendChild(pilotEl);
  });
  
  return pilotContainer;
}

/**
 * Creates the main menu buttons
 * @param {HTMLElement} container - Main container element
 * @returns {HTMLElement} The menu element
 */
function createMainMenu(container) {
  const menu = document.createElement('div');
  menu.className = 'main-menu';
  
  // Quick Battle button
  const quickBtn = document.createElement('button');
  quickBtn.textContent = 'Quick Battle';
  quickBtn.onclick = () => handleQuickBattle(container);
  menu.appendChild(quickBtn);
  
  // Upgrade button
  const upgradeBtn = document.createElement('button');
  upgradeBtn.textContent = 'Upgrade Bots';
  upgradeBtn.onclick = handleUpgradeBots;
  menu.appendChild(upgradeBtn);
  
  // Customization button
  const customBtn = document.createElement('button');
  customBtn.textContent = 'Customization';
  customBtn.onclick = () => handleCustomization(container);
  menu.appendChild(customBtn);
  
  return menu;
}

export function mountUI(container) {
  container.innerHTML = '';
  
  // Create and append all UI components
  const saveMenu = createSaveMenu();
  const mainMenu = createMainMenu(container);
  const pilotSelection = createPilotSelection();
  
  container.appendChild(saveMenu);
  container.appendChild(mainMenu);
  container.appendChild(pilotSelection);
}
