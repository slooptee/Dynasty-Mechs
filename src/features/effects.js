// PixiJS effects overlay for battle grid
import * as PIXI from 'pixi.js';

let app = null;
let container = null;

export function mountEffectsOverlay(parent) {
  if (app) return app;
  app = new PIXI.Application({
    width: 8 * 40,
    height: 6 * 40,
    transparent: true,
    antialias: true,
    autoStart: true
  });
  container = app.stage;
  app.view.style.position = 'absolute';
  app.view.style.top = '0';
  app.view.style.left = '0';
  app.view.style.pointerEvents = 'none';
  parent.appendChild(app.view);
  return app;
}

export function playHitEffect(x, y) {
  if (!app) return;
  const g = new PIXI.Graphics();
  g.beginFill(0xffff00, 0.7);
  g.drawCircle(0, 0, 18);
  g.endFill();
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
