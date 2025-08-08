// Sample battle setup for Dynasty Mechs
import { Bot, Battle, aiChooseAction } from './src/core/Battle.js';

// Create bots for Team A
const teamA = [
  new Bot({ id: 'a1', name: 'Alpha', type: 'assault', hp: 30, attack: 8, defense: 3, aiProfile: { aggression: 0.8, caution: 0.2, targetPreference: 'weakest' } }),
  new Bot({ id: 'a2', name: 'Bravo', type: 'sniper', hp: 22, attack: 11, defense: 2, aiProfile: { aggression: 0.4, caution: 0.7, targetPreference: 'strongest' } })
];

const teamB = [
  new Bot({ id: 'b1', name: 'Omega', type: 'engineer', hp: 28, attack: 7, defense: 4, aiProfile: { aggression: 0.6, caution: 0.5, targetPreference: 'random' } }),
  new Bot({ id: 'b2', name: 'Delta', type: 'assault', hp: 25, attack: 9, defense: 3, aiProfile: { aggression: 0.9, caution: 0.1, targetPreference: 'weakest' } })
];

// Initialize battle
const battle = new Battle(teamA, teamB);

// Simulate a few turns
while (!battle.ended) {
  const currentTeam = battle.getCurrentTeam();
  // Pick first alive bot from current team
  const actingBot = currentTeam.find(bot => bot.isAlive());
  if (actingBot) {
    const aiAction = aiChooseAction(battle, actingBot);
    if (aiAction && aiAction.action === 'attack' && aiAction.target) {
      battle.attack(actingBot, aiAction.target);
      actingBot.gainExperience(10); // Gain experience for acting
    } else if (aiAction && aiAction.action === 'defend') {
      battle.log.push(`${actingBot.name} defends this turn.`);
      actingBot.gainExperience(5);
    }
  }
  battle.nextTurn();
}

console.log(battle.log.join('\n'));
// Show final AI profiles and experience
console.log('\nFinal AI Profiles:');
[...teamA, ...teamB].forEach(bot => {
  const ai = bot.aiProfile;
  if (!ai) return;
  console.log(`${bot.name}: exp=${bot.experience}, aggression=${ai.aggression.toFixed(2)}, caution=${ai.caution.toFixed(2)}, teamwork=${ai.teamwork.toFixed(2)}, risk=${ai.risk.toFixed(2)}, memory=${ai.memory.toFixed(2)}, targetPref=${ai.targetPreference}`);
});
