// Advanced Mech Customization System - Revolutionary modular parts
export class MechCustomizationSystem {
  constructor() {
    this.parts = {
      chassis: {
        light: { 
          name: 'Light Chassis', 
          health: -5, speed: +2, defense: -1,
          cost: 100, 
          description: 'Fast and agile but fragile'
        },
        heavy: { 
          name: 'Heavy Chassis', 
          health: +8, speed: -1, defense: +2,
          cost: 200, 
          description: 'Tanky but slow'
        },
        stealth: { 
          name: 'Stealth Chassis', 
          health: 0, speed: +1, defense: 0,
          cost: 250, 
          description: '+20% dodge chance',
          special: 'dodge'
        }
      },
      weapon: {
        plasma: { 
          name: 'Plasma Cannon', 
          attack: +3, accuracy: -10,
          cost: 150, 
          description: 'High damage but less accurate',
          damageType: 'fire'
        },
        railgun: { 
          name: 'Railgun', 
          attack: +5, speed: -1,
          cost: 300, 
          description: 'Pierces armor but heavy',
          special: 'armorPiercing'
        },
        burst: { 
          name: 'Burst Rifle', 
          attack: +1, speed: +1,
          cost: 120, 
          description: '30% chance for double attack',
          special: 'doubleAttack'
        }
      },
      armor: {
        reactive: { 
          name: 'Reactive Armor', 
          defense: +2, health: +3,
          cost: 180, 
          description: 'Reduces explosive damage by 50%'
        },
        shield: { 
          name: 'Energy Shield', 
          defense: +1, health: -2,
          cost: 220, 
          description: 'Regenerates 2 HP per turn'
        },
        ablative: { 
          name: 'Ablative Coating', 
          defense: +3, speed: -1,
          cost: 160, 
          description: 'Absorbs first 5 damage each battle'
        }
      },
      accessory: {
        targeting: { 
          name: 'Targeting Computer', 
          accuracy: +15, attack: +1,
          cost: 140, 
          description: 'Improved accuracy and crit chance'
        },
        booster: { 
          name: 'Jump Booster', 
          speed: +2, health: -3,
          cost: 130, 
          description: 'Can move over other units'
        },
        repair: { 
          name: 'Auto-Repair', 
          health: +5, cost: 190,
          description: 'Heals 3 HP at start of each turn'
        }
      }
    };
    
    this.presets = {
      berserker: {
        name: 'Berserker',
        chassis: 'light',
        weapon: 'burst',
        armor: 'reactive',
        accessory: 'booster'
      },
      tank: {
        name: 'Tank',
        chassis: 'heavy', 
        weapon: 'railgun',
        armor: 'ablative',
        accessory: 'repair'
      },
      assassin: {
        name: 'Assassin',
        chassis: 'stealth',
        weapon: 'plasma',
        armor: 'shield', 
        accessory: 'targeting'
      }
    };
  }

  customizeBot(bot, configuration) {
    // Reset to base stats first
    this.resetBotToBase(bot);
    
    // Apply chassis modifications
    if (configuration.chassis && this.parts.chassis[configuration.chassis]) {
      this.applyPartModifications(bot, this.parts.chassis[configuration.chassis]);
    }
    
    // Apply weapon modifications
    if (configuration.weapon && this.parts.weapon[configuration.weapon]) {
      this.applyPartModifications(bot, this.parts.weapon[configuration.weapon]);
      bot.weaponType = configuration.weapon;
    }
    
    // Apply armor modifications
    if (configuration.armor && this.parts.armor[configuration.armor]) {
      this.applyPartModifications(bot, this.parts.armor[configuration.armor]);
      bot.armorType = configuration.armor;
    }
    
    // Apply accessory modifications
    if (configuration.accessory && this.parts.accessory[configuration.accessory]) {
      this.applyPartModifications(bot, this.parts.accessory[configuration.accessory]);
      bot.accessoryType = configuration.accessory;
    }
    
    // Store configuration
    bot.customization = configuration;
    
    // Update max health if health was modified
    if (bot.health > bot.maxHealth) {
      bot.maxHealth = bot.health;
    }
    
    return bot;
  }

  applyPartModifications(bot, part) {
    if (part.health) bot.health = Math.max(1, bot.health + part.health);
    if (part.attack) bot.attack = Math.max(1, bot.attack + part.attack);
    if (part.defense) bot.defense = Math.max(0, bot.defense + part.defense);
    if (part.speed) bot.speed = Math.max(1, bot.speed + part.speed);
    if (part.accuracy) bot.accuracy = (bot.accuracy || 90) + part.accuracy;
    
    // Apply special abilities
    if (part.special) {
      switch (part.special) {
        case 'dodge':
          bot.dodge = (bot.dodge || 0) + 0.2;
          break;
        case 'armorPiercing':
          bot.armorPiercing = true;
          break;
        case 'doubleAttack':
          bot.attackAgainChance = (bot.attackAgainChance || 0) + 0.3;
          break;
      }
    }
    
    if (part.damageType) {
      bot.damageType = part.damageType;
    }
  }

  resetBotToBase(bot) {
    // Store original stats if not stored
    if (!bot.baseStats) {
      bot.baseStats = {
        health: bot.health,
        maxHealth: bot.maxHealth,
        attack: bot.attack,
        defense: bot.defense,
        speed: bot.speed
      };
    }
    
    // Reset to base stats
    bot.health = bot.baseStats.health;
    bot.maxHealth = bot.baseStats.maxHealth;
    bot.attack = bot.baseStats.attack;
    bot.defense = bot.baseStats.defense;
    bot.speed = bot.baseStats.speed;
    
    // Clear special properties
    delete bot.accuracy;
    delete bot.armorPiercing;
    delete bot.damageType;
    delete bot.weaponType;
    delete bot.armorType;
    delete bot.accessoryType;
    
    // Reset bonuses
    bot.dodge = 0;
    bot.attackAgainChance = 0;
  }

  getConfigurationCost(configuration) {
    let totalCost = 0;
    
    Object.keys(configuration).forEach(partType => {
      const partId = configuration[partType];
      if (this.parts[partType] && this.parts[partType][partId]) {
        totalCost += this.parts[partType][partId].cost;
      }
    });
    
    return totalCost;
  }

  applyPreset(bot, presetName) {
    if (this.presets[presetName]) {
      return this.customizeBot(bot, this.presets[presetName]);
    }
    return bot;
  }

  generateRandomConfiguration() {
    const config = {};
    
    Object.keys(this.parts).forEach(partType => {
      const availableParts = Object.keys(this.parts[partType]);
      config[partType] = availableParts[Math.floor(Math.random() * availableParts.length)];
    });
    
    return config;
  }

  renderCustomizationUI(container, bot, onSave) {
    container.innerHTML = '';
    container.style.background = '#1a202c';
    container.style.color = '#white';
    container.style.padding = '20px';
    container.style.borderRadius = '8px';
    
    const title = document.createElement('h2');
    title.textContent = `Customize ${bot.name}`;
    title.style.marginBottom = '20px';
    container.appendChild(title);
    
    // Current stats display
    const statsDiv = document.createElement('div');
    statsDiv.className = 'current-stats';
    statsDiv.style.marginBottom = '20px';
    statsDiv.style.padding = '10px';
    statsDiv.style.background = '#2d3748';
    statsDiv.style.borderRadius = '4px';
    this.updateStatsDisplay(statsDiv, bot);
    container.appendChild(statsDiv);
    
    // Part selection
    const partsContainer = document.createElement('div');
    partsContainer.style.display = 'grid';
    partsContainer.style.gridTemplateColumns = '1fr 1fr';
    partsContainer.style.gap = '20px';
    partsContainer.style.marginBottom = '20px';
    
    const currentConfig = bot.customization || {};
    
    Object.keys(this.parts).forEach(partType => {
      const partSection = document.createElement('div');
      partSection.style.background = '#2d3748';
      partSection.style.padding = '15px';
      partSection.style.borderRadius = '4px';
      
      const partTitle = document.createElement('h4');
      partTitle.textContent = partType.charAt(0).toUpperCase() + partType.slice(1);
      partTitle.style.marginBottom = '10px';
      partSection.appendChild(partTitle);
      
      const select = document.createElement('select');
      select.style.width = '100%';
      select.style.padding = '5px';
      select.style.marginBottom = '10px';
      select.style.background = '#4a5568';
      select.style.color = 'white';
      select.style.border = 'none';
      select.style.borderRadius = '4px';
      
      // Default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Stock';
      select.appendChild(defaultOption);
      
      Object.keys(this.parts[partType]).forEach(partId => {
        const part = this.parts[partType][partId];
        const option = document.createElement('option');
        option.value = partId;
        option.textContent = `${part.name} (${part.cost} credits)`;
        if (currentConfig[partType] === partId) {
          option.selected = true;
        }
        select.appendChild(option);
      });
      
      select.onchange = () => {
        currentConfig[partType] = select.value || undefined;
        this.customizeBot(bot, currentConfig);
        this.updateStatsDisplay(statsDiv, bot);
        costDiv.textContent = `Total Cost: ${this.getConfigurationCost(currentConfig)} credits`;
      };
      
      partSection.appendChild(select);
      
      // Part description
      const descDiv = document.createElement('div');
      descDiv.style.fontSize = '12px';
      descDiv.style.color = '#a0aec0';
      
      const updateDescription = () => {
        const selectedPart = select.value ? this.parts[partType][select.value] : null;
        descDiv.textContent = selectedPart ? selectedPart.description : 'Standard equipment';
      };
      
      select.addEventListener('change', updateDescription);
      updateDescription();
      
      partSection.appendChild(descDiv);
      partsContainer.appendChild(partSection);
    });
    
    container.appendChild(partsContainer);
    
    // Cost display
    const costDiv = document.createElement('div');
    costDiv.style.fontSize = '18px';
    costDiv.style.fontWeight = 'bold';
    costDiv.style.marginBottom = '20px';
    costDiv.textContent = `Total Cost: ${this.getConfigurationCost(currentConfig)} credits`;
    container.appendChild(costDiv);
    
    // Preset buttons
    const presetsDiv = document.createElement('div');
    presetsDiv.style.marginBottom = '20px';
    
    const presetsTitle = document.createElement('h4');
    presetsTitle.textContent = 'Quick Presets';
    presetsTitle.style.marginBottom = '10px';
    presetsDiv.appendChild(presetsTitle);
    
    Object.keys(this.presets).forEach(presetName => {
      const btn = document.createElement('button');
      btn.textContent = this.presets[presetName].name;
      btn.style.margin = '5px';
      btn.style.padding = '8px 15px';
      btn.style.background = '#4299e1';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
      
      btn.onclick = () => {
        this.applyPreset(bot, presetName);
        this.updateStatsDisplay(statsDiv, bot);
        // Update select elements
        Object.keys(this.presets[presetName]).forEach(partType => {
          if (partType !== 'name') {
            const select = partsContainer.querySelector(`select:nth-of-type(${Object.keys(this.parts).indexOf(partType) + 1})`);
            if (select) select.value = this.presets[presetName][partType];
          }
        });
        costDiv.textContent = `Total Cost: ${this.getConfigurationCost(this.presets[presetName])} credits`;
      };
      
      presetsDiv.appendChild(btn);
    });
    
    container.appendChild(presetsDiv);
    
    // Action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.style.textAlign = 'center';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Configuration';
    saveBtn.style.padding = '10px 20px';
    saveBtn.style.background = '#38a169';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '4px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.marginRight = '10px';
    
    saveBtn.onclick = () => {
      if (onSave) onSave(bot, currentConfig);
    };
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset to Stock';
    resetBtn.style.padding = '10px 20px';
    resetBtn.style.background = '#e53e3e';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.cursor = 'pointer';
    
    resetBtn.onclick = () => {
      this.resetBotToBase(bot);
      this.updateStatsDisplay(statsDiv, bot);
      partsContainer.querySelectorAll('select').forEach(select => {
        select.value = '';
      });
      costDiv.textContent = 'Total Cost: 0 credits';
    };
    
    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(resetBtn);
    container.appendChild(actionsDiv);
  }

  updateStatsDisplay(container, bot) {
    container.innerHTML = `
      <h4>Current Stats</h4>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div>Health: ${bot.health}/${bot.maxHealth}</div>
        <div>Attack: ${bot.finalAttack}</div>
        <div>Defense: ${bot.finalDefense}</div>
        <div>Speed: ${bot.finalSpeed}</div>
      </div>
      ${bot.accuracy ? `<div>Accuracy: ${bot.accuracy}%</div>` : ''}
      ${bot.dodge > 0 ? `<div>Dodge: ${Math.round(bot.dodge * 100)}%</div>` : ''}
      ${bot.armorPiercing ? '<div>Armor Piercing: Yes</div>' : ''}
      ${bot.attackAgainChance > 0 ? `<div>Double Attack: ${Math.round(bot.attackAgainChance * 100)}%</div>` : ''}
    `;
  }
}