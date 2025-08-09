export const synergyConfig = {
  factions: {
    Shu: {
      bonuses: [
        { count: 2, description: 'All allies gain +1 Speed' },
        { count: 3, description: 'All allies gain +2 Speed and 10% Dodge' }
      ]
    },
    Wei: {
      bonuses: [
        { count: 2, description: 'All allies gain +1 Defense' },
        { count: 3, description: 'All allies gain +2 Defense and 10% Damage Reduction' }
      ]
    },
    Wu: {
      bonuses: [
        { count: 2, description: 'All allies gain +1 Attack' },
        { count: 3, description: 'All allies gain +2 Attack and their first attack is a guaranteed crit' }
      ]
    }
  },
  classes: {
    Assault: {
      bonuses: [
        { count: 2, description: 'Assault bots gain +3 Attack' }
      ]
    },
    Sniper: {
      bonuses: [
        { count: 2, description: 'Sniper bots have a 25% chance to attack again' }
      ]
    },
    Defender: {
      bonuses: [
        { count: 2, description: 'Defender bots start battle with a shield' }
      ]
    },
    Medic: {
        bonuses: [
            { count: 2, description: 'Medic bots heal for 50% more' }
        ]
    },
    Scout: {
        bonuses: [
            { count: 2, description: 'Scout bots gain +2 Speed' }
        ]
    },
    Engineer: {
        bonuses: [
            { count: 2, description: 'Engineer bots start with their ability cooldown at 0' }
        ]
    }
  }
};

export class SynergyManager {
  calculateSynergies(bots) {
    const activeSynergies = {
      factions: {},
      classes: {}
    };

    const factionCounts = {};
    const classCounts = {};

    for (const bot of bots) {
      if (bot.faction) {
        factionCounts[bot.faction] = (factionCounts[bot.faction] || 0) + 1;
      }
      if (bot.class) {
        classCounts[bot.class] = (classCounts[bot.class] || 0) + 1;
      }
    }

    for (const faction in factionCounts) {
      const count = factionCounts[faction];
      const synergy = synergyConfig.factions[faction];
      if (synergy) {
        for (const bonus of synergy.bonuses) {
          if (count >= bonus.count) {
            activeSynergies.factions[faction] = bonus;
          }
        }
      }
    }

    for (const botClass in classCounts) {
      const count = classCounts[botClass];
      const synergy = synergyConfig.classes[botClass];
      if (synergy) {
        for (const bonus of synergy.bonuses) {
          if (count >= bonus.count) {
            activeSynergies.classes[botClass] = bonus;
          }
        }
      }
    }

    return activeSynergies;
  }

  applySynergies(bots, activeSynergies) {
    // Reset all synergy effects first
    bots.forEach(bot => {
      bot.speedBonus = 0;
      bot.defenseBonus = 0;
      bot.attackBonus = 0;
      bot.dodge = 0;
      bot.damageReduction = 0;
      bot.crit = false;
      bot.healBonus = 0;
    });

    for (const faction in activeSynergies.factions) {
      const bonus = activeSynergies.factions[faction];
      if (faction === 'Shu') {
        if (bonus.count >= 3) {
            bots.forEach(b => {
                b.speedBonus += 2;
                b.dodge += 0.1;
            });
        } else if (bonus.count >= 2) {
            bots.forEach(b => b.speedBonus += 1);
        }
      }
      if (faction === 'Wei') {
        if (bonus.count >= 3) {
            bots.forEach(b => {
                b.defenseBonus += 2;
                b.damageReduction += 0.1;
            });
        } else if (bonus.count >= 2) {
            bots.forEach(b => b.defenseBonus += 1);
        }
      }
      if (faction === 'Wu') {
        if (bonus.count >= 3) {
            bots.forEach(b => {
                b.attackBonus += 2;
                b.crit = true;
            });
        } else if (bonus.count >= 2) {
            bots.forEach(b => b.attackBonus += 1);
        }
      }
    }

    for (const botClass in activeSynergies.classes) {
      const bonus = activeSynergies.classes[botClass];
      bots.forEach(bot => {
        if (bot.class === botClass) {
          if (botClass === 'Assault' && bonus.count >= 2) bot.attackBonus += 3;
          if (botClass === 'Sniper' && bonus.count >= 2) bot.attackAgainChance = 0.25;
          if (botClass === 'Defender' && bonus.count >= 2) bot.shielded = true;
          if (botClass === 'Medic' && bonus.count >= 2) bot.healBonus = 0.5;
          if (botClass === 'Scout' && bonus.count >= 2) bot.speedBonus += 2;
          if (botClass === 'Engineer' && bonus.count >= 2) bot.abilityCooldown = 0;
        }
      });
    }
  }
}
