import { Pilot } from './Pilot.js';

export const GameState = {
  settings: {
    sound: true,
  },
  battle: {
    grid: [],
    rows: 8,
    cols: 6,
  },
  player: {
    bots: []
  },
  pilots: [
    new Pilot({ 
      name: 'Zhang Fei', 
      description: '+10 Attack', 
      ability: (bot) => { bot.stats.attack += 10; } 
    }),
    new Pilot({ 
      name: 'Guan Yu', 
      description: '+5 Defense', 
      ability: (bot) => { bot.stats.defense += 5; } 
    }),
    new Pilot({ 
      name: 'Liu Bei', 
      description: '+3 Speed', 
      ability: (bot) => { bot.stats.speed += 3; } 
    })
  ]
};
