// ─── Storage ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sawit-idle-save-v2';

// ─── DOM refs ────────────────────────────────────────────────────────────────
const sawitEl           = document.querySelector('.sawit-cost');
const totalSawitEl      = document.getElementById('total-sawit');
const spcText           = document.getElementById('spc-text');
const spsText           = document.getElementById('sps-text');
const sawitImgContainer = document.querySelector('.sawit-img-container');
const sawitImg          = document.getElementById('sawit-img');
const toastEl           = document.getElementById('toast');

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
    sawit:               0,
    spc:                 1,
    sps:                 0,
    totalSawit:          0,
    upgradesBought:      0,
    totalClicks:         0,
    playTimeSec:         0,
    achievementsUnlocked: [],
    prestigeMultiplier:  1,
    certificateLevel:    0,
    certificateCost:     500000,
    buyMultiplier:       1,       // 1 | 10 | 'max'
    muted:               false,
    lastSaveTime:        null,
};

// ─── Audio ───────────────────────────────────────────────────────────────────
const AUDIO = {
    click:       new Audio('./assets/images/audio/sawit-click.wav'),
    buy:         new Audio('./assets/images/audio/buyupgrade.wav'),
    achievement: new Audio('./assets/images/audio/achievment-completed.wav'),
};
AUDIO.click.volume       = 0.5;
AUDIO.buy.volume         = 0.6;
AUDIO.achievement.volume = 0.7;

function playSound(key) {
    if (state.muted) return;
    const snd = AUDIO[key];
    if (!snd) return;
    snd.currentTime = 0;
    snd.play().catch(() => {});
}

function toggleMute() {
    state.muted = !state.muted;
    document.getElementById('mute-btn').textContent = state.muted ? '🔇' : '🔊';
}

// ─── Number formatting ───────────────────────────────────────────────────────
const SUFFIXES = [
    { v: 1e12, s: 'T' },
    { v: 1e9,  s: 'M' },
    { v: 1e6,  s: 'Jt' },
    { v: 1e3,  s: 'Rb' },
];

function formatNumber(value) {
    const n = Math.round(value);
    for (const { v, s } of SUFFIXES) {
        if (n >= v) return (n / v).toFixed(2).replace(/\.?0+$/, '') + ' ' + s;
    }
    return n.toLocaleString('id-ID');
}

function formatTime(sec) {
    if (sec < 60) return `${Math.floor(sec)} dtk`;
    if (sec < 3600) return `${Math.floor(sec / 60)} mnt`;
    return `${Math.floor(sec / 3600)} jam ${Math.floor((sec % 3600) / 60)} mnt`;
}

// ─── Achievements ────────────────────────────────────────────────────────────
const achievements = [
    {
        id: '1', title: 'Kumpulkan 100 sawit',
        condition: () => state.totalSawit >= 100,
        reward: () => { state.sawit += 100; },
        rewardText: '+100 Sawit', unlocked: false,
    },
    {
        id: '2', title: 'Upgrade 10 kali',
        condition: () => state.upgradesBought >= 10,
        reward: () => { state.sps += 10; },
        rewardText: '+10 SPS', unlocked: false,
    },
    {
        id: '3', title: 'Capai 100 SPS',
        condition: () => state.sps >= 100,
        reward: () => { state.sawit += 1000; },
        rewardText: '+1.000 Sawit', unlocked: false,
    },
    {
        id: '4', title: 'Kumpulkan 10.000 sawit',
        condition: () => state.totalSawit >= 10000,
        reward: () => { state.sps += 500; },
        rewardText: '+500 SPS', unlocked: false,
    },
    {
        id: '5', title: 'Capai 500 SPS',
        condition: () => state.sps >= 500,
        reward: () => { state.prestigeMultiplier *= 1.05; },
        rewardText: 'Pengganda ×1.05', unlocked: false,
    },
    {
        id: '6', title: 'Upgrade 50 kali',
        condition: () => state.upgradesBought >= 50,
        reward: () => { state.spc += 2; },
        rewardText: '+2 SPC', unlocked: false,
    },
    {
        id: '7', title: 'Beli 5 Sertifikat',
        condition: () => state.certificateLevel >= 5,
        reward: () => { state.prestigeMultiplier *= 1.10; },
        rewardText: 'Pengganda ×1.10', unlocked: false,
    },
    {
        id: '8', title: 'Kumpulkan 1.000.000 sawit',
        condition: () => state.totalSawit >= 1000000,
        reward: () => { state.sps += 5000; },
        rewardText: '+5.000 SPS', unlocked: false,
    },
    {
        id: '9', title: 'Capai 1.000 SPS',
        condition: () => state.sps >= 1000,
        reward: () => { state.prestigeMultiplier *= 1.10; },
        rewardText: 'Pengganda ×1.10', unlocked: false,
    },
    {
        id: '10', title: 'Upgrade semua item ke Lvl 10',
        condition: () => upgrades.every(u => u.level >= 10),
        reward: () => { state.spc *= 2; },
        rewardText: 'SPC ×2 (Klik Emas!)', unlocked: false,
    },
];

// ─── Upgrades ────────────────────────────────────────────────────────────────
const upgrades = [
    {
        name: 'clicker',
        levelEl:    document.querySelector('.clicker-level'),
        costEl:     document.querySelector('.clicker-cost'),
        progressEl: document.querySelector('.clicker-progress'),
        etaEl:      document.querySelector('.clicker-eta'),
        initiallyCost: 10,    cost: 10,    level: 0, increase: 1,
        sawitMultiplier: 1.26, costMultiplier: 1.20,
        type: 'spc',
    },
    {
        name: 'egrek',
        levelEl:    document.querySelector('.egrek-level'),
        costEl:     document.querySelector('.egrek-cost'),
        progressEl: document.querySelector('.egrek-progress'),
        etaEl:      document.querySelector('.egrek-eta'),
        initiallyCost: 150,   cost: 150,   level: 0, increase: 4,
        sawitMultiplier: 1.21, costMultiplier: 1.18,
        type: 'sps',
    },
    {
        name: 'mandor',
        levelEl:    document.querySelector('.mandor-level'),
        costEl:     document.querySelector('.mandor-cost'),
        progressEl: document.querySelector('.mandor-progress'),
        etaEl:      document.querySelector('.mandor-eta'),
        initiallyCost: 550,   cost: 550,   level: 0, increase: 10,
        sawitMultiplier: 1.18, costMultiplier: 1.17,
        type: 'sps',
    },
    {
        name: 'traktor',
        levelEl:    document.querySelector('.traktor-level'),
        costEl:     document.querySelector('.traktor-cost'),
        progressEl: document.querySelector('.traktor-progress'),
        etaEl:      document.querySelector('.traktor-eta'),
        initiallyCost: 2500,  cost: 2500,  level: 0, increase: 30,
        sawitMultiplier: 1.16, costMultiplier: 1.15,
        type: 'sps',
    },
    {
        name: 'gudang',
        levelEl:    document.querySelector('.gudang-level'),
        costEl:     document.querySelector('.gudang-cost'),
        progressEl: document.querySelector('.gudang-progress'),
        etaEl:      document.querySelector('.gudang-eta'),
        initiallyCost: 5000,  cost: 5000,  level: 0, increase: 55,
        sawitMultiplier: 1.14, costMultiplier: 1.14,
        type: 'sps',
    },
    {
        name: 'pabrik',
        levelEl:    document.querySelector('.pabrik-level'),
        costEl:     document.querySelector('.pabrik-cost'),
        progressEl: document.querySelector('.pabrik-progress'),
        etaEl:      document.querySelector('.pabrik-eta'),
        initiallyCost: 10500, cost: 10500, level: 0, increase: 120,
        sawitMultiplier: 1.14, costMultiplier: 1.14,
        type: 'sps',
    },
];

// ─── Toast ───────────────────────────────────────────────────────────────────
function showToast(message, duration = 1400) {
    toastEl.innerText = message;
    toastEl.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.add('hidden'), duration);
}

// ─── Achievement handler ──────────────────────────────────────────────────────
function rewardAchievement(ach) {
    if (ach.unlocked) return;
    ach.unlocked = true;
    if (!state.achievementsUnlocked.includes(ach.id)) {
        state.achievementsUnlocked.push(ach.id);
    }
    ach.reward();
    updateUI();
    playSound('achievement');
    showToast(`🏆 Pencapaian: ${ach.title} — Hadiah ${ach.rewardText}`, 5000);
}

function updateAchievements() {
    achievements.forEach(ach => {
        const unlocked = ach.unlocked || state.achievementsUnlocked.includes(ach.id);
        if (unlocked && !ach.unlocked) ach.unlocked = true;
        if (ach.condition() && !ach.unlocked) rewardAchievement(ach);

        const tick = ach.unlocked ? '[✓]' : '[ ]';
        const liMain = document.getElementById(`achv-main-${ach.id}`);
        const liStat = document.getElementById(`achv-stat-${ach.id}`);
        const text = `${tick} ${ach.title}`;
        if (liMain) { liMain.textContent = text; liMain.classList.toggle('unlocked', ach.unlocked); }
        if (liStat) { liStat.textContent = text; liStat.classList.toggle('unlocked', ach.unlocked); }
    });
}

// ─── Progress bar helper ──────────────────────────────────────────────────────
const MILESTONES = [10, 25, 50, 100, 200];
function getMilestone(level) {
    return MILESTONES.find(m => m > level) ?? (Math.ceil(level / 100) * 100);
}

// ─── Main UI update ───────────────────────────────────────────────────────────
function updateUI() {
    sawitEl.innerHTML           = formatNumber(state.sawit);
    totalSawitEl.innerText      = formatNumber(state.totalSawit);
    spcText.innerText           = formatNumber(state.spc);
    spsText.innerText           = formatNumber(state.sps);

    const certText = document.getElementById('certificate-text');
    if (certText) {
        const bonusPct = ((state.prestigeMultiplier - 1) * 100).toFixed(0);
        certText.innerText = `Sertifikat: ${state.certificateLevel}  ·  Harga: ${formatNumber(state.certificateCost)} Sawit  ·  Bonus +${bonusPct}%`;
    }

    // Stats panel
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set('panel-total',    formatNumber(state.totalSawit));
    set('panel-spc',      formatNumber(state.spc));
    set('panel-sps',      formatNumber(state.sps));
    set('panel-prestige', `${state.prestigeMultiplier.toFixed(2)}×`);
    set('panel-cert',     state.certificateLevel);
    set('panel-clicks',   formatNumber(state.totalClicks));
    set('panel-upgrades', formatNumber(state.upgradesBought));
    set('panel-playtime', formatTime(state.playTimeSec));

    // Buy multiplier button label
    const effectiveSPS = state.sps * state.prestigeMultiplier;

    upgrades.forEach(u => {
        if (u.levelEl) u.levelEl.innerText = u.level;

        // Calculate cost for current multiplier
        const qty = calcMaxAffordable(u);
        const displayQty = state.buyMultiplier === 'max' ? qty : state.buyMultiplier;
        const batchCost  = calcBatchCost(u, displayQty);

        if (u.costEl) u.costEl.innerText = formatNumber(batchCost);

        const card    = document.querySelector(`.upgrade[data-upgrade='${u.name}']`);
        const buyBtn  = document.getElementById(`buy-btn-${u.name}`);
        const canAfford = state.sawit >= batchCost && displayQty > 0;

        if (card) {
            card.classList.toggle('locked', !canAfford);
            card.classList.toggle('affordable', canAfford);
            const sub = card.querySelector('.upgrade-sub');
            if (sub) sub.textContent = u.type === 'spc' ? `+${formatNumber(u.increase)} SPC` : `+${formatNumber(u.increase)} SPS`;
        }
        if (buyBtn) {
            if (state.buyMultiplier === 'max') {
                buyBtn.textContent = qty > 0 ? `BELI ×${qty}` : 'BELI';
            } else if (state.buyMultiplier === 10) {
                buyBtn.textContent = 'BELI ×10';
            } else {
                buyBtn.textContent = 'BELI';
            }
        }

        // Progress bar
        const milestone = getMilestone(u.level);
        const prevMilestone = MILESTONES[MILESTONES.indexOf(milestone) - 1] ?? 0;
        const pct = Math.min(100, ((u.level - prevMilestone) / (milestone - prevMilestone)) * 100);
        if (u.progressEl) u.progressEl.style.width = pct + '%';

        // ETA
        if (u.etaEl) {
            if (canAfford) {
                u.etaEl.textContent = '';
            } else if (effectiveSPS > 0) {
                const needed = batchCost - state.sawit;
                u.etaEl.textContent = `~${formatTime(needed / effectiveSPS)}`;
            } else {
                u.etaEl.textContent = '';
            }
        }
    });

    updateAchievements();
}

// ─── Buy multiplier ───────────────────────────────────────────────────────────
function setBuyMultiplier(val) {
    state.buyMultiplier = val;
    ['x1', 'x10', 'max'].forEach(k => {
        document.getElementById(`btn-${k}`).classList.remove('active');
    });
    const idMap = { 1: 'x1', 10: 'x10', max: 'max' };
    document.getElementById(`btn-${idMap[val]}`).classList.add('active');
    updateUI();
}

// ─── Batch cost calculation ───────────────────────────────────────────────────
function calcBatchCost(upgrade, qty) {
    // Geometric series: cost + cost*r + cost*r^2 + ... for qty terms
    const r = upgrade.costMultiplier;
    if (qty <= 0) return Infinity;
    if (qty === 1) return upgrade.cost;
    return Math.round(upgrade.cost * ((Math.pow(r, qty) - 1) / (r - 1)));
}

function calcMaxAffordable(upgrade) {
    if (state.sawit < upgrade.cost) return 0;
    const r = upgrade.costMultiplier;
    // Solve: cost * (r^n - 1) / (r - 1) <= sawit
    const n = Math.floor(Math.log((state.sawit * (r - 1) / upgrade.cost) + 1) / Math.log(r));
    return Math.max(0, n);
}

// ─── Clicker ──────────────────────────────────────────────────────────────────
function incrementSawit(event) {
    const gained = state.spc * state.prestigeMultiplier;
    state.sawit      += gained;
    state.totalSawit += gained;
    state.totalClicks++;
    updateUI();
    playSound('click');

    // Click bounce
    sawitImg.classList.add('clicked');
    setTimeout(() => sawitImg.classList.remove('clicked'), 120);

    // Floating label
    const x = event.offsetX;
    const y = event.offsetY;
    const pop = document.createElement('div');
    pop.className = 'fade-up';
    pop.innerText = `+${formatNumber(gained)}`;
    pop.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:13px;color:#fdf7ca;font-weight:bold;pointer-events:none;`;
    sawitImgContainer.appendChild(pop);
    setTimeout(() => pop.remove(), 800);
}

// ─── Buy upgrade ─────────────────────────────────────────────────────────────
function buyUpgrade(name) {
    const upgrade = upgrades.find(u => u.name === name);
    if (!upgrade) return;

    let qty = state.buyMultiplier === 'max'
        ? calcMaxAffordable(upgrade)
        : state.buyMultiplier;

    if (qty <= 0 || state.sawit < upgrade.cost) {
        showToast('Sawit tidak cukup!');
        return;
    }

    // Apply each purchase iteratively to keep cost scaling correct
    for (let i = 0; i < qty; i++) {
        if (state.sawit < upgrade.cost) { qty = i; break; }
        state.sawit -= upgrade.cost;
        upgrade.level++;
        if (upgrade.type === 'spc') state.spc += upgrade.increase;
        else                         state.sps += upgrade.increase;
        state.upgradesBought++;
        upgrade.increase = Math.round(upgrade.increase * upgrade.sawitMultiplier);
        upgrade.cost     = Math.round(upgrade.cost     * upgrade.costMultiplier);
    }

    playSound('buy');
    showToast(`${upgrade.name.charAt(0).toUpperCase() + upgrade.name.slice(1)} ×${qty} berhasil dibeli!`);
    updateUI();
}

// ─── Certificate (Prestige) ───────────────────────────────────────────────────
function buyCertificate() {
    if (state.sawit < state.certificateCost) {
        showToast('Sawit belum cukup untuk beli Sertifikat Lahan.');
        return;
    }
    state.sawit -= state.certificateCost;
    state.certificateLevel++;
    state.prestigeMultiplier *= 1.12;
    state.certificateCost = Math.round(state.certificateCost * 1.35);
    const bonusPct = ((state.prestigeMultiplier - 1) * 100).toFixed(0);
    showToast(`Sertifikat dibeli! Bonus permanen sekarang +${bonusPct}%`, 5000);
    playSound('buy');
    updateUI();
}

// ─── Save / Load ──────────────────────────────────────────────────────────────
function buildSaveData() {
    return {
        state,
        upgrades:     upgrades.map(u => ({ name: u.name, level: u.level, cost: u.cost, increase: u.increase })),
        achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        savedAt:      Date.now(),
    };
}

function save() {
    const data = buildSaveData();
    data.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showToast('Game disimpan ✓');
}

function silentSave() {
    const data = buildSaveData();
    data.savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
        const parsed = JSON.parse(raw);
        if (parsed.state) Object.assign(state, parsed.state);
        if (Array.isArray(parsed.upgrades)) {
            parsed.upgrades.forEach(loaded => {
                const u = upgrades.find(u => u.name === loaded.name);
                if (u) {
                    u.level    = Number(loaded.level    ?? 0);
                    u.cost     = Number(loaded.cost     ?? u.initiallyCost);
                    u.increase = Number(loaded.increase ?? u.increase);
                }
            });
        }
        if (Array.isArray(parsed.achievements)) {
            parsed.achievements.forEach(saved => {
                const a = achievements.find(a => a.id === saved.id);
                if (a && saved.unlocked) {
                    a.unlocked = true;
                    if (!state.achievementsUnlocked.includes(saved.id)) {
                        state.achievementsUnlocked.push(saved.id);
                    }
                }
            });
        }

        // Offline earnings
        if (parsed.savedAt) {
            const elapsedSec = Math.min((Date.now() - parsed.savedAt) / 1000, 4 * 3600);
            if (elapsedSec > 60 && state.sps > 0) {
                const earned = Math.floor(state.sps * state.prestigeMultiplier * elapsedSec);
                state.sawit      += earned;
                state.totalSawit += earned;
                showOfflineModal(elapsedSec, earned);
            }
        }

        return true;
    } catch (e) {
        console.error('Load gagal', e);
        showToast('Gagal memuat — data mungkin rusak');
        return false;
    }
}

// ─── Offline modal ────────────────────────────────────────────────────────────
function showOfflineModal(elapsedSec, earned) {
    const modal = document.getElementById('offline-modal');
    const msg   = document.getElementById('offline-msg');
    if (!modal || !msg) return;
    msg.innerHTML = `Kamu absen selama <strong>${formatTime(elapsedSec)}</strong>.<br>Perkebunanmu menghasilkan <strong class="sawit-text">+${formatNumber(earned)} Sawit</strong>!`;
    modal.classList.remove('hidden');
}

function closeOfflineModal() {
    const modal = document.getElementById('offline-modal');
    if (modal) modal.classList.add('hidden');
}

// ─── Game loop ────────────────────────────────────────────────────────────────
function startGame() {
    const loaded = load();
    if (!loaded) showToast('Selamat datang di Sawit Idle Clicker! 🌴');
    updateUI();

    // SPS tick every 100ms
    setInterval(() => {
        const gain = (state.sps * state.prestigeMultiplier) / 10;
        state.sawit      += gain;
        state.totalSawit += gain;
        updateUI();
    }, 100);

    // Playtime counter every second
    setInterval(() => {
        state.playTimeSec++;
    }, 1000);

    // Silent auto-save every 8s
    setInterval(silentSave, 8000);
}

startGame();