/* ========== 1-tap fly - Game Logic ========== */

/* ========= CONFIG ========= */
const localImages = {
  circle: 'local/1.jpg',
  square: 'local/2.jpg',
  triangle: 'local/3.jpg',
  pentagon: 'local/4.jpg',
  hexagon: 'local/5.jpg',
  star: 'local/6.jpg',
  diamond: 'local/7.jpg',
  heart: 'local/8.jpg'
};

const difficultyConfig = {
  initialGap: 300,
  minGap: 200,
  shrinkPerSecond: 2.0,
  shrinkPerScore: 1.0,
  basePipeSpeed: 1.2,
  maxPipeSpeed: 3.0,
  speedIncreasePerScore: 0.05,
  basePipeSpacing: 380,
  minPipeSpacing: 280,
  spacingDecreasePerScore: 0.8
};

/* ========= SVG FALLBACKS ========= */
function svgToDataURL(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const fallback = {
  circle: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><circle cx='64' cy='64' r='44' fill='#ffe066' stroke='#000' stroke-width='4'/></svg>"),
  square: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect x='28' y='28' width='72' height='72' rx='8' fill='#ff6b6b' stroke='#000' stroke-width='4'/></svg>"),
  triangle: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><path d='M64 24 L28 100 L100 100 Z' fill='#4ecdc4' stroke='#000' stroke-width='4'/></svg>"),
  pentagon: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><path d='M64 20 L100 48 L85 90 L43 90 L28 48 Z' fill='#a29bfe' stroke='#000' stroke-width='4'/></svg>"),
  hexagon: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><path d='M64 20 L95 38 L95 74 L64 92 L33 74 L33 38 Z' fill='#fd79a8' stroke='#000' stroke-width='4'/></svg>"),
  star: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><path d='M64 20 L72 50 L104 50 L78 68 L88 98 L64 80 L40 98 L50 68 L24 50 L56 50 Z' fill='#ffeaa7' stroke='#000' stroke-width='4'/></svg>"),
  diamond: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><path d='M64 20 L100 64 L64 108 L28 64 Z' fill='#74b9ff' stroke='#000' stroke-width='4'/></svg>"),
  heart: svgToDataURL("<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><path d='M64 100 C 64 100, 30 70, 30 50 C 30 30, 50 30, 64 45 C 78 30, 98 30, 98 50 C 98 70, 64 100, 64 100 Z' fill='#ff7675' stroke='#000' stroke-width='4'/></svg>")
};

/* ========= SPRITE LOADING ========= */
const sprites = {
  circle: [new Image(), new Image()],
  square: [new Image(), new Image()],
  triangle: [new Image(), new Image()],
  pentagon: [new Image(), new Image()],
  hexagon: [new Image(), new Image()],
  star: [new Image(), new Image()],
  diamond: [new Image(), new Image()],
  heart: [new Image(), new Image()]
};

Object.keys(localImages).forEach(shape => {
  const path = localImages[shape];
  const img = new Image();
  img.onload = () => {
    sprites[shape][0] = img;
    sprites[shape][1] = img;
    if (player.shape === shape) updatePreview();
  };
  img.onerror = () => {
    sprites[shape][0].src = fallback[shape];
    sprites[shape][1].src = fallback[shape];
    if (player.shape === shape) updatePreview();
  };
  img.src = path;
});

/* ========= GAME CORE ========= */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const overlay = document.getElementById('overlay');
const scoreText = document.getElementById('scoreText');
const gapText = document.getElementById('gapText');
const speedText = document.getElementById('speedText');
const shapePreview = document.getElementById('shapePreview');
const coinText = document.getElementById('coinText');

function updateCoinDisplay() {
  if (coinText) coinText.textContent = totalCoins + sessionCoins;
}

let W = window.innerWidth, H = window.innerHeight;
canvas.width = W;
canvas.height = H;
const shapes = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'star', 'diamond', 'heart'];

const player = {
  x: 100,
  y: H / 2,
  radius: 36,
  vy: 0,
  gravity: 0.45,
  flapStrength: -9.2,
  shape: 'circle'
};

let score = 0;
let pipes = [];
const pipeWidth = 90;

// Coin system
let coins = [];
let sessionCoins = 0;
let totalCoins = 0;
const coinRadius = 18;
const coinSpawnChance = 0.4;

let gameRunning = false;
let gameOver = false;
let animTimer = 0;
let lastAnimTime = performance.now();
let gameStartTimestamp = null;

// Load saved coins
try {
  const saved = localStorage.getItem('flappyShapeCoins');
  if (saved) totalCoins = parseInt(saved) || 0;
} catch (e) {}

/* ========= BACKGROUND IMAGE ========= */
const bgImagePath = 'local/bg.jpg';
let bgImage = new Image();
let bgImageLoaded = false;
bgImage.onload = () => { bgImageLoaded = true; };
bgImage.onerror = () => { bgImageLoaded = false; };
bgImage.src = bgImagePath;

/* ========= AUDIO SYSTEM ========= */
const audioConfig = {
  bgMusic: 'local/sounds/bg-music.mp3',
  flapSound: 'local/sounds/flap.mp3',
  scoreSound: 'local/sounds/score.mp3',
  gameOverSound: 'local/sounds/gameover.mp3',
  coinSound: 'local/sounds/coin.mp3'
};

let isMuted = false;
const sounds = {
  bgMusic: new Audio(),
  flap: new Audio(),
  score: new Audio(),
  gameOver: new Audio(),
  coin: new Audio()
};

sounds.bgMusic.src = audioConfig.bgMusic;
sounds.bgMusic.loop = true;
sounds.bgMusic.volume = 0.3;
sounds.flap.src = audioConfig.flapSound;
sounds.flap.volume = 0.5;
sounds.score.src = audioConfig.scoreSound;
sounds.score.volume = 0.6;
sounds.gameOver.src = audioConfig.gameOverSound;
sounds.gameOver.volume = 0.7;
sounds.coin.src = audioConfig.coinSound;
sounds.coin.volume = 0.5;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency, duration, type = 'sine') {
  if (isMuted) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function playSound(soundName) {
  if (isMuted) return;
  const sound = sounds[soundName];
  if (sound && sound.src && sound.readyState >= 2) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } else {
    if (soundName === 'flap') playBeep(400, 0.1, 'square');
    else if (soundName === 'score') playBeep(800, 0.15, 'sine');
    else if (soundName === 'gameOver') playBeep(200, 0.3, 'sawtooth');
    else if (soundName === 'coin') playBeep(600, 0.12, 'sine');
  }
}

function toggleMute() {
  isMuted = !isMuted;
  const btn = document.getElementById('btnMute');
  if (btn) btn.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) {
    sounds.bgMusic.pause();
  } else {
    if (gameRunning) sounds.bgMusic.play().catch(() => {});
  }
}

/* ========= GAME FUNCTIONS ========= */
function updatePreview() {
  const img = sprites[player.shape][0];
  if (img && img.src) {
    shapePreview.style.backgroundImage = `url("${img.src}")`;
    shapePreview.style.backgroundSize = 'cover';
    shapePreview.style.backgroundPosition = 'center';
  }
}

function computeCurrentGap() {
  if (!gameStartTimestamp) return difficultyConfig.initialGap;
  const elapsed = (performance.now() - gameStartTimestamp) / 1000;
  let gap = difficultyConfig.initialGap - difficultyConfig.shrinkPerSecond * elapsed - difficultyConfig.shrinkPerScore * score;
  if (gap < difficultyConfig.minGap) gap = difficultyConfig.minGap;
  return Math.round(gap);
}

function computeCurrentPipeSpeed() {
  let speed = difficultyConfig.basePipeSpeed + score * difficultyConfig.speedIncreasePerScore;
  if (speed > difficultyConfig.maxPipeSpeed) speed = difficultyConfig.maxPipeSpeed;
  return parseFloat(speed.toFixed(3));
}

function computeCurrentSpacing() {
  let spacing = difficultyConfig.basePipeSpacing - score * difficultyConfig.spacingDecreasePerScore;
  if (spacing < difficultyConfig.minPipeSpacing) spacing = difficultyConfig.minPipeSpacing;
  return Math.round(spacing);
}

function updateDifficultyUI() {
  gapText.textContent = computeCurrentGap();
  speedText.textContent = computeCurrentPipeSpeed();
}

function spawnPipe(xOverride) {
  const gap = computeCurrentGap();
  const margin = 60;
  const gapY = margin + Math.random() * (H - 2 * margin - gap);
  const spawnX = typeof xOverride === 'number' ? xOverride : (W + 40);
  pipes.push({ x: spawnX, gapY, gapHeight: gap, passed: false });

  if (Math.random() < coinSpawnChance) {
    const coinY = gapY + gap / 2 + (Math.random() - 0.5) * (gap * 0.4);
    coins.push({ x: spawnX + pipeWidth / 2, y: coinY, collected: false, wobble: Math.random() * Math.PI * 2 });
  }
}

function flap() {
  if (gameOver) {
    location.reload();
    return;
  }
  if (!gameRunning) {
    gameRunning = true;
    overlay.style.display = 'none';
    gameStartTimestamp = performance.now();
    pipes.length = 0;
    coins.length = 0;
    sessionCoins = 0;
    updateCoinDisplay();
    const firstOffset = Math.max(350, Math.min(500, Math.floor(W * 0.5)));
    spawnPipe(player.x + firstOffset);
    spawnPipe(player.x + firstOffset + computeCurrentSpacing());
    if (!isMuted) sounds.bgMusic.play().catch(() => {});
  }
  player.vy = player.flapStrength;
  playSound('flap');
}

function randomShape() {
  let s;
  do s = shapes[Math.floor(Math.random() * shapes.length)];
  while (s === player.shape);
  return s;
}

function triggerGameOver() {
  if (gameOver) return;
  gameOver = true;
  gameRunning = false;
  overlay.style.display = 'flex';
  overlay.style.opacity = 1;
  document.getElementById('titleText').textContent = 'Game Over';
  const coinMsg = sessionCoins > 0 ? `<br>🪙 Koin: +${sessionCoins}` : '';
  document.getElementById('subText').innerHTML = `Skor kamu: ${score}${coinMsg}<br>TAP di mana saja untuk restart`;
  playSound('gameOver');
  sounds.bgMusic.pause();
  sounds.bgMusic.currentTime = 0;

  if (sessionCoins > 0) {
    totalCoins += sessionCoins;
    try {
      localStorage.setItem('flappyShapeCoins', totalCoins.toString());
    } catch (e) {}
    updateCoinDisplay();
  }
}

function getGroundHeight() {
  return Math.max(60, Math.floor(H * 0.06));
}

/* ========= MAIN UPDATE LOOP ========= */
function update(now) {
  const dt = now - lastAnimTime;
  lastAnimTime = now;
  animTimer += dt;

  if (gameRunning && !gameOver) {
    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y - player.radius < 0 || player.y + player.radius > H - getGroundHeight()) {
      triggerGameOver();
    }

    const currentSpacing = computeCurrentSpacing();
    if (pipes.length === 0 || (W - pipes[pipes.length - 1].x) >= currentSpacing) {
      spawnPipe();
    }

    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.x -= computeCurrentPipeSpeed();
      c.wobble += 0.08;

      if (!c.collected) {
        const dx = player.x - c.x;
        const dy = player.y - c.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + coinRadius) {
          c.collected = true;
          sessionCoins++;
          updateCoinDisplay();
          playSound('coin');
        }
      }

      if (c.x < -50) coins.splice(i, 1);
    }

    const currentSpeed = computeCurrentPipeSpeed();
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= currentSpeed;

      const withinX = (player.x + player.radius > p.x) && (player.x - player.radius < p.x + pipeWidth);
      if (withinX) {
        const inGap = (player.y - player.radius >= p.gapY) && (player.y + player.radius <= p.gapY + p.gapHeight);
        if (!inGap) {
          triggerGameOver();
        } else {
          if (!p.passed) {
            p.passed = true;
            score++;
            scoreText.textContent = score;
            playSound('score');
            player.shape = randomShape();
            updatePreview();
          }
        }
      }

      if (p.x + pipeWidth < -50) pipes.splice(i, 1);
    }

    updateDifficultyUI();
  }

  draw();
  requestAnimationFrame(update);
}

/* ========= DRAWING FUNCTIONS ========= */
function drawBackground() {
  const groundHeight = Math.max(60, Math.floor(H * 0.06));

  if (bgImageLoaded) {
    const imgW = bgImage.naturalWidth || bgImage.width;
    const imgH = bgImage.naturalHeight || bgImage.height;
    const scale = Math.max(W / imgW, H / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (W - drawW) / 2;
    const dy = (H - drawH) / 2;
    ctx.drawImage(bgImage, dx, dy, drawW, drawH);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#4d9fff');
    grad.addColorStop(1, '#88ddff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = "#27ae60";
  ctx.fillRect(0, H - groundHeight, W, groundHeight);
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(0, H - groundHeight + 5, W, groundHeight - 5);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  const cloudSpeed = 0.02;
  const clouds = [
    { baseX: 0.1, y: 0.15, circles: [{ x: 0, y: 0, r: 35 }, { x: 30, y: -8, r: 28 }, { x: -25, y: -5, r: 30 }, { x: 50, y: 5, r: 25 }, { x: -10, y: 12, r: 22 }] },
    { baseX: 0.4, y: 0.25, circles: [{ x: 0, y: 0, r: 40 }, { x: 35, y: -10, r: 32 }, { x: -30, y: -8, r: 35 }, { x: 60, y: 8, r: 28 }, { x: -15, y: 15, r: 25 }] },
    { baseX: 0.7, y: 0.12, circles: [{ x: 0, y: 0, r: 32 }, { x: 28, y: -6, r: 26 }, { x: -22, y: -4, r: 28 }, { x: 45, y: 6, r: 22 }, { x: -12, y: 10, r: 20 }] }
  ];

  clouds.forEach(cloud => {
    const offsetX = (Date.now() * cloudSpeed + cloud.baseX * W * 3) % (W + 200) - 100;
    const cloudY = cloud.y * H;
    ctx.beginPath();
    cloud.circles.forEach(c => {
      ctx.moveTo(offsetX + c.x + c.r, cloudY + c.y);
      ctx.arc(offsetX + c.x, cloudY + c.y, c.r, 0, Math.PI * 2);
    });
    ctx.fill();
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  const frameIndex = Math.floor((animTimer / 140) % 2);
  const img = sprites[player.shape][frameIndex];
  const size = player.radius * 2;

  if (img && img.complete && img.naturalWidth !== 0) {
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  } else {
    const colors = { circle: '#ffe066', square: '#ff6b6b', triangle: '#4ecdc4', pentagon: '#a29bfe', hexagon: '#fd79a8', star: '#ffeaa7', diamond: '#74b9ff', heart: '#ff7675' };
    ctx.fillStyle = colors[player.shape] || '#ffe066';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    const r = player.radius;

    if (player.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (player.shape === 'square') {
      const s = r * 1.6;
      ctx.beginPath();
      ctx.rect(-s / 2, -s / 2, s, s);
      ctx.fill();
      ctx.stroke();
    } else if (player.shape === 'triangle') {
      const s = r * 2;
      ctx.beginPath();
      ctx.moveTo(-s / 2, s / 2);
      ctx.lineTo(0, -s / 2);
      ctx.lineTo(s / 2, s / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (player.shape === 'pentagon') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (player.shape === 'hexagon') {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (player.shape === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = i * Math.PI / 5 - Math.PI / 2;
        const d = i % 2 ? r * 0.4 : r;
        ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (player.shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (player.shape === 'heart') {
      ctx.beginPath();
      ctx.moveTo(0, r * 0.3);
      ctx.bezierCurveTo(-r, -r * 0.3, -r, -r * 0.8, 0, -r * 0.2);
      ctx.bezierCurveTo(r, -r * 0.8, r, -r * 0.3, 0, r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawPipe(p) {
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(p.x, 0, pipeWidth, p.gapY);
  ctx.fillRect(p.x, p.gapY + p.gapHeight, pipeWidth, H - (p.gapY + p.gapHeight));
  ctx.save();
  ctx.translate(p.x + pipeWidth / 2, p.gapY + p.gapHeight / 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(-pipeWidth / 2, -p.gapHeight / 2, pipeWidth, p.gapHeight);
  ctx.restore();
}

function drawCoin(c) {
  if (c.collected) return;
  ctx.save();
  ctx.translate(c.x, c.y + Math.sin(c.wobble) * 5);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coinRadius);
  gradient.addColorStop(0, '#ffd700');
  gradient.addColorStop(0.7, '#ffed4e');
  gradient.addColorStop(1, '#daa520');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, coinRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#daa520';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = '#ffed4e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, coinRadius * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  pipes.forEach(drawPipe);
  coins.forEach(drawCoin);
  drawPlayer();
}

/* ========= INPUT HANDLERS ========= */
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); flap(); }
  else if (e.code === 'KeyM') { toggleMute(); }
  else if (e.code === 'Digit1') { player.shape = 'circle'; updatePreview(); }
  else if (e.code === 'Digit2') { player.shape = 'square'; updatePreview(); }
  else if (e.code === 'Digit3') { player.shape = 'triangle'; updatePreview(); }
  else if (e.code === 'Digit4') { player.shape = 'pentagon'; updatePreview(); }
  else if (e.code === 'Digit5') { player.shape = 'hexagon'; updatePreview(); }
  else if (e.code === 'Digit6') { player.shape = 'star'; updatePreview(); }
  else if (e.code === 'Digit7') { player.shape = 'diamond'; updatePreview(); }
  else if (e.code === 'Digit8') { player.shape = 'heart'; updatePreview(); }
});

document.addEventListener('mousedown', flap);
document.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, { passive: false });

/* ========= MOBILE CONTROLS ========= */
const mobileControls = document.getElementById('mobileControls');
const btnFlap = document.getElementById('btnFlap');
const btnMute = document.getElementById('btnMute');
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn4');
const btn5 = document.getElementById('btn5');
const btn6 = document.getElementById('btn6');
const btn7 = document.getElementById('btn7');
const btn8 = document.getElementById('btn8');

btnFlap.addEventListener('click', flap);
if (btnMute) btnMute.addEventListener('click', toggleMute);
btn1.addEventListener('click', () => { player.shape = 'circle'; updatePreview(); });
btn2.addEventListener('click', () => { player.shape = 'square'; updatePreview(); });
btn3.addEventListener('click', () => { player.shape = 'triangle'; updatePreview(); });
btn4.addEventListener('click', () => { player.shape = 'pentagon'; updatePreview(); });
btn5.addEventListener('click', () => { player.shape = 'hexagon'; updatePreview(); });
btn6.addEventListener('click', () => { player.shape = 'star'; updatePreview(); });
btn7.addEventListener('click', () => { player.shape = 'diamond'; updatePreview(); });
btn8.addEventListener('click', () => { player.shape = 'heart'; updatePreview(); });

btnFlap.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, { passive: false });
btn1.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'circle'; updatePreview(); }, { passive: false });
btn2.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'square'; updatePreview(); }, { passive: false });
btn3.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'triangle'; updatePreview(); }, { passive: false });
btn4.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'pentagon'; updatePreview(); }, { passive: false });
btn5.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'hexagon'; updatePreview(); }, { passive: false });
btn6.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'star'; updatePreview(); }, { passive: false });
btn7.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'diamond'; updatePreview(); }, { passive: false });
btn8.addEventListener('touchstart', (e) => { e.preventDefault(); player.shape = 'heart'; updatePreview(); }, { passive: false });

/* ========= RESPONSIVE & INITIALIZATION ========= */
function adaptUI() {
  const isMobile = window.innerWidth <= 480 || ('ontouchstart' in window && window.innerWidth < 768);
  mobileControls.style.display = isMobile ? 'flex' : 'none';
}

function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  player.y = Math.min(Math.max(player.radius + 5, player.y), H - player.radius - 5);
}

window.addEventListener('resize', () => { resizeCanvas(); adaptUI(); });
resizeCanvas();

updatePreview();
updateCoinDisplay();
requestAnimationFrame(update);
