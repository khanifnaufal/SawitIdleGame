const STORAGE_KEY = 'sawit-idle-save-v1';

const sawitEl = document.querySelector('.sawit-cost');
const totalSawitEl = document.getElementById('total-sawit');
const spcText = document.getElementById('spc-text');
const spsText = document.getElementById('sps-text');
const sawitImgContainer = document.querySelector('.sawit-img-container');
const toastEl = document.getElementById('toast');

const state = {
    sawit: 0,
    spc: 1,
    sps: 0,
    totalSawit: 0,
    upgradesBought: 0,
    achievementsUnlocked: [],
    prestigeMultiplier: 1,
    certificateLevel: 0,
    certificateCost: 500000,
};

const achievements = [
    { id: 'achv-1', title: 'Kumpulkan 100 sawit', condition: () => state.totalSawit >= 100, reward: () => { state.sawit += 100; }, rewardText: '+100 Sawit', unlocked: false },
    { id: 'achv-2', title: 'Upgrade 10 kali', condition: () => state.upgradesBought >= 10, reward: () => { state.sps += 10; }, rewardText: '+10 SPS', unlocked: false },
    { id: 'achv-3', title: 'Capai 100 SPS', condition: () => state.sps >= 100, reward: () => { state.sawit += 1000; }, rewardText: '+1000 Sawit', unlocked: false },
];

const upgrades = [
    {
        name: 'clicker',
        levelEl: document.querySelector('.clicker-level'),
        costEl: document.querySelector('.clicker-cost'),
        increaseEl: document.querySelector('.clicker-increase'),
        initiallyCost: 10,
        cost: 10,
        level: 0,
        increase: 1,
        sawitMultiplier: 1.26,
        costMultiplier: 1.20,
        type: 'spc',
    },
    {
        name: 'egrek',
        levelEl: document.querySelector('.egrek-level'),
        costEl: document.querySelector('.egrek-cost'),
        increaseEl: document.querySelector('.egrek-increase'),
        initiallyCost: 150,
        cost: 150,
        level: 0,
        increase: 4,
        sawitMultiplier: 1.21,
        costMultiplier: 1.18,
        type: 'sps',
    },
    {
        name: 'mandor',
        levelEl: document.querySelector('.mandor-level'),
        costEl: document.querySelector('.mandor-cost'),
        initiallyCost: 550,
        cost: 550,
        level: 0,
        increase: 10,
        sawitMultiplier: 1.18,
        costMultiplier: 1.17,
        type: 'sps',
    },
    {
        name: 'traktor',
        levelEl: document.querySelector('.traktor-level'),
        costEl: document.querySelector('.traktor-cost'),
        initiallyCost: 2500,
        cost: 2500,
        level: 0,
        increase: 30,
        sawitMultiplier: 1.16,
        costMultiplier: 1.15,
        type: 'sps',
    },
    {
        name: 'gudang',
        levelEl: document.querySelector('.gudang-level'),
        costEl: document.querySelector('.gudang-cost'),
        initiallyCost: 5000,
        cost: 5000,
        level: 0,
        increase: 55,
        sawitMultiplier: 1.14,
        costMultiplier: 1.14,
        type: 'sps',
    },
    {
        name: 'pabrik',
        levelEl: document.querySelector('.pabrik-level'),
        costEl: document.querySelector('.pabrik-cost'),
        initiallyCost: 10500,
        cost: 10500,
        level: 0,
        increase: 120,
        sawitMultiplier: 1.14,
        costMultiplier: 1.14,
        type: 'sps',
    },
];

function formatNumber(value) {
    return Math.round(value).toLocaleString('id-ID');
}

function showToast(message, duration = 1200) {
    toastEl.innerText = message;
    toastEl.classList.remove('hidden');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toastEl.classList.add('hidden'), duration);
}

function rewardAchievement(achievement) {
    if (achievement.unlocked) return;
    achievement.unlocked = true;
    state.achievementsUnlocked.push(achievement.id);
    achievement.reward();
    updateUI();
    showToast(`Achievement unlocked: ${achievement.title} - Hadiah ${achievement.rewardText}`, 5000);
}

function updateUI() {
    sawitEl.innerHTML = formatNumber(state.sawit);
    totalSawitEl.innerText = formatNumber(state.totalSawit);
    spcText.innerText = formatNumber(state.spc);
    spsText.innerText = formatNumber(state.sps);
    const certificateText = document.getElementById('certificate-text');
    if (certificateText) {
        certificateText.innerText = `Sertifikat: ${state.certificateLevel} · Harga: ${formatNumber(state.certificateCost)} Sawit · Bonus: ${(state.prestigeMultiplier * 100).toFixed(0)}%`;
    }
    const panelTotal = document.getElementById('panel-total');
    const panelSpc = document.getElementById('panel-spc');
    const panelSps = document.getElementById('panel-sps');
    const panelPrestige = document.getElementById('panel-prestige');
    const panelCert = document.getElementById('panel-cert');
    if (panelTotal) panelTotal.innerText = formatNumber(state.totalSawit);
    if (panelSpc) panelSpc.innerText = formatNumber(state.spc);
    if (panelSps) panelSps.innerText = formatNumber(state.sps);
    if (panelPrestige) panelPrestige.innerText = `${state.prestigeMultiplier.toFixed(2)}x`;
    if (panelCert) panelCert.innerText = state.certificateLevel;

    upgrades.forEach((upgrade) => {
        if (upgrade.levelEl) upgrade.levelEl.innerText = upgrade.level;
        if (upgrade.costEl) upgrade.costEl.innerText = formatNumber(upgrade.cost);
        const card = document.querySelector(`.upgrade[data-upgrade='${upgrade.name}']`);
        if (card) {
            card.classList.toggle('locked', state.sawit < upgrade.cost);
            const sub = card.querySelector('.upgrade-sub');
            if (sub) sub.textContent = upgrade.type === 'spc' ? `+${upgrade.increase} SPC` : `+${upgrade.increase} SPS`;
        }
    });

    updateAchievements();
}

function updateAchievements() {
    achievements.forEach((achievement) => {
        const li = document.getElementById(achievement.id);
        const unlocked = state.achievementsUnlocked.includes(achievement.id) || achievement.unlocked;
        if (unlocked && !achievement.unlocked) {
            achievement.unlocked = true;
        }
        if (achievement.condition() && !unlocked) {
            rewardAchievement(achievement);
        }
        if (li) {
            li.innerText = `${achievement.unlocked ? '[✓]' : '[ ]'} ${achievement.title}`;
        }
    });
}

function incrementSawit(event) {
    const effectiveClick = state.spc * state.prestigeMultiplier;
    state.sawit += effectiveClick;
    state.totalSawit += effectiveClick;
    updateUI();

    const x = event.offsetX;
    const y = event.offsetY;
    const pop = document.createElement('div');
    pop.className = 'fade-up';
    pop.innerText = `+${formatNumber(state.spc)}`;
    pop.style.cssText = `position:absolute; left:${x}px; top:${y}px; font-size:14px; color:#fdf7ca; font-weight:bold;`;
    sawitImgContainer.appendChild(pop);
    setTimeout(() => pop.remove(), 700);
}

function buyUpgrade(name) {
    const upgrade = upgrades.find((u) => u.name === name);
    if (!upgrade) return;
    if (state.sawit < upgrade.cost) {
        showToast('Koin tidak cukup!');
        return;
    }
    state.sawit -= upgrade.cost;
    upgrade.level += 1;

    if (upgrade.type === 'spc') {
        state.spc += upgrade.increase;
    } else {
        state.sps += upgrade.increase;
    }

    state.upgradesBought += 1;
    upgrade.increase = Math.round(upgrade.increase * upgrade.sawitMultiplier);
    upgrade.cost = Math.round(upgrade.cost * upgrade.costMultiplier);

    showToast(`Upgrade ${upgrade.name} berhasil!`);
    updateUI();
}

function save() {
    const saveData = {
        state,
        upgrades: upgrades.map((u) => ({ name: u.name, level: u.level, cost: u.cost, increase: u.increase })),
        achievements: achievements.map((a) => ({ id: a.id, unlocked: a.unlocked })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    showToast('Game disimpan');
}

function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        showToast('Tidak ada save data');
        return;
    }
    try {
        const parsed = JSON.parse(saved);
        if (parsed.state) {
            Object.assign(state, parsed.state);
        }
        if (Array.isArray(parsed.upgrades)) {
            parsed.upgrades.forEach((loaded) => {
                const upgrade = upgrades.find((u) => u.name === loaded.name);
                if (upgrade) {
                    upgrade.level = Number(loaded.level || 0);
                    upgrade.cost = Number(loaded.cost || upgrade.initiallyCost);
                    upgrade.increase = Number(loaded.increase || upgrade.increase);
                }
            });
        }
        if (Array.isArray(parsed.achievements)) {
            parsed.achievements.forEach((saved) => {
                const ach = achievements.find((a) => a.id === saved.id);
                if (ach && saved.unlocked) {
                    ach.unlocked = true;
                    state.achievementsUnlocked = state.achievementsUnlocked || [];
                    if (!state.achievementsUnlocked.includes(saved.id)) {
                        state.achievementsUnlocked.push(saved.id);
                    }
                }
            });
        }
        updateUI();
        showToast('Game dimuat');
    } catch (e) {
        console.error('Load failed', e);
        showToast('Load gagal, data rusak');
    }
}

function buyCertificate() {
    if (state.sawit < state.certificateCost) {
        showToast('Sawit belum cukup untuk beli Sertifikat Lahan.');
        return;
    }
    state.sawit -= state.certificateCost;
    state.certificateLevel += 1;
    state.prestigeMultiplier *= 1.12;
    state.certificateCost = Math.round(state.certificateCost * 1.35);
    showToast(`Sertifikat dibeli! Bonus permanen sekarang ${state.prestigeMultiplier.toFixed(2)}x`, 5000);
    updateUI();
}

function autoSaveLoop() {
    save();
}

function startGame() {
    load();
    updateUI();
    setInterval(() => {
        const effectiveSPS = state.sps * state.prestigeMultiplier;
        state.sawit += effectiveSPS / 10;
        state.totalSawit += effectiveSPS / 10;
        updateUI();
    }, 100);
    setInterval(autoSaveLoop, 8000);
}

startGame();