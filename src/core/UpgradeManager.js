export class UpgradeManager {
  checkForUpgrades(bots) {
    const upgradeableBots = {};
    for (const bot of bots) {
      if (!upgradeableBots[bot.type]) {
        upgradeableBots[bot.type] = {
          1: [],
          2: [],
        };
      }
      if (bot.level === 1) {
        upgradeableBots[bot.type][1].push(bot);
      } else if (bot.level === 2) {
        upgradeableBots[bot.type][2].push(bot);
      }
    }

    const availableUpgrades = [];
    for (const botType in upgradeableBots) {
      if (upgradeableBots[botType][1].length >= 3) {
        availableUpgrades.push({ type: botType, level: 1, bots: upgradeableBots[botType][1] });
      }
      if (upgradeableBots[botType][2].length >= 3) {
        availableUpgrades.push({ type: botType, level: 2, bots: upgradeableBots[botType][2] });
      }
    }
    return availableUpgrades;
  }

  performUpgrade(bots, upgrade) {
    const botsToUpgrade = upgrade.bots.slice(0, 3);
    const botToLevelUp = botsToUpgrade[0];
    botToLevelUp.levelUp();

    // Remove the other two bots
    for (let i = 1; i < botsToUpgrade.length; i++) {
      const index = bots.findIndex(b => b.id === botsToUpgrade[i].id);
      if (index !== -1) {
        bots.splice(index, 1);
      }
    }
    return bots;
  }
}
