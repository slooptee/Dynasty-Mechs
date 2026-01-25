// Enhanced PixiJS Effects System - Revolutionary visual effects
import * as PIXI from 'pixi.js';

let app = null;
let container = null;
let particleContainer = null;

export async function mountAdvancedEffectsOverlay(parent) {
  if (app) return app;
  
  app = new PIXI.Application();
  await app.init({
    width: 8 * 40,
    height: 6 * 40,
    backgroundColor: 0x000000,
    backgroundAlpha: 0,
    antialias: true,
    autoStart: true
  });
  
  container = app.stage;
  
  // Create particle container for performance
  particleContainer = new PIXI.ParticleContainer(1000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });
  container.addChild(particleContainer);
  
  app.canvas.style.position = 'absolute';
  app.canvas.style.top = '0';
  app.canvas.style.left = '0';
  app.canvas.style.pointerEvents = 'none';
  app.canvas.style.zIndex = '10';
  parent.appendChild(app.canvas);
  
  return app;
}

export function playEnhancedHitEffect(x, y, damageType = 'physical') {
  if (!app) return;
  
  const colors = {
    physical: 0xffff00,
    fire: 0xff4444,
    ice: 0x44aaff,
    poison: 0x44ff44,
    electric: 0xaa44ff
  };
  
  // Main impact effect
  const impact = new PIXI.Graphics();
  impact.circle(0, 0, 20);
  impact.fill(colors[damageType] || colors.physical);
  impact.alpha = 0.8;
  impact.x = (x - 1) * 40 + 20;
  impact.y = (y - 1) * 40 + 20;
  container.addChild(impact);
  
  // Screen shake effect
  shakeScreen(3, 150);
  
  // Particle burst
  createParticleBurst(impact.x, impact.y, colors[damageType] || colors.physical);
  
  // Animate impact
  let scale = 0.5;
  app.ticker.add(function impactAnim() {
    scale += 0.3;
    impact.scale.set(scale);
    impact.alpha -= 0.15;
    
    if (impact.alpha <= 0) {
      container.removeChild(impact);
      app.ticker.remove(impactAnim);
    }
  });
}

export function createParticleBurst(x, y, color, count = 8) {
  if (!app || !particleContainer) return;
  
  for (let i = 0; i < count; i++) {
    const particle = new PIXI.Graphics();
    particle.circle(0, 0, Math.random() * 3 + 1);
    particle.fill(color);
    particle.x = x;
    particle.y = y;
    
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 3 + 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    particleContainer.addChild(particle);
    
    app.ticker.add(function particleAnim() {
      particle.x += vx;
      particle.y += vy;
      particle.alpha -= 0.02;
      
      if (particle.alpha <= 0) {
        particleContainer.removeChild(particle);
        app.ticker.remove(particleAnim);
      }
    });
  }
}

export function shakeScreen(intensity = 5, duration = 200) {
  if (!app) return;
  
  const originalX = container.x;
  const originalY = container.y;
  let elapsed = 0;
  
  app.ticker.add(function shake() {
    elapsed += app.ticker.deltaMS;
    
    if (elapsed < duration) {
      const shake = intensity * (1 - elapsed / duration);
      container.x = originalX + (Math.random() - 0.5) * shake;
      container.y = originalY + (Math.random() - 0.5) * shake;
    } else {
      container.x = originalX;
      container.y = originalY;
      app.ticker.remove(shake);
    }
  });
}

export function playAbilityEffect(x, y, abilityType) {
  if (!app) return;
  
  switch (abilityType) {
    case 'heal':
      playHealEffect(x, y);
      break;
    case 'shield':
      playShieldEffect(x, y);
      break;
    case 'explosion':
      playExplosionEffect(x, y);
      break;
    case 'lightning':
      playLightningEffect(x, y);
      break;
    default:
      playEnhancedHitEffect(x, y);
  }
}

function playHealEffect(x, y) {
  const heal = new PIXI.Graphics();
  heal.circle(0, 0, 15);
  heal.fill(0x44ff44);
  heal.alpha = 0.6;
  heal.x = (x - 1) * 40 + 20;
  heal.y = (y - 1) * 40 + 20;
  container.addChild(heal);
  
  // Rising particle effect
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 2);
      particle.fill(0x44ff44);
      particle.x = heal.x + (Math.random() - 0.5) * 20;
      particle.y = heal.y;
      container.addChild(particle);
      
      app.ticker.add(function riseUp() {
        particle.y -= 2;
        particle.alpha -= 0.05;
        
        if (particle.alpha <= 0) {
          container.removeChild(particle);
          app.ticker.remove(riseUp);
        }
      });
    }, i * 100);
  }
  
  // Pulse effect
  let pulseScale = 1;
  app.ticker.add(function pulse() {
    pulseScale += 0.1;
    heal.scale.set(pulseScale);
    heal.alpha -= 0.05;
    
    if (heal.alpha <= 0) {
      container.removeChild(heal);
      app.ticker.remove(pulse);
    }
  });
}

function playShieldEffect(x, y) {
  const shield = new PIXI.Graphics();
  shield.circle(0, 0, 25);
  shield.stroke({ color: 0x4499ff, width: 3 });
  shield.alpha = 0.8;
  shield.x = (x - 1) * 40 + 20;
  shield.y = (y - 1) * 40 + 20;
  container.addChild(shield);
  
  let rotation = 0;
  app.ticker.add(function shieldSpin() {
    rotation += 0.1;
    shield.rotation = rotation;
    shield.alpha -= 0.02;
    
    if (shield.alpha <= 0) {
      container.removeChild(shield);
      app.ticker.remove(shieldSpin);
    }
  });
}

function playExplosionEffect(x, y) {
  shakeScreen(8, 300);
  
  // Multiple explosion rings
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const explosion = new PIXI.Graphics();
      explosion.circle(0, 0, 5);
      explosion.fill(0xff4444);
      explosion.x = (x - 1) * 40 + 20;
      explosion.y = (y - 1) * 40 + 20;
      container.addChild(explosion);
      
      let scale = 0.5;
      app.ticker.add(function explode() {
        scale += 0.8;
        explosion.scale.set(scale);
        explosion.alpha -= 0.1;
        
        if (explosion.alpha <= 0) {
          container.removeChild(explosion);
          app.ticker.remove(explode);
        }
      });
      
      // Debris particles
      createParticleBurst((x - 1) * 40 + 20, (y - 1) * 40 + 20, 0xff4444, 12);
    }, i * 100);
  }
}

function playLightningEffect(x, y) {
  const lightning = new PIXI.Graphics();
  lightning.moveTo(0, -100);
  
  // Create zigzag lightning pattern
  let currentY = -100;
  let currentX = 0;
  
  while (currentY < 40) {
    currentY += Math.random() * 20 + 10;
    currentX += (Math.random() - 0.5) * 15;
    lightning.lineTo(currentX, currentY);
  }
  
  lightning.stroke({ color: 0xffff00, width: 2 });
  lightning.x = (x - 1) * 40 + 20;
  lightning.y = (y - 1) * 40 + 20;
  container.addChild(lightning);
  
  // Flash effect
  let flashCount = 0;
  app.ticker.add(function flash() {
    flashCount++;
    lightning.alpha = flashCount % 2 === 0 ? 1 : 0;
    
    if (flashCount > 8) {
      container.removeChild(lightning);
      app.ticker.remove(flash);
    }
  });
}

export function createWeatherEffect(weatherType) {
  if (!app) return;
  
  switch (weatherType) {
    case 'rain':
      createRainEffect();
      break;
    case 'snow':
      createSnowEffect();
      break;
    case 'sandstorm':
      createSandstormEffect();
      break;
  }
}

function createRainEffect() {
  for (let i = 0; i < 50; i++) {
    const raindrop = new PIXI.Graphics();
    raindrop.rect(0, 0, 1, 8);
    raindrop.fill(0x4499ff);
    raindrop.x = Math.random() * app.canvas.width;
    raindrop.y = Math.random() * -100;
    raindrop.alpha = 0.6;
    container.addChild(raindrop);
    
    app.ticker.add(function fall() {
      raindrop.y += 8;
      
      if (raindrop.y > app.canvas.height) {
        raindrop.y = -10;
        raindrop.x = Math.random() * app.canvas.width;
      }
    });
  }
}

function createSnowEffect() {
  for (let i = 0; i < 30; i++) {
    const snowflake = new PIXI.Graphics();
    snowflake.circle(0, 0, Math.random() * 2 + 1);
    snowflake.fill(0xffffff);
    snowflake.x = Math.random() * app.canvas.width;
    snowflake.y = Math.random() * -100;
    snowflake.alpha = 0.8;
    container.addChild(snowflake);
    
    app.ticker.add(function fall() {
      snowflake.y += 2;
      snowflake.x += Math.sin(snowflake.y * 0.01) * 0.5;
      
      if (snowflake.y > app.canvas.height) {
        snowflake.y = -10;
        snowflake.x = Math.random() * app.canvas.width;
      }
    });
  }
}

function createSandstormEffect() {
  for (let i = 0; i < 40; i++) {
    const sand = new PIXI.Graphics();
    sand.rect(0, 0, Math.random() * 2 + 1, 1);
    sand.fill(0xdeb887);
    sand.x = Math.random() * app.canvas.width;
    sand.y = Math.random() * app.canvas.height;
    sand.alpha = 0.4;
    container.addChild(sand);
    
    app.ticker.add(function blow() {
      sand.x += 4 + Math.random() * 2;
      sand.y += (Math.random() - 0.5) * 2;
      
      if (sand.x > app.canvas.width) {
        sand.x = -10;
        sand.y = Math.random() * app.canvas.height;
      }
    });
  }
}

// Export the original function as well for backwards compatibility
export { mountAdvancedEffectsOverlay as mountEffectsOverlay, playEnhancedHitEffect as playHitEffect };