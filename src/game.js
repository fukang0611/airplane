(() => {
  "use strict";

  const W = 540;
  const H = 960;
  const TAU = Math.PI * 2;
  const canvas = document.querySelector("#gameCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    armorFill: document.querySelector("#armorFill"),
    armorText: document.querySelector("#armorText"),
    comboText: document.querySelector("#comboText"),
    scoreText: document.querySelector("#scoreText"),
    bombRow: document.querySelector("#bombRow"),
    alert: document.querySelector("#alertBanner"),
    overlay: document.querySelector("#gameOverlay"),
    overlayContent: document.querySelector("#overlayContent"),
    deploy: document.querySelector("#deployButton"),
    deployLabel: document.querySelector("#deployLabel"),
    pause: document.querySelector("#pauseButton"),
    mobileSpecial: document.querySelector("#mobileSpecial"),
    railScore: document.querySelector("#railScore"),
    bestScore: document.querySelector("#bestScore"),
    railWave: document.querySelector("#railWave"),
    railElims: document.querySelector("#railElims"),
    railBombs: document.querySelector("#railBombs"),
    range: document.querySelector("#rangeReadout"),
    weaponName: document.querySelector("#weaponName"),
    weaponDetail: document.querySelector("#weaponDetail"),
    weaponLevel: document.querySelector("#weaponLevel"),
    weaponSwatch: document.querySelector("#weaponSwatch"),
    footerWeapon: document.querySelector("#footerWeapon"),
    footerWave: document.querySelector("#footerWave"),
  };

  const weaponDefs = {
    vulcan: { name: "VULCAN", detail: "TWIN CANNON", color: "#69f7d0", rate: 0.105, pickup: "V" },
    spread: { name: "SPREAD", detail: "FAN ARRAY", color: "#ffd665", rate: 0.19, pickup: "S" },
    laser: { name: "LASER", detail: "PHOTON RAY", color: "#73d6ff", rate: 0.075, pickup: "L" },
    plasma: { name: "PLASMA", detail: "ARC ORBS", color: "#ff9177", rate: 0.27, pickup: "P" },
    rail: { name: "RAIL", detail: "PIERCE SHOT", color: "#f4edf6", rate: 0.23, pickup: "R" },
    homing: { name: "HOMING", detail: "SEEKER POD", color: "#de94ff", rate: 0.3, pickup: "H" },
  };
  const weaponKeys = Object.keys(weaponDefs);
  const enemyDefs = {
    scout: { hp: 26, r: 17, speed: 118, score: 100, color: "#ff806a" },
    fighter: { hp: 50, r: 21, speed: 90, score: 180, color: "#ffc766" },
    dart: { hp: 39, r: 15, speed: 175, score: 160, color: "#72ddf5" },
    bomber: { hp: 120, r: 31, speed: 53, score: 370, color: "#ff6680" },
    ace: { hp: 195, r: 26, speed: 74, score: 510, color: "#c695ff" },
    carrier: { hp: 1400, r: 73, speed: 22, score: 4500, color: "#ffcd67" },
  };

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    score: 0,
    best: loadBest(),
    elapsed: 0,
    wave: 1,
    eliminations: 0,
    combo: 1,
    comboTimer: 0,
    spawnTimer: 0.75,
    weaponKillCounter: 0,
    nextWeaponDrop: 20,
    bossTimer: 48,
    alertTimer: 0,
    alertType: "",
    shake: 0,
    flash: 0,
    keys: new Set(),
    pointer: { active: false, id: null, lastX: 0, lastY: 0, deltaX: 0, deltaY: 0 },
    stars: [],
    streaks: [],
    bullets: [],
    enemyBullets: [],
    enemies: [],
    pickups: [],
    particles: [],
    rings: [],
    floating: [],
    player: null,
    audio: null,
    muted: false,
  };

  let dpr = 1;
  let previousTime = performance.now();
  let animationId = 0;

  function loadBest() {
    try { return Number(localStorage.getItem("skybreaker-best") || 0); } catch (_) { return 0; }
  }

  function storeBest() {
    try { localStorage.setItem("skybreaker-best", String(state.best)); } catch (_) { /* Storage is optional. */ }
  }

  function random(min, max) { return min + Math.random() * (max - min); }
  function choose(items) { return items[Math.floor(Math.random() * items.length)]; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function pad(value, count = 6) { return String(Math.max(0, Math.floor(value))).padStart(count, "0"); }
  function roman(level) { return ["I", "II", "III"][Math.max(0, level - 1)] || "III"; }

  function initBackdrop() {
    state.stars = Array.from({ length: 112 }, () => ({
      x: random(0, W), y: random(0, H), z: random(0.25, 1), size: random(0.6, 2), hue: choose(["#75e7d1", "#e6f6d4", "#ffd878", "#7ad2ed"]),
    }));
    state.streaks = Array.from({ length: 14 }, () => ({ x: random(0, W), y: random(0, H), len: random(8, 26), speed: random(120, 290) }));
  }

  function fitCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makePlayer() {
    return {
      x: W / 2,
      y: H - 120,
      r: 20,
      hp: 100,
      lives: 3,
      weapon: "vulcan",
      weaponLevel: 1,
      bombs: 3,
      fireCooldown: 0.1,
      specialCooldown: 0,
      invulnerable: 1.5,
      tilt: 0,
      engine: 0,
    };
  }

  function resetPointerInput() {
    Object.assign(state.pointer, {
      active: false,
      id: null,
      lastX: 0,
      lastY: 0,
      deltaX: 0,
      deltaY: 0,
    });
  }

  function resetGame() {
    state.score = 0;
    state.elapsed = 0;
    state.wave = 1;
    state.eliminations = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.spawnTimer = 1.05;
    state.weaponKillCounter = 0;
    state.nextWeaponDrop = Math.floor(random(17, 24));
    state.bossTimer = 44;
    state.alertTimer = 0;
    state.shake = 0;
    state.flash = 0;
    state.bullets = [];
    state.enemyBullets = [];
    state.enemies = [];
    state.pickups = [];
    state.particles = [];
    state.rings = [];
    state.floating = [];
    state.player = makePlayer();
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    state.keys.clear();
    resetPointerInput();
    initBackdrop();
    setAlert("AIRSPACE ENGAGED", "bright", 1.65);
    hideOverlay();
    syncUi();
  }

  function startGame() {
    resumeAudio();
    resetGame();
    tone("start");
  }

  function pauseGame() {
    if (!state.running || state.gameOver) return;
    state.paused = !state.paused;
    ui.pause.textContent = state.paused ? ">" : "II";
    if (state.paused) {
      resetPointerInput();
      showOverlay("PAUSED", "HOLDING PATTERN", "继续", "resume");
    } else {
      hideOverlay();
      previousTime = performance.now();
      resumeAudio();
    }
  }

  function showOverlay(title, subtitle, buttonLabel, mode) {
    ui.overlayContent.innerHTML = `
      <span class="overlay-index">${mode === "over" ? "SORTIE COMPLETE" : mode === "resume" ? "HOLD POSITION" : "OUTBOUND // 09"}</span>
      <h1>${title.replace(" ", "<br />")}</h1>
      <p>${subtitle}</p>
      <button class="deploy-button" id="overlayAction" type="button"><span class="deploy-icon">${mode === "over" ? "↻" : ">"}</span><span>${buttonLabel}</span></button>
      <div class="key-glyphs"><span>←</span><span>↑</span><span>↓</span><span>→</span><span class="space-key">SPACE</span></div>
    `;
    ui.overlay.setAttribute("aria-hidden", "false");
    ui.overlay.classList.add("is-visible");
    const action = document.querySelector("#overlayAction");
    action.addEventListener("click", () => {
      if (mode === "resume") pauseGame(); else startGame();
    }, { once: true });
  }

  function hideOverlay() {
    ui.overlay.classList.remove("is-visible");
    ui.overlay.setAttribute("aria-hidden", "true");
  }

  function endGame() {
    state.running = false;
    state.gameOver = true;
    resetPointerInput();
    if (state.score > state.best) {
      state.best = state.score;
      storeBest();
      setAlert("NEW FLIGHT RECORD", "bright", 2.8);
    }
    tone("fail");
    showOverlay("MISSION FAILED", `SCORE ${pad(state.score)}`, "再来一次", "over");
    syncUi();
  }

  function setAlert(message, type = "", duration = 1.2) {
    state.alertTimer = duration;
    state.alertType = type;
    ui.alert.textContent = message;
    ui.alert.className = `alert-banner is-visible ${type}`;
  }

  function clearAlert() {
    ui.alert.className = "alert-banner";
    ui.alert.textContent = "";
  }

  function spawnEnemy(forceType) {
    const difficulty = 1 + Math.floor(state.elapsed / 28) * 0.13;
    let type = forceType;
    if (!type) {
      const roll = Math.random();
      if (state.elapsed < 12) type = roll < 0.7 ? "scout" : "dart";
      else if (roll < 0.37) type = "scout";
      else if (roll < 0.61) type = "fighter";
      else if (roll < 0.78) type = "dart";
      else if (roll < 0.93) type = "bomber";
      else type = "ace";
    }
    const def = enemyDefs[type];
    const x = type === "carrier" ? W / 2 : random(48, W - 48);
    const enemy = {
      type,
      x,
      y: type === "carrier" ? -105 : -random(35, 105),
      baseX: x,
      r: def.r,
      hp: Math.round(def.hp * difficulty),
      maxHp: Math.round(def.hp * difficulty),
      speed: def.speed * (1 + Math.min(0.2, state.elapsed / 280)),
      score: def.score,
      color: def.color,
      phase: random(0, TAU),
      age: 0,
      shoot: random(1.35, 2.5),
      turn: random(-1, 1),
      drift: random(30, 75),
      dead: false,
      damaged: 0,
    };
    state.enemies.push(enemy);
  }

  function spawnPickup(x, y, kind, weapon) {
    const actualKind = kind || (Math.random() < 0.74 ? "weapon" : Math.random() < 0.6 ? "bomb" : "repair");
    const selectedWeapon = weapon || choose(weaponKeys);
    state.pickups.push({
      x, y, kind: actualKind, weapon: selectedWeapon, r: 18, life: 12, spin: random(0, TAU), vy: random(50, 74), dead: false,
    });
  }

  function fireEnemy(enemy) {
    if (!state.player || enemy.y < 20) return;
    const bulletCap = Math.floor(10 + Math.min(32, state.elapsed * 0.35));
    if (state.enemyBullets.length >= bulletCap) return;
    const target = state.player;
    const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const create = (offset, speed, damage, r = 5, color = "#ff9a72") => {
      const a = angle + offset;
      state.enemyBullets.push({ x: enemy.x, y: enemy.y + enemy.r * 0.4, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r, damage, color, life: 7, dead: false });
    };
    if (enemy.type === "scout") create(0, 225, 10, 4, "#ff8e76");
    if (enemy.type === "fighter") { create(-0.14, 190, 9, 4, "#ffd171"); create(0.14, 190, 9, 4, "#ffd171"); }
    if (enemy.type === "dart") create(0, 285, 12, 4, "#77dcee");
    if (enemy.type === "bomber") [-0.35, -0.17, 0, 0.17, 0.35].forEach((offset) => create(offset, 160, 12, 5, "#ff7893"));
    if (enemy.type === "ace") [-0.32, -0.16, 0, 0.16, 0.32].forEach((offset) => create(offset, 210, 12, 5, "#d49aff"));
    if (enemy.type === "carrier") {
      [-0.47, -0.24, 0, 0.24, 0.47].forEach((offset) => create(offset, 178, 14, 6, "#ffd665"));
      state.enemyBullets.push({ x: enemy.x - 48, y: enemy.y + 40, vx: -74, vy: 220, r: 6, damage: 14, color: "#ff8c6d", life: 6, dead: false });
      state.enemyBullets.push({ x: enemy.x + 48, y: enemy.y + 40, vx: 74, vy: 220, r: 6, damage: 14, color: "#ff8c6d", life: 6, dead: false });
    }
    tone("enemy", 0.035);
  }

  function fireWeapon() {
    const player = state.player;
    const def = weaponDefs[player.weapon];
    const level = player.weaponLevel;
    const add = (x, y, vx, vy, opts = {}) => {
      state.bullets.push({ x, y, vx, vy, r: 4, damage: 12, color: def.color, life: 2.2, pierce: 1, hits: 0, type: player.weapon, dead: false, ...opts });
    };
    if (player.weapon === "vulcan") {
      add(player.x - 12, player.y - 20, -18, -590, { damage: 11 + level * 4, r: 4 });
      add(player.x + 12, player.y - 20, 18, -590, { damage: 11 + level * 4, r: 4 });
      if (level >= 2) add(player.x, player.y - 29, 0, -630, { damage: 10 + level * 3, r: 3.5 });
      if (level >= 3) { add(player.x - 23, player.y - 10, -70, -560, { damage: 11, r: 3 }); add(player.x + 23, player.y - 10, 70, -560, { damage: 11, r: 3 }); }
    }
    if (player.weapon === "spread") {
      const count = level === 1 ? 3 : level === 2 ? 5 : 7;
      for (let i = 0; i < count; i += 1) {
        const offset = (i - (count - 1) / 2) * 0.12;
        add(player.x, player.y - 24, Math.sin(offset) * 480, -Math.cos(offset) * 480, { damage: 11 + level * 3, r: 4, pierce: 1 });
      }
    }
    if (player.weapon === "laser") {
      const lanes = level === 1 ? [-8, 8] : level === 2 ? [-14, 0, 14] : [-20, -7, 7, 20];
      lanes.forEach((lane) => add(player.x + lane, player.y - 28, 0, -770, { damage: 8 + level * 2, r: 3.5, pierce: 3 + level, laser: true, life: 1.35 }));
    }
    if (player.weapon === "plasma") {
      const lanes = level === 1 ? [0] : level === 2 ? [-11, 11] : [-18, 0, 18];
      lanes.forEach((lane) => add(player.x + lane, player.y - 28, lane * 1.7, -365, { damage: 29 + level * 8, r: 9, pierce: 1, plasma: true, life: 2.7 }));
    }
    if (player.weapon === "rail") {
      add(player.x, player.y - 35, 0, -780, { damage: 54 + level * 13, r: 8 + level, pierce: 5 + level, rail: true, life: 1.45 });
      if (level >= 2) {
        add(player.x - 21, player.y - 18, 0, -700, { damage: 23 + level * 6, r: 5, pierce: 3, rail: true });
        add(player.x + 21, player.y - 18, 0, -700, { damage: 23 + level * 6, r: 5, pierce: 3, rail: true });
      }
    }
    if (player.weapon === "homing") {
      const lanes = level === 1 ? [-13, 13] : level === 2 ? [-20, 0, 20] : [-27, -9, 9, 27];
      lanes.forEach((lane) => add(player.x + lane, player.y - 15, lane * 2.4, -265, { damage: 22 + level * 5, r: 6, pierce: 1, homing: true, life: 3.5, turnRate: 3.5 }));
    }
    tone(player.weapon === "rail" ? "rail" : "shoot", player.weapon === "laser" ? 0.018 : 0.026);
  }

  function explodePlasma(bullet) {
    state.rings.push({ x: bullet.x, y: bullet.y, r: 5, max: 72, life: 0.34, maxLife: 0.34, color: bullet.color, damage: bullet.damage * 0.52, hits: new Set() });
    burst(bullet.x, bullet.y, bullet.color, 13, 145, 0.46);
  }

  function triggerSpecial() {
    const player = state.player;
    if (!state.running || state.paused || !player || player.bombs <= 0 || player.specialCooldown > 0) return;
    player.bombs -= 1;
    player.specialCooldown = 1.5;
    state.rings.push({ x: player.x, y: player.y, r: 8, max: 700, life: 0.9, maxLife: 0.9, color: "#ffd665", damage: 145, hits: new Set(), special: true });
    state.enemyBullets.forEach((bullet) => { bullet.dead = true; burst(bullet.x, bullet.y, "#ffd665", 4, 72, 0.25); });
    state.flash = 0.35;
    state.shake = 8;
    setAlert("ION BURST", "bright", 1.25);
    tone("special");
    syncUi();
  }

  function updatePlayer(dt) {
    const player = state.player;
    const left = state.keys.has("ArrowLeft") || state.keys.has("KeyA");
    const right = state.keys.has("ArrowRight") || state.keys.has("KeyD");
    const up = state.keys.has("ArrowUp") || state.keys.has("KeyW");
    const down = state.keys.has("ArrowDown") || state.keys.has("KeyS");
    const keyX = (right ? 1 : 0) - (left ? 1 : 0);
    const keyY = (down ? 1 : 0) - (up ? 1 : 0);
    const keyMagnitude = Math.hypot(keyX, keyY) || 1;
    const speed = 315;
    const pointerX = state.pointer.deltaX;
    const pointerY = state.pointer.deltaY;
    state.pointer.deltaX = 0;
    state.pointer.deltaY = 0;

    const previousX = player.x;
    player.x = clamp(player.x + (keyX / keyMagnitude) * speed * dt + pointerX, 28, W - 28);
    player.y = clamp(player.y + (keyY / keyMagnitude) * speed * dt + pointerY, 120, H - 36);
    const tiltDirection = Math.abs(pointerX) > 0.01
      ? clamp((player.x - previousX) / 18, -1, 1)
      : keyX / keyMagnitude;
    player.tilt += (tiltDirection * 0.44 - player.tilt) * Math.min(1, dt * 14);
    player.engine += dt * 20;
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.specialCooldown = Math.max(0, player.specialCooldown - dt);
    player.fireCooldown -= dt;
    const fireRate = weaponDefs[player.weapon].rate * (1 - (player.weaponLevel - 1) * 0.07);
    while (player.fireCooldown <= 0) {
      fireWeapon();
      player.fireCooldown += fireRate;
    }
  }

  function updateEnemies(dt) {
    for (const enemy of state.enemies) {
      enemy.age += dt;
      enemy.damaged = Math.max(0, enemy.damaged - dt);
      if (enemy.type === "scout") enemy.x = enemy.baseX + Math.sin(enemy.age * 2.1 + enemy.phase) * 64;
      if (enemy.type === "fighter") enemy.x = enemy.baseX + Math.sin(enemy.age * 1.3 + enemy.phase) * 104;
      if (enemy.type === "dart") enemy.x += Math.sin(enemy.age * 7 + enemy.phase) * 150 * dt;
      if (enemy.type === "bomber") enemy.x = enemy.baseX + Math.sin(enemy.age * 0.75 + enemy.phase) * 88;
      if (enemy.type === "ace") {
        enemy.x = clamp(enemy.x + Math.sin(enemy.age * 2.8 + enemy.phase) * 115 * dt, 30, W - 30);
      }
      if (enemy.type === "carrier") enemy.x = W / 2 + Math.sin(enemy.age * 0.5) * 85;
      enemy.y += enemy.speed * dt;
      enemy.shoot -= dt;
      if (enemy.shoot <= 0 && enemy.y > 40 && enemy.y < H - 110) {
        fireEnemy(enemy);
        const cadenceByType = { scout: 3, fighter: 2.45, dart: 2.7, bomber: 2.3, ace: 1.35, carrier: 1.75 };
        const earlyPressure = clamp(1.36 - state.elapsed / 90, 1, 1.36);
        enemy.shoot += cadenceByType[enemy.type] * earlyPressure * random(0.9, 1.14);
      }
      if (enemy.y > H + 115 || enemy.x < -120 || enemy.x > W + 120) enemy.dead = true;
      if (state.player && !enemy.dead && distance(enemy, state.player) < enemy.r + state.player.r - 4) {
        damagePlayer(enemy.type === "carrier" ? 42 : 27);
        damageEnemy(enemy, enemy.hp + 1, true);
      }
    }
  }

  function updateBullets(dt) {
    for (const bullet of state.bullets) {
      bullet.life -= dt;
      if (bullet.homing) {
        let nearest = null;
        let nearestDistance = Infinity;
        for (const enemy of state.enemies) {
          if (enemy.dead) continue;
          const d = distance(bullet, enemy);
          if (d < nearestDistance) { nearestDistance = d; nearest = enemy; }
        }
        if (nearest) {
          const desired = Math.atan2(nearest.y - bullet.y, nearest.x - bullet.x);
          const current = Math.atan2(bullet.vy, bullet.vx);
          let turn = (desired - current + Math.PI * 3) % TAU - Math.PI;
          turn = clamp(turn, -bullet.turnRate * dt, bullet.turnRate * dt);
          const speed = Math.hypot(bullet.vx, bullet.vy);
          bullet.vx = Math.cos(current + turn) * speed;
          bullet.vy = Math.sin(current + turn) * speed;
        }
      }
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      if (bullet.life <= 0 || bullet.y < -100 || bullet.x < -100 || bullet.x > W + 100) bullet.dead = true;
      if (bullet.dead) continue;
      for (const enemy of state.enemies) {
        if (enemy.dead || bullet.dead || bullet.hitIds?.has(enemy)) continue;
        if (distance(bullet, enemy) < bullet.r + enemy.r) {
          bullet.hitIds ||= new Set();
          bullet.hitIds.add(enemy);
          damageEnemy(enemy, bullet.damage);
          bullet.hits += 1;
          if (bullet.plasma) { explodePlasma(bullet); bullet.dead = true; }
          else if (bullet.hits >= bullet.pierce) bullet.dead = true;
          else { burst(bullet.x, bullet.y, bullet.color, 3, 65, 0.18); }
        }
      }
    }
    for (const bullet of state.enemyBullets) {
      bullet.life -= dt;
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      if (bullet.life <= 0 || bullet.y > H + 60 || bullet.x < -60 || bullet.x > W + 60) bullet.dead = true;
      if (!bullet.dead && state.player && distance(bullet, state.player) < bullet.r + state.player.r - 3) {
        bullet.dead = true;
        damagePlayer(bullet.damage);
      }
    }
  }

  function updateRings(dt) {
    for (const ring of state.rings) {
      ring.life -= dt;
      const progress = 1 - ring.life / ring.maxLife;
      ring.r = ring.max * (1 - (1 - progress) * (1 - progress));
      for (const enemy of state.enemies) {
        if (enemy.dead || ring.hits.has(enemy)) continue;
        if (distance(ring, enemy) < ring.r + enemy.r) {
          ring.hits.add(enemy);
          damageEnemy(enemy, ring.damage, ring.special);
        }
      }
      if (ring.life <= 0) ring.dead = true;
    }
  }

  function updatePickups(dt) {
    for (const pickup of state.pickups) {
      pickup.life -= dt;
      pickup.spin += dt * 3.7;
      pickup.y += pickup.vy * dt;
      pickup.x += Math.sin(pickup.spin * 1.8) * 24 * dt;
      if (pickup.life <= 0 || pickup.y > H + 35) pickup.dead = true;
      if (!pickup.dead && state.player && distance(pickup, state.player) < pickup.r + state.player.r + 5) collectPickup(pickup);
    }
  }

  function collectPickup(pickup) {
    const player = state.player;
    pickup.dead = true;
    if (pickup.kind === "weapon") {
      if (player.weapon === pickup.weapon) player.weaponLevel = Math.min(3, player.weaponLevel + 1);
      else player.weapon = pickup.weapon;
      const def = weaponDefs[player.weapon];
      setAlert(`${def.name} ${roman(player.weaponLevel)}`, "bright", 1.05);
      burst(pickup.x, pickup.y, def.color, 20, 130, 0.5);
      tone("pickup");
    } else if (pickup.kind === "bomb") {
      player.bombs = Math.min(5, player.bombs + 1);
      setAlert("ION CELL +1", "bright", 0.9);
      burst(pickup.x, pickup.y, "#ffd665", 18, 125, 0.48);
      tone("pickup");
    } else {
      player.hp = Math.min(100, player.hp + 32);
      setAlert("ARMOR RESTORED", "bright", 0.9);
      burst(pickup.x, pickup.y, "#69f7d0", 18, 125, 0.48);
      tone("pickup");
    }
    syncUi();
  }

  function damageEnemy(enemy, amount, heavy = false) {
    if (enemy.dead) return;
    enemy.hp -= amount;
    enemy.damaged = 0.1;
    burst(enemy.x, enemy.y, enemy.color, heavy ? 8 : 3, heavy ? 145 : 62, 0.28);
    if (enemy.hp <= 0) destroyEnemy(enemy);
  }

  function destroyEnemy(enemy) {
    if (enemy.dead) return;
    enemy.dead = true;
    state.eliminations += 1;
    state.combo = Math.min(9, state.combo + 1);
    state.comboTimer = 2.5;
    const bonus = state.combo >= 5 ? 1.5 : state.combo >= 3 ? 1.25 : 1;
    const earned = Math.round(enemy.score * bonus);
    state.score += earned;
    state.best = Math.max(state.best, state.score);
    state.shake = Math.max(state.shake, enemy.type === "carrier" ? 13 : 3);
    burst(enemy.x, enemy.y, enemy.color, enemy.type === "carrier" ? 74 : 30, enemy.type === "carrier" ? 365 : 235, enemy.type === "carrier" ? 1.25 : 0.65);
    state.rings.push({ x: enemy.x, y: enemy.y, r: 2, max: enemy.type === "carrier" ? 180 : 62, life: 0.38, maxLife: 0.38, color: enemy.color, damage: 0, hits: new Set() });
    state.floating.push({ x: enemy.x, y: enemy.y - enemy.r, text: `+${earned}`, color: enemy.color, life: 0.78, maxLife: 0.78 });
    state.weaponKillCounter += enemy.type === "carrier" ? 4 : 1;
    let droppedWeapon = false;
    if (state.weaponKillCounter >= state.nextWeaponDrop) {
      spawnPickup(enemy.x, enemy.y, "weapon");
      state.weaponKillCounter = 0;
      state.nextWeaponDrop = Math.floor(random(17, 24));
      droppedWeapon = true;
    }
    if (enemy.type === "carrier") {
      spawnPickup(clamp(enemy.x - 38, 30, W - 30), enemy.y + 16, "bomb");
      spawnPickup(clamp(enemy.x + 38, 30, W - 30), enemy.y + 16, "repair");
      setAlert("CARRIER DOWN", "bright", 2);
    } else if (!droppedWeapon) {
      const roll = Math.random();
      if (roll < 0.045) spawnPickup(enemy.x, enemy.y, "bomb");
      else if (roll < 0.07) spawnPickup(enemy.x, enemy.y, "repair");
    }
    tone(enemy.type === "carrier" ? "boss" : "explode");
  }

  function damagePlayer(amount) {
    const player = state.player;
    if (!player || player.invulnerable > 0 || !state.running) return;
    player.hp -= amount;
    player.invulnerable = 0.78;
    state.shake = 9;
    state.flash = 0.15;
    burst(player.x, player.y, "#ff8b70", 22, 180, 0.55);
    tone("hit");
    if (player.hp <= 0) {
      player.lives -= 1;
      if (player.lives <= 0) {
        player.hp = 0;
        endGame();
      } else {
        player.hp = 100;
        player.x = W / 2;
        player.y = H - 120;
        player.invulnerable = 2.1;
        setAlert(`HULL LOST // ${player.lives} LEFT`, "danger", 1.8);
      }
    }
    syncUi();
  }

  function burst(x, y, color, count, speed, life) {
    for (let i = 0; i < count; i += 1) {
      const angle = random(0, TAU);
      const velocity = random(speed * 0.18, speed);
      state.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: random(life * 0.55, life), maxLife: life, size: random(1.4, 4.8), color, drag: random(0.82, 0.94) });
    }
  }

  function updateParticles(dt) {
    for (const particle of state.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(particle.drag, dt * 60);
      particle.vy *= Math.pow(particle.drag, dt * 60);
      if (particle.life <= 0) particle.dead = true;
    }
    for (const float of state.floating) {
      float.life -= dt;
      float.y -= 32 * dt;
      if (float.life <= 0) float.dead = true;
    }
  }

  function updateBackdrop(dt) {
    for (const star of state.stars) {
      star.y += (42 + star.z * 142) * dt;
      if (star.y > H + 8) { star.y = -8; star.x = random(0, W); }
    }
    for (const streak of state.streaks) {
      streak.y += streak.speed * dt;
      if (streak.y > H + 30) { streak.y = -random(10, 180); streak.x = random(0, W); }
    }
  }

  function updateGame(dt) {
    updateBackdrop(dt);
    if (!state.running || state.paused) return;
    state.elapsed += dt;
    state.wave = 1 + Math.floor(state.elapsed / 28);
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 1;
    state.spawnTimer -= dt;
    state.bossTimer -= dt;
    if (state.bossTimer <= 0) {
      spawnEnemy("carrier");
      state.bossTimer = 52;
      setAlert("HEAVY CONTACT", "danger", 2.2);
      tone("warning");
    }
    if (state.spawnTimer <= 0) {
      spawnEnemy();
      const tempo = Math.max(0.55, 1.38 - state.elapsed * 0.0065);
      state.spawnTimer = random(tempo * 0.8, tempo * 1.32);
      if (Math.random() < Math.min(0.24, state.elapsed / 240)) state.spawnTimer *= 0.62;
    }
    updatePlayer(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateRings(dt);
    updatePickups(dt);
    updateParticles(dt);
    state.bullets = state.bullets.filter((item) => !item.dead);
    state.enemyBullets = state.enemyBullets.filter((item) => !item.dead);
    state.enemies = state.enemies.filter((item) => !item.dead);
    state.pickups = state.pickups.filter((item) => !item.dead);
    state.particles = state.particles.filter((item) => !item.dead);
    state.rings = state.rings.filter((item) => !item.dead);
    state.floating = state.floating.filter((item) => !item.dead);
    state.alertTimer -= dt;
    if (state.alertTimer <= 0) clearAlert();
    state.shake = Math.max(0, state.shake - dt * 24);
    state.flash = Math.max(0, state.flash - dt * 2.2);
    syncUi();
  }

  function drawBackdrop() {
    ctx.fillStyle = "#071615";
    ctx.fillRect(0, 0, W, H);
    const horizon = ctx.createLinearGradient(0, 0, 0, H);
    horizon.addColorStop(0, "#17302d");
    horizon.addColorStop(0.32, "#0a2828");
    horizon.addColorStop(1, "#061110");
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, W, H);

    for (const star of state.stars) {
      ctx.globalAlpha = 0.28 + star.z * 0.7;
      ctx.fillStyle = star.hue;
      ctx.fillRect(star.x, star.y, star.size, star.size * (1.1 + star.z));
    }
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "#85e9d2";
    ctx.lineWidth = 0.7;
    for (const streak of state.streaks) {
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x, streak.y - streak.len);
      ctx.stroke();
    }

    const horizonY = 187;
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#69f7d0";
    ctx.lineWidth = 1;
    for (let y = horizonY; y < H; y += 34) {
      const t = (y - horizonY) / (H - horizonY);
      const curve = t * t;
      ctx.globalAlpha = 0.07 + curve * 0.15;
      ctx.beginPath();
      ctx.moveTo(18 + curve * 115, y);
      ctx.lineTo(W - 18 - curve * 115, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 9; i += 1) {
      const base = 16 + i * (W - 32) / 8;
      ctx.beginPath();
      ctx.moveTo(W / 2, horizonY);
      ctx.lineTo(base, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.19;
    const cityY = 252;
    for (let i = 0; i < 19; i += 1) {
      const x = i * 31 + Math.sin(i * 13) * 6;
      const height = 15 + (i * 29 % 70);
      ctx.fillStyle = i % 3 === 0 ? "#dc714f" : "#408b80";
      ctx.fillRect(x, cityY - height, 20, height);
      ctx.fillStyle = "#d7e497";
      ctx.globalAlpha = 0.18;
      for (let k = 0; k < 3; k += 1) ctx.fillRect(x + 4 + k * 5, cityY - height + 8, 2, 3);
      ctx.globalAlpha = 0.19;
    }
    ctx.globalAlpha = 1;
  }

  function shipPath(scale = 1) {
    ctx.beginPath();
    ctx.moveTo(0, -31 * scale);
    ctx.lineTo(11 * scale, -8 * scale);
    ctx.lineTo(28 * scale, 8 * scale);
    ctx.lineTo(11 * scale, 12 * scale);
    ctx.lineTo(7 * scale, 29 * scale);
    ctx.lineTo(0, 22 * scale);
    ctx.lineTo(-7 * scale, 29 * scale);
    ctx.lineTo(-11 * scale, 12 * scale);
    ctx.lineTo(-28 * scale, 8 * scale);
    ctx.lineTo(-11 * scale, -8 * scale);
    ctx.closePath();
  }

  function drawPlayer() {
    const p = state.player;
    if (!p) return;
    if (p.invulnerable > 0 && Math.floor(p.invulnerable * 14) % 2 === 0) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.tilt);
    const flame = 24 + Math.sin(p.engine) * 7;
    ctx.fillStyle = "rgba(105, 247, 208, 0.25)";
    ctx.beginPath();
    ctx.moveTo(-8, 19); ctx.lineTo(0, flame + 18); ctx.lineTo(8, 19); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#69f7d0";
    ctx.beginPath();
    ctx.moveTo(-4, 19); ctx.lineTo(0, flame); ctx.lineTo(4, 19); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d8eee2";
    shipPath();
    ctx.fill();
    ctx.strokeStyle = "#2a8475";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#183d3b";
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo(7, -5); ctx.lineTo(0, 5); ctx.lineTo(-7, -5); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ff765f";
    ctx.fillRect(-2, 11, 4, 7);
    ctx.restore();
  }

  function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const tint = enemy.damaged > 0 ? "#fff7dc" : enemy.color;
    if (enemy.type === "scout" || enemy.type === "dart") {
      ctx.rotate(Math.sin(enemy.age * 4 + enemy.phase) * 0.18);
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 25); ctx.lineTo(17, -13); ctx.lineTo(5, -9); ctx.lineTo(0, -27); ctx.lineTo(-5, -9); ctx.lineTo(-17, -13); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#3b2024";
      ctx.fillRect(-4, -13, 8, 19);
    } else if (enemy.type === "fighter") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 29); ctx.lineTo(23, 9); ctx.lineTo(15, -21); ctx.lineTo(0, -14); ctx.lineTo(-15, -21); ctx.lineTo(-23, 9); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#453829";
      ctx.beginPath(); ctx.ellipse(0, -2, 6, 11, 0, 0, TAU); ctx.fill();
    } else if (enemy.type === "bomber") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 34); ctx.lineTo(40, 14); ctx.lineTo(33, -12); ctx.lineTo(12, -5); ctx.lineTo(0, -28); ctx.lineTo(-12, -5); ctx.lineTo(-33, -12); ctx.lineTo(-40, 14); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a2230";
      ctx.fillRect(-7, -18, 14, 28);
      ctx.fillStyle = "#ffd665";
      ctx.fillRect(-27, 8, 9, 5); ctx.fillRect(18, 8, 9, 5);
    } else if (enemy.type === "ace") {
      ctx.rotate(Math.sin(enemy.age * 3) * 0.12);
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 34); ctx.lineTo(28, 15); ctx.lineTo(24, -18); ctx.lineTo(9, -12); ctx.lineTo(0, -31); ctx.lineTo(-9, -12); ctx.lineTo(-24, -18); ctx.lineTo(-28, 15); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f5d5ff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#422b61";
      ctx.beginPath(); ctx.arc(0, -3, 7, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 76); ctx.lineTo(80, 48); ctx.lineTo(70, 6); ctx.lineTo(40, -8); ctx.lineTo(27, -54); ctx.lineTo(0, -72); ctx.lineTo(-27, -54); ctx.lineTo(-40, -8); ctx.lineTo(-70, 6); ctx.lineTo(-80, 48); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff0ac";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#553d29";
      ctx.fillRect(-21, -40, 42, 51);
      ctx.fillStyle = "#ff765f";
      ctx.fillRect(-58, 15, 17, 14); ctx.fillRect(41, 15, 17, 14);
      ctx.fillStyle = "#dff3d5";
      ctx.fillRect(-7, -56, 14, 26);
    }
    ctx.restore();
    if (enemy.type === "carrier" || enemy.hp < enemy.maxHp) drawHealthBar(enemy);
  }

  function drawHealthBar(enemy) {
    const width = enemy.type === "carrier" ? 150 : 45;
    const y = enemy.y - enemy.r - 14;
    ctx.fillStyle = "rgba(2, 9, 9, 0.72)";
    ctx.fillRect(enemy.x - width / 2, y, width, 4);
    ctx.fillStyle = enemy.type === "carrier" ? "#ffd665" : enemy.color;
    ctx.fillRect(enemy.x - width / 2, y, width * Math.max(0, enemy.hp / enemy.maxHp), 4);
  }

  function drawPickup(pickup) {
    const color = pickup.kind === "weapon" ? weaponDefs[pickup.weapon].color : pickup.kind === "bomb" ? "#ffd665" : "#69f7d0";
    ctx.save();
    ctx.translate(pickup.x, pickup.y);
    ctx.rotate(pickup.spin);
    ctx.fillStyle = "rgba(2, 17, 16, 0.78)";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, TAU); ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(17, 0); ctx.lineTo(0, 18); ctx.lineTo(-17, 0); ctx.closePath(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = color;
    ctx.font = "900 16px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = pickup.kind === "weapon" ? weaponDefs[pickup.weapon].pickup : pickup.kind === "bomb" ? "◆" : "+";
    ctx.fillText(label, pickup.x, pickup.y + 1);
  }

  function drawBullet(bullet, enemy = false) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
    ctx.rotate(angle);
    ctx.shadowBlur = bullet.rail || bullet.laser ? 12 : 6;
    ctx.shadowColor = bullet.color;
    ctx.fillStyle = bullet.color;
    if (bullet.plasma) {
      ctx.beginPath(); ctx.arc(0, 0, bullet.r, 0, TAU); ctx.fill();
      ctx.fillStyle = "#fff5d6"; ctx.beginPath(); ctx.arc(0, 0, bullet.r * 0.35, 0, TAU); ctx.fill();
    } else if (bullet.rail) {
      ctx.fillRect(-bullet.r * 0.4, -22, bullet.r * 0.8, 32);
      ctx.fillStyle = "#fff8e7"; ctx.fillRect(-1.3, -30, 2.6, 38);
    } else if (bullet.laser) {
      ctx.fillRect(-1.5, -27, 3, 37);
    } else if (bullet.homing) {
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5, 7); ctx.lineTo(0, 4); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(-bullet.r / 2, -10, bullet.r, enemy ? 14 : 18);
    }
    ctx.restore();
  }

  function drawRings() {
    for (const ring of state.rings) {
      const alpha = Math.max(0, ring.life / ring.maxLife);
      ctx.save();
      ctx.globalAlpha = ring.special ? alpha * 0.92 : alpha * 0.7;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ring.special ? Math.max(2, 13 * alpha) : 2;
      ctx.shadowBlur = ring.special ? 18 : 7;
      ctx.shadowColor = ring.color;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 14px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
    for (const float of state.floating) {
      ctx.globalAlpha = Math.max(0, float.life / float.maxLife);
      ctx.fillStyle = float.color;
      ctx.fillText(float.text, float.x, float.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawBossIndicator() {
    const boss = state.enemies.find((enemy) => enemy.type === "carrier");
    if (!boss) return;
    const width = 270;
    const y = 92;
    ctx.fillStyle = "rgba(5, 16, 15, 0.64)";
    ctx.fillRect(W / 2 - width / 2, y, width, 16);
    ctx.strokeStyle = "rgba(255, 214, 101, 0.72)";
    ctx.strokeRect(W / 2 - width / 2, y, width, 16);
    ctx.fillStyle = "#ffd665";
    ctx.fillRect(W / 2 - width / 2 + 3, y + 3, (width - 6) * Math.max(0, boss.hp / boss.maxHp), 10);
    ctx.fillStyle = "#fff4c9";
    ctx.font = "900 9px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HEAVY CARRIER", W / 2, y - 5);
  }

  function render() {
    ctx.save();
    const shake = state.running && !state.paused ? state.shake : 0;
    if (shake) ctx.translate(random(-shake, shake), random(-shake * 0.55, shake * 0.55));
    drawBackdrop();
    drawRings();
    state.pickups.forEach(drawPickup);
    state.bullets.forEach((bullet) => drawBullet(bullet));
    state.enemyBullets.forEach((bullet) => drawBullet(bullet, true));
    state.enemies.forEach(drawEnemy);
    drawPlayer();
    drawParticles();
    drawBossIndicator();
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 235, 171, ${state.flash * 0.32})`;
      ctx.fillRect(-15, -15, W + 30, H + 30);
    }
    ctx.restore();
  }

  function syncUi() {
    const player = state.player;
    const score = pad(state.score);
    const best = pad(state.best);
    const minutes = Math.floor(state.elapsed / 60);
    const seconds = Math.floor(state.elapsed % 60);
    ui.scoreText.textContent = score;
    ui.railScore.textContent = score;
    ui.bestScore.textContent = best;
    ui.railWave.textContent = String(state.wave).padStart(2, "0");
    ui.railElims.textContent = String(state.eliminations).padStart(3, "0");
    ui.range.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    ui.footerWave.textContent = `WAVE ${String(state.wave).padStart(2, "0")}`;
    ui.comboText.textContent = `x${state.combo}`;
    if (!player) return;
    const def = weaponDefs[player.weapon];
    const health = Math.max(0, Math.round(player.hp));
    ui.armorText.textContent = String(health);
    ui.armorFill.style.width = `${health}%`;
    ui.armorFill.style.background = health > 50 ? "#69f7d0" : health > 25 ? "#ffd665" : "#ff765f";
    ui.armorFill.style.boxShadow = `0 0 8px ${health > 50 ? "#69f7d0" : health > 25 ? "#ffd665" : "#ff765f"}`;
    ui.railBombs.textContent = String(player.bombs).padStart(2, "0");
    ui.bombRow.innerHTML = Array.from({ length: Math.min(5, player.bombs) }, () => '<i class="bomb-pip"></i>').join("");
    ui.weaponName.textContent = def.name;
    ui.weaponDetail.textContent = def.detail;
    ui.weaponLevel.textContent = roman(player.weaponLevel);
    ui.weaponSwatch.style.background = def.color;
    ui.footerWeapon.textContent = `${def.name} / ${roman(player.weaponLevel)}`;
  }

  function resumeAudio() {
    if (state.muted) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!state.audio) state.audio = new AudioCtx();
    if (state.audio.state === "suspended") state.audio.resume().catch(() => {});
  }

  function tone(kind, volume) {
    if (state.muted || !state.audio) return;
    const ctxAudio = state.audio;
    const now = ctxAudio.currentTime;
    const gain = ctxAudio.createGain();
    const oscillator = ctxAudio.createOscillator();
    const presets = {
      start: [220, 660, "sine", 0.07, 0.18],
      shoot: [520, 280, "square", volume || 0.022, 0.045],
      rail: [180, 70, "sawtooth", 0.05, 0.1],
      enemy: [145, 110, "triangle", volume || 0.02, 0.05],
      explode: [92, 38, "sawtooth", 0.04, 0.18],
      boss: [120, 28, "sawtooth", 0.1, 0.42],
      hit: [170, 58, "square", 0.06, 0.13],
      pickup: [440, 880, "triangle", 0.06, 0.15],
      special: [90, 880, "sine", 0.1, 0.54],
      warning: [260, 220, "square", 0.05, 0.18],
      fail: [150, 45, "sawtooth", 0.08, 0.44],
    };
    const [start, end, wave, level, duration] = presets[kind] || presets.shoot;
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(ctxAudio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function loop(now) {
    const dt = Math.min(0.034, Math.max(0.001, (now - previousTime) / 1000));
    previousTime = now;
    updateGame(dt);
    render();
    animationId = requestAnimationFrame(loop);
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * W / rect.width,
      y: (event.clientY - rect.top) * H / rect.height,
    };
  }

  function updatePointerDelta(event) {
    if (!state.pointer.active || event.pointerId !== state.pointer.id) return;
    const position = pointerPosition(event);
    state.pointer.deltaX += position.x - state.pointer.lastX;
    state.pointer.deltaY += position.y - state.pointer.lastY;
    state.pointer.lastX = position.x;
    state.pointer.lastY = position.y;
  }

  function releasePointer(event, includeFinalPosition = false) {
    if (!state.pointer.active || event.pointerId !== state.pointer.id) return;
    if (includeFinalPosition) updatePointerDelta(event);
    state.pointer.active = false;
    state.pointer.id = null;
    if (!includeFinalPosition) {
      state.pointer.deltaX = 0;
      state.pointer.deltaY = 0;
    }
  }

  window.addEventListener("keydown", (event) => {
    const codes = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "Space", "KeyP", "Escape", "Enter"];
    if (codes.includes(event.code)) event.preventDefault();
    if (event.code === "Space" && !event.repeat) {
      if (!state.running) startGame();
      else triggerSpecial();
      return;
    }
    if ((event.code === "KeyP" || event.code === "Escape") && !event.repeat) { pauseGame(); return; }
    if (event.code === "Enter" && !event.repeat && (!state.running || state.gameOver)) { startGame(); return; }
    state.keys.add(event.code);
    resumeAudio();
  });

  window.addEventListener("keyup", (event) => state.keys.delete(event.code));
  window.addEventListener("blur", () => { if (state.running && !state.paused) pauseGame(); });
  window.addEventListener("resize", fitCanvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.running && !state.paused) pauseGame();
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.running || state.paused || state.pointer.active) return;
    const position = pointerPosition(event);
    Object.assign(state.pointer, {
      active: true,
      id: event.pointerId,
      lastX: position.x,
      lastY: position.y,
      deltaX: 0,
      deltaY: 0,
    });
    canvas.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    resumeAudio();
  });
  canvas.addEventListener("pointermove", (event) => {
    updatePointerDelta(event);
  });
  canvas.addEventListener("pointerup", (event) => releasePointer(event, true));
  canvas.addEventListener("pointercancel", (event) => releasePointer(event));
  canvas.addEventListener("lostpointercapture", (event) => releasePointer(event));
  ui.deploy.addEventListener("click", startGame);
  ui.pause.addEventListener("click", pauseGame);
  ui.mobileSpecial.addEventListener("click", () => { resumeAudio(); triggerSpecial(); });

  fitCanvas();
  initBackdrop();
  syncUi();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
})();
