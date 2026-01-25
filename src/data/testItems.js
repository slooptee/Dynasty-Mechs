import { Item } from '../core/Item.js';
import { ItemManager } from '../core/ItemManager.js';

/**
 * Creates test items for development and testing purposes
 * @param {ItemManager} itemManager - The item manager instance to add items to
 */
export function createTestItems(itemManager) {
  const testItems = [
    new Item({ 
      name: 'Power Sword', 
      description: '+5 Attack', 
      effects: { attack: 5 } 
    }),
    new Item({ 
      name: 'Iron Shield', 
      description: '+5 Defense', 
      effects: { defense: 5 } 
    }),
    new Item({ 
      name: 'Speed Boots', 
      description: '+2 Speed', 
      effects: { speed: 2 } 
    }),
    new Item({ 
      name: 'Vampiric Dagger', 
      description: 'Heal for 20% of damage dealt', 
      effects: { lifesteal: 0.2 } 
    }),
    new Item({ 
      name: 'Thornmail', 
      description: 'Reflect 10% of damage taken', 
      effects: { damageReflect: 0.1 } 
    })
  ];

  testItems.forEach(item => itemManager.addItem(item));
}