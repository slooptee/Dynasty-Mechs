// Core battle system logic for Dynasty Mechs

export class Bot {
  constructor({ id, name, type, hp, attack, defense, aiProfile, experience = 0 }) {
    this.id = id;
    this.name = name;
    this.type = type; // e.g., 'assault', 'sniper', 'engineer', etc.
    this.maxHp = hp;
    this.hp = hp;
    this.attack = attack;
    this.defense = defense;
    this.alive = true;
    // AI profile: aggression, caution, targetPreference, etc.
    this.aiProfile = aiProfile || {
      aggression: 0.5, // 0 = defensive, 1 = aggressive
      caution: 0.5,    // 0 = reckless, 1 = cautious
      teamwork: 0.5,   // 0 = lone wolf, 1 = supports allies
      risk: 0.5,       // 0 = avoids risk, 1 = takes risks
      memory: 0.5,     // 0 = forgetful, 1 = remembers past actions
      targetPreference: 'weakest', // 'weakest', 'strongest', 'random', 'revenge'
      lastTargetId: null // for memory/vengeance
    };
    this.experience = experience;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  isAlive() {
    return this.alive;
  }

  gainExperience(amount) {
    this.experience += amount;
    this.evolveAI();
  }

  evolveAI() {
    // Smarter evolution: traits evolve based on experience and battle outcomes
    const expFactor = Math.min(1, this.experience / 200);
    // Aggression increases with experience, but risk also increases
    this.aiProfile.aggression = Math.min(1, 0.4 + 0.6 * expFactor);
    this.aiProfile.risk = Math.min(1, 0.3 + 0.7 * expFactor);
    // Caution decreases, but teamwork increases with experience
    this.aiProfile.caution = Math.max(0, 0.7 - 0.5 * expFactor);
    this.aiProfile.teamwork = Math.min(1, 0.3 + 0.7 * expFactor);
    // Memory improves with experience
    this.aiProfile.memory = Math.min(1, 0.2 + 0.8 * expFactor);
    // Target preference can evolve: high memory/risk = 'revenge', high teamwork = 'support', else 'weakest'
    if (this.aiProfile.memory > 0.8 && this.aiProfile.risk > 0.7) {
      this.aiProfile.targetPreference = 'revenge';
    } else if (this.aiProfile.teamwork > 0.8) {
      this.aiProfile.targetPreference = 'support';
    } else {
      this.aiProfile.targetPreference = 'weakest';
    }
  }
}

// AI action selection based on aiProfile
export function aiChooseAction(battle, bot) {
  const enemyTeam = battle.teamA.includes(bot) ? battle.teamB : battle.teamA;
  const allyTeam = battle.teamA.includes(bot) ? battle.teamA : battle.teamB;
  const aliveEnemies = enemyTeam.filter(e => e.isAlive());
  const aliveAllies = allyTeam.filter(a => a.isAlive() && a.id !== bot.id);
  if (aliveEnemies.length === 0) return null;

  let target;
  switch (bot.aiProfile.targetPreference) {
    case 'strongest':
      target = aliveEnemies.reduce((a, b) => (a.attack > b.attack ? a : b));
      break;
    case 'random':
      target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      break;
    case 'revenge':
      // Attack the last enemy that attacked this bot, if alive, else weakest
      if (bot.aiProfile.lastTargetId) {
        const revengeTarget = aliveEnemies.find(e => e.id === bot.aiProfile.lastTargetId);
        if (revengeTarget) {
          target = revengeTarget;
          break;
        }
      }
      // fallback
      target = aliveEnemies.reduce((a, b) => (a.hp < b.hp ? a : b));
      break;
    case 'support':
      // If any ally is low, defend them (could be expanded to healing/support actions)
      const allyInNeed = aliveAllies.find(a => a.hp < a.maxHp * 0.5);
      if (allyInNeed) {
        return { action: 'defend', bot, target: allyInNeed };
      }
      // fallback to weakest
      target = aliveEnemies.reduce((a, b) => (a.hp < b.hp ? a : b));
      break;
    case 'weakest':
    default:
      target = aliveEnemies.reduce((a, b) => (a.hp < b.hp ? a : b));
      break;
  }

  // Smarter: risk-takers attack even when low, cautious bots defend if low
  if (bot.aiProfile.caution > 0.7 && bot.hp < bot.maxHp * 0.3) {
    return { action: 'defend', bot };
  }
  if (bot.aiProfile.risk > 0.8 && bot.hp < bot.maxHp * 0.2) {
    // High risk: attack even if nearly dead
    return { action: 'attack', bot, target };
  }
  // Memory: store last target for revenge
  bot.aiProfile.lastTargetId = target ? target.id : null;
  return { action: 'attack', bot, target };
}
export class Battle {
  constructor(teamA, teamB) {
    this.teamA = teamA; // Array of Bot
    this.teamB = teamB; // Array of Bot
    this.turn = 0;
    this.log = [];
    this.ended = false;
    this.winner = null;
  }

  getCurrentTeam() {
    return this.turn % 2 === 0 ? this.teamA : this.teamB;
  }

  getEnemyTeam() {
    return this.turn % 2 === 0 ? this.teamB : this.teamA;
  }

  nextTurn() {
    if (this.ended) return;
    this.turn++;
  }

  attack(attacker, target) {
    if (!attacker.isAlive() || !target.isAlive()) return;
    // Simple damage formula: attack - defense (min 1)
    const damage = Math.max(1, attacker.attack - target.defense);
    target.takeDamage(damage);
    this.log.push(`${attacker.name} attacks ${target.name} for ${damage} damage!`);
    this.checkBattleEnd();
  }

  checkBattleEnd() {
    const aAlive = this.teamA.some(bot => bot.isAlive());
    const bAlive = this.teamB.some(bot => bot.isAlive());
    if (!aAlive || !bAlive) {
      this.ended = true;
      this.winner = aAlive ? 'A' : 'B';
      this.log.push(`Team ${this.winner} wins!`);
    }
  }
}
