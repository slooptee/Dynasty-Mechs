// SkinManager UI integration
import { SkinManager } from '../cosmetics/SkinManager.js';

export function mountCustomizationUI({ container, bots, skinManager }) {
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'bot-list';
  bots.forEach(bot => {
    const botDiv = document.createElement('div');
    botDiv.className = 'bot-customize';
    botDiv.textContent = bot.name;
    // HSL sliders
    ['h', 's', 'l'].forEach(key => {
      const label = document.createElement('label');
      label.textContent = key.toUpperCase();
      const input = document.createElement('input');
      input.type = 'range';
      input.min = key === 'h' ? 0 : 0;
      input.max = key === 'h' ? 360 : 100;
      input.value = skinManager.registry.get(bot.id)?.[key] ?? (key === 'h' ? 0 : 100);
      input.oninput = e => {
        const val = Number(e.target.value);
        const hsl = {
          h: key === 'h' ? val : skinManager.registry.get(bot.id)?.h ?? 0,
          s: key === 's' ? val : skinManager.registry.get(bot.id)?.s ?? 100,
          l: key === 'l' ? val : skinManager.registry.get(bot.id)?.l ?? 50
        };
        skinManager.setHSL(bot.id, hsl);
      };
      label.appendChild(input);
      botDiv.appendChild(label);
    });
    list.appendChild(botDiv);
  });
  container.appendChild(list);
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Back to Menu';
  closeBtn.onclick = () => container.style.display = 'none';
  container.appendChild(closeBtn);
}
