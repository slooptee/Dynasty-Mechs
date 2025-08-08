export class SkinManager {
  constructor() {
    this.registry = new Map(); // botId -> {h, s, l, decals:[{id, url, x,y,scale,rot,z}]}
  }
  setHSL(botId, { h, s, l }) {
    const r = this._ensure(botId);
    if (h !== undefined) r.h = h;
    if (s !== undefined) r.s = s;
    if (l !== undefined) r.l = l;
    this._apply(botId);
  }
  addDecal(botId, decal) {
    const r = this._ensure(botId);
    r.decals.push({ z: 0, ...decal });
    r.decals.sort((a,b)=>a.z-b.z);
    this._apply(botId);
  }
  removeDecal(botId, id) {
    const r = this._ensure(botId);
    r.decals = r.decals.filter(d => d.id !== id);
    this._apply(botId);
  }
  _apply(botId) {
    if (typeof document === 'undefined') return;
    const el = document.querySelector(`[data-bot-id="${botId}"] .bot-body`);
    if (!el) return;
    const cfg = this.registry.get(botId);
    // HSL tint via CSS filter
    el.style.filter = `hue-rotate(${(cfg.h||0)}deg) saturate(${(cfg.s??100)/100}) brightness(${(cfg.l??50)/50})`;

    // Decals: create absolutely-positioned <img> inside bot element
    const model = el.closest('.bot').querySelector('.bot-model');
    if (!model) return;
    model.querySelectorAll('.decal-layer').forEach(n => n.remove());
    cfg.decals.forEach(d => {
      const img = document.createElement('img');
      img.src = d.url;
      img.className = 'decal-layer';
      img.style.position = 'absolute';
      img.style.left = (d.x||0)+'px';
      img.style.top = (d.y||0)+'px';
      img.style.transform = `translate(-50%,-50%) scale(${d.scale||1}) rotate(${d.rot||0}deg)`;
      img.style.pointerEvents = 'none';
      img.style.zIndex = 10 + (d.z||0);
      model.appendChild(img);
    });
  }
  _ensure(botId) {
    if (!this.registry.has(botId)) this.registry.set(botId, { h:0, s:100, l:50, decals:[] });
    return this.registry.get(botId);
  }
}
