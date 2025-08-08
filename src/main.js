import './styles.css';
import { GameState } from './core/GameState.js';
import { SoundSystem } from './core/SoundSystem.js';
import { Router, goToMainMenu } from './core/Router.js';
import { initParticles } from './ui/components/Particles.js';
import { AchievementManager } from './core/AchievementManager.js';
import { SaveSystem } from './core/SaveSystem.js';

const soundSystem = new SoundSystem();
await soundSystem.init();

const achievements = new AchievementManager();
const saves = new SaveSystem();

initParticles();
Router.mount(document.getElementById('app'));
goToMainMenu();

// click to start BGM (as in your current file)
document.addEventListener('click', () => {
  if (GameState.settings.sound && !soundSystem.currentMusic) {
    soundSystem.playBackgroundMusic();
  }
}, { once: true });
