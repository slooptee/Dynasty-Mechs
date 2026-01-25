// Dynamic Terrain System - Revolutionary battlefield environments
import { emit } from '../core/eventBus.js';

export class TerrainSystem {
  constructor() {
    this.terrainTypes = {
      normal: { 
        name: 'Normal', 
        color: '#4a5568', 
        movementCost: 1, 
        defenseBonus: 0,
        effects: []
      },
      forest: { 
        name: 'Forest', 
        color: '#38a169', 
        movementCost: 2, 
        defenseBonus: 0.2,
        effects: ['concealment']
      },
      mountain: { 
        name: 'Mountain', 
        color: '#718096', 
        movementCost: 3, 
        defenseBonus: 0.3,
        effects: ['elevation']
      },
      water: { 
        name: 'Water', 
        color: '#4299e1', 
        movementCost: 3, 
        defenseBonus: -0.1,
        effects: ['slow']
      },
      lava: { 
        name: 'Lava', 
        color: '#e53e3e', 
        movementCost: 2, 
        defenseBonus: 0,
        effects: ['burning']
      },
      ice: { 
        name: 'Ice', 
        color: '#63b3ed', 
        movementCost: 1, 
        defenseBonus: 0,
        effects: ['slippery']
      }
    };
    
    this.grid = {};
    this.weatherEffect = 'clear';
    this.environmentalHazards = [];
  }

  generateTerrain(rows, cols, seed = Math.random()) {
    // Procedural terrain generation using Perlin-like noise
    const terrain = {};
    
    // Create base terrain
    for (let x = 1; x <= rows; x++) {
      for (let y = 1; y <= cols; y++) {
        const noise = this.simpleNoise(x * 0.1, y * 0.1, seed);
        let terrainType = 'normal';
        
        if (noise < -0.3) terrainType = 'water';
        else if (noise < -0.1) terrainType = 'forest';
        else if (noise > 0.3) terrainType = 'mountain';
        else if (noise > 0.6) terrainType = 'lava';
        
        terrain[`${x},${y}`] = { 
          ...this.terrainTypes[terrainType],
          x, y, type: terrainType 
        };
      }
    }
    
    this.grid = terrain;
    return terrain;
  }

  simpleNoise(x, y, seed) {
    // Simple pseudo-random noise function
    const a = seed * 12.9898;
    const b = seed * 78.233;
    const c = 43758.5453;
    const dt = (Math.sin(x * a + y * b) + 1) / 2;
    return (Math.sin(dt * c) + 1) / 2 - 0.5;
  }

  getTerrainAt(x, y) {
    return this.grid[`${x},${y}`] || this.terrainTypes.normal;
  }

  applyTerrainEffects(bot, targetX, targetY) {
    const terrain = this.getTerrainAt(targetX, targetY);
    const effects = [];

    terrain.effects.forEach(effect => {
      switch (effect) {
        case 'concealment':
          bot.dodge = Math.min(bot.dodge + 0.15, 0.8);
          effects.push('Hidden in forest (+15% dodge)');
          break;
        case 'elevation':
          bot.attackBonus += 2;
          effects.push('High ground advantage (+2 attack)');
          break;
        case 'slow':
          bot.speedBonus = Math.max(bot.speedBonus - 1, -bot.speed + 1);
          effects.push('Slowed by water (-1 speed)');
          break;
        case 'burning':
          effects.push('Taking fire damage!');
          setTimeout(() => {
            bot.takeDamage(2);
            emit('terrain:damage', { bot, damage: 2, type: 'fire' });
          }, 100);
          break;
        case 'slippery':
          if (Math.random() < 0.15) {
            effects.push('Slipped on ice!');
            // Skip turn logic would go here
          }
          break;
      }
    });

    return effects;
  }

  setWeather(weather) {
    this.weatherEffect = weather;
    emit('terrain:weather-change', { weather });
  }

  spawnHazard(x, y, type, duration = 3) {
    const hazard = {
      x, y, type, duration, 
      id: `hazard_${Date.now()}_${Math.random()}`
    };
    
    this.environmentalHazards.push(hazard);
    emit('terrain:hazard-spawn', hazard);
    
    // Auto-remove after duration
    setTimeout(() => {
      this.removeHazard(hazard.id);
    }, duration * 1000);
  }

  removeHazard(hazardId) {
    this.environmentalHazards = this.environmentalHazards.filter(h => h.id !== hazardId);
    emit('terrain:hazard-remove', { hazardId });
  }

  renderTerrainOverlay(container, rows, cols) {
    const overlay = document.createElement('div');
    overlay.className = 'terrain-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1';

    for (let x = 1; x <= rows; x++) {
      for (let y = 1; y <= cols; y++) {
        const terrain = this.getTerrainAt(x, y);
        if (terrain.type === 'normal') continue;

        const cell = document.createElement('div');
        cell.className = `terrain-cell terrain-${terrain.type}`;
        cell.style.position = 'absolute';
        cell.style.left = `${(x - 1) * (100 / rows)}%`;
        cell.style.top = `${(y - 1) * (100 / cols)}%`;
        cell.style.width = `${100 / rows}%`;
        cell.style.height = `${100 / cols}%`;
        cell.style.backgroundColor = terrain.color;
        cell.style.opacity = '0.3';
        cell.style.border = '1px solid rgba(255,255,255,0.1)';
        cell.title = `${terrain.name} (Move: ${terrain.movementCost}, Def: ${terrain.defenseBonus > 0 ? '+' : ''}${Math.round(terrain.defenseBonus * 100)}%)`;

        overlay.appendChild(cell);
      }
    }

    container.appendChild(overlay);
    return overlay;
  }
}