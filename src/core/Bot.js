// Bot class for battle
export class Bot {
  constructor({ id, team, name, type, health, maxHealth, attack, defense, speed, x, y, faction, class: botClass }) {
    this.id = id;
    this.team = team;
    this.name = name;
    this.type = type;
    this.faction = faction;
    this.class = botClass;
    this.health = health;
    this.maxHealth = maxHealth;
    this.attack = attack;
    this.defense = defense;
    this.speed = speed;
    this.x = x;
    this.y = y;
    this.alive = true;
    // Ability state
    this.shielded = false; // Defender
    this.abilityCooldown = 0;
    // Synergy bonuses
    this.speedBonus = 0;
    this.defenseBonus = 0;
    this.attackBonus = 0;
    this.dodge = 0;
    this.damageReduction = 0;
    this.crit = false;
    this.healBonus = 0;
    this.attackAgainChance = 0;
  }

  get finalAttack() {
    return this.attack + this.attackBonus;
  }

  get finalDefense() {
    return this.defense + this.defenseBonus;
  }

  get finalSpeed() {
    return this.speed + this.speedBonus;
  }

  takeDamage(amount) {
    if (Math.random() < this.dodge) return; // Dodge the attack

    let dmg = amount * (1 - this.damageReduction);
    if (this.shielded) {
      dmg = Math.ceil(dmg / 2);
      this.shielded = false; // shield breaks after one hit
    }
    this.health -= dmg;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }
  heal(amount) {
    const finalHeal = amount * (1 + this.healBonus);
    this.health = Math.min(this.maxHealth, this.health + finalHeal);
  }
  canAct() {
    return this.alive;
  }
  // Unique abilities
  useAbility(allies, enemies, grid) {
    if (this.abilityCooldown > 0) return false;
    switch (this.type) {
      case 'defender': {
        // Shield lowest HP ally
        const ally = allies.filter(a => a.alive).sort((a, b) => a.health - b.health)[0];
        if (ally) {
          ally.shielded = true;
          this.abilityCooldown = 3;
          return { action: 'shield', target: ally };
        }
        break;
      }
      case 'medic': {
        // Heal lowest HP ally
        const toHeal = allies.filter(a => a.alive && a.health < a.maxHealth).sort((a, b) => a.health - b.health)[0];
        if (toHeal) {
          toHeal.heal(6);
          this.abilityCooldown = 2;
          return { action: 'heal', target: toHeal };
        }
        break;
      }
      case 'scout': {
        // Double move (handled in AI/move logic)
        this.abilityCooldown = 2;
        return { action: 'doubleMove' };
      }
      case 'assault': {
        // Area attack: damage all adjacent enemies
        const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
        let hit = false;
        dirs.forEach(([dx,dy]) => {
          const nx = this.x + dx;
          const ny = this.y + dy;
          const enemy = enemies.find(e => e.alive && e.x === nx && e.y === ny);
          if (enemy) {
            enemy.takeDamage(Math.round(this.finalAttack * 0.8));
            hit = true;
          }
        });
        if (hit) {
          this.abilityCooldown = 3;
          return { action: 'areaAttack' };
        }
        break;
      }
      case 'sniper': {
        // Long-range attack: hit any enemy, higher cooldown
        const target = enemies.filter(e => e.alive).sort((a, b) => a.health - b.health)[0];
        if (target) {
          target.takeDamage(this.finalAttack + 2);
          this.abilityCooldown = 4;
          return { action: 'snipe', target };
        }
        break;
      }
      case 'engineer': {
        // Deploy turret: summon a stationary bot (one per engineer)
        if (grid && !this.turretDeployed) {
          const tx = this.x;
          const ty = this.y;
          grid.push({ id: `turret-${this.id}`, team: this.team, name: 'Turret', type: 'turret', health: 8, maxHealth: 8, attack: 3, defense: 0, speed: 0, x: tx, y: ty, alive: true });
          this.turretDeployed = true;
          this.abilityCooldown = 5;
          return { action: 'deployTurret', x: tx, y: ty };
        }
        break;
      }
      default:
        break;
    }
    return false;
  }
  tickCooldown() {
    if (this.abilityCooldown > 0) this.abilityCooldown--;
  }
}
