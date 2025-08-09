export class UpgradeManager {
  checkForUpgrades(bots) {
    const upgradeableBots = {};
    for (const bot of bots) {
      if (!upgradeableBots[bot.name]) {
        upgradeableBots[bot.name] = {
          1: [],
          2: [],
        };
      }
      if (bot.level === 1) {
        upgradeableBots[bot.name][1].push(bot);
      } else if (bot.level === 2) {
        upgradeableBots[bot.name][2].push(bot);
      }
    }

    const availableUpgrades = [];
    for (const botName in upgradeableBots) {
      if (upgradeableBots[botName][1].length >= 3) {
        availableUpgrades.push({ name: botName, level: 1, bots: upgradeableBots[botName][1] });
      }
      if (upgradeableBots[botName][2].length >= 3) {
        availableUpgrades.push({ name: botName, level: 2, bots: upgradeableBots[botName][2] });
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
