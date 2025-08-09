export const synergyConfig = {
  factions: {
    Shu: {
      bonuses: [
        { count: 2, description: 'All allies gain +1 Speed', effects: [{ stat: 'speedBonus', value: 1 }] },
        { count: 3, description: 'All allies gain +2 Speed and 10% Dodge', effects: [{ stat: 'speedBonus', value: 2 }, { stat: 'dodge', value: 0.1 }] }
      ]
    },
    Wei: {
      bonuses: [
        { count: 2, description: 'All allies gain +1 Defense', effects: [{ stat: 'defenseBonus', value: 1 }] },
        { count: 3, description: 'All allies gain +2 Defense and 10% Damage Reduction', effects: [{ stat: 'defenseBonus', value: 2 }, { stat: 'damageReduction', value: 0.1 }] }
      ]
    },
    Wu: {
      bonuses: [
        { count: 2, description: 'All allies gain +1 Attack', effects: [{ stat: 'attackBonus', value: 1 }] },
        { count: 3, description: 'All allies gain +2 Attack and their first attack is a guaranteed crit', effects: [{ stat: 'attackBonus', value: 2 }, { stat: 'crit', value: true }] }
      ]
    }
  },
  classes: {
    Assault: {
      bonuses: [
        { count: 2, description: 'Assault bots gain +3 Attack', effects: [{ stat: 'attackBonus', value: 3 }] }
      ]
    },
    Sniper: {
      bonuses: [
        { count: 2, description: 'Sniper bots have a 25% chance to attack again', effects: [{ stat: 'attackAgainChance', value: 0.25 }] }
      ]
    },
    Defender: {
      bonuses: [
        { count: 2, description: 'Defender bots start battle with a shield', effects: [{ stat: 'shielded', value: true }] }
      ]
    },
    Medic: {
        bonuses: [
            { count: 2, description: 'Medic bots heal for 50% more', effects: [{ stat: 'healBonus', value: 0.5 }] }
        ]
    },
    Scout: {
        bonuses: [
            { count: 2, description: 'Scout bots gain +2 Speed', effects: [{ stat: 'speedBonus', value: 2 }] }
        ]
    },
    Engineer: {
        bonuses: [
            { count: 2, description: 'Engineer bots start with their ability cooldown at 0', effects: [{ stat: 'abilityCooldown', value: 0 }] }
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
        let activeBonus = null;
        for (const bonus of synergy.bonuses) {
          if (count >= bonus.count) {
            activeBonus = bonus;
          }
        }
        if (activeBonus) {
            activeSynergies.factions[faction] = { ...activeBonus, actualCount: count };
        }
      }
    }

    for (const botClass in classCounts) {
      const count = classCounts[botClass];
      const synergy = synergyConfig.classes[botClass];
      if (synergy) {
        let activeBonus = null;
        for (const bonus of synergy.bonuses) {
          if (count >= bonus.count) {
            activeBonus = bonus;
          }
        }
        if (activeBonus) {
            activeSynergies.classes[botClass] = { ...activeBonus, actualCount: count };
        }
      }
    }

    return activeSynergies;
  }

  applySynergies(bots, activeSynergies, grid) {
    // Reset all synergy effects first
    bots.forEach(bot => {
      bot.speedBonus = 0;
      bot.defenseBonus = 0;
      bot.attackBonus = 0;
      bot.dodge = 0;
      bot.damageReduction = 0;
      bot.crit = false;
      bot.healBonus = 0;
      bot.attackAgainChance = 0;
    });

    const applyEffects = (bonus, filter) => {
        bonus.effects.forEach(effect => {
            bots.forEach(bot => {
                if (filter(bot)) {
                    if (typeof bot[effect.stat] === 'number') {
                        bot[effect.stat] += effect.value;
                    } else {
                        bot[effect.stat] = effect.value;
                    }
                }
            });
        });
    };

    for (const faction in activeSynergies.factions) {
        applyEffects(activeSynergies.factions[faction], () => true);
    }

    for (const botClass in activeSynergies.classes) {
        applyEffects(activeSynergies.classes[botClass], (bot) => bot.class === botClass);
    }

    // Apply tile effects
    bots.forEach(bot => {
        const tile = grid[bot.y - 1][bot.x - 1];
        if (tile.type === 'fortress') {
            bot.defenseBonus += 2;
        } else if (tile.type === 'swamp') {
            bot.speedBonus -= 1;
        }
    });

    // Apply pilot abilities
    bots.forEach(bot => {
        if (bot.pilot && bot.pilot.ability) {
            bot.pilot.ability(bot);
        }
    });
  }
}
