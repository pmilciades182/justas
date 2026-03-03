// ══════════════════════════════════════
// ABILITIES SYSTEM — Manejo de barra inferior y cooldowns
// ══════════════════════════════════════

export function initAbilities() {
  const buttons = document.querySelectorAll('.ability-btn');
  buttons.forEach(btn => {
    // Reset any previous cooldowns
    btn.classList.remove('cooldown');
    
    // Remove old listeners to avoid duplicates
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', (e) => {
      if (newBtn.classList.contains('cooldown')) return;

      // Get button color for particles BEFORE adding cooldown class (to avoid grayscale)
      const color = getComputedStyle(newBtn).borderTopColor;
      
      // Start cooldown
      newBtn.classList.add('cooldown');
      
      spawnButtonParticles(e.clientX, e.clientY, color);

      // Remove cooldown after 3 seconds
      setTimeout(() => {
        newBtn.classList.remove('cooldown');
      }, 3000);

      console.log(`Ability used: ${newBtn.id}`);
    });
  });
}

function spawnButtonParticles(x, y, color) {
  const container = document.getElementById('app');
  const count = 45; // Tripled from 15 (approx 12 before)
  
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 12; // Increased speed
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = 4 + Math.random() * 8; // Varied and larger sizes
    
    // Position relative to #app
    const rect = container.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    Object.assign(p.style, {
      position: 'absolute',
      left: `${localX}px`,
      top: `${localY}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '100',
      boxShadow: `0 0 12px ${color}, 0 0 20px ${color}` // Enhanced double glow
    });

    container.appendChild(p);

    let life = 1;
    let curX = localX;
    let curY = localY;
    const gravity = 0.15; // Added gravity for more "weight"
    const decay = 0.015 + Math.random() * 0.02;

    const anim = () => {
      life -= decay;
      curX += vx;
      curY += vy + (1 - life) * gravity * 10; // Gravity effect
      
      p.style.opacity = life;
      p.style.transform = `translate(${curX - localX}px, ${curY - localY}px) scale(${life * 1.5})`;

      if (life > 0) {
        requestAnimationFrame(anim);
      } else {
        p.remove();
      }
    };
    requestAnimationFrame(anim);
  }
}
