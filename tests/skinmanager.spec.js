import { describe, it, expect } from 'vitest';
import { SkinManager } from '../src/cosmetics/SkinManager.js';

describe('SkinManager', () => {
  it('stores HSL per bot', () => {
    const sm = new SkinManager();
    sm.setHSL('bot-1', { h: 120, s: 80, l: 60 });
    const cfg = sm.registry.get('bot-1');
    expect(cfg.h).toBe(120);
    expect(cfg.s).toBe(80);
    expect(cfg.l).toBe(60);
  });
});
