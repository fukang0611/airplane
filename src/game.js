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
    overdriveCard: document.querySelector("#overdriveCard"),
    overdriveLabel: document.querySelector("#overdriveLabel"),
    overdriveFill: document.querySelector("#overdriveFill"),
    overdriveText: document.querySelector("#overdriveText"),
    missionLabel: document.querySelector("#missionLabel"),
    missionProgress: document.querySelector("#missionProgress"),
    missionTitle: document.querySelector("#missionTitle"),
    missionFill: document.querySelector("#missionFill"),
    environmentLabel: document.querySelector("#environmentLabel"),
    moduleName: document.querySelector("#moduleName"),
    moduleChip: document.querySelector("#moduleChip"),
    routePanel: document.querySelector("#routePanel"),
    routeKicker: document.querySelector("#routeKicker"),
    routeSummary: document.querySelector("#routeSummary"),
    routeOptions: document.querySelector("#routeOptions"),
    signalReadout: document.querySelector("#signalReadout"),
    wingmanButton: document.querySelector("#wingmanButton"),
    wingmanIcon: document.querySelector("#wingmanIcon"),
    wingmanName: document.querySelector("#wingmanName"),
    wingmanRole: document.querySelector("#wingmanRole"),
    wingmanStatus: document.querySelector("#wingmanStatus"),
  };

  const weaponDefs = {
    vulcan: { name: "VULCAN", detail: "TWIN CANNON", color: "#69f7d0", rate: 0.105, pickup: "V" },
    spread: { name: "SPREAD", detail: "FAN ARRAY", color: "#ffd665", rate: 0.19, pickup: "S" },
    laser: { name: "LASER", detail: "PHOTON RAY", color: "#73d6ff", rate: 0.075, pickup: "L" },
    plasma: { name: "PLASMA", detail: "ARC ORBS", color: "#ff9177", rate: 0.27, pickup: "P" },
    rail: { name: "RAIL", detail: "PIERCE SHOT", color: "#f4edf6", rate: 0.23, pickup: "R" },
    homing: { name: "HOMING", detail: "SEEKER POD", color: "#de94ff", rate: 0.3, pickup: "H" },
    arc: { name: "ARC", detail: "CHAIN CONDUCTOR", color: "#a7ffe7", rate: 0.23, pickup: "A" },
    gravity: { name: "GRAVITY", detail: "SINGULARITY CANNON", color: "#b8a7ff", rate: 0.52, pickup: "G" },
    blade: { name: "BLADE", detail: "RETURNING EDGE", color: "#ffb77c", rate: 0.31, pickup: "B" },
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
    bulwark: { hp: 168, r: 27, speed: 59, score: 620, color: "#68e6d4", motion: "anchor", attack: "fan", cadence: 3.1, bullet: "orb", supportRole: "shield", supportRange: 168 },
    mender: { hp: 136, r: 24, speed: 62, score: 690, color: "#91f3ad", motion: "glide", attack: "aim", cadence: 3.25, bullet: "spark", supportRole: "repair", supportRange: 178 },
    commander: { hp: 208, r: 30, speed: 55, score: 880, color: "#ffd66e", motion: "anchor", attack: "command", cadence: 2.55, bullet: "shard", supportRole: "command", supportRange: 196 },
    jammer: { hp: 152, r: 25, speed: 74, score: 760, color: "#ee9cff", motion: "orbit", attack: "jam", cadence: 2.85, bullet: "orb", supportRole: "jammer", supportRange: 225 },
    phantom: { hp: 102, r: 22, speed: 116, score: 610, color: "#b49bff", motion: "phase", attack: "cross", cadence: 2.15, bullet: "shard", stealth: true },
    rammer: { hp: 68, r: 19, speed: 168, score: 480, color: "#ff6d65", motion: "ram", attack: "ram", cadence: 9, bullet: "bolt", rammer: true },
    carrier: { hp: 1450, r: 73, speed: 98, score: 4500, color: "#ffcd67", boss: true, motion: "carrier", attack: "carrier", cadence: 1.55, bullet: "shell", bossTitle: "BULWARK CARRIER" },
    tempest: { hp: 1750, r: 70, speed: 92, score: 5600, color: "#90dfff", boss: true, motion: "tempest", attack: "tempest", cadence: 1.32, bullet: "spark", bossTitle: "TEMPEST FORTRESS" },
    dreadnought: { hp: 2200, r: 78, speed: 84, score: 7000, color: "#ff8c62", boss: true, motion: "dreadnought", attack: "dreadnought", cadence: 1.28, bullet: "shell", bossTitle: "FOUNDRY DREADNOUGHT" },
    core: { hp: 2700, r: 65, speed: 76, score: 9000, color: "#c8a6ff", boss: true, motion: "core", attack: "core", cadence: 1.05, bullet: "orb", bossTitle: "RIFT COMMAND CORE" },
    seraph: { hp: 3600, r: 72, speed: 88, score: 15000, color: "#f0dcff", boss: true, motion: "seraph", attack: "seraph", cadence: 0.92, bullet: "orb", bossTitle: "NULL SERAPH // HIDDEN SIGNAL" },
  };

  const levelDefs = [
    {
      name: "NEON HARBOR",
      subtitle: "CITY PERIMETER",
      theme: "harbor",
      difficulty: 1,
      waves: [
        { label: "PATROL V", groups: [{ type: "bulwark", formation: "line", count: 1, squad: "aegis" }, { type: "scout", formation: "vee", count: 5, squad: "aegis" }, { type: "fighter", formation: "line", count: 3, gap: 0.55, squad: "aegis" }] },
        { label: "DOCKLINE", groups: [{ type: "scout", formation: "stagger", count: 6 }, { type: "fighter", formation: "flank", count: 4, gap: 0.62 }] },
        { label: "BREAKWATER", groups: [{ type: "fighter", formation: "arc", count: 5 }, { type: "scout", formation: "vee", count: 5, gap: 0.58 }] },
      ],
      boss: "carrier",
      environment: { type: "slipstream", name: "NEON SLIPSTREAMS" },
      mission: { type: "escort", title: "ESCORT // AEGIS-7", target: 100 },
      routes: ["harborSafe", "harborRisk"],
    },
    {
      name: "STORM FRONT",
      subtitle: "THUNDERHEAD ASCENT",
      theme: "storm",
      difficulty: 1.28,
      waves: [
        { label: "SQUALL RUN", groups: [{ type: "jammer", formation: "line", count: 1, squad: "blackout" }, { type: "skimmer", formation: "stagger", count: 6, squad: "blackout" }, { type: "scout", formation: "flank", count: 4, gap: 0.46, squad: "blackout" }] },
        { label: "CLOUD SPEAR", groups: [{ type: "phantom", formation: "vee", count: 3 }, { type: "striker", formation: "vee", count: 4 }, { type: "skimmer", formation: "arc", count: 6, gap: 0.66 }] },
        { label: "DOWNDRAFT", groups: [{ type: "striker", formation: "line", count: 5 }, { type: "skimmer", formation: "flank", count: 6, gap: 0.58 }] },
      ],
      boss: "tempest",
      environment: { type: "lightning", name: "CHAIN LIGHTNING" },
      mission: { type: "pursuit", title: "INTERCEPT // STORM COURIERS", target: 4, targetType: "skimmer" },
      routes: ["stormSafe", "stormRisk"],
    },
    {
      name: "CRIMSON FORGE",
      subtitle: "SMELTER CORRIDOR",
      theme: "forge",
      difficulty: 1.62,
      waves: [
        { label: "ASH WING", groups: [{ type: "mender", formation: "line", count: 1, squad: "forge" }, { type: "bomber", formation: "line", count: 3, squad: "forge" }, { type: "turret", formation: "flank", count: 4, gap: 0.72, squad: "forge" }] },
        { label: "MOLTEN LOCK", groups: [{ type: "commander", formation: "line", count: 1, squad: "forge-2" }, { type: "bomber", formation: "vee", count: 5, squad: "forge-2" }, { type: "fighter", formation: "stagger", count: 5, gap: 0.58, squad: "forge-2" }] },
        { label: "PRESSURE GATE", groups: [{ type: "turret", formation: "arc", count: 5 }, { type: "bomber", formation: "flank", count: 4, gap: 0.68 }] },
      ],
      boss: "dreadnought",
      environment: { type: "heat", name: "THERMAL VENT GRID" },
      mission: { type: "sabotage", title: "SABOTAGE // FURNACE NODES", target: 3, targetType: "turret" },
      routes: ["forgeSafe", "forgeRisk"],
    },
    {
      name: "VOID GATE",
      subtitle: "ANOMALY APPROACH",
      theme: "rift",
      difficulty: 2.04,
      waves: [
        { label: "GATEKEEPERS", groups: [{ type: "bulwark", formation: "line", count: 1, squad: "gate" }, { type: "jammer", formation: "line", count: 1, squad: "gate" }, { type: "wraith", formation: "arc", count: 6, squad: "gate" }, { type: "prism", formation: "line", count: 3, gap: 0.68, squad: "gate" }] },
        { label: "FRACTURE", groups: [{ type: "phantom", formation: "flank", count: 4 }, { type: "rammer", formation: "vee", count: 4, gap: 0.4 }, { type: "wraith", formation: "flank", count: 7 }, { type: "striker", formation: "vee", count: 5, gap: 0.58 }] },
        { label: "LAST VECTOR", groups: [{ type: "prism", formation: "stagger", count: 5 }, { type: "wraith", formation: "vee", count: 7, gap: 0.62 }] },
      ],
      boss: "core",
      environment: { type: "gravity", name: "GRAVITY WELLS" },
      mission: { type: "escape", title: "ESCAPE // COLLAPSE WINDOW", target: 24 },
      routes: ["riftSafe", "riftRisk"],
    },
  ];

  const themeDefs = {
    harbor: { sky: ["#17302d", "#0a2828", "#061110"], stars: ["#75e7d1", "#e6f6d4", "#ffd878", "#7ad2ed"], line: "#69f7d0", accent: "#ff806a" },
    storm: { sky: ["#1a3447", "#0b1b35", "#050c1d"], stars: ["#d6f3ff", "#78c7ff", "#efffbc", "#91aef8"], line: "#8ee6ff", accent: "#b4e7ff" },
    forge: { sky: ["#3b211b", "#241411", "#0c0a0a"], stars: ["#ffba6f", "#ff6f5d", "#ffd27a", "#d58d69"], line: "#ff9b5f", accent: "#ffdd8a" },
    rift: { sky: ["#14283a", "#0e1530", "#050712"], stars: ["#92f1df", "#b9b1ff", "#e5d3ff", "#7acffd"], line: "#96e9dc", accent: "#d4a7ff" },
  };

  const moduleDefs = {
    none: { name: "NO MODULE", detail: "STANDARD FRAME", color: "#8aa59d" },
    aegis: { name: "AEGIS SHELL", detail: "BLOCKS ONE HIT EACH SECTOR", color: "#69f7d0" },
    reactor: { name: "GRAZE REACTOR", detail: "FASTER, LONGER OVERDRIVE", color: "#ffd665" },
    nanoforge: { name: "NANOFORGE", detail: "REPAIRS ARMOR BETWEEN WAVES", color: "#7de9ff" },
    arsenal: { name: "ARSENAL LINK", detail: "INCREASED WEAPON CYCLING", color: "#ff9b69" },
    magnet: { name: "SALVAGE MAGNET", detail: "ATTRACTS PICKUPS AND LOCKS CORES", color: "#9cf0d9" },
    phase: { name: "PHASE VEIL", detail: "GRAZES GRANT A PHASE WINDOW", color: "#d4a7ff" },
  };

  const wingmanDefs = {
    guardian: { name: "ROOK", role: "AEGIS INTERCEPTOR", color: "#7de9ff", cooldown: 1.35, icon: "R" },
    striker: { name: "LANCER", role: "MISSILE WING", color: "#ffb36d", cooldown: 1.08, icon: "L" },
    medic: { name: "MENDER", role: "NANO SUPPORT", color: "#8ff0b0", cooldown: 6.2, icon: "M" },
  };

  const rescueRoleByEnemy = {
    bulwark: "guardian",
    jammer: "striker",
    commander: "striker",
    mender: "medic",
  };

  const routeDefs = {
    harborSafe: { name: "CONVOY LANE", detail: "Repair 30 armor and load one ion cell.", module: "aegis", pressure: -0.04, score: 1, repair: 30, bombs: 1, color: "#69f7d0", tag: "STABLE" },
    harborRisk: { name: "THUNDER BREACH", detail: "Enter a denser storm with a charged reactor.", module: "reactor", pressure: 0.16, score: 1.25, charge: 38, color: "#ffd665", tag: "RISK +25%" },
    stormSafe: { name: "COOLANT BYPASS", detail: "Restore 35 armor and install autonomous repair.", module: "nanoforge", pressure: 0, score: 1.05, repair: 35, color: "#7de9ff", tag: "RECOVERY" },
    stormRisk: { name: "FOUNDRY RAID", detail: "Faster weapons against reinforced formations.", module: "arsenal", pressure: 0.2, score: 1.3, color: "#ff9b69", tag: "RISK +30%" },
    forgeSafe: { name: "WARDEN CORRIDOR", detail: "Secure salvage and load an additional ion cell.", module: "magnet", pressure: 0.04, score: 1.1, repair: 18, bombs: 1, color: "#9cf0d9", tag: "SALVAGE" },
    forgeRisk: { name: "RIFT SLINGSHOT", detail: "Phase through a volatile anomaly for a score surge.", module: "phase", pressure: 0.24, score: 1.38, charge: 56, color: "#d4a7ff", tag: "RISK +38%" },
    riftSafe: { name: "DAWN RETURN", detail: "Re-arm the Aegis shell before the next combat cycle.", module: "aegis", pressure: 0.08, score: 1.15, repair: 40, bombs: 1, color: "#69f7d0", tag: "CYCLE SAFE" },
    riftRisk: { name: "ECHO DESCENT", detail: "Descend deeper; every formation mutates faster.", module: "reactor", pressure: 0.3, score: 1.55, charge: 70, color: "#ff7ee5", tag: "CYCLE +55%" },
  };

  const bossPartDefs = {
    carrier: [
      { id: "port-battery", label: "PORT BATTERY", x: -53, y: 20, r: 18, hp: 250, role: "gun" },
      { id: "starboard-battery", label: "STARBOARD BATTERY", x: 53, y: 20, r: 18, hp: 250, role: "gun" },
    ],
    tempest: [
      { id: "port-rotor", label: "PORT ROTOR", x: -49, y: 12, r: 19, hp: 290, role: "gun" },
      { id: "starboard-rotor", label: "STARBOARD ROTOR", x: 49, y: 12, r: 19, hp: 290, role: "gun" },
    ],
    dreadnought: [
      { id: "port-cannon", label: "PORT CANNON", x: -53, y: 18, r: 19, hp: 350, role: "gun" },
      { id: "furnace-plate", label: "FURNACE PLATE", x: 0, y: -28, r: 18, hp: 430, role: "shield" },
      { id: "starboard-cannon", label: "STARBOARD CANNON", x: 53, y: 18, r: 19, hp: 350, role: "gun" },
    ],
    core: [
      { id: "rift-node-a", label: "RIFT NODE A", orbit: 59, angle: -Math.PI / 2, orbitSpeed: 0.72, r: 15, hp: 340, role: "node" },
      { id: "rift-node-b", label: "RIFT NODE B", orbit: 59, angle: Math.PI / 6, orbitSpeed: 0.72, r: 15, hp: 340, role: "node" },
      { id: "rift-node-c", label: "RIFT NODE C", orbit: 59, angle: Math.PI * 5 / 6, orbitSpeed: 0.72, r: 15, hp: 340, role: "node" },
    ],
    seraph: [
      { id: "left-halo", label: "LEFT HALO", orbit: 66, angle: Math.PI, orbitSpeed: -0.9, r: 16, hp: 420, role: "node" },
      { id: "crown", label: "SERAPH CROWN", x: 0, y: -44, r: 17, hp: 520, role: "shield" },
      { id: "right-halo", label: "RIGHT HALO", orbit: 66, angle: 0, orbitSpeed: -0.9, r: 16, hp: 420, role: "node" },
    ],
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
    overdriveCharge: 0,
    overdrive: 0,
    overdriveMax: 0,
    grazes: 0,
    environment: null,
    hazards: [],
    mission: null,
    ally: null,
    signalFragments: 0,
    missionSuccesses: 0,
    bossPartsDestroyed: 0,
    jamStrength: 0,
    module: "none",
    moduleCooldown: 0,
    routeModifier: { pressure: 0, score: 1 },
    routeOpen: false,
    secretBossActive: false,
    secretBossDefeated: false,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    pickups: [],
    particles: [],
    rings: [],
    arcs: [],
    floating: [],
    wingmanRoster: [],
    wingman: null,
    rescueDropLevel: 0,
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
    return currentLevelDef().difficulty + currentCycle() * cycleStep + (state.routeModifier?.pressure || 0);
  }
  function levelLabel() { return `LEVEL ${String(state.level).padStart(2, "0")}`; }

  function tacticalSourceFor(enemy, role, range) {
    return state.enemies.find((candidate) => {
      if (candidate === enemy || candidate.dead || candidate.boss) return false;
      const def = enemyDefs[candidate.type];
      return def.supportRole === role && distance(candidate, enemy) <= (range || def.supportRange || 160);
    }) || null;
  }

  function emitArc(from, to, color, life = 0.18, width = 2) {
    state.arcs.push({ from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y }, color, life, maxLife: life, width, jitter: random(-8, 8) });
  }

  function deployWingman(role, announce = true) {
    const def = wingmanDefs[role];
    if (!def || !state.player) return;
    state.wingman = {
      role,
      x: state.player.x + (role === "guardian" ? -54 : 54),
      y: state.player.y + 16,
      age: 0,
      cooldown: 0.35,
      pulse: 0,
      tilt: 0,
    };
    if (announce) {
      setAlert(`WINGMAN LINK // ${def.name}`, "bright", 1.1);
      state.floating.push({ x: state.player.x, y: state.player.y - 46, text: `${def.name} ONLINE`, color: def.color, life: 1.15, maxLife: 1.15 });
      tone("wingman");
    }
    syncUi();
  }

  function unlockWingman(role) {
    if (!wingmanDefs[role] || state.wingmanRoster.includes(role)) return;
    state.wingmanRoster.push(role);
    deployWingman(role);
    const def = wingmanDefs[role];
    state.floating.push({ x: W / 2, y: 235, text: `RESCUE LINK // ${def.name}`, color: def.color, life: 1.8, maxLife: 1.8 });
  }

  function cycleWingman() {
    if (!state.running || state.paused || state.routeOpen || state.wingmanRoster.length < 2) return;
    const current = state.wingman?.role;
    const index = Math.max(0, state.wingmanRoster.indexOf(current));
    deployWingman(state.wingmanRoster[(index + 1) % state.wingmanRoster.length]);
  }

  function addOverdrive(amount) {
    if (!state.running || !state.player) return;
    const reactorBoost = state.module === "reactor" ? 1.35 : 1;
    if (state.overdrive > 0) {
      state.overdrive = Math.min(state.overdriveMax, state.overdrive + amount * 0.012 * reactorBoost);
      return;
    }
    state.overdriveCharge = clamp(state.overdriveCharge + amount * reactorBoost, 0, 100);
    if (state.overdriveCharge < 100) return;
    state.overdriveMax = state.module === "reactor" ? 9 : 7;
    state.overdrive = state.overdriveMax;
    state.overdriveCharge = 100;
    state.flash = Math.max(state.flash, 0.2);
    state.shake = Math.max(state.shake, 5);
    state.rings.push({ x: state.player.x, y: state.player.y, r: 8, max: 155, life: 0.48, maxLife: 0.48, color: "#ffd665", damage: 18, hits: new Set() });
    setAlert("OVERDRIVE // WEAPONS FREE", "bright", 1.5);
    tone("overdrive");
    navigator.vibrate?.(24);
  }

  function registerGraze(bullet) {
    if (bullet.grazed || state.overdrive > 0) return;
    bullet.grazed = true;
    state.grazes += 1;
    state.score += 18 * Math.max(1, state.combo);
    addOverdrive(4.2);
    if (state.module === "phase" && state.moduleCooldown <= 0 && state.player) {
      state.player.invulnerable = Math.max(state.player.invulnerable, 0.2);
      state.moduleCooldown = 0.62;
    }
    if (state.grazes % 4 === 0) {
      state.floating.push({ x: state.player.x, y: state.player.y - 34, text: `GRAZE ${state.grazes}`, color: "#ffd665", life: 0.54, maxLife: 0.54 });
      tone("graze", 0.022);
    }
  }

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

  function initEnvironment() {
    const environment = currentLevelDef().environment;
    state.environment = {
      type: environment.type,
      name: environment.name,
      timer: environment.type === "slipstream" ? 2.2 : 3.2,
      pulse: 0,
    };
    state.hazards = [];
  }

  function initMission() {
    const definition = currentLevelDef().mission;
    const cycleBonus = currentCycle();
    const target = definition.type === "escape"
      ? definition.target + cycleBonus * 5
      : definition.type === "escort"
        ? definition.target
        : definition.target + cycleBonus;
    state.mission = {
      ...definition,
      target,
      progress: definition.type === "escort" ? 100 : 0,
      assigned: 0,
      missed: 0,
      resolved: false,
      success: false,
      status: "ACTIVE",
    };
    state.ally = definition.type === "escort"
      ? { x: W / 2, y: H - 265, baseY: H - 265, r: 24, hp: 140, maxHp: 140, age: 0, damaged: 0, dead: false }
      : null;
  }

  function resolveMission(success, detail) {
    const mission = state.mission;
    if (!mission || mission.resolved) return;
    mission.resolved = true;
    mission.success = success;
    mission.status = success ? "COMPLETE" : "FAILED";
    if (success) {
      state.signalFragments = Math.min(4, state.signalFragments + 1);
      state.missionSuccesses += 1;
      state.score += 1200 * (currentCycle() + 1);
      addOverdrive(28);
      setAlert(`MISSION COMPLETE // SIGNAL ${state.signalFragments}/4`, "bright", 1.65);
      tone("mission");
    } else {
      setAlert(`MISSION LOST // ${detail || mission.title}`, "danger", 1.65);
      tone("warning");
    }
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
      moduleCharges: 0,
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
    const previousCycle = currentCycle();
    state.level = level;
    if (currentCycle() !== previousCycle) {
      state.signalFragments = 0;
      state.secretBossActive = false;
      state.secretBossDefeated = false;
    }
    state.levelPhase = "intro";
    state.phaseTimer = 2.15;
    state.waveIndex = -1;
    state.wave = 1;
    state.waveTimer = 0;
    state.spawnQueue = [];
    state.bossActive = false;
    state.bossDefeated = false;
    state.routeOpen = false;
    ui.routePanel.classList.remove("is-visible");
    ui.routePanel.setAttribute("aria-hidden", "true");
    state.enemyBullets = [];
    initBackdrop();
    initEnvironment();
    initMission();
    if (state.player) state.player.moduleCharges = state.module === "aegis" ? 1 : 0;
    const def = currentLevelDef();
    const cycle = currentCycle() > 0 ? ` // CYCLE ${currentCycle() + 1}` : "";
    setAlert(`${levelLabel()} // ${def.name}${cycle}`, "bright", 2.15);
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
    state.overdriveCharge = 0;
    state.overdrive = 0;
    state.overdriveMax = 0;
    state.grazes = 0;
    state.signalFragments = 0;
    state.missionSuccesses = 0;
    state.bossPartsDestroyed = 0;
    state.jamStrength = 0;
    state.module = "none";
    state.moduleCooldown = 0;
    state.routeModifier = { pressure: 0, score: 1 };
    state.routeOpen = false;
    state.secretBossActive = false;
    state.secretBossDefeated = false;
    state.environment = null;
    state.hazards = [];
    state.mission = null;
    state.ally = null;
    state.bullets = [];
    state.enemyBullets = [];
    state.enemies = [];
    state.pickups = [];
    state.particles = [];
    state.rings = [];
    state.arcs = [];
    state.floating = [];
    state.wingmanRoster = [];
    state.wingman = null;
    state.rescueDropLevel = 0;
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
    if (!state.running || state.gameOver || state.routeOpen) return;
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

  function finishMissionBeforeBoss() {
    const mission = state.mission;
    if (!mission || mission.resolved) return;
    if (mission.type === "escort") resolveMission(Boolean(state.ally && !state.ally.dead), "ESCORT LOST");
    else resolveMission(mission.progress >= mission.target, `${mission.progress}/${mission.target}`);
  }

  function shouldUnlockSecretBoss(enemy) {
    return enemy.type === currentLevelDef().boss
      && state.level % levelDefs.length === 0
      && state.signalFragments >= 4
      && !state.secretBossActive
      && !state.secretBossDefeated;
  }

  function startSecretBoss() {
    state.levelPhase = "secret-boss";
    state.bossActive = true;
    state.secretBossActive = true;
    spawnEnemy("seraph", { x: W / 2, y: -110, secret: true });
    setAlert("HIDDEN CONTACT // NULL SERAPH", "danger", 2.2);
    tone("boss");
  }

  function openRouteChoice() {
    const routeKeys = currentLevelDef().routes;
    state.levelPhase = "route";
    state.routeOpen = true;
    resetPointerInput();
    ui.routeKicker.textContent = state.level % levelDefs.length === 0
      ? `COMBAT CYCLE ${currentCycle() + 1} COMPLETE // SELECT DESCENT`
      : `${levelLabel()} SECURED // SELECT VECTOR`;
    ui.routeSummary.textContent = state.mission?.success
      ? "支线任务已完成，异常信号已经稳定。航线会替换当前战术模块并改变下一关压力。"
      : "支线任务未完成，但仍可继续推进。选择补给航线，或以更高压力换取更高得分。";
    ui.signalReadout.textContent = `ANOMALY SIGNAL ${state.signalFragments} / 4${state.signalFragments >= 4 ? " // LOCKED" : ""}`;
    ui.routeOptions.innerHTML = routeKeys.map((key, index) => {
      const route = routeDefs[key];
      const module = moduleDefs[route.module];
      return `
        <button class="route-option" type="button" data-route="${key}" style="--route-color: ${route.color}">
          <span class="route-option__index">${index + 1}</span>
          <span><b>${route.name}</b><small>${route.detail}</small></span>
          <em>${route.tag}<br />${module.name}</em>
        </button>
      `;
    }).join("");
    ui.routePanel.classList.add("is-visible");
    ui.routePanel.setAttribute("aria-hidden", "false");
    ui.routeOptions.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", () => selectRoute(button.dataset.route), { once: true });
    });
    ui.routeOptions.querySelector("button")?.focus({ preventScroll: true });
    tone("route");
  }

  function selectRoute(key) {
    if (!state.routeOpen || !routeDefs[key]) return;
    const route = routeDefs[key];
    const player = state.player;
    state.routeOpen = false;
    state.routeModifier = { pressure: route.pressure, score: route.score };
    state.module = route.module;
    if (player) {
      if (route.repair) player.hp = Math.min(100, player.hp + route.repair);
      if (route.bombs) player.bombs = Math.min(5, player.bombs + route.bombs);
    }
    ui.routePanel.classList.remove("is-visible");
    ui.routePanel.setAttribute("aria-hidden", "true");
    startLevel(state.level + 1);
    if (route.charge) addOverdrive(route.charge);
    state.floating.push({ x: W / 2, y: 245, text: moduleDefs[route.module].name, color: route.color, life: 1.8, maxLife: 1.8 });
    tone("route");
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
      const squadId = `${state.level}-${state.waveIndex + 1}-${group.squad || groupIndex}`;
      formationSlots(group.formation, group.count).forEach((slot, index) => {
        const elite = currentCycle() > 0 && index < Math.min(currentCycle(), 2) && (groupIndex + index) % 2 === 0;
        queue.push({ at: cursor + index * interval, type: group.type, phase: groupPhase, squadId, elite, ...slot });
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
      finishMissionBeforeBoss();
      state.levelPhase = "boss-warning";
      state.phaseTimer = 2.35;
      state.spawnQueue = [];
      setAlert(`WARNING // ${enemyDefs[level.boss].bossTitle}`, "danger", 2.35);
      tone("warning");
      return;
    }
    if (state.waveIndex > 0 && state.module === "nanoforge" && state.player) {
      state.player.hp = Math.min(100, state.player.hp + 14);
      state.floating.push({ x: state.player.x, y: state.player.y - 36, text: "NANOFORGE +14", color: moduleDefs.nanoforge.color, life: 0.9, maxLife: 0.9 });
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
    if (!enemy.boss || state.bossDefeated) return;
    if (shouldUnlockSecretBoss(enemy)) {
      state.bossActive = false;
      state.hazards = [];
      state.levelPhase = "secret-warning";
      state.phaseTimer = 2.8;
      state.enemyBullets.forEach((bullet) => { bullet.dead = true; });
      state.flash = 0.24;
      setAlert("ANOMALY SIGNAL COMPLETE // SOMETHING ANSWERED", "danger", 2.8);
      state.floating.push({ x: W / 2, y: 275, text: "HIDDEN VECTOR OPEN", color: "#f0dcff", life: 2.4, maxLife: 2.4 });
      tone("warning");
      return;
    }
    if (enemy.type === "seraph") {
      state.secretBossDefeated = true;
      state.secretBossActive = false;
    }
    state.bossDefeated = true;
    state.bossActive = false;
    state.hazards = [];
    state.levelPhase = "clear";
    state.phaseTimer = 2.65;
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
    if (state.levelPhase === "secret-warning") {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) startSecretBoss();
      return;
    }
    if (state.levelPhase === "clear") {
      state.phaseTimer -= dt;
      if (state.phaseTimer <= 0) openRouteChoice();
    }
  }

  function makeBossParts(type, hpScale) {
    return (bossPartDefs[type] || []).map((part) => {
      const maxHp = Math.round(part.hp * hpScale * 0.78);
      return { ...part, hp: maxHp, maxHp, dead: false, damaged: 0 };
    });
  }

  function bossPartPosition(enemy, part) {
    if (part.orbit) {
      const angle = part.angle + enemy.age * part.orbitSpeed;
      return { x: enemy.x + Math.cos(angle) * part.orbit, y: enemy.y + Math.sin(angle) * part.orbit };
    }
    return { x: enemy.x + part.x, y: enemy.y + part.y };
  }

  function aliveBossParts(enemy, role) {
    return (enemy.parts || []).filter((part) => !part.dead && (!role || part.role === role));
  }

  function bossStage(enemy) {
    if (!enemy.boss) return 1;
    const total = enemy.parts?.length || 0;
    const destroyed = total - aliveBossParts(enemy).length;
    if ((total > 0 && destroyed === total) || enemy.hp <= enemy.maxHp * 0.3) return 3;
    if ((total > 0 && destroyed >= Math.ceil(total / 2)) || enemy.hp <= enemy.maxHp * 0.64) return 2;
    return 1;
  }

  function refreshBossStage(enemy) {
    const next = bossStage(enemy);
    if (next <= enemy.stage) return;
    enemy.stage = next;
    enemy.shoot = Math.min(enemy.shoot, 0.48);
    state.enemyBullets.forEach((bullet, index) => { if (index % 3 === 0) bullet.dead = true; });
    state.flash = Math.max(state.flash, 0.18);
    state.shake = Math.max(state.shake, 7);
    setAlert(`BOSS PHASE ${next} // ${next === 3 ? "CORE EXPOSED" : "ARMOR BREACH"}`, "danger", 1.45);
    tone("phase");
  }

  function spawnEnemy(type, options = {}) {
    const def = enemyDefs[type];
    const difficulty = currentDifficulty();
    const cycleScale = Math.pow(1.68, currentCycle());
    const eliteScale = options.elite ? 1.55 : 1;
    const hpScale = (def.boss ? 0.72 + difficulty * 0.38 : 0.72 + difficulty * 0.32) * cycleScale * eliteScale;
    const x = options.x ?? (def.boss ? W / 2 : random(48, W - 48));
    const mission = state.mission;
    const missionTarget = Boolean(!def.boss
      && mission
      && !mission.resolved
      && mission.targetType === type
      && mission.assigned < mission.target);
    if (missionTarget) mission.assigned += 1;
    const enemy = {
      type,
      x,
      y: options.y ?? (def.boss ? -def.r - 30 : -random(35, 105)),
      baseX: x,
      r: def.r,
      hp: Math.round(def.hp * hpScale),
      maxHp: Math.round(def.hp * hpScale),
      speed: def.speed * (1 + Math.min(0.25, (state.level - 1) * 0.035)) * (options.elite ? 1.08 : 1) * (missionTarget && mission.type === "pursuit" ? 1.13 : 1),
      score: Math.round(def.score * (1 + currentCycle() * 0.75) * (options.elite ? 1.8 : 1)),
      color: def.color,
      boss: Boolean(def.boss),
      elite: Boolean(options.elite),
      missionTarget,
      secret: Boolean(options.secret),
      squadId: options.squadId || "solo",
      supportRole: def.supportRole || "",
      supportRange: def.supportRange || 0,
      stealth: Boolean(def.stealth),
      cloaked: false,
      repairCooldown: random(0.9, 1.6),
      shieldFlash: 0,
      supportFlash: 0,
      bossTitle: def.bossTitle || "",
      phase: options.phase ?? random(0, TAU),
      age: 0,
      shoot: def.boss ? 1.25 : random(1.25, 2.25),
      attackStep: 0,
      turn: random(-1, 1),
      drift: random(30, 75),
      targetY: def.boss ? 148 + (def.r - 65) * 0.45 : null,
      parts: def.boss ? makeBossParts(type, hpScale) : [],
      stage: 1,
      dead: false,
      damaged: 0,
    };
    state.enemies.push(enemy);
    return enemy;
  }

  function spawnPickup(x, y, kind, weapon, options = {}) {
    const roll = Math.random();
    const actualKind = kind || (roll < 0.55 ? "armory" : roll < 0.74 ? "upgrade" : roll < 0.88 ? "bomb" : "repair");
    let selectedWeapon = weapon;
    if (!selectedWeapon && (actualKind === "weapon" || actualKind === "armory")) {
      const alternatives = state.player ? weaponKeys.filter((key) => key !== state.player.weapon) : weaponKeys;
      selectedWeapon = state.player && Math.random() < 0.34 ? state.player.weapon : choose(alternatives.length ? alternatives : weaponKeys);
    }
    state.pickups.push({
      x,
      y,
      kind: actualKind,
      weapon: selectedWeapon,
      weaponIndex: Math.max(0, weaponKeys.indexOf(selectedWeapon)),
      pilotRole: options.pilotRole || "",
      r: actualKind === "armory" ? 22 : actualKind === "rescue" ? 21 : 18,
      life: actualKind === "armory" || actualKind === "rescue" ? 15 : 12,
      spin: random(0, TAU),
      vy: actualKind === "armory" || actualKind === "rescue" ? random(36, 48) : random(50, 74),
      hitPulse: 0,
      cycleCharge: 0,
      dead: false,
    });
  }

  function fireEnemy(enemy) {
    if (!state.player || enemy.y < 20) return;
    const def = enemyDefs[enemy.type];
    if (def.attack === "ram") return;
    const bulletCap = Math.min(92, 24 + state.level * 12);
    if (state.enemyBullets.length >= bulletCap) return;
    const escortTarget = state.mission?.type === "escort" && !state.mission.resolved && state.ally && !state.ally.dead && Math.random() < 0.28;
    const target = escortTarget ? state.ally : state.player;
    const aimedAngle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const damageScale = 1 + Math.min(0.32, (state.level - 1) * 0.045);
    const projectileScale = 1 + currentCycle() * 0.07 + Math.max(0, state.routeModifier.pressure || 0) * 0.18;
    const create = (angle, speed, damage, options = {}) => {
      if (state.enemyBullets.length >= bulletCap) return;
      state.enemyBullets.push({
        x: options.x ?? enemy.x,
        y: options.y ?? enemy.y + enemy.r * 0.4,
        vx: Math.cos(angle) * speed * projectileScale,
        vy: Math.sin(angle) * speed * projectileScale,
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
    if (def.attack === "command") {
      [-0.24, 0, 0.24].forEach((offset) => aimed(offset, 206, 12, { r: 5, color: "#ffe19a", style: "shard" }));
      radial(5, 132, 8, enemy.age * 0.55, { r: 4, color: "#ffd665", style: "spark" });
    }
    if (def.attack === "jam") {
      [-0.22, 0, 0.22].forEach((offset) => aimed(offset, 210, 11, { r: 5, color: "#efabff", style: "orb", curve: offset * 0.7 }));
      radial(5, 126, 7, -enemy.age * 0.8, { r: 4, color: "#d8a4ff", style: "spark", curve: 0.12 });
    }
    if (def.attack === "radial") radial(7, 172, 10, enemy.age * 0.7, { r: 5, style: "orb" });
    if (def.attack === "carrier") {
      [-0.48, -0.24, 0, 0.24, 0.48].forEach((offset) => aimed(offset, 182, 13, { r: 6, color: "#ffd665" }));
      aliveBossParts(enemy, "gun").forEach((part) => {
        const origin = bossPartPosition(enemy, part);
        const side = origin.x < enemy.x ? 0.3 : -0.3;
        create(Math.PI / 2 + side, 225, 14, { x: origin.x, y: origin.y + 18, r: 7, color: "#ff8c6d", style: "shell" });
      });
    }
    if (def.attack === "tempest") {
      if (enemy.attackStep % 2 === 0) radial(6 + aliveBossParts(enemy, "gun").length * 2, 160, 10, enemy.age * 0.82, { r: 4, color: "#91e4ff", style: "spark", curve: 0.12 });
      else [-0.42, -0.21, 0, 0.21, 0.42].forEach((offset) => aimed(offset, 238, 12, { r: 5, color: "#e7fbff", style: "bolt" }));
    }
    if (def.attack === "dreadnought") {
      if (enemy.attackStep % 2 === 0) {
        const guns = aliveBossParts(enemy, "gun");
        (guns.length ? guns : [{ x: 0, y: 20 }]).forEach((part) => {
          const origin = part.id ? bossPartPosition(enemy, part) : { x: enemy.x, y: enemy.y + 20 };
          create(Math.PI / 2, 214, 15, { x: origin.x, y: origin.y + 22, r: 8, color: "#ff9a5f", style: "shell" });
        });
      } else {
        [-0.54, -0.36, -0.18, 0, 0.18, 0.36, 0.54].forEach((offset) => aimed(offset, 174, 13, { r: 6, color: "#ffcb73", style: "shard" }));
      }
    }
    if (def.attack === "core") {
      radial(6 + aliveBossParts(enemy, "node").length * 2, 158 + (enemy.attackStep % 3) * 18, 11, enemy.age * 1.1, { r: 6, color: enemy.attackStep % 2 ? "#9af0de" : "#d6a8ff", style: "orb", curve: enemy.attackStep % 2 ? 0.14 : -0.14 });
      [-0.18, 0, 0.18].forEach((offset) => aimed(offset, 252, 13, { r: 4, color: "#f1e8ff", style: "bolt" }));
    }
    if (def.attack === "seraph") {
      const spin = enemy.attackStep % 2 ? 0.16 : -0.16;
      radial(14, 168 + enemy.stage * 13, 12, enemy.age * 1.35, { r: 6, color: enemy.attackStep % 2 ? "#f0dcff" : "#8ff5df", style: "orb", curve: spin });
      [-0.3, -0.15, 0, 0.15, 0.3].forEach((offset) => aimed(offset, 275, 14, { r: 4, color: "#ffffff", style: "spark" }));
    }
    if (enemy.boss && enemy.stage >= 2) {
      if (enemy.attackStep % 2 === 0) [-0.27, 0, 0.27].forEach((offset) => aimed(offset, 248, 12, { r: 5, color: currentTheme().accent, style: "shard" }));
      else radial(6 + enemy.stage * 2, 148 + enemy.stage * 12, 10, -enemy.age * 0.78, { r: 5, color: currentTheme().line, style: "orb", curve: -0.08 });
    }
    if (enemy.boss && enemy.stage >= 3) {
      [-64, 64].forEach((lane) => create(Math.PI / 2, 235, 14, { x: enemy.x + lane, y: enemy.y + 28, r: 6, color: "#fff2bd", style: "bolt" }));
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
      const bullet = { x, y, vx, vy, r: 4, damage: 12, color: def.color, life: 2.2, pierce: 1, hits: 0, type: player.weapon, dead: false, ...opts };
      if (state.overdrive > 0) {
        bullet.damage *= 1.28;
        bullet.vx *= 1.08;
        bullet.vy *= 1.08;
        bullet.overdrive = true;
      }
      state.bullets.push(bullet);
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
    if (player.weapon === "arc") {
      const lanes = level === 1 ? [-9, 9] : level === 2 ? [-15, 15] : [-20, 0, 20];
      lanes.forEach((lane) => add(player.x + lane, player.y - 25, lane * 1.2, -525, {
        damage: 19 + level * 5,
        r: 4.5,
        pierce: 1,
        chain: true,
        chainCount: 1 + level,
        chainRange: 92 + level * 16,
        life: 1.9,
      }));
    }
    if (player.weapon === "gravity") {
      const lanes = level === 1 ? [0] : level === 2 ? [-16, 16] : [-22, 0, 22];
      lanes.forEach((lane) => add(player.x + lane, player.y - 30, lane * 0.7, -330, {
        damage: 38 + level * 10,
        r: 10 + level,
        pierce: 1,
        gravity: true,
        gravityRadius: 92 + level * 16,
        gravityForce: 72 + level * 18,
        life: 2.2,
      }));
    }
    if (player.weapon === "blade") {
      const lanes = level === 1 ? [-17, 17] : level === 2 ? [-24, 0, 24] : [-31, -10, 10, 31];
      lanes.forEach((lane) => add(player.x + lane, player.y - 23, lane * 1.6, -480, {
        damage: 24 + level * 6,
        r: 8,
        pierce: 4 + level * 2,
        blade: true,
        returnAfter: 0.68 + Math.abs(lane) * 0.001,
        life: 3.2,
      }));
    }
    tone(player.weapon === "rail" ? "rail" : "shoot", player.weapon === "laser" ? 0.018 : 0.026);
  }

  function explodePlasma(bullet) {
    state.rings.push({ x: bullet.x, y: bullet.y, r: 5, max: 72, life: 0.34, maxLife: 0.34, color: bullet.color, damage: bullet.damage * 0.52, hits: new Set() });
    burst(bullet.x, bullet.y, bullet.color, 13, 145, 0.46);
  }

  function triggerChainLightning(bullet, firstTarget) {
    if (!bullet.chain || bullet.chained || !firstTarget) return;
    bullet.chained = true;
    const visited = new Set([firstTarget]);
    let current = firstTarget;
    for (let hop = 0; hop < bullet.chainCount; hop += 1) {
      const candidates = state.enemies
        .filter((enemy) => !enemy.dead && !visited.has(enemy) && distance(current, enemy) <= bullet.chainRange)
        .sort((a, b) => {
          const roleBiasA = enemyDefs[a.type].supportRole ? -34 : 0;
          const roleBiasB = enemyDefs[b.type].supportRole ? -34 : 0;
          return distance(current, a) + roleBiasA - distance(current, b) - roleBiasB;
        });
      const next = candidates[0];
      if (!next) break;
      const damageScale = Math.max(0.42, 0.76 - hop * 0.1);
      emitArc(current, next, bullet.color, 0.2, 3 - hop * 0.35);
      visited.add(next);
      damageEnemy(next, bullet.damage * damageScale);
      current = next;
    }
  }

  function collapseGravityBullet(bullet) {
    if (bullet.collapsed) return;
    bullet.collapsed = true;
    bullet.dead = true;
    const radius = bullet.gravityRadius || 110;
    state.rings.push({ x: bullet.x, y: bullet.y, r: 6, max: radius, life: 0.44, maxLife: 0.44, color: bullet.color, damage: bullet.damage * 0.66, hits: new Set() });
    let captured = 0;
    for (const hostile of state.enemyBullets) {
      if (!hostile.dead && distance(bullet, hostile) < radius * 0.82) {
        hostile.dead = true;
        captured += 1;
      }
    }
    if (captured) addOverdrive(Math.min(12, captured * 0.7));
    burst(bullet.x, bullet.y, bullet.color, 22 + Math.min(18, captured), 185, 0.58);
    state.shake = Math.max(state.shake, 4.5);
    tone("gravity", 0.04);
  }

  function updateGravityBullet(bullet, dt) {
    const radius = bullet.gravityRadius || 110;
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const d = Math.hypot(dx, dy);
      if (d <= 1 || d > radius) continue;
      const force = (1 - d / radius) * bullet.gravityForce * (enemy.boss ? 0.08 : 1);
      const pullX = dx / d * force * dt;
      enemy.x += pullX;
      enemy.y += dy / d * force * dt;
      if (!enemy.boss && Number.isFinite(enemy.baseX)) enemy.baseX = clamp(enemy.baseX + pullX, 26, W - 26);
    }
    for (const hostile of state.enemyBullets) {
      if (hostile.dead) continue;
      const dx = bullet.x - hostile.x;
      const dy = bullet.y - hostile.y;
      const d = Math.hypot(dx, dy);
      if (d <= 1 || d > radius * 1.08) continue;
      const force = (1 - d / (radius * 1.08)) * bullet.gravityForce * 2.2;
      hostile.vx += dx / d * force * dt;
      hostile.vy += dy / d * force * dt;
      if (d < bullet.r + hostile.r + 6) hostile.dead = true;
    }
  }

  function updateBladeBullet(bullet, dt) {
    const player = state.player;
    if (!player) return;
    if (!bullet.returning && (bullet.age >= bullet.returnAfter || bullet.y < 92)) {
      bullet.returning = true;
      bullet.hitIds = new Set();
      bullet.hits = 0;
    }
    if (!bullet.returning) return;
    const desired = Math.atan2(player.y - bullet.y, player.x - bullet.x);
    const current = Math.atan2(bullet.vy, bullet.vx);
    let turn = (desired - current + Math.PI * 3) % TAU - Math.PI;
    turn = clamp(turn, -6.2 * dt, 6.2 * dt);
    const speed = Math.min(620, Math.hypot(bullet.vx, bullet.vy) + 190 * dt);
    bullet.vx = Math.cos(current + turn) * speed;
    bullet.vy = Math.sin(current + turn) * speed;
    if (distance(bullet, player) < player.r + 12 && bullet.age > bullet.returnAfter + 0.16) bullet.dead = true;
  }

  function fireWingmanMissile(wingman, target) {
    const def = wingmanDefs[wingman.role];
    const level = state.player?.weaponLevel || 1;
    const angle = Math.atan2(target.y - wingman.y, target.x - wingman.x);
    state.bullets.push({
      x: wingman.x,
      y: wingman.y - 12,
      vx: Math.cos(angle) * 285,
      vy: Math.sin(angle) * 285,
      r: 5,
      damage: 17 + level * 5,
      color: def.color,
      life: 3.2,
      pierce: 1,
      hits: 0,
      type: "wingman",
      homing: true,
      turnRate: 4.8,
      dead: false,
    });
    tone("wingman-shot", 0.018);
  }

  function updateWingman(dt) {
    const wingman = state.wingman;
    const player = state.player;
    if (!wingman || !player) return;
    const def = wingmanDefs[wingman.role];
    wingman.age += dt;
    wingman.cooldown = Math.max(0, wingman.cooldown - dt);
    wingman.pulse = Math.max(0, wingman.pulse - dt);
    const rosterIndex = Math.max(0, state.wingmanRoster.indexOf(wingman.role));
    const side = rosterIndex % 2 === 0 ? -1 : 1;
    const targetX = clamp(player.x + side * (53 + Math.sin(wingman.age * 1.7) * 5), 28, W - 28);
    const targetY = clamp(player.y + 24 + Math.cos(wingman.age * 2.1) * 7, 140, H - 42);
    const oldX = wingman.x;
    wingman.x += (targetX - wingman.x) * Math.min(1, dt * 7.5);
    wingman.y += (targetY - wingman.y) * Math.min(1, dt * 7.5);
    wingman.tilt += (clamp((wingman.x - oldX) / 8, -0.45, 0.45) - wingman.tilt) * Math.min(1, dt * 12);

    if (wingman.role === "striker" && wingman.cooldown <= 0) {
      const target = state.enemies
        .filter((enemy) => !enemy.dead && enemy.y > 20)
        .sort((a, b) => distance(wingman, a) - distance(wingman, b))[0];
      if (target) {
        fireWingmanMissile(wingman, target);
        wingman.cooldown = def.cooldown;
        wingman.pulse = 0.18;
      }
    }
    if (wingman.role === "guardian" && wingman.cooldown <= 0) {
      const threat = state.enemyBullets
        .filter((bullet) => !bullet.dead && distance(player, bullet) < 118)
        .sort((a, b) => distance(player, a) - distance(player, b))[0];
      if (threat) {
        threat.dead = true;
        wingman.cooldown = def.cooldown;
        wingman.pulse = 0.34;
        emitArc(wingman, threat, def.color, 0.22, 3);
        state.rings.push({ x: threat.x, y: threat.y, r: 3, max: 34, life: 0.24, maxLife: 0.24, color: def.color, damage: 0, hits: new Set() });
        addOverdrive(1.1);
        tone("shield", 0.025);
      }
    }
    if (wingman.role === "medic" && wingman.cooldown <= 0 && player.hp < 100) {
      const repair = 5 + player.weaponLevel * 2;
      player.hp = Math.min(100, player.hp + repair);
      wingman.cooldown = def.cooldown;
      wingman.pulse = 0.55;
      emitArc(wingman, player, def.color, 0.4, 3);
      state.rings.push({ x: player.x, y: player.y, r: 8, max: 48, life: 0.42, maxLife: 0.42, color: def.color, damage: 0, hits: new Set() });
      state.floating.push({ x: player.x, y: player.y - 38, text: `NANO REPAIR +${repair}`, color: def.color, life: 0.9, maxLife: 0.9 });
      tone("pickup", 0.03);
    }
  }

  function triggerSpecial() {
    const player = state.player;
    if (!state.running || state.paused || state.routeOpen || !player || player.bombs <= 0 || player.specialCooldown > 0) return;
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

  function damageAlly(amount) {
    const ally = state.ally;
    if (!ally || ally.dead || ally.invulnerable > 0) return;
    ally.hp -= amount * 0.62;
    ally.damaged = 0.18;
    ally.invulnerable = 0.12;
    state.mission.progress = Math.max(0, Math.round(ally.hp / ally.maxHp * 100));
    burst(ally.x, ally.y, "#7de9ff", 8, 105, 0.35);
    if (ally.hp <= 0) {
      ally.hp = 0;
      ally.dead = true;
      burst(ally.x, ally.y, "#ff806a", 38, 245, 0.9);
      resolveMission(false, "AEGIS-7 DESTROYED");
    }
  }

  function updateMission(dt) {
    const mission = state.mission;
    if (!mission) return;
    if (state.ally && !state.ally.dead) {
      const ally = state.ally;
      ally.age += dt;
      ally.damaged = Math.max(0, ally.damaged - dt);
      ally.invulnerable = Math.max(0, (ally.invulnerable || 0) - dt);
      ally.x = W / 2 + Math.sin(ally.age * 0.62) * 132;
      ally.y = ally.baseY + Math.sin(ally.age * 1.3) * 10;
      mission.progress = Math.max(0, Math.round(ally.hp / ally.maxHp * 100));
    }
    if (!mission.resolved && mission.type === "escape" && state.levelPhase === "waves") {
      mission.progress = Math.min(mission.target, mission.progress + dt);
      if (mission.progress >= mission.target) resolveMission(true);
    }
  }

  function applyLightningStrike(hazard) {
    if (state.player && Math.abs(state.player.x - hazard.x) < 28) damagePlayer(19);
    else if (state.player && Math.abs(state.player.x - hazard.x) < 76) addOverdrive(10);
    for (const enemy of state.enemies) {
      if (!enemy.dead && Math.abs(enemy.x - hazard.x) < 36) damageEnemy(enemy, enemy.boss ? 42 : 78, true);
    }
    if (state.ally && !state.ally.dead && Math.abs(state.ally.x - hazard.x) < 30) damageAlly(17);
    state.shake = Math.max(state.shake, 6);
    state.flash = Math.max(state.flash, 0.12);
    burst(hazard.x, H * 0.45, "#dff8ff", 24, 180, 0.45);
    tone("lightning");
  }

  function applyHeatVent(hazard) {
    const laneWidth = W / 3;
    const playerLane = clamp(Math.floor(state.player.x / laneWidth), 0, 2);
    if (playerLane !== hazard.safeLane) damagePlayer(16);
    for (const enemy of state.enemies) {
      const lane = clamp(Math.floor(enemy.x / laneWidth), 0, 2);
      if (!enemy.dead && lane !== hazard.safeLane) damageEnemy(enemy, enemy.boss ? 34 : 58, true);
    }
    if (state.ally && !state.ally.dead) {
      const allyLane = clamp(Math.floor(state.ally.x / laneWidth), 0, 2);
      if (allyLane !== hazard.safeLane) damageAlly(14);
    }
    state.shake = Math.max(state.shake, 5);
    tone("heat");
  }

  function updateEnvironment(dt) {
    const environment = state.environment;
    if (!environment || state.levelPhase === "clear" || state.levelPhase === "route" || state.levelPhase === "secret-warning") return;
    environment.timer -= dt;
    environment.pulse += dt;
    const pressure = Math.max(0, state.routeModifier.pressure || 0);
    if (environment.timer <= 0) {
      if (environment.type === "slipstream") {
        state.hazards.push({ kind: "slipstream", x: random(65, W - 65), y: -45, r: 34, life: 9, spin: random(0, TAU), dead: false });
        environment.timer = Math.max(3.6, 5.3 - currentCycle() * 0.25 - pressure);
      } else if (environment.type === "lightning") {
        state.hazards.push({ kind: "lightning", x: random(54, W - 54), warning: 1.15, active: 0.25, fired: false, dead: false });
        environment.timer = Math.max(3, 5.2 - currentCycle() * 0.3 - pressure * 2);
      } else if (environment.type === "heat") {
        state.hazards.push({ kind: "heat", safeLane: Math.floor(random(0, 3)), warning: 1.3, active: 0.72, fired: false, dead: false });
        environment.timer = Math.max(3.1, 5.5 - currentCycle() * 0.3 - pressure * 2);
      } else if (environment.type === "gravity") {
        state.hazards.push({ kind: "gravity", x: random(90, W - 90), y: random(260, 585), r: 24, life: 4.7, maxLife: 4.7, captured: 0, dead: false });
        environment.timer = Math.max(4.2, 6.8 - currentCycle() * 0.35 - pressure * 2);
      }
    }

    for (const hazard of state.hazards) {
      if (hazard.kind === "slipstream") {
        hazard.life -= dt;
        hazard.y += 116 * dt;
        hazard.spin += dt * 1.9;
        if (state.player && distance(hazard, state.player) < hazard.r + state.player.r && !hazard.collected) {
          hazard.collected = true;
          hazard.dead = true;
          state.score += 320;
          addOverdrive(17);
          state.rings.push({ x: hazard.x, y: hazard.y, r: 8, max: 88, life: 0.42, maxLife: 0.42, color: "#69f7d0", damage: 0, hits: new Set() });
          state.floating.push({ x: hazard.x, y: hazard.y, text: "SLIPSTREAM +17", color: "#69f7d0", life: 0.8, maxLife: 0.8 });
          tone("graze", 0.035);
        }
        if (hazard.life <= 0 || hazard.y > H + 55) hazard.dead = true;
      } else if (hazard.kind === "lightning" || hazard.kind === "heat") {
        if (!hazard.fired) {
          hazard.warning -= dt;
          if (hazard.warning <= 0) {
            hazard.fired = true;
            if (hazard.kind === "lightning") applyLightningStrike(hazard); else applyHeatVent(hazard);
          }
        } else {
          hazard.active -= dt;
          if (hazard.active <= 0) hazard.dead = true;
        }
      } else if (hazard.kind === "gravity") {
        hazard.life -= dt;
        const bodies = [...state.bullets, ...state.enemyBullets, ...state.pickups];
        for (const body of bodies) {
          if (body.dead) continue;
          const dx = hazard.x - body.x;
          const dy = hazard.y - body.y;
          const d = Math.hypot(dx, dy);
          if (d <= 1 || d > 185) continue;
          const force = (1 - d / 185) * (body.kind ? 48 : 90);
          if (body.vx !== undefined) {
            body.vx += dx / d * force * dt;
            body.vy += dy / d * force * dt;
          } else {
            body.x += dx / d * force * dt;
            body.y += dy / d * force * dt;
          }
          if (d < 20 && body.damage && state.enemyBullets.includes(body)) {
            body.dead = true;
            hazard.captured += 1;
            addOverdrive(1.4);
          }
        }
        if (hazard.life <= 0) {
          hazard.dead = true;
          state.rings.push({ x: hazard.x, y: hazard.y, r: 6, max: 95, life: 0.42, maxLife: 0.42, color: "#d4a7ff", damage: 24 + hazard.captured * 2, hits: new Set() });
          burst(hazard.x, hazard.y, "#d4a7ff", 18, 150, 0.55);
        }
      }
    }
    state.hazards = state.hazards.filter((hazard) => !hazard.dead);
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
    state.moduleCooldown = Math.max(0, state.moduleCooldown - dt);
    player.fireCooldown -= dt;
    const overdriveRate = state.overdrive > 0 ? 0.64 : 1;
    const moduleRate = state.module === "arsenal" ? 0.88 : 1;
    const jammerPenalty = 1 + state.jamStrength * 0.56;
    const fireRate = weaponDefs[player.weapon].rate * (1 - (player.weaponLevel - 1) * 0.07) * overdriveRate * moduleRate * jammerPenalty;
    while (player.fireCooldown <= 0) {
      fireWeapon();
      player.fireCooldown += fireRate;
    }
  }

  function updateEnemies(dt) {
    state.jamStrength = 0;
    for (const enemy of state.enemies) {
      const def = enemyDefs[enemy.type];
      enemy.age += dt;
      enemy.damaged = Math.max(0, enemy.damaged - dt);
      enemy.shieldFlash = Math.max(0, enemy.shieldFlash - dt);
      enemy.supportFlash = Math.max(0, enemy.supportFlash - dt);
      enemy.parts?.forEach((part) => { part.damaged = Math.max(0, part.damaged - dt); });
      enemy.cloaked = Boolean(def.stealth && enemy.damaged <= 0 && Math.sin(enemy.age * 1.75 + enemy.phase) > -0.18);
      if (def.supportRole === "jammer" && state.player && distance(enemy, state.player) < def.supportRange) {
        state.jamStrength = Math.max(state.jamStrength, 1 - distance(enemy, state.player) / def.supportRange);
      }
      if (def.supportRole === "repair") {
        enemy.repairCooldown -= dt;
        if (enemy.repairCooldown <= 0 && enemy.y > 25) {
          const target = state.enemies
            .filter((candidate) => !candidate.dead && candidate !== enemy && !candidate.boss && candidate.hp < candidate.maxHp && distance(enemy, candidate) < def.supportRange)
            .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
          if (target) {
            const amount = 10 + currentDifficulty() * 3;
            target.hp = Math.min(target.maxHp, target.hp + amount);
            enemy.supportFlash = 0.3;
            emitArc(enemy, target, def.color, 0.34, 2.4);
            state.floating.push({ x: target.x, y: target.y - target.r - 10, text: `REPAIR +${Math.round(amount)}`, color: def.color, life: 0.62, maxLife: 0.62 });
            tone("repair", 0.018);
          }
          enemy.repairCooldown = 1.6 + random(0.25, 0.8);
        }
      }
      if (enemy.boss) {
        refreshBossStage(enemy);
        if (enemy.y < enemy.targetY) enemy.y = Math.min(enemy.targetY, enemy.y + enemy.speed * dt);
        else enemy.y += (enemy.targetY - enemy.y + Math.sin(enemy.age * 1.4) * 5) * Math.min(1, dt * 3.2);
        const bossDrift = def.motion === "carrier" ? 85 : def.motion === "tempest" ? 122 : def.motion === "dreadnought" ? 70 : def.motion === "seraph" ? 138 : 96;
        const bossTempo = def.motion === "dreadnought" ? 0.38 : def.motion === "core" ? 0.84 : def.motion === "tempest" ? 0.68 : def.motion === "seraph" ? 0.95 : 0.5;
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
        if (def.motion === "ram") {
          const target = state.player || { x: W / 2, y: H };
          const steer = clamp((target.x - enemy.x) / 120, -1, 1);
          enemy.x += steer * enemy.speed * 0.82 * dt;
          enemy.y += enemy.speed * (enemy.age > 0.8 ? 1.22 : 0.72) * dt;
        } else {
          enemy.y += enemy.speed * dt;
        }
        enemy.x = clamp(enemy.x, 26, W - 26);
      }
      enemy.shoot -= dt;
      if (enemy.shoot <= 0 && enemy.y > 40 && enemy.y < H - 110) {
        fireEnemy(enemy);
        const pressure = clamp(1.08 - (state.level - 1) * 0.035, 0.76, 1.08);
        const stageRate = enemy.boss ? 1 - (enemy.stage - 1) * 0.12 : 1;
        const destroyedGuns = enemy.boss ? (enemy.parts || []).filter((part) => part.role === "gun" && part.dead).length : 0;
        const commander = tacticalSourceFor(enemy, "command", 205);
        enemy.shoot += def.cadence * pressure * stageRate * (commander ? 0.73 : 1) * (1 + destroyedGuns * 0.1) * random(0.9, 1.12);
      }
      if (!enemy.boss && (enemy.y > H + 115 || enemy.x < -120 || enemy.x > W + 120)) {
        enemy.dead = true;
        if (enemy.missionTarget && state.mission && !state.mission.resolved) {
          state.mission.missed += 1;
          state.floating.push({ x: clamp(enemy.x, 30, W - 30), y: H - 60, text: "TARGET ESCAPED", color: "#ff806a", life: 1, maxLife: 1 });
          resolveMission(false, "TARGET ESCAPED");
        }
      }
      if (state.ally && !state.ally.dead && !enemy.dead && distance(enemy, state.ally) < enemy.r + state.ally.r - 4) {
        damageAlly(enemy.boss ? 36 : 24);
        if (!enemy.boss) damageEnemy(enemy, enemy.hp + 1, true);
      }
      if (state.player && !enemy.dead && distance(enemy, state.player) < enemy.r + state.player.r - 4) {
        damagePlayer(enemy.boss ? 42 : 27);
        if (!enemy.boss) damageEnemy(enemy, enemy.hp + 1, true);
        else state.player.y = clamp(state.player.y + 34, 120, H - 36);
      }
    }
  }

  function damageBossPart(enemy, part, amount, heavy = false) {
    if (part.dead || enemy.dead || !state.running) return;
    part.hp -= amount;
    part.damaged = 0.12;
    const position = bossPartPosition(enemy, part);
    burst(position.x, position.y, enemy.color, heavy ? 10 : 4, heavy ? 160 : 76, 0.32);
    if (part.hp > 0) return;
    part.dead = true;
    part.hp = 0;
    state.bossPartsDestroyed += 1;
    const reward = Math.round((720 + currentCycle() * 380) * (state.routeModifier.score || 1));
    state.score += reward;
    addOverdrive(18);
    state.shake = Math.max(state.shake, 8);
    state.rings.push({ x: position.x, y: position.y, r: 5, max: 92, life: 0.42, maxLife: 0.42, color: enemy.color, damage: 0, hits: new Set() });
    state.floating.push({ x: position.x, y: position.y - 18, text: `${part.label} BREAK +${reward}`, color: "#ffd665", life: 1.1, maxLife: 1.1 });
    refreshBossStage(enemy);
    tone("part");
  }

  function hitArmoryCore(bullet, pickup) {
    bullet.armoryHits ||= new Set();
    if (bullet.armoryHits.has(pickup) || distance(bullet, pickup) >= bullet.r + pickup.r) return false;
    bullet.armoryHits.add(pickup);
    pickup.hitPulse = 0.2;
    pickup.cycleCharge = Math.min(1.25, pickup.cycleCharge + Math.min(0.18, bullet.damage / 180));
    burst(bullet.x, bullet.y, weaponDefs[pickup.weapon].color, 3, 58, 0.16);
    return true;
  }

  function updateBullets(dt) {
    for (const bullet of state.bullets) {
      bullet.life -= dt;
      bullet.age = (bullet.age || 0) + dt;
      if (bullet.gravity) updateGravityBullet(bullet, dt);
      if (bullet.blade) updateBladeBullet(bullet, dt);
      if (bullet.dead) continue;
      if (bullet.homing) {
        let nearest = null;
        let nearestDistance = Infinity;
        for (const enemy of state.enemies) {
          if (enemy.dead || enemy.cloaked) continue;
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
      if (bullet.life <= 0 || bullet.y < -100 || bullet.x < -100 || bullet.x > W + 100) {
        if (bullet.gravity) collapseGravityBullet(bullet); else bullet.dead = true;
      }
      if (bullet.dead) continue;
      for (const pickup of state.pickups) {
        if (!pickup.dead && pickup.kind === "armory") hitArmoryCore(bullet, pickup);
      }
      for (const enemy of state.enemies) {
        if (enemy.dead || bullet.dead) continue;
        if (enemy.boss) {
          const part = aliveBossParts(enemy).find((candidate) => {
            const position = bossPartPosition(enemy, candidate);
            return distance(bullet, position) < bullet.r + candidate.r;
          });
          if (part) {
            bullet.hitIds ||= new Set();
            if (bullet.hitIds.has(part)) continue;
            bullet.hitIds.add(part);
            damageBossPart(enemy, part, bullet.damage);
            bullet.hits += 1;
            triggerChainLightning(bullet, enemy);
            if (bullet.gravity) collapseGravityBullet(bullet);
            else if (bullet.plasma) { explodePlasma(bullet); bullet.dead = true; }
            else if (bullet.hits >= bullet.pierce) bullet.dead = true;
            continue;
          }
        }
        if (bullet.hitIds?.has(enemy)) continue;
        if (distance(bullet, enemy) < bullet.r + enemy.r) {
          bullet.hitIds ||= new Set();
          bullet.hitIds.add(enemy);
          damageEnemy(enemy, bullet.damage);
          bullet.hits += 1;
          triggerChainLightning(bullet, enemy);
          if (bullet.gravity) collapseGravityBullet(bullet);
          else if (bullet.plasma) { explodePlasma(bullet); bullet.dead = true; }
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
      if (!bullet.dead && state.player) {
        const playerDistance = distance(bullet, state.player);
        if (playerDistance < bullet.r + state.player.r - 3) {
          bullet.dead = true;
          damagePlayer(bullet.damage);
        } else if (playerDistance < bullet.r + state.player.r + 22 && state.player.invulnerable <= 0) {
          registerGraze(bullet);
        }
      }
      if (!bullet.dead && state.ally && !state.ally.dead && distance(bullet, state.ally) < bullet.r + state.ally.r - 2) {
        bullet.dead = true;
        damageAlly(bullet.damage * 0.82);
      }
    }
  }

  function updateRings(dt) {
    for (const ring of state.rings) {
      ring.life -= dt;
      const progress = 1 - ring.life / ring.maxLife;
      ring.r = ring.max * (1 - (1 - progress) * (1 - progress));
      if (ring.damage <= 0) {
        if (ring.life <= 0) ring.dead = true;
        continue;
      }
      for (const enemy of state.enemies) {
        if (enemy.dead) continue;
        if (enemy.boss) {
          for (const part of aliveBossParts(enemy)) {
            if (ring.hits.has(part)) continue;
            const position = bossPartPosition(enemy, part);
            if (distance(ring, position) < ring.r + part.r) {
              ring.hits.add(part);
              damageBossPart(enemy, part, ring.damage * 0.72, ring.special);
            }
          }
        }
        if (ring.hits.has(enemy)) continue;
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
      if (pickup.kind === "rescue" && state.player) {
        const d = distance(pickup, state.player);
        if (d > 1) {
          const pull = (72 + Math.max(0, 260 - d) * 0.28) * dt;
          pickup.x += (state.player.x - pickup.x) / d * pull;
          pickup.y += (state.player.y - pickup.y) / d * pull;
          pickup.vy = Math.max(18, pickup.vy - dt * 12);
        }
      }
      pickup.hitPulse = Math.max(0, (pickup.hitPulse || 0) - dt);
      if (pickup.kind === "armory") {
        const threshold = state.module === "magnet" ? 0.76 : 1;
        if (pickup.hitPulse <= 0) pickup.cycleCharge = Math.max(0, pickup.cycleCharge - dt * 0.5);
        if (pickup.cycleCharge >= threshold) {
          pickup.cycleCharge = 0;
          pickup.weaponIndex = (pickup.weaponIndex + 1) % weaponKeys.length;
          pickup.weapon = weaponKeys[pickup.weaponIndex];
          state.rings.push({ x: pickup.x, y: pickup.y, r: 4, max: 45, life: 0.24, maxLife: 0.24, color: weaponDefs[pickup.weapon].color, damage: 0, hits: new Set() });
          tone("armory", 0.028);
        }
      }
      if (state.module === "magnet" && state.player) {
        const d = distance(pickup, state.player);
        if (d < 190 && d > 1) {
          const pull = (1 - d / 190) * 245 * dt;
          pickup.x += (state.player.x - pickup.x) / d * pull;
          pickup.y += (state.player.y - pickup.y) / d * pull;
        }
      }
      if (pickup.life <= 0 || pickup.y > H + 35) pickup.dead = true;
      if (!pickup.dead && state.player && distance(pickup, state.player) < pickup.r + state.player.r + 5) collectPickup(pickup);
    }
  }

  function collectPickup(pickup) {
    const player = state.player;
    pickup.dead = true;
    if (pickup.kind === "rescue") {
      const role = pickup.pilotRole || "guardian";
      const def = wingmanDefs[role];
      unlockWingman(role);
      setAlert(`PILOT RESCUED // ${def.name}`, "bright", 1.25);
      burst(pickup.x, pickup.y, def.color, 26, 155, 0.62);
      tone("rescue");
    } else if (pickup.kind === "weapon" || pickup.kind === "armory") {
      const isDuplicate = player.weapon === pickup.weapon;
      if (isDuplicate) player.weaponLevel = Math.min(3, player.weaponLevel + 1);
      else player.weapon = pickup.weapon;
      const def = weaponDefs[player.weapon];
      const message = isDuplicate
        ? `${def.name} POWER // ${player.weaponLevel >= 3 ? "MAX" : roman(player.weaponLevel)}`
        : `${pickup.kind === "armory" ? "ARMORY LOCK" : "WEAPON SWITCH"} // ${def.name} ${roman(player.weaponLevel)}`;
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
    const shield = !heavy && !enemy.boss ? tacticalSourceFor(enemy, "shield", 178) : null;
    if (shield) {
      amount *= 0.42;
      shield.shieldFlash = 0.16;
      emitArc(shield, enemy, enemyDefs[shield.type].color, 0.1, 1.6);
    }
    if (enemy.cloaked) {
      amount *= 0.68;
      enemy.cloaked = false;
      enemy.supportFlash = 0.22;
    }
    if (enemy.boss && enemy.parts?.length) {
      const alive = aliveBossParts(enemy).length;
      const destroyedRatio = 1 - alive / enemy.parts.length;
      const shieldAlive = aliveBossParts(enemy, "shield").length > 0;
      const armorScale = alive === 0 ? 1.12 : (0.38 + destroyedRatio * 0.36) * (shieldAlive ? 0.72 : 1);
      amount *= armorScale;
    }
    enemy.hp -= amount;
    enemy.damaged = 0.1;
    burst(enemy.x, enemy.y, enemy.color, heavy ? 8 : 3, heavy ? 145 : 62, 0.28);
    if (enemy.boss) refreshBossStage(enemy);
    if (enemy.hp <= 0) destroyEnemy(enemy);
  }

  function destroyEnemy(enemy) {
    if (enemy.dead || !state.running) return;
    enemy.dead = true;
    state.eliminations += 1;
    state.combo = Math.min(9, state.combo + 1);
    state.comboTimer = 2.5;
    const bonus = state.combo >= 5 ? 1.5 : state.combo >= 3 ? 1.25 : 1;
    const earned = Math.round(enemy.score * bonus * (state.routeModifier.score || 1) * (state.overdrive > 0 ? 1.4 : 1));
    state.score += earned;
    state.shake = Math.max(state.shake, enemy.boss ? 13 : 3);
    burst(enemy.x, enemy.y, enemy.color, enemy.boss ? 78 : 30, enemy.boss ? 365 : 235, enemy.boss ? 1.25 : 0.65);
    state.rings.push({ x: enemy.x, y: enemy.y, r: 2, max: enemy.boss ? 190 : 62, life: 0.38, maxLife: 0.38, color: enemy.color, damage: 0, hits: new Set() });
    state.floating.push({ x: enemy.x, y: enemy.y - enemy.r, text: `+${earned}`, color: enemy.color, life: 0.78, maxLife: 0.78 });
    if (enemy.missionTarget && state.mission && !state.mission.resolved) {
      state.mission.progress = Math.min(state.mission.target, state.mission.progress + 1);
      state.floating.push({ x: enemy.x, y: enemy.y - enemy.r - 22, text: `OBJECTIVE ${Math.floor(state.mission.progress)}/${state.mission.target}`, color: "#ffd665", life: 0.95, maxLife: 0.95 });
      if (state.mission.progress >= state.mission.target) resolveMission(true);
    }
    state.weaponKillCounter += enemy.boss ? 5 : 1;
    state.upgradeKillCounter += enemy.boss ? 5 : 1;
    let droppedWeapon = false;
    let droppedUpgrade = false;
    let droppedRescue = false;
    if (state.weaponKillCounter >= state.nextWeaponDrop) {
      spawnPickup(enemy.x, enemy.y, "armory");
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
    const rescueRole = rescueRoleByEnemy[enemy.type];
    if (rescueRole && !state.wingmanRoster.includes(rescueRole) && state.rescueDropLevel !== state.level) {
      spawnPickup(clamp(enemy.x + (droppedWeapon || droppedUpgrade ? 34 : 0), 30, W - 30), enemy.y, "rescue", null, { pilotRole: rescueRole });
      state.rescueDropLevel = state.level;
      droppedRescue = true;
    }
    if (enemy.boss) {
      spawnPickup(clamp(enemy.x - 48, 30, W - 30), enemy.y + 18, "upgrade");
      spawnPickup(enemy.x, enemy.y + 18, "bomb");
      spawnPickup(clamp(enemy.x + 48, 30, W - 30), enemy.y + 18, "repair");
      completeLevel(enemy);
    } else if (!droppedWeapon && !droppedUpgrade && !droppedRescue) {
      const roll = Math.random();
      if (roll < 0.045) spawnPickup(enemy.x, enemy.y, "bomb");
      else if (roll < 0.07) spawnPickup(enemy.x, enemy.y, "repair");
    }
    tone(enemy.boss ? "boss" : "explode");
  }

  function damagePlayer(amount) {
    const player = state.player;
    if (!player || player.invulnerable > 0 || !state.running) return;
    if (state.module === "aegis" && player.moduleCharges > 0) {
      player.moduleCharges -= 1;
      player.invulnerable = 0.92;
      state.shake = Math.max(state.shake, 4);
      state.rings.push({ x: player.x, y: player.y, r: 10, max: 78, life: 0.42, maxLife: 0.42, color: moduleDefs.aegis.color, damage: 0, hits: new Set() });
      setAlert("AEGIS SHELL // IMPACT ABSORBED", "bright", 1.05);
      tone("shield");
      navigator.vibrate?.(15);
      syncUi();
      return;
    }
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
    for (const arc of state.arcs) {
      arc.life -= dt;
      if (arc.life <= 0) arc.dead = true;
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
    if (state.routeOpen) {
      updateParticles(dt);
      state.particles = state.particles.filter((item) => !item.dead);
      state.floating = state.floating.filter((item) => !item.dead);
      state.arcs = state.arcs.filter((item) => !item.dead);
      state.shake = Math.max(0, state.shake - dt * 24);
      state.flash = Math.max(0, state.flash - dt * 2.2);
      syncUi();
      return;
    }
    state.elapsed += dt;
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 1;
    if (state.overdrive > 0) {
      state.overdrive = Math.max(0, state.overdrive - dt);
      state.overdriveCharge = state.overdriveMax > 0 ? state.overdrive / state.overdriveMax * 100 : 0;
      if (state.overdrive <= 0) {
        state.overdriveCharge = 0;
        state.overdriveMax = 0;
        state.floating.push({ x: state.player.x, y: state.player.y - 34, text: "OVERDRIVE COOLED", color: "#a8cabc", life: 0.7, maxLife: 0.7 });
      }
    }
    updateMission(dt);
    updateLevelFlow(dt);
    if (state.routeOpen) return;
    updateEnvironment(dt);
    updatePlayer(dt);
    updateWingman(dt);
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
    state.arcs = state.arcs.filter((item) => !item.dead);
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

  function drawEnvironment() {
    for (const hazard of state.hazards) {
      ctx.save();
      if (hazard.kind === "slipstream") {
        ctx.translate(hazard.x, hazard.y);
        ctx.rotate(hazard.spin);
        ctx.strokeStyle = "rgba(105, 247, 208, 0.74)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#69f7d0";
        ctx.setLineDash([12, 8]);
        ctx.beginPath(); ctx.arc(0, 0, hazard.r, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.42;
        ctx.beginPath(); ctx.arc(0, 0, hazard.r - 9, 0, TAU); ctx.stroke();
        ctx.fillStyle = "#dfffee";
        ctx.globalAlpha = 0.8;
        [-1, 1].forEach((side) => {
          ctx.beginPath(); ctx.moveTo(side * 9, -7); ctx.lineTo(0, 0); ctx.lineTo(side * 9, 7); ctx.lineTo(side * 4, 0); ctx.closePath(); ctx.fill();
        });
      } else if (hazard.kind === "lightning") {
        const warningAlpha = hazard.fired ? 0.85 : 0.24 + Math.sin(hazard.warning * 18) * 0.16;
        ctx.globalAlpha = warningAlpha;
        ctx.strokeStyle = hazard.fired ? "#f1feff" : "#8de7ff";
        ctx.lineWidth = hazard.fired ? 12 : 2;
        ctx.shadowBlur = hazard.fired ? 30 : 8;
        ctx.shadowColor = "#8de7ff";
        ctx.setLineDash(hazard.fired ? [] : [10, 12]);
        ctx.beginPath(); ctx.moveTo(hazard.x, 0); ctx.lineTo(hazard.x, H); ctx.stroke();
        if (!hazard.fired) {
          ctx.fillStyle = "#dff8ff";
          ctx.font = "900 9px 'Avenir Next Condensed', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("STRIKE VECTOR", hazard.x, 142);
        }
      } else if (hazard.kind === "heat") {
        const laneWidth = W / 3;
        for (let lane = 0; lane < 3; lane += 1) {
          if (lane === hazard.safeLane) {
            ctx.globalAlpha = 0.35;
            ctx.strokeStyle = "#69f7d0";
            ctx.lineWidth = 2;
            ctx.strokeRect(lane * laneWidth + 7, 0, laneWidth - 14, H);
          } else {
            const alpha = hazard.fired ? 0.34 : 0.11 + Math.sin(hazard.warning * 16) * 0.045;
            const gradient = ctx.createLinearGradient(0, H, 0, 80);
            gradient.addColorStop(0, `rgba(255, 105, 69, ${alpha * 1.9})`);
            gradient.addColorStop(1, `rgba(255, 170, 86, ${alpha * 0.2})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(lane * laneWidth, 0, laneWidth, H);
            ctx.globalAlpha = 0.68;
            ctx.fillStyle = "#ffb176";
            ctx.font = "900 8px 'Avenir Next Condensed', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("VENT", (lane + 0.5) * laneWidth, H - 92);
          }
        }
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#ffe1aa";
        ctx.font = "900 9px 'Avenir Next Condensed', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SAFE", (hazard.safeLane + 0.5) * laneWidth, H - 92);
      } else if (hazard.kind === "gravity") {
        const progress = Math.max(0, hazard.life / hazard.maxLife);
        ctx.translate(hazard.x, hazard.y);
        ctx.rotate(state.backdropTime * 1.4);
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#d4a7ff";
        for (let ring = 0; ring < 4; ring += 1) {
          ctx.globalAlpha = (0.52 - ring * 0.09) * Math.min(1, progress * 3);
          ctx.strokeStyle = ring % 2 ? "#8ff3dc" : "#d4a7ff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 18 + ring * 11 + Math.sin(state.backdropTime * 4 + ring) * 3, ring * 0.6, Math.PI + ring * 0.8);
          ctx.stroke();
        }
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#080714";
        ctx.beginPath(); ctx.arc(0, 0, 11 + hazard.captured * 0.45, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawAlly() {
    const ally = state.ally;
    if (!ally || ally.dead) return;
    ctx.save();
    ctx.translate(ally.x, ally.y);
    ctx.fillStyle = ally.damaged > 0 ? "#ffffff" : "#7de9ff";
    ctx.globalAlpha = 0.86;
    ctx.beginPath();
    ctx.moveTo(0, -30); ctx.lineTo(13, -9); ctx.lineTo(34, 2); ctx.lineTo(18, 14); ctx.lineTo(8, 10); ctx.lineTo(0, 28); ctx.lineTo(-8, 10); ctx.lineTo(-18, 14); ctx.lineTo(-34, 2); ctx.lineTo(-13, -9); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#dcffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#173b4b";
    ctx.fillRect(-6, -16, 12, 31);
    ctx.restore();
    const width = 74;
    ctx.fillStyle = "rgba(3, 12, 14, 0.78)";
    ctx.fillRect(ally.x - width / 2, ally.y + 37, width, 4);
    ctx.fillStyle = ally.hp > 35 ? "#7de9ff" : "#ff806a";
    ctx.fillRect(ally.x - width / 2, ally.y + 37, width * ally.hp / ally.maxHp, 4);
    ctx.fillStyle = "#dff8ff";
    ctx.font = "900 8px 'Avenir Next Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AEGIS-7", ally.x, ally.y + 52);
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

  function drawWingman() {
    const wingman = state.wingman;
    if (!wingman) return;
    const def = wingmanDefs[wingman.role];
    ctx.save();
    ctx.translate(wingman.x, wingman.y);
    ctx.rotate(wingman.tilt);
    ctx.shadowBlur = wingman.pulse > 0 ? 18 : 7;
    ctx.shadowColor = def.color;
    if (wingman.pulse > 0) {
      ctx.globalAlpha = 0.28 + wingman.pulse;
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 25 + wingman.pulse * 20, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "rgba(255, 214, 101, 0.34)";
    ctx.beginPath(); ctx.moveTo(-4, 12); ctx.lineTo(0, 27 + Math.sin(wingman.age * 18) * 4); ctx.lineTo(4, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = def.color;
    shipPath(0.56);
    ctx.fill();
    ctx.strokeStyle = "rgba(247, 255, 245, 0.8)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = "#132b2c";
    ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(4, 1); ctx.lineTo(0, 8); ctx.lineTo(-4, 1); ctx.closePath(); ctx.fill();
    if (wingman.role === "guardian") {
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 1, 18, -2.65, -0.5); ctx.stroke();
    } else if (wingman.role === "medic") {
      ctx.fillStyle = "#e9fff0";
      ctx.fillRect(-5, -1, 10, 3);
      ctx.fillRect(-1.5, -4.5, 3, 10);
    } else {
      ctx.fillStyle = "#fff0cc";
      ctx.fillRect(-15, 4, 5, 8);
      ctx.fillRect(10, 4, 5, 8);
    }
    ctx.restore();
  }

  function drawPlayer() {
    const p = state.player;
    if (!p) return;
    if (p.invulnerable > 0 && Math.floor(p.invulnerable * 14) % 2 === 0) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.tilt);
    if (state.overdrive > 0) {
      ctx.save();
      ctx.rotate(-p.tilt + state.backdropTime * 2.2);
      ctx.strokeStyle = "rgba(255, 214, 101, 0.72)";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#ffd665";
      ctx.setLineDash([8, 7]);
      ctx.beginPath(); ctx.arc(0, 0, 34 + Math.sin(p.engine * 0.35) * 3, 0, TAU); ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = "rgba(105, 247, 208, 0.13)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, p.r + 22, 0, TAU); ctx.stroke();
    }
    if (state.module === "aegis" && p.moduleCharges > 0) {
      ctx.strokeStyle = "rgba(105, 247, 208, 0.58)";
      ctx.lineWidth = 2;
      ctx.setLineDash([13, 6]);
      ctx.beginPath(); ctx.arc(0, 0, 39, -1.1, Math.PI + 1.1); ctx.stroke();
      ctx.setLineDash([]);
    }
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

  function drawTacticalLinks() {
    for (const source of state.enemies) {
      if (source.dead || source.boss || !source.supportRole) continue;
      const def = enemyDefs[source.type];
      const range = source.supportRange || def.supportRange;
      const isJammer = source.supportRole === "jammer";
      ctx.save();
      ctx.globalAlpha = 0.14 + (source.supportFlash > 0 || source.shieldFlash > 0 ? 0.2 : 0);
      ctx.strokeStyle = def.color;
      ctx.lineWidth = source.supportRole === "shield" ? 2 : 1.2;
      ctx.setLineDash(source.supportRole === "command" ? [10, 7] : [5, 8]);
      ctx.beginPath();
      ctx.arc(source.x, source.y, range, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      if (!isJammer) {
        const targets = state.enemies
          .filter((enemy) => {
            if (enemy === source || enemy.dead || enemy.boss || distance(source, enemy) > range) return false;
            if (source.supportRole === "repair") return enemy.hp < enemy.maxHp;
            return true;
          })
          .sort((a, b) => distance(source, a) - distance(source, b))
          .slice(0, 5);
        ctx.globalAlpha = 0.26;
        for (const target of targets) {
          ctx.beginPath(); ctx.moveTo(source.x, source.y); ctx.lineTo(target.x, target.y); ctx.stroke();
        }
      } else if (state.player && distance(source, state.player) < range) {
        ctx.globalAlpha = 0.22 + state.jamStrength * 0.18;
        ctx.beginPath(); ctx.moveTo(source.x, source.y); ctx.lineTo(state.player.x, state.player.y); ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.fillStyle = def.color;
      ctx.font = "900 7px 'Avenir Next Condensed', sans-serif";
      ctx.textAlign = "center";
      ctx.globalAlpha = 0.8;
      ctx.fillText(source.supportRole.toUpperCase(), source.x, source.y - source.r - 17);
      ctx.restore();
    }
  }

  function drawArcs() {
    for (const arc of state.arcs) {
      const alpha = Math.max(0, arc.life / arc.maxLife);
      const dx = arc.to.x - arc.from.x;
      const dy = arc.to.y - arc.from.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = Math.max(0.8, arc.width * alpha);
      ctx.shadowBlur = 12;
      ctx.shadowColor = arc.color;
      ctx.beginPath();
      ctx.moveTo(arc.from.x, arc.from.y);
      for (let step = 1; step < 5; step += 1) {
        const t = step / 5;
        const normalX = -dy / Math.max(1, Math.hypot(dx, dy));
        const normalY = dx / Math.max(1, Math.hypot(dx, dy));
        const offset = Math.sin(step * 8.7 + arc.jitter) * arc.jitter * alpha;
        ctx.lineTo(arc.from.x + dx * t + normalX * offset, arc.from.y + dy * t + normalY * offset);
      }
      ctx.lineTo(arc.to.x, arc.to.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawJammerInterference() {
    if (state.jamStrength <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = state.jamStrength * 0.22;
    ctx.fillStyle = "#ee9cff";
    for (let index = 0; index < 7; index += 1) {
      const y = (state.backdropTime * 170 + index * 149) % H;
      const width = 70 + (index * 47 % 180);
      ctx.fillRect((index * 83 + state.backdropTime * 23) % W - 40, y, width, 1.5);
    }
    ctx.strokeStyle = "#ee9cff";
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, W - 6, H - 6);
    ctx.restore();
  }

  function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const tint = enemy.damaged > 0 ? "#fff7dc" : enemy.color;
    if (enemy.cloaked) ctx.globalAlpha = 0.22 + Math.sin(enemy.age * 7) * 0.08;
    if (enemy.elite) {
      ctx.save();
      ctx.rotate(-enemy.age * 0.9);
      ctx.strokeStyle = "rgba(255, 214, 101, 0.64)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(0, 0, enemy.r + 8, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    if (enemy.missionTarget) {
      ctx.save();
      ctx.rotate(enemy.age * 1.3);
      ctx.strokeStyle = "#ffd665";
      ctx.lineWidth = 2;
      for (let corner = 0; corner < 4; corner += 1) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(enemy.r + 8, -7); ctx.lineTo(enemy.r + 8, 7); ctx.lineTo(enemy.r + 14, 7); ctx.stroke();
      }
      ctx.restore();
    }
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
    } else if (enemy.type === "bulwark") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, -31); ctx.lineTo(25, -16); ctx.lineTo(34, 13); ctx.lineTo(16, 29); ctx.lineTo(0, 18); ctx.lineTo(-16, 29); ctx.lineTo(-34, 13); ctx.lineTo(-25, -16); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d8fff8";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#153f3d";
      ctx.beginPath(); ctx.arc(0, 1, 12, 0, TAU); ctx.fill();
      ctx.strokeStyle = enemy.shieldFlash > 0 ? "#ffffff" : "#7ffff0";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 1, 19, -2.8, -0.34); ctx.stroke();
    } else if (enemy.type === "mender") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, -29); ctx.lineTo(12, -9); ctx.lineTo(31, -15); ctx.lineTo(25, 13); ctx.lineTo(9, 10); ctx.lineTo(0, 29); ctx.lineTo(-9, 10); ctx.lineTo(-25, 13); ctx.lineTo(-31, -15); ctx.lineTo(-12, -9); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#e5ffea";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#173c2a";
      ctx.fillRect(-6, -15, 12, 28);
      ctx.fillStyle = enemy.supportFlash > 0 ? "#ffffff" : "#dfffe5";
      ctx.fillRect(-12, -2, 24, 4);
      ctx.fillRect(-2, -12, 4, 24);
    } else if (enemy.type === "commander") {
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, -38); ctx.lineTo(13, -17); ctx.lineTo(38, -4); ctx.lineTo(30, 26); ctx.lineTo(8, 16); ctx.lineTo(0, 34); ctx.lineTo(-8, 16); ctx.lineTo(-30, 26); ctx.lineTo(-38, -4); ctx.lineTo(-13, -17); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff0b5";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#4e3d1d";
      ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(9, 2); ctx.lineTo(0, 18); ctx.lineTo(-9, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff7cb";
      [-15, 0, 15].forEach((x) => ctx.fillRect(x - 2, 20 - Math.abs(x) * 0.18, 4, 7));
    } else if (enemy.type === "jammer") {
      ctx.rotate(Math.sin(enemy.age * 2.2) * 0.1);
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, -30); ctx.lineTo(17, -15); ctx.lineTo(35, 0); ctx.lineTo(20, 23); ctx.lineTo(0, 16); ctx.lineTo(-20, 23); ctx.lineTo(-35, 0); ctx.lineTo(-17, -15); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f9deff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#3c2250";
      [-18, 18].forEach((x) => { ctx.beginPath(); ctx.arc(x, 2, 8, 0, TAU); ctx.fill(); });
      ctx.strokeStyle = "#ffd7ff";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 12 + Math.sin(enemy.age * 5) * 2, 0, TAU); ctx.stroke();
    } else if (enemy.type === "phantom") {
      ctx.rotate(Math.sin(enemy.age * 3.8) * 0.18);
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, -34); ctx.lineTo(9, -8); ctx.lineTo(31, -19); ctx.lineTo(20, 3); ctx.lineTo(34, 20); ctx.lineTo(8, 14); ctx.lineTo(0, 31); ctx.lineTo(-8, 14); ctx.lineTo(-34, 20); ctx.lineTo(-20, 3); ctx.lineTo(-31, -19); ctx.lineTo(-9, -8); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f4eaff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#281d4b";
      ctx.beginPath(); ctx.moveTo(0, -21); ctx.lineTo(7, 2); ctx.lineTo(0, 17); ctx.lineTo(-7, 2); ctx.closePath(); ctx.fill();
    } else if (enemy.type === "rammer") {
      ctx.rotate(Math.sin(enemy.age * 7) * 0.08);
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, 34); ctx.lineTo(15, 8); ctx.lineTo(9, -8); ctx.lineTo(4, -33); ctx.lineTo(0, -42); ctx.lineTo(-4, -33); ctx.lineTo(-9, -8); ctx.lineTo(-15, 8); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffe1d2";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#651d25";
      ctx.fillRect(-3, -25, 6, 42);
      ctx.fillStyle = "#fff1b0";
      ctx.beginPath(); ctx.arc(0, 22, 4 + Math.sin(enemy.age * 12), 0, TAU); ctx.fill();
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
    } else if (enemy.type === "seraph") {
      ctx.save();
      ctx.rotate(enemy.age * 0.28);
      ctx.strokeStyle = tint;
      ctx.lineWidth = 7;
      ctx.globalAlpha = 0.7;
      for (let arc = 0; arc < 3; arc += 1) {
        ctx.beginPath(); ctx.arc(0, 0, 58 - arc * 9, arc * 1.8, arc * 1.8 + 1.15); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = tint;
      ctx.beginPath();
      ctx.moveTo(0, -72); ctx.lineTo(16, -30); ctx.lineTo(58, -5); ctx.lineTo(24, 11); ctx.lineTo(42, 54); ctx.lineTo(0, 30); ctx.lineTo(-42, 54); ctx.lineTo(-24, 11); ctx.lineTo(-58, -5); ctx.lineTo(-16, -30); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#17132b";
      ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(15, 0); ctx.lineTo(0, 24); ctx.lineTo(-15, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = enemy.damaged > 0 ? "#ffffff" : "#8ff5df";
      ctx.beginPath(); ctx.arc(0, -2, 8 + Math.sin(enemy.age * 5) * 2, 0, TAU); ctx.fill();
    }
    ctx.restore();
    if (enemy.boss) drawBossParts(enemy);
    if (enemy.boss || enemy.hp < enemy.maxHp) drawHealthBar(enemy);
  }

  function drawBossParts(enemy) {
    for (const part of enemy.parts || []) {
      if (part.dead) continue;
      const position = bossPartPosition(enemy, part);
      ctx.save();
      ctx.translate(position.x, position.y);
      if (part.orbit) ctx.rotate(part.angle + enemy.age * part.orbitSpeed + Math.PI / 2);
      ctx.shadowBlur = 10;
      ctx.shadowColor = enemy.color;
      ctx.fillStyle = part.damaged > 0 ? "#ffffff" : enemy.color;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
      ctx.lineWidth = 1.5;
      if (part.role === "gun") {
        ctx.beginPath(); ctx.moveTo(0, -part.r); ctx.lineTo(part.r * 0.78, part.r * 0.65); ctx.lineTo(0, part.r * 0.36); ctx.lineTo(-part.r * 0.78, part.r * 0.65); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#241d25";
        ctx.fillRect(-3, -part.r - 6, 6, part.r + 8);
      } else if (part.role === "shield") {
        ctx.beginPath();
        for (let point = 0; point < 6; point += 1) {
          const angle = point * TAU / 6 - Math.PI / 2;
          const x = Math.cos(angle) * part.r;
          const y = Math.sin(angle) * part.r;
          if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#211a2b";
        ctx.beginPath(); ctx.arc(0, 0, part.r * 0.42, 0, TAU); ctx.fill();
      } else {
        ctx.rotate(enemy.age * 1.7);
        ctx.beginPath(); ctx.moveTo(0, -part.r); ctx.lineTo(part.r, 0); ctx.lineTo(0, part.r); ctx.lineTo(-part.r, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#171329";
        ctx.beginPath(); ctx.arc(0, 0, part.r * 0.36, 0, TAU); ctx.fill();
      }
      ctx.restore();
      const width = part.r * 1.6;
      ctx.fillStyle = "rgba(2, 9, 9, 0.75)";
      ctx.fillRect(position.x - width / 2, position.y + part.r + 5, width, 2);
      ctx.fillStyle = "#ffd665";
      ctx.fillRect(position.x - width / 2, position.y + part.r + 5, width * Math.max(0, part.hp / part.maxHp), 2);
    }
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
    const color = pickup.kind === "weapon" || pickup.kind === "armory"
      ? weaponDefs[pickup.weapon].color
      : pickup.kind === "upgrade"
        ? "#8de7ff"
        : pickup.kind === "rescue"
          ? wingmanDefs[pickup.pilotRole]?.color || "#dff8ff"
        : pickup.kind === "bomb"
          ? "#ffd665"
          : "#69f7d0";
    ctx.save();
    ctx.translate(pickup.x, pickup.y);
    ctx.rotate(pickup.spin);
    ctx.fillStyle = "rgba(2, 17, 16, 0.78)";
    ctx.beginPath();
    ctx.arc(0, 0, pickup.kind === "armory" ? 24 : pickup.kind === "rescue" ? 23 : 20, 0, TAU); ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = pickup.kind === "armory" ? 2.5 : 2;
    ctx.shadowBlur = pickup.kind === "armory" ? 12 : 0;
    ctx.shadowColor = color;
    ctx.beginPath();
    const edge = pickup.kind === "armory" ? 22 : pickup.kind === "rescue" ? 20 : 18;
    ctx.moveTo(0, -edge); ctx.lineTo(edge - 1, 0); ctx.lineTo(0, edge); ctx.lineTo(-edge + 1, 0); ctx.closePath(); ctx.stroke();
    ctx.restore();
    if (pickup.kind === "armory") {
      ctx.save();
      ctx.translate(pickup.x, pickup.y);
      ctx.rotate(-Math.PI / 2);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, TAU); ctx.stroke();
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, TAU * clamp(pickup.cycleCharge, 0, 1)); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = color;
    ctx.font = "900 16px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = pickup.kind === "weapon" || pickup.kind === "armory" ? weaponDefs[pickup.weapon].pickup : pickup.kind === "upgrade" ? "U" : pickup.kind === "rescue" ? wingmanDefs[pickup.pilotRole]?.icon || "W" : pickup.kind === "bomb" ? "◆" : "+";
    ctx.fillText(label, pickup.x, pickup.y + 1);
    if (pickup.kind === "armory") {
      ctx.fillStyle = "rgba(235, 248, 239, 0.78)";
      ctx.font = "900 7px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
      ctx.fillText("FIRE / CYCLE", pickup.x, pickup.y + 37);
    } else if (pickup.kind === "rescue") {
      ctx.fillStyle = "rgba(235, 248, 239, 0.86)";
      ctx.font = "900 7px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
      ctx.fillText("RESCUE LINK", pickup.x, pickup.y + 35);
    }
  }

  function drawBullet(bullet, enemy = false) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
    ctx.rotate(angle);
    ctx.shadowBlur = bullet.overdrive || bullet.gravity ? 16 : bullet.rail || bullet.laser ? 12 : 6;
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
    } else if (bullet.gravity) {
      ctx.fillStyle = "#090817";
      ctx.beginPath(); ctx.arc(0, 0, bullet.r, 0, TAU); ctx.fill();
      ctx.strokeStyle = bullet.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.72;
      ctx.beginPath(); ctx.arc(0, 0, bullet.r + 5 + Math.sin((bullet.age || 0) * 12) * 2, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.arc(0, 0, bullet.r + 10, Math.PI * 0.2, Math.PI * 1.4); ctx.stroke();
    } else if (bullet.blade) {
      ctx.rotate((bullet.age || 0) * 15);
      ctx.beginPath(); ctx.moveTo(0, -bullet.r * 1.45); ctx.lineTo(bullet.r * 0.72, 0); ctx.lineTo(0, bullet.r * 1.45); ctx.lineTo(-bullet.r * 0.72, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff4de";
      ctx.beginPath(); ctx.moveTo(0, -bullet.r * 0.55); ctx.lineTo(2.5, 0); ctx.lineTo(0, bullet.r * 0.55); ctx.lineTo(-2.5, 0); ctx.closePath(); ctx.fill();
    } else if (bullet.chain) {
      ctx.fillRect(-1.5, -11, 3, 22);
      ctx.fillRect(-7, -1.5, 14, 3);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-1, -7, 2, 14);
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
    const y = 205;
    ctx.fillStyle = "rgba(5, 16, 15, 0.64)";
    ctx.fillRect(W / 2 - width / 2, y, width, 16);
    ctx.strokeStyle = boss.color;
    ctx.strokeRect(W / 2 - width / 2, y, width, 16);
    ctx.fillStyle = currentTheme().accent;
    ctx.fillRect(W / 2 - width / 2 + 3, y + 3, (width - 6) * Math.max(0, boss.hp / boss.maxHp), 10);
    ctx.fillStyle = "#fff4c9";
    ctx.font = "900 9px 'Avenir Next Condensed', 'DIN Condensed', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${boss.bossTitle} // PHASE ${boss.stage}`, W / 2, y - 5);
    const parts = boss.parts || [];
    parts.forEach((part, index) => {
      const pipX = W / 2 - (parts.length - 1) * 7 + index * 14;
      ctx.fillStyle = part.dead ? "rgba(255,255,255,0.18)" : "#ffd665";
      ctx.fillRect(pipX - 4, y + 20, 8, 2);
    });
  }

  function render() {
    ctx.save();
    const shake = state.running && !state.paused ? state.shake : 0;
    if (shake) ctx.translate(random(-shake, shake), random(-shake * 0.55, shake * 0.55));
    drawBackdrop();
    drawEnvironment();
    drawTacticalLinks();
    drawRings();
    drawAlly();
    drawWingman();
    state.pickups.forEach(drawPickup);
    state.bullets.forEach((bullet) => drawBullet(bullet));
    state.enemyBullets.forEach((bullet) => drawBullet(bullet, true));
    state.enemies.forEach(drawEnemy);
    drawArcs();
    drawPlayer();
    drawJammerInterference();
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
    const mission = state.mission;
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
    ui.stageSerial.textContent = `${levelLabel()} / ${level.name}${currentCycle() > 0 ? ` / CYCLE ${currentCycle() + 1}` : ""}`;
    ui.railSector.textContent = `SECTOR ${String(state.level).padStart(2, "0")}${currentCycle() > 0 ? ` // C${currentCycle() + 1}` : ""}`;
    ui.comboText.textContent = `x${state.combo}`;
    ui.overdriveFill.style.width = `${clamp(state.overdriveCharge, 0, 100)}%`;
    ui.overdriveLabel.textContent = state.overdrive > 0 ? "OVERDRIVE" : "GRAZE";
    ui.overdriveText.textContent = state.overdrive > 0 ? `${state.overdrive.toFixed(1)}s` : `${String(Math.round(state.overdriveCharge)).padStart(2, "0")}%`;
    ui.overdriveCard.classList.toggle("is-active", state.overdrive > 0);
    const objectiveCard = ui.missionTitle.closest(".status-card--objective");
    if (mission) {
      const ratio = mission.type === "escort"
        ? mission.progress / mission.target
        : mission.progress / Math.max(1, mission.target);
      ui.missionLabel.textContent = mission.status === "ACTIVE" ? "SIDE MISSION" : `MISSION ${mission.status}`;
      ui.missionTitle.textContent = mission.title;
      ui.missionProgress.textContent = mission.type === "escort"
        ? `${Math.round(mission.progress)}%`
        : mission.type === "escape"
          ? `${Math.floor(mission.progress)} / ${mission.target}s`
          : `${Math.floor(mission.progress)} / ${mission.target}`;
      ui.missionFill.style.width = `${clamp(ratio * 100, 0, 100)}%`;
      objectiveCard.classList.toggle("is-complete", mission.success);
      objectiveCard.classList.toggle("is-failed", mission.resolved && !mission.success);
    }
    ui.environmentLabel.textContent = `${state.environment?.name || "AIRSPACE NOMINAL"} // SIGNAL ${state.signalFragments}/4${state.jamStrength > 0.08 ? ` // JAM ${Math.round(state.jamStrength * 100)}%` : ""}`;
    const module = moduleDefs[state.module] || moduleDefs.none;
    ui.moduleName.textContent = state.module === "aegis" && player ? `${module.name} // ${player.moduleCharges}` : module.name;
    ui.moduleChip.style.borderColor = module.color;
    if (state.wingman) {
      const wingman = state.wingman;
      const wingmanDef = wingmanDefs[wingman.role];
      ui.wingmanIcon.textContent = wingmanDef.icon;
      ui.wingmanName.textContent = wingmanDef.name;
      ui.wingmanRole.textContent = `${wingmanDef.role} // ${state.wingmanRoster.length} LINKED`;
      ui.wingmanStatus.textContent = wingman.cooldown <= 0 ? "READY" : `${wingman.cooldown.toFixed(1)}s`;
      ui.wingmanButton.style.setProperty("--wing-color", wingmanDef.color);
      ui.wingmanButton.classList.add("is-online");
      ui.wingmanButton.classList.toggle("is-switchable", state.wingmanRoster.length > 1);
      ui.wingmanButton.setAttribute("aria-label", state.wingmanRoster.length > 1 ? `切换僚机，当前 ${wingmanDef.name}` : `当前僚机 ${wingmanDef.name}`);
    } else {
      ui.wingmanIcon.textContent = "+";
      ui.wingmanName.textContent = "NO WINGMAN";
      ui.wingmanRole.textContent = "RESCUE LINK // STANDBY";
      ui.wingmanStatus.textContent = "OFFLINE";
      ui.wingmanButton.style.setProperty("--wing-color", "#6f8f86");
      ui.wingmanButton.classList.remove("is-online", "is-switchable");
      ui.wingmanButton.setAttribute("aria-label", "尚未营救僚机");
    }
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
      gravity: [105, 32, "sine", volume || 0.045, 0.24],
      enemy: [145, 110, "triangle", volume || 0.02, 0.05],
      explode: [92, 38, "sawtooth", 0.04, 0.18],
      boss: [120, 28, "sawtooth", 0.1, 0.42],
      hit: [170, 58, "square", 0.06, 0.13],
      pickup: [440, 880, "triangle", 0.06, 0.15],
      upgrade: [520, 1040, "triangle", 0.075, 0.22],
      armory: [370, 740, "square", volume || 0.035, 0.1],
      graze: [760, 1180, "sine", volume || 0.025, 0.07],
      overdrive: [180, 1320, "sawtooth", 0.085, 0.38],
      mission: [420, 1120, "triangle", 0.07, 0.3],
      route: [240, 690, "sine", 0.055, 0.25],
      phase: [160, 620, "square", 0.065, 0.28],
      part: [210, 68, "sawtooth", 0.075, 0.24],
      shield: [840, 310, "sine", 0.06, 0.2],
      repair: [360, 720, "sine", volume || 0.025, 0.12],
      rescue: [310, 980, "triangle", 0.07, 0.3],
      wingman: [260, 780, "triangle", 0.055, 0.22],
      "wingman-shot": [430, 190, "square", volume || 0.018, 0.06],
      lightning: [1200, 58, "sawtooth", 0.07, 0.2],
      heat: [92, 42, "sawtooth", 0.055, 0.24],
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
    const codes = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "KeyC", "Space", "KeyP", "Escape", "Enter", "Digit1", "Digit2"];
    if (codes.includes(event.code)) event.preventDefault();
    if (state.routeOpen && (event.code === "Digit1" || event.code === "Digit2")) {
      const route = currentLevelDef().routes[event.code === "Digit1" ? 0 : 1];
      selectRoute(route);
      return;
    }
    if (event.code === "Space" && !event.repeat) {
      if (!state.running) startGame();
      else triggerSpecial();
      return;
    }
    if ((event.code === "KeyP" || event.code === "Escape") && !event.repeat) { pauseGame(); return; }
    if (event.code === "KeyC" && !event.repeat) { cycleWingman(); return; }
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
    if (!state.running || state.paused || state.routeOpen || state.pointer.active) return;
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
  ui.wingmanButton.addEventListener("click", () => { resumeAudio(); cycleWingman(); });
  ui.mobileSpecial.addEventListener("click", () => { resumeAudio(); triggerSpecial(); });

  if (new URLSearchParams(window.location.search).has("debug")) {
    window.__skybreakerDebug = {
      state,
      startGame,
      spawnEnemy,
      spawnPickup,
      deployWingman: (role) => {
        if (!state.wingmanRoster.includes(role)) state.wingmanRoster.push(role);
        deployWingman(role, false);
      },
      setWeapon: (weapon, level = 1) => {
        if (!weaponDefs[weapon] || !state.player) return;
        state.player.weapon = weapon;
        state.player.weaponLevel = clamp(level, 1, 3);
        state.player.fireCooldown = 0;
      },
      snapshot: () => ({
        level: state.level,
        phase: state.levelPhase,
        weapon: state.player?.weapon,
        weaponLevel: state.player?.weaponLevel,
        wingman: state.wingman?.role || null,
        roster: [...state.wingmanRoster],
        enemies: state.enemies.map((enemy) => ({ type: enemy.type, hp: enemy.hp, shielded: Boolean(tacticalSourceFor(enemy, "shield", 178)), cloaked: enemy.cloaked })),
        bullets: state.bullets.map((bullet) => ({ type: bullet.type, chain: Boolean(bullet.chain), gravity: Boolean(bullet.gravity), blade: Boolean(bullet.blade), returning: Boolean(bullet.returning) })),
        arcs: state.arcs.length,
        jamStrength: state.jamStrength,
      }),
    };
  }

  fitCanvas();
  initBackdrop();
  syncUi();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
})();
