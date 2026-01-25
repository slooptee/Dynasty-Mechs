// PixiJS effects overlay for battle grid
import * as PIXI from 'pixi.js';

let app = null;
let container = null;

export async function mountEffectsOverlay(parent) {
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
  app.canvas.style.position = 'absolute';
  app.canvas.style.top = '0';
  app.canvas.style.left = '0';
  app.canvas.style.pointerEvents = 'none';
  parent.appendChild(app.canvas);
  return app;
}

export function playHitEffect(x, y) {
  if (!app) return;
  const g = new PIXI.Graphics();
  g.circle(0, 0, 18);
  g.fill(0xffff00);
  g.alpha = 0.7;
  g.x = (x - 1) * 40 + 20;
  g.y = (y - 1) * 40 + 20;
  container.addChild(g);
  // Animate fade out
  app.ticker.add(function fade() {
    g.alpha -= 0.08;
    if (g.alpha <= 0) {
      container.removeChild(g);
      app.ticker.remove(fade);
    }
  });
}
