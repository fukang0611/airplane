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
    stageSerial: document.querySelector("#stageSerial"),
    railSector: document.querySelector("#railSector"),
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
    scout: { hp: 28, r: 17, speed: 118, score: 100, color: "#ff806a", motion: "weave", attack: "aim", cadence: 3.05, bullet: "bolt" },
    fighter: { hp: 55, r: 21, speed: 90, score: 180, color: "#ffc766", motion: "sweep", attack: "fan", cadence: 2.45, bullet: "shard" },
    skimmer: { hp: 45, r: 18, speed: 148, score: 210, color: "#7ccdf8", motion: "dart", attack: "trident", cadence: 2.7, bullet: "spark" },
    striker: { hp: 92, r: 25, speed: 78, score: 330, color: "#b5e5ff", motion: "glide", attack: "sweep", cadence: 2.1, bullet: "bolt" },
    bomber: { hp: 128, r: 31, speed: 53, score: 370, color: "#ff6680", motion: "bomber", attack: "barrage", cadence: 2.35, bullet: "shell" },
    turret: { hp: 108, r: 25, speed: 64, score: 410, color: "#ffad62", motion: "anchor", attack: "lanes", cadence: 2.15, bullet: "shell" },
    wraith: { hp: 78, r: 22, speed: 104, score: 470, color: "#d49aff", motion: "phase", attack: "cross", cadence: 1.85, bullet: "orb" },
    prism: { hp: 150, r: 28, speed: 69, score: 620, color: "#90f0d6", motion: "orbit", attack: "radial", cadence: 1.7, bullet: "orb" },
    carrier: { hp: 1450, r: 73, speed: 98, score: 4500, color: "#ffcd67", boss: true, motion: "carrier", attack: "carrier", cadence: 1.55, bullet: "shell", bossTitle: "BULWARK CARRIER" },
    tempest: { hp: 1750, r: 70, speed: 92, score: 5600, color: "#90dfff", boss: true, motion: "tempest", attack: "tempest", cadence: 1.32, bullet: "spark", bossTitle: "TEMPEST FORTRESS" },
    dreadnought: { hp: 2200, r: 78, speed: 84, score: 7000, color: "#ff8c62", boss: true, motion: "dreadnought", attack: "dreadnought", cadence: 1.28, bullet: "shell", bossTitle: "FOUNDRY DREADNOUGHT" },
    core: { hp: 2700, r: 65, speed: 76, score: 9000, color: "#c8a6ff", boss: true, motion: "core", attack: "core", cadence: 1.05, bullet: "orb", bossTitle: "RIFT COMMAND CORE" },
  };

  const levelDefs = [
    {
      name: "NEON HARBOR",
      subtitle: "CITY PERIMETER",
      theme: "harbor",
      difficulty: 1,
      waves: [
        { label: "PATROL V", groups: [{ type: "scout", formation: "vee", count: 5 }, { type: "fighter", formation: "line", count: 3, gap: 0.55 }] },
        { label: "DOCKLINE", groups: [{ type: "scout", formation: "stagger", count: 6 }, { type: "fighter", formation: "flank", count: 4, gap: 0.62 }] },
        { label: "BREAKWATER", groups: [{ type: "fighter", formation: "arc", count: 5 }, { type: "scout", formation: "vee", count: 5, gap: 0.58 }] },
      ],
      boss: "carrier",
    },
    {
      name: "STORM FRONT",
      subtitle: "THUNDERHEAD ASCENT",
      theme: "storm",
      difficulty: 1.28,
      waves: [
        { label: "SQUALL RUN", groups: [{ type: "skimmer", formation: "stagger", count: 6 }, { type: "scout", formation: "flank", count: 4, gap: 0.46 }] },
        { label: "CLOUD SPEAR", groups: [{ type: "striker", formation: "vee", count: 4 }, { type: "skimmer", formation: "arc", count: 6, gap: 0.66 }] },
        { label: "DOWNDRAFT", groups: [{ type: "striker", formation: "line", count: 5 }, { type: "skimmer", formation: "flank", count: 6, gap: 0.58 }] },
      ],
      boss: "tempest",
    },
    {
      name: "CRIMSON FORGE",
      subtitle: "SMELTER CORRIDOR",
      theme: "forge",
      difficulty: 1.62,
      waves: [
        { label: "ASH WING", groups: [{ type: "bomber", formation: "line", count: 3 }, { type: "turret", formation: "flank", count: 4, gap: 0.72 }] },
        { label: "MOLTEN LOCK", groups: [{ type: "bomber", formation: "vee", count: 5 }, { type: "fighter", formation: "stagger", count: 5, gap: 0.58 }] },
        { label: "PRESSURE GATE", groups: [{ type: "turret", formation: "arc", count: 5 }, { type: "bomber", formation: "flank", count: 4, gap: 0.68 }] },
      ],
      boss: "dreadnought",
    },
    {
      name: "VOID GATE",
      subtitle: "ANOMALY APPROACH",
      theme: "rift",
      difficulty: 2.04,
      waves: [
        { label: "GATEKEEPERS", groups: [{ type: "wraith", formation: "arc", count: 6 }, { type: "prism", formation: "line", count: 3, gap: 0.68 }] },
        { label: "FRACTURE", groups: [{ type: "wraith", formation: "flank", count: 7 }, { type: "striker", formation: "vee", count: 5, gap: 0.58 }] },
        { label: "LAST VECTOR", groups: [{ type: "prism", formation: "stagger", count: 5 }, { type: "wraith", formation: "vee", count: 7, gap: 0.62 }] },
      ],
      boss: "core",
    },
  ];

  const themeDefs = {
    harbor: { sky: ["#17302d", "#0a2828", "#061110"], stars: ["#75e7d1", "#e6f6d4", "#ffd878", "#7ad2ed"], line: "#69f7d0", accent: "#ff806a" },
    storm: { sky: ["#1a3447", "#0b1b35", "#050c1d"], stars: ["#d6f3ff", "#78c7ff", "#efffbc", "#91aef8"], line: "#8ee6ff", accent: "#b4e7ff" },
    forge: { sky: ["#3b211b", "#241411", "#0c0a0a"], stars: ["#ffba6f", "#ff6f5d", "#ffd27a", "#d58d69"], line: "#ff9b5f", accent: "#ffdd8a" },
    rift: { sky: ["#14283a", "#0e1530", "#050712"], stars: ["#92f1df", "#b9b1ff", "#e5d3ff", "#7acffd"], line: "#96e9dc", accent: "#d4a7ff" },
  };

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    score: 0,
    best: loadBest(),
    elapsed: 0,
    wave: 1,
    level: 1,
    levelPhase: "intro",
    phaseTimer: 0,
    waveIndex: -1,
    waveTimer: 0,
    spawnQueue: [],
    bossActive: false,
    bossDefeated: false,
    eliminations: 0,
    combo: 1,
    comboTimer: 0,
    weaponKillCounter: 0,
    nextWeaponDrop: 20,
    upgradeKillCounter: 0,
    nextUpgradeDrop: 13,
    alertTimer: 0,
    alertType: "",
    shake: 0,
    flash: 0,
    keys: new Set(),
    pointer: { active: false, id: null, lastX: 0, lastY: 0, deltaX: 0, deltaY: 0 },
    stars: [],
    streaks: [],
    backdropTime: 0,
    weatherFlash: 0,
    nextWeatherFlash: 5,
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
  function currentLevelDef() { return levelDefs[(state.level - 1) % levelDefs.length]; }
  function currentTheme() { return themeDefs[currentLevelDef().theme]; }
  function currentCycle() { return Math.floor((state.level - 1) / levelDefs.length); }
  function currentDifficulty() {
    const cycleStep = levelDefs[levelDefs.length - 1].difficulty - levelDefs[0].difficulty + 0.28;
    return currentLevelDef().difficulty + currentCycle() * cycleStep;
  }
  function levelLabel() { return `LEVEL ${String(state.level).padStart(2, "0")}`; }

  function initBackdrop() {
    const theme = currentTheme();
    state.stars = Array.from({ length: 112 }, () => ({
      x: random(0, W), y: random(0, H), z: random(0.25, 1), size: random(0.6, 2), hue: choose(theme.stars),
    }));
    state.streaks = Array.from({ length: currentLevelDef().theme === "storm" ? 34 : 14 }, () => ({ x: random(0, W), y: random(0, H), len: random(8, 26), speed: random(120, 290) }));
    state.backdropTime = 0;
    state.weatherFlash = 0;
    state.nextWeatherFlash = random(3.8, 7.5);
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

  function startLevel(level) {
    state.level = level;
    state.levelPhase = "intro";
    state.phaseTimer = 2.15;
    state.waveIndex = -1;
    state.wave = 1;
    state.waveTimer = 0;
    state.spawnQueue = [];
    state.bossActive = false;
    state.bossDefeated = false;
    state.enemyBullets = [];
    initBackdrop();
    const def = currentLevelDef();
    const overdrive = state.level > levelDefs.length ? " // OVERDRIVE" : "";
    setAlert(`${levelLabel()} // ${def.name}${overdrive}`, "bright", 2.15);
    tone("level");
  }

  function resetGame() {
    state.score = 0;
    state.elapsed = 0;
    state.eliminations = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.weaponKillCounter = 0;
    state.nextWeaponDrop = Math.floor(random(17, 24));
    state.upgradeKillCounter = 0;
    state.nextUpgradeDrop = Math.floor(random(10, 15));
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
    startLevel(1);
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

  function formationSlots(formation, count) {
    const spacing = Math.min(72, 360 / Math.max(1, count - 1));
    const middle = (count - 1) / 2;
    return Array.from({ length: count }, (_, index) => {
      const offset = index - middle;
      let x = W / 2 + offset * spacing;
      let y = -52;
      if (formation === "vee") y -= Math.abs(offset) * 25;
      if (formation === "stagger") y -= (index % 2) * 44;
      if (formation === "arc") y -= Math.cos(offset / Math.max(1, middle) * Math.PI / 2) * 44;
      if (formation === "flank") {
        const sideIndex = Math.floor(index / 2);
        x = index % 2 === 0 ? 68 + sideIndex * 42 : W - 68 - sideIndex * 42;
        y -= sideIndex * 38;
      }
      return { x: clamp(x, 42, W - 42), y };
    });
  }

  function queueWave(wave) {
    let cursor = 0.24;
    const queue = [];
    wave.groups.forEach((group, groupIndex) => {
      if (groupIndex > 0) cursor += group.gap || 0.78;
      const interval = group.interval || 0.12;
      const groupPhase = random(0, TAU);
      formationSlots(group.formation, group.count).forEach((slot, index) => {
        queue.push({ at: cursor + index * interval, type: group.type, phase: groupPhase, ...slot });
      });
      cursor += group.count * interval;
    });
    state.spawnQueue = queue.sort((a, b) => a.at - b.at);
    state.waveTimer = 0;
    state.phaseTimer = 0;
  }

  function beginNextWave() {
    state.waveIndex += 1;
    const level = currentLevelDef();
    if (state.waveIndex >= level.waves.length) {
      state.levelPhase = "boss-warning";
      state.phaseTimer = 2.35;
      state.spawnQueue = [];
      setAlert(`WARNING // ${enemyDefs[level.boss].bossTitle}`, "danger", 2.35);
      tone("warning");
      return;
    }
    const wave = level.waves[state.waveIndex];
    state.levelPhase = "waves";
    state.wave = state.waveIndex + 1;
    queueWave(wave);
    setAlert(`${levelLabel()} // WAVE ${String(state.wave).padStart(2, "0")} // ${wave.label}`, "bright", 1.45);
  }

  function startBoss() {
    const bossType = currentLevelDef().boss;
    state.levelPhase = "boss";
    state.bossActive = true;
    state.bossDefeated = false;
    spawnEnemy(bossType, { x: W / 2, y: -enemyDefs[bossType].r - 30 });
    setAlert(`BOSS ENGAGED // ${enemyDefs[bossType].bossTitle}`, "danger", 2.1);
    tone("boss");
  }

  function completeLevel(enemy) {
    if (state.levelPhase !== "boss" || state.bossDefeated) return;
    state.bossDefeated = true;
    state.bossActive = false;
    state.levelPhase = "clear";
    state.phaseTimer = 3;
    state.enemyBullets.forEach((bullet) => { bullet.dead = true; });
    state.flash = 0.28;
    setAlert(`${levelLabel()} CLEAR // ${currentLevelDef().name}`, "bright", 3);
    state.floating.push({ x: W / 2, y: 270, text: "SECTOR SECURED", color: enemy.color, life: 2.2, maxLife: 2.2 });
    tone("clear");
  }

  function updateLevelFlow(dt) {
    if (state.levelPhase === "intro") {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) beginNextWave();
      return;
    }
    if (state.levelPhase === "waves") {
      state.waveTimer += dt;
      while (state.spawnQueue.length && state.spawnQueue[0].at <= state.waveTimer) {
        const next = state.spawnQueue.shift();
        spawnEnemy(next.type, next);
      }
      const waveClear = state.spawnQueue.length === 0 && !state.enemies.some((enemy) => !enemy.dead && !enemy.boss);
      if (!waveClear) state.phaseTimer = 0;
      else if (state.phaseTimer === 0) state.phaseTimer = 0.72;
      else {
        state.phaseTimer -= dt;
        if (state.phaseTimer <= 0) beginNextWave();
      }
      return;
    }
    if (state.levelPhase === "boss-warning") {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) startBoss();
      return;
    }
    if (state.levelPhase === "clear") {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) startLevel(state.level + 1);
    }
  }

  function spawnEnemy(type, options = {}) {
    const def = enemyDefs[type];
    const difficulty = currentDifficulty();
    const overdriveScale = Math.pow(2.7, currentCycle());
    const hpScale = (def.boss ? 0.72 + difficulty * 0.38 : 0.72 + difficulty * 0.32) * overdriveScale;
    const x = options.x ?? (def.boss ? W / 2 : random(48, W - 48));
    const enemy = {
      type,
      x,
      y: options.y ?? (def.boss ? -def.r - 30 : -random(35, 105)),
      baseX: x,
      r: def.r,
      hp: Math.round(def.hp * hpScale),
      maxHp: Math.round(def.hp * hpScale),
      speed: def.speed * (1 + Math.min(0.22, (state.level - 1) * 0.035)),
      score: Math.round(def.score * (1 + currentCycle() * 0.75)),
      color: def.color,
      boss: Boolean(def.boss),
      bossTitle: def.bossTitle || "",
      phase: options.phase ?? random(0, TAU),
      age: 0,
      shoot: def.boss ? 1.25 : random(1.25, 2.25),
      attackStep: 0,
      turn: random(-1, 1),
      drift: random(30, 75),
      targetY: def.boss ? 148 + (def.r - 65) * 0.45 : null,
      dead: false,
      damaged: 0,
    };
    state.enemies.push(enemy);
  }

  function spawnPickup(x, y, kind, weapon) {
    const roll = Math.random();
    const actualKind = kind || (roll < 0.55 ? "weapon" : roll < 0.74 ? "upgrade" : roll < 0.88 ? "bomb" : "repair");
    let selectedWeapon = weapon;
    if (!selectedWeapon) {
      const alternatives = state.player ? weaponKeys.filter((key) => key !== state.player.weapon) : weaponKeys;
      selectedWeapon = state.player && Math.random() < 0.34 ? state.player.weapon : choose(alternatives.length ? alternatives : weaponKeys);
    }
    state.pickups.push({
      x, y, kind: actualKind, weapon: selectedWeapon, r: 18, life: 12, spin: random(0, TAU), vy: random(50, 74), dead: false,
    });
  }

  function fireEnemy(enemy) {
    if (!state.player || enemy.y < 20) return;
    const def = enemyDefs[enemy.type];
    const bulletCap = Math.min(92, 24 + state.level * 12);
    if (state.enemyBullets.length >= bulletCap) return;
    const target = state.player;
    const aimedAngle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const damageScale = 1 + Math.min(0.32, (state.level - 1) * 0.045);
    const create = (angle, speed, damage, options = {}) => {
      if (state.enemyBullets.length >= bulletCap) return;
      state.enemyBullets.push({
        x: options.x ?? enemy.x,
        y: options.y ?? enemy.y + enemy.r * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: options.r || 5,
        damage: damage * damageScale,
        color: options.color || def.color,
        life: options.life || 7,
        age: 0,
        curve: options.curve || 0,
        enemyStyle: options.style || def.bullet,
        dead: false,
      });
    };
    const aimed = (offset, speed, damage, options) => create(aimedAngle + offset, speed, damage, options);
    const radial = (count, speed, damage, rotation = 0, options = {}) => {
      for (let index = 0; index < count; index += 1) create(rotation + index * TAU / count, speed, damage, options);
    };

    if (def.attack === "aim") aimed(0, 225, 10, { r: 4, color: "#ff8e76" });
    if (def.attack === "fan") [-0.14, 0.14].forEach((offset) => aimed(offset, 192, 9, { r: 4 }));
    if (def.attack === "trident") [-0.1, 0, 0.1].forEach((offset) => aimed(offset, 276, 10, { r: 4, curve: offset * 0.5 }));
    if (def.attack === "sweep") {
      const sweep = Math.sin(enemy.age * 1.7) * 0.42;
      [-0.1, 0.1].forEach((offset) => aimed(sweep + offset, 218, 11, { r: 4, curve: -sweep * 0.22 }));
    }
    if (def.attack === "barrage") [-0.36, -0.18, 0, 0.18, 0.36].forEach((offset) => aimed(offset, 164, 12, { r: 6 }));
    if (def.attack === "lanes") {
      [-24, 0, 24].forEach((lane) => create(Math.PI / 2, 208, 13, { x: enemy.x + lane, r: 7, style: "shell" }));
    }
    if (def.attack === "cross") {
      [-0.32, 0, 0.32].forEach((offset) => aimed(offset, 224, 12, { r: 5, style: "orb", curve: offset * 0.45 }));
      create(Math.PI / 2, 178, 10, { r: 4, color: "#8ff3dc", style: "spark" });
    }
    if (def.attack === "radial") radial(7, 172, 10, enemy.age * 0.7, { r: 5, style: "orb" });
    if (def.attack === "carrier") {
      [-0.48, -0.24, 0, 0.24, 0.48].forEach((offset) => aimed(offset, 182, 13, { r: 6, color: "#ffd665" }));
      create(Math.PI / 2 + 0.3, 225, 14, { x: enemy.x - 48, y: enemy.y + 40, r: 7, color: "#ff8c6d", style: "shell" });
      create(Math.PI / 2 - 0.3, 225, 14, { x: enemy.x + 48, y: enemy.y + 40, r: 7, color: "#ff8c6d", style: "shell" });
    }
    if (def.attack === "tempest") {
      if (enemy.attackStep % 2 === 0) radial(10, 160, 10, enemy.age * 0.82, { r: 4, color: "#91e4ff", style: "spark", curve: 0.12 });
      else [-0.42, -0.21, 0, 0.21, 0.42].forEach((offset) => aimed(offset, 238, 12, { r: 5, color: "#e7fbff", style: "bolt" }));
    }
    if (def.attack === "dreadnought") {
      if (enemy.attackStep % 2 === 0) {
        [-54, 0, 54].forEach((lane) => create(Math.PI / 2, 214, 15, { x: enemy.x + lane, y: enemy.y + 45, r: 8, color: "#ff9a5f", style: "shell" }));
      } else {
        [-0.54, -0.36, -0.18, 0, 0.18, 0.36, 0.54].forEach((offset) => aimed(offset, 174, 13, { r: 6, color: "#ffcb73", style: "shard" }));
      }
    }
    if (def.attack === "core") {
      radial(12, 158 + (enemy.attackStep % 3) * 18, 11, enemy.age * 1.1, { r: 6, color: enemy.attackStep % 2 ? "#9af0de" : "#d6a8ff", style: "orb", curve: enemy.attackStep % 2 ? 0.14 : -0.14 });
      [-0.18, 0, 0.18].forEach((offset) => aimed(offset, 252, 13, { r: 4, color: "#f1e8ff", style: "bolt" }));
    }
    if (currentCycle() > 0) {
      if (enemy.boss) {
        const count = Math.min(10, 4 + currentCycle() * 2);
        radial(count, 148 + currentCycle() * 12, 10 + currentCycle(), -enemy.age * 0.72, { r: 5, color: currentTheme().line, style: "orb", curve: -0.1 });
      } else if (enemy.attackStep % 2 === 0) {
        aimed(0, 230 + currentCycle() * 14, 10 + currentCycle(), { r: 4, color: currentTheme().accent, style: "bolt" });
      }
    }
    enemy.attackStep += 1;
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
      const def = enemyDefs[enemy.type];
      enemy.age += dt;
      enemy.damaged = Math.max(0, enemy.damaged - dt);
      if (enemy.boss) {
        if (enemy.y < enemy.targetY) enemy.y = Math.min(enemy.targetY, enemy.y + enemy.speed * dt);
        else enemy.y += (enemy.targetY - enemy.y + Math.sin(enemy.age * 1.4) * 5) * Math.min(1, dt * 3.2);
        const bossDrift = def.motion === "carrier" ? 85 : def.motion === "tempest" ? 122 : def.motion === "dreadnought" ? 70 : 96;
        const bossTempo = def.motion === "dreadnought" ? 0.38 : def.motion === "core" ? 0.84 : def.motion === "tempest" ? 0.68 : 0.5;
        enemy.x = W / 2 + Math.sin(enemy.age * bossTempo + enemy.phase) * bossDrift;
      } else {
        if (def.motion === "weave") enemy.x = enemy.baseX + Math.sin(enemy.age * 2.1 + enemy.phase) * 64;
        if (def.motion === "sweep") enemy.x = enemy.baseX + Math.sin(enemy.age * 1.3 + enemy.phase) * 104;
        if (def.motion === "dart") enemy.x = enemy.baseX + Math.sin(enemy.age * 4.8 + enemy.phase) * 82;
        if (def.motion === "glide") enemy.x = enemy.baseX + Math.sin(enemy.age * 1.65 + enemy.phase) * 118;
        if (def.motion === "bomber") enemy.x = enemy.baseX + Math.sin(enemy.age * 0.75 + enemy.phase) * 88;
        if (def.motion === "anchor") enemy.x = enemy.baseX + Math.sin(enemy.age * 0.92 + enemy.phase) * 46;
        if (def.motion === "phase") enemy.x = enemy.baseX + Math.sin(enemy.age * 2.65 + enemy.phase) * 96 + Math.sin(enemy.age * 6.2) * 18;
        if (def.motion === "orbit") enemy.x = enemy.baseX + Math.sin(enemy.age * 1.85 + enemy.phase) * 102;
        enemy.x = clamp(enemy.x, 26, W - 26);
        enemy.y += enemy.speed * dt;
      }
      enemy.shoot -= dt;
      if (enemy.shoot <= 0 && enemy.y > 40 && enemy.y < H - 110) {
        fireEnemy(enemy);
        const pressure = clamp(1.08 - (state.level - 1) * 0.035, 0.76, 1.08);
        enemy.shoot += def.cadence * pressure * random(0.9, 1.12);
      }
      if (!enemy.boss && (enemy.y > H + 115 || enemy.x < -120 || enemy.x > W + 120)) enemy.dead = true;
      if (state.player && !enemy.dead && distance(enemy, state.player) < enemy.r + state.player.r - 4) {
        damagePlayer(enemy.boss ? 42 : 27);
        if (!enemy.boss) damageEnemy(enemy, enemy.hp + 1, true);
        else state.player.y = clamp(state.player.y + 34, 120, H - 36);
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
      bullet.age += dt;
      if (bullet.curve) {
        const speed = Math.hypot(bullet.vx, bullet.vy);
        const angle = Math.atan2(bullet.vy, bullet.vx) + bullet.curve * dt;
        bullet.vx = Math.cos(angle) * speed;
        bullet.vy = Math.sin(angle) * speed;
      }
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
      const isDuplicate = player.weapon === pickup.weapon;
      if (isDuplicate) player.weaponLevel = Math.min(3, player.weaponLevel + 1);
      else player.weapon = pickup.weapon;
      const def = weaponDefs[player.weapon];
      const message = isDuplicate
        ? `${def.name} POWER // ${player.weaponLevel >= 3 ? "MAX" : roman(player.weaponLevel)}`
        : `WEAPON SWITCH // ${def.name} ${roman(player.weaponLevel)}`;
      setAlert(message, "bright", 1.1);
      burst(pickup.x, pickup.y, def.color, 20, 130, 0.5);
      tone(isDuplicate ? "upgrade" : "pickup");
    } else if (pickup.kind === "upgrade") {
      const before = player.weaponLevel;
      player.weaponLevel = Math.min(3, player.weaponLevel + 1);
      const def = weaponDefs[player.weapon];
      setAlert(before === 3 ? `SYSTEM POWER // MAX` : `SYSTEM UPGRADE // ${roman(player.weaponLevel)}`, "bright", 1.1);
      burst(pickup.x, pickup.y, "#8de7ff", 24, 150, 0.58);
      tone("upgrade");
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
    if (enemy.dead || !state.running) return;
    enemy.hp -= amount;
    enemy.damaged = 0.1;
    burst(enemy.x, enemy.y, enemy.color, heavy ? 8 : 3, heavy ? 145 : 62, 0.28);
    if (enemy.hp <= 0) destroyEnemy(enemy);
  }

  function destroyEnemy(enemy) {
    if (enemy.dead || !state.running) return;
    enemy.dead = true;
    state.eliminations += 1;
    state.combo = Math.min(9, state.combo + 1);
    state.comboTimer = 2.5;
    const bonus = state.combo >= 5 ? 1.5 : state.combo >= 3 ? 1.25 : 1;
    const earned = Math.round(enemy.score * bonus);
    state.score += earned;
    state.shake = Math.max(state.shake, enemy.boss ? 13 : 3);
    burst(enemy.x, enemy.y, enemy.color, enemy.boss ? 78 : 30, enemy.boss ? 365 : 235, enemy.boss ? 1.25 : 0.65);
    state.rings.push({ x: enemy.x, y: enemy.y, r: 2, max: enemy.boss ? 190 : 62, life: 0.38, maxLife: 0.38, color: enemy.color, damage: 0, hits: new Set() });
    state.floating.push({ x: enemy.x, y: enemy.y - enemy.r, text: `+${earned}`, color: enemy.color, life: 0.78, maxLife: 0.78 });
    state.weaponKillCounter += enemy.boss ? 5 : 1;
    state.upgradeKillCounter += enemy.boss ? 5 : 1;
    let droppedWeapon = false;
    let droppedUpgrade = false;
    if (state.weaponKillCounter >= state.nextWeaponDrop) {
      spawnPickup(enemy.x, enemy.y, "weapon");
      state.weaponKillCounter = 0;
      state.nextWeaponDrop = Math.floor(random(17, 24));
      droppedWeapon = true;
    }
    if (state.upgradeKillCounter >= state.nextUpgradeDrop) {
      spawnPickup(clamp(enemy.x + (droppedWeapon ? 32 : 0), 30, W - 30), enemy.y, "upgrade");
      state.upgradeKillCounter = 0;
      state.nextUpgradeDrop = Math.floor(random(11, 16));
      droppedUpgrade = true;
    }
    if (enemy.boss) {
      spawnPickup(clamp(enemy.x - 48, 30, W - 30), enemy.y + 18, "upgrade");
      spawnPickup(enemy.x, enemy.y + 18, "bomb");
      spawnPickup(clamp(enemy.x + 48, 30, W - 30), enemy.y + 18, "repair");
      completeLevel(enemy);
    } else if (!droppedWeapon && !droppedUpgrade) {
      const roll = Math.random();
      if (roll < 0.045) spawnPickup(enemy.x, enemy.y, "bomb");
      else if (roll < 0.07) spawnPickup(enemy.x, enemy.y, "repair");
    }
    tone(enemy.boss ? "boss" : "explode");
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
    const theme = currentLevelDef().theme;
    state.backdropTime += dt;
    for (const star of state.stars) {
      const themeSpeed = theme === "storm" ? 1.45 : theme === "rift" ? 0.72 : 1;
      star.y += (42 + star.z * 142) * themeSpeed * dt;
      if (star.y > H + 8) { star.y = -8; star.x = random(0, W); }
    }
    for (const streak of state.streaks) {
      streak.y += streak.speed * (theme === "storm" ? 1.55 : 1) * dt;
      if (streak.y > H + 30) { streak.y = -random(10, 180); streak.x = random(0, W); }
    }
    if (theme === "storm") {
      state.nextWeatherFlash -= dt;
      if (state.nextWeatherFlash <= 0) {
        state.weatherFlash = 0.24;
        state.nextWeatherFlash = random(3.6, 7.2);
      }
    }
    state.weatherFlash = Math.max(0, state.weatherFlash - dt * 1.4);
  }

  function updateGame(dt) {
    updateBackdrop(dt);
    if (!state.running || state.paused) return;
    state.elapsed += dt;
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 1;
    updateLevelFlow(dt);
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

  function drawPerspectiveGrid(color, horizonY = 190) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let y = horizonY; y < H; y += 34) {
      const t = (y - horizonY) / (H - horizonY);
      const curve = t * t;
      ctx.globalAlpha = 0.055 + curve * 0.14;
      ctx.beginPath();
      ctx.moveTo(18 + curve * 115, y);
      ctx.lineTo(W - 18 - curve * 115, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.13;
    for (let index = 0; index < 9; index += 1) {
      const base = 16 + index * (W - 32) / 8;
      ctx.beginPath();
      ctx.moveTo(W / 2, horizonY);
      ctx.lineTo(base, H);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHarborScene() {
    drawPerspectiveGrid(currentTheme().line, 187);
    ctx.save();
    ctx.globalAlpha = 0.2;
    const cityY = 252;
    for (let index = 0; index < 19; index += 1) {
      const x = index * 31 + Math.sin(index * 13) * 6;
      const height = 15 + (index * 29 % 70);
      ctx.fillStyle = index % 3 === 0 ? "#dc714f" : "#408b80";
      ctx.fillRect(x, cityY - height, 20, height);
      ctx.fillStyle = "#d7e497";
      for (let light = 0; light < 3; light += 1) ctx.fillRect(x + 4 + light * 5, cityY - height + 8, 2, 3);
    }
    ctx.strokeStyle = "#69f7d0";
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.moveTo(0, cityY); ctx.lineTo(W, cityY); ctx.stroke();
    ctx.restore();
  }

  function drawStormScene() {
    ctx.save();
    for (let band = 0; band < 7; band += 1) {
      const y = 120 + band * 94 + Math.sin(state.backdropTime * 0.18 + band) * 18;
      ctx.fillStyle = band % 2 ? "rgba(116, 157, 188, 0.055)" : "rgba(218, 241, 255, 0.045)";
      ctx.beginPath();
      ctx.ellipse(40 + (band % 3) * 160, y, 210, 48, -0.08, 0, TAU);
      ctx.ellipse(360 - (band % 2) * 95, y + 18, 230, 56, 0.06, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = "#9de8ff";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    for (const streak of state.streaks) {
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x - 11, streak.y - streak.len * 1.7);
      ctx.stroke();
    }
    if (state.weatherFlash > 0) {
      ctx.fillStyle = `rgba(207, 241, 255, ${state.weatherFlash})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = Math.min(1, state.weatherFlash * 5);
      ctx.strokeStyle = "#effcff";
      ctx.lineWidth = 3;
      const boltX = 110 + (Math.floor(state.backdropTime * 10) % 4) * 105;
      ctx.beginPath();
      ctx.moveTo(boltX, 0);
      ctx.lineTo(boltX - 24, 88);
      ctx.lineTo(boltX + 8, 132);
      ctx.lineTo(boltX - 31, 218);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawForgeScene() {
    drawPerspectiveGrid(currentTheme().line, 218);
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let index = 0; index < 9; index += 1) {
      const x = index * 68 - 12;
      const height = 55 + (index * 47 % 118);
      ctx.fillStyle = index % 2 ? "#612f25" : "#3d2924";
      ctx.fillRect(x, 220 - height, 46, height);
      ctx.fillStyle = "#ff9b5f";
      ctx.fillRect(x + 8, 211 - height, 7, height * 0.46);
      ctx.fillRect(x + 30, 205 - height, 5, height * 0.28);
    }
    ctx.strokeStyle = "#ffb16d";
    ctx.lineWidth = 2;
    for (let lane = 0; lane < 4; lane += 1) {
      const y = 305 + lane * 142 + Math.sin(state.backdropTime * 2 + lane) * 4;
      ctx.globalAlpha = 0.08 + lane * 0.018;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 18) {
        const waveY = y + Math.sin(x * 0.04 + state.backdropTime * 3) * 8;
        if (x === 0) ctx.moveTo(x, waveY); else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRiftScene() {
    ctx.save();
    ctx.translate(W / 2, 184);
    ctx.rotate(state.backdropTime * 0.1);
    for (let ring = 0; ring < 5; ring += 1) {
      const radius = 44 + ring * 31 + Math.sin(state.backdropTime * 1.5 + ring) * 4;
      ctx.globalAlpha = 0.16 - ring * 0.02;
      ctx.strokeStyle = ring % 2 ? "#d2a7ff" : "#8debd9";
      ctx.lineWidth = ring === 0 ? 3 : 1;
      ctx.beginPath();
      ctx.arc(0, 0, radius, ring * 0.36, Math.PI + ring * 0.58);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius, Math.PI + ring * 0.36, TAU - ring * 0.24);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.12;
    for (let spoke = 0; spoke < 6; spoke += 1) {
      ctx.rotate(TAU / 6);
      ctx.beginPath();
      ctx.moveTo(34, 0);
      ctx.lineTo(162, -18);
      ctx.lineTo(142, 18);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
    drawPerspectiveGrid(currentTheme().line, 244);
  }

  function drawBackdrop() {
    const level = currentLevelDef();
    const theme = currentTheme();
    ctx.save();
    const horizon = ctx.createLinearGradient(0, 0, 0, H);
    horizon.addColorStop(0, theme.sky[0]);
    horizon.addColorStop(0.36, theme.sky[1]);
    horizon.addColorStop(1, theme.sky[2]);
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, W, H);

    for (const star of state.stars) {
      ctx.globalAlpha = (level.theme === "storm" ? 0.12 : 0.24) + star.z * 0.58;
      ctx.fillStyle = star.hue;
      const stretch = level.theme === "forge" ? 2.3 : 1.1 + star.z;
      ctx.fillRect(star.x, star.y, star.size, star.size * stretch);
    }
    if (level.theme !== "storm") {
      ctx.globalAlpha = level.theme === "rift" ? 0.22 : 0.3;
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = 0.7;
      for (const streak of state.streaks) {
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(streak.x, streak.y - streak.len);
        ctx.stroke();
      }
    }
    ctx.restore();

    if (level.theme === "harbor") drawHarborScene();
    if (level.theme === "storm") drawStormScene();
    if (level.theme === "forge") drawForgeScene();
    if (level.theme === "rift") drawRiftScene();
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
    if (enemy.type === "scout") {
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
    } else if (enemy.type === "skimmer") {
      ctx.rotate(Math.sin(enemy.age * 6 + enemy.phase) * 0.22);
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 27); ctx.lineTo(12, 8); ctx.lineTo(30, -2); ctx.lineTo(17, -15); ctx.lineTo(5, -9); ctx.lineTo(0, -28); ctx.lineTo(-5, -9); ctx.lineTo(-17, -15); ctx.lineTo(-30, -2); ctx.lineTo(-12, 8); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#dff8ff";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#18354b";
      ctx.fillRect(-3, -18, 6, 28);
    } else if (enemy.type === "striker") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 34); ctx.lineTo(15, 12); ctx.lineTo(35, 15); ctx.lineTo(23, -13); ctx.lineTo(8, -9); ctx.lineTo(0, -31); ctx.lineTo(-8, -9); ctx.lineTo(-23, -13); ctx.lineTo(-35, 15); ctx.lineTo(-15, 12); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#27465c";
      ctx.beginPath(); ctx.moveTo(0, -21); ctx.lineTo(7, 0); ctx.lineTo(0, 12); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#eafaff";
      ctx.fillRect(-29, 8, 10, 4); ctx.fillRect(19, 8, 10, 4);
    } else if (enemy.type === "bomber") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 34); ctx.lineTo(40, 14); ctx.lineTo(33, -12); ctx.lineTo(12, -5); ctx.lineTo(0, -28); ctx.lineTo(-12, -5); ctx.lineTo(-33, -12); ctx.lineTo(-40, 14); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a2230";
      ctx.fillRect(-7, -18, 14, 28);
      ctx.fillStyle = "#ffd665";
      ctx.fillRect(-27, 8, 9, 5); ctx.fillRect(18, 8, 9, 5);
    } else if (enemy.type === "turret") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 31); ctx.lineTo(32, 21); ctx.lineTo(28, -12); ctx.lineTo(12, -17); ctx.lineTo(0, -28); ctx.lineTo(-12, -17); ctx.lineTo(-28, -12); ctx.lineTo(-32, 21); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4a2c21";
      ctx.beginPath(); ctx.arc(0, 1, 11, 0, TAU); ctx.fill();
      ctx.fillStyle = "#ffe09a";
      ctx.fillRect(-23, 9, 8, 8); ctx.fillRect(15, 9, 8, 8);
    } else if (enemy.type === "wraith") {
      ctx.rotate(Math.sin(enemy.age * 3.4) * 0.15);
      ctx.globalAlpha = 0.8 + Math.sin(enemy.age * 6) * 0.18;
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 35); ctx.lineTo(27, 18); ctx.lineTo(18, 0); ctx.lineTo(31, -22); ctx.lineTo(7, -14); ctx.lineTo(0, -32); ctx.lineTo(-7, -14); ctx.lineTo(-31, -22); ctx.lineTo(-18, 0); ctx.lineTo(-27, 18); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f1dfff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#3b2456";
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(8, 3); ctx.lineTo(0, 18); ctx.lineTo(-8, 3); ctx.closePath(); ctx.fill();
    } else if (enemy.type === "prism") {
      ctx.rotate(enemy.age * 0.35);
      ctx.fillStyle = tint;
      ctx.beginPath();
      for (let point = 0; point < 6; point += 1) {
        const angle = -Math.PI / 2 + point * TAU / 6;
        const radius = point % 2 ? 27 : 32;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#d8fff5";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.rotate(-enemy.age * 0.7);
      ctx.fillStyle = "#173c3d";
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill();
    } else if (enemy.type === "carrier") {
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
    } else if (enemy.type === "tempest") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 70); ctx.lineTo(32, 40); ctx.lineTo(86, 25); ctx.lineTo(66, -12); ctx.lineTo(32, -18); ctx.lineTo(18, -60); ctx.lineTo(0, -73); ctx.lineTo(-18, -60); ctx.lineTo(-32, -18); ctx.lineTo(-66, -12); ctx.lineTo(-86, 25); ctx.lineTo(-32, 40); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#e8fbff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#244a66";
      [-48, 48].forEach((x) => { ctx.beginPath(); ctx.arc(x, 12, 17, 0, TAU); ctx.fill(); });
      ctx.strokeStyle = "#c9f5ff";
      ctx.lineWidth = 3;
      const rotor = enemy.age * 3;
      [-48, 48].forEach((x) => {
        ctx.beginPath(); ctx.moveTo(x + Math.cos(rotor) * 14, 12 + Math.sin(rotor) * 14); ctx.lineTo(x - Math.cos(rotor) * 14, 12 - Math.sin(rotor) * 14); ctx.stroke();
      });
      ctx.fillStyle = "#f4ffff";
      ctx.fillRect(-8, -47, 16, 31);
    } else if (enemy.type === "dreadnought") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 78); ctx.lineTo(32, 54); ctx.lineTo(86, 45); ctx.lineTo(79, -9); ctx.lineTo(44, -31); ctx.lineTo(27, -66); ctx.lineTo(0, -79); ctx.lineTo(-27, -66); ctx.lineTo(-44, -31); ctx.lineTo(-79, -9); ctx.lineTo(-86, 45); ctx.lineTo(-32, 54); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffd09a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#5c3028";
      ctx.fillRect(-27, -45, 54, 72);
      ctx.fillStyle = "#ffcc72";
      ctx.fillRect(-60, 6, 20, 26); ctx.fillRect(40, 6, 20, 26);
      ctx.fillStyle = "#2c1b19";
      ctx.fillRect(-7, -62, 14, 39);
      ctx.strokeStyle = "#ffedb8";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-24, 41); ctx.lineTo(24, 41); ctx.stroke();
    } else if (enemy.type === "core") {
      ctx.rotate(enemy.age * 0.16);
      ctx.strokeStyle = tint;
      ctx.lineWidth = 13;
      ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(0, 0, 57, 0.25, 1.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 57, 2.05, 3.35); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 57, 3.85, 5.55); ctx.stroke();
      ctx.rotate(-enemy.age * 0.42);
      ctx.fillStyle = tint;
      ctx.beginPath();
      for (let point = 0; point < 6; point += 1) {
        const angle = point * TAU / 6;
        const radius = 38;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#15122f";
      ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.fill();
      ctx.fillStyle = enemy.damaged > 0 ? "#ffffff" : "#9af0de";
      ctx.beginPath(); ctx.arc(0, 0, 11 + Math.sin(enemy.age * 4) * 2, 0, TAU); ctx.fill();
    }
    ctx.restore();
    if (enemy.boss || enemy.hp < enemy.maxHp) drawHealthBar(enemy);
  }

  function drawHealthBar(enemy) {
    const width = enemy.boss ? 150 : 45;
    const y = enemy.y - enemy.r - 14;
    ctx.fillStyle = "rgba(2, 9, 9, 0.72)";
    ctx.fillRect(enemy.x - width / 2, y, width, 4);
    ctx.fillStyle = enemy.boss ? currentTheme().accent : enemy.color;
    ctx.fillRect(enemy.x - width / 2, y, width * Math.max(0, enemy.hp / enemy.maxHp), 4);
  }

  function drawPickup(pickup) {
    const color = pickup.kind === "weapon"
      ? weaponDefs[pickup.weapon].color
      : pickup.kind === "upgrade"
        ? "#8de7ff"
        : pickup.kind === "bomb"
          ? "#ffd665"
          : "#69f7d0";
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
    const label = pickup.kind === "weapon" ? weaponDefs[pickup.weapon].pickup : pickup.kind === "upgrade" ? "U" : pickup.kind === "bomb" ? "◆" : "+";
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
    if (enemy && bullet.enemyStyle === "orb") {
      ctx.beginPath(); ctx.arc(0, 0, bullet.r, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, bullet.r + 3, 0, TAU); ctx.stroke();
    } else if (enemy && bullet.enemyStyle === "shard") {
      ctx.beginPath(); ctx.moveTo(0, -bullet.r * 1.7); ctx.lineTo(bullet.r, 0); ctx.lineTo(0, bullet.r * 1.7); ctx.lineTo(-bullet.r, 0); ctx.closePath(); ctx.fill();
    } else if (enemy && bullet.enemyStyle === "spark") {
      ctx.fillRect(-1.5, -bullet.r * 2.2, 3, bullet.r * 4.4);
      ctx.fillRect(-bullet.r, -1, bullet.r * 2, 2);
    } else if (enemy && bullet.enemyStyle === "shell") {
      ctx.beginPath(); ctx.moveTo(0, -bullet.r * 1.7); ctx.lineTo(bullet.r * 0.85, -bullet.r * 0.3); ctx.lineTo(bullet.r * 0.72, bullet.r * 1.3); ctx.lineTo(-bullet.r * 0.72, bullet.r * 1.3); ctx.lineTo(-bullet.r * 0.85, -bullet.r * 0.3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(-1.2, -bullet.r, 2.4, bullet.r * 1.5);
    } else if (enemy && bullet.enemyStyle === "bolt") {
      ctx.fillRect(-bullet.r * 0.35, -bullet.r * 2.4, bullet.r * 0.7, bullet.r * 4.1);
    } else if (bullet.plasma) {
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
    const boss = state.enemies.find((enemy) => enemy.boss && !enemy.dead);
    if (!boss) return;
    const width = 270;
    const y = 92;
    ctx.fillStyle = "rgba(5, 16, 15, 0.64)";
    ctx.fillRect(W / 2 - width / 2, y, width, 16);
    ctx.strokeStyle = boss.color;
    ctx.strokeRect(W / 2 - width / 2, y, width, 16);
    ctx.fillStyle = currentTheme().accent;
    ctx.fillRect(W / 2 - width / 2 + 3, y + 3, (width - 6) * Math.max(0, boss.hp / boss.maxHp), 10);
    ctx.fillStyle = "#fff4c9";
    ctx.font = "900 9px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(boss.bossTitle, W / 2, y - 5);
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
    const level = currentLevelDef();
    const score = pad(state.score);
    const best = pad(Math.max(state.best, state.score));
    const minutes = Math.floor(state.elapsed / 60);
    const seconds = Math.floor(state.elapsed % 60);
    ui.scoreText.textContent = score;
    ui.railScore.textContent = score;
    ui.bestScore.textContent = best;
    ui.railWave.textContent = `${String(state.level).padStart(2, "0")} / ${String(state.wave).padStart(2, "0")}`;
    ui.railElims.textContent = String(state.eliminations).padStart(3, "0");
    ui.range.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    ui.footerWave.textContent = `L${String(state.level).padStart(2, "0")} // W${String(state.wave).padStart(2, "0")}`;
    ui.stageSerial.textContent = `${levelLabel()} / ${level.name}`;
    ui.railSector.textContent = `SECTOR ${String(state.level).padStart(2, "0")}`;
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
      upgrade: [520, 1040, "triangle", 0.075, 0.22],
      level: [190, 720, "sine", 0.065, 0.32],
      clear: [330, 990, "triangle", 0.085, 0.45],
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
