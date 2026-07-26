// ===== СОСТОЯНИЕ =====
let game = {
    p: { 
        h: 200, mh: 200, e: 150, me: 150, pw: 25, def: 5, 
        c: 500, w: 0, l: 0, t: 0, 
        lvl: 10, xp: 0, xn: 250, 
        wp: [], potion: 0 
    },
    ch: 1,
    fg: false,
    en: null,
    eh: 0,
    selectedChapter: 1,
    daily: { lastClaim: 0, streak: 0, day: 1 }
};

// ===== 100 БОССОВ =====
const enemies = {};
for (let i = 1; i <= 100; i++) {
    let isBoss = i % 10 === 0;
    let baseHP = 50 + i * 5;
    let basePower = 5 + i * 0.8;
    let baseDef = 1 + Math.floor(i / 20);
    let reward = 10 + i * 2;
    let expBonus = 8 + i * 1.2;
    enemies[i] = {
        n: isBoss ? '⭐ БОСС ' + i : 'Враг ' + i,
        h: isBoss ? Math.floor(baseHP * 3) : Math.floor(baseHP),
        pw: isBoss ? Math.floor(basePower * 2.5) : Math.floor(basePower),
        d: isBoss ? Math.floor(baseDef * 2.5) : Math.floor(baseDef),
        r: isBoss ? Math.floor(reward * 5) : Math.floor(reward),
        exp: isBoss ? Math.floor(expBonus * 4) : Math.floor(expBonus),
        b: isBoss,
        ic: isBoss ? '👑' : '👾'
    };
}

// ===== ОРУЖИЕ =====
const wpn = {
    f: { id: 'f', n: 'Кулаки', d: 5, pr: 0, ic: '👊', lvl: 1 },
    s: { id: 's', n: 'Меч', d: 14, pr: 80, ic: '⚔️', lvl: 2 },
    a: { id: 'a', n: 'Топор', d: 19, pr: 120, ic: '🪓', lvl: 3 },
    b: { id: 'b', n: 'Лук', d: 12, pr: 100, ic: '🏹', lvl: 4 },
    fi: { id: 'fi', n: 'Огн меч', d: 24, pr: 200, ic: '🔥', lvl: 5 },
    wd: { id: 'wd', n: 'Посох', d: 17, pr: 150, ic: '🪄', lvl: 6 },
    cr: { id: 'cr', n: 'Арбалет', d: 22, pr: 250, ic: '🎯', lvl: 7 },
    da: { id: 'da', n: 'Меч тьмы', d: 35, pr: 400, ic: '🗡️', lvl: 8 },
    st: { id: 'st', n: 'Посох маг', d: 30, pr: 350, ic: '🔮', lvl: 10 },
    le: { id: 'le', n: 'Легенда', d: 50, pr: 1000, ic: '⭐', lvl: 12 },
    dr: { id: 'dr', n: 'Драконобой', d: 60, pr: 1500, ic: '🐉', lvl: 14 }
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    let saved = localStorage.getItem('gd');
    if (saved) {
        try {
            let data = JSON.parse(saved);
            Object.assign(game.p, data.p);
            game.ch = data.ch || 1;
            if (data.daily) game.daily = data.daily;
        } catch(e) {}
    }
    
    // Если нет сохранения - даём 10 уровень
    if (!saved) {
        game.p.lvl = 10;
        game.p.mh = 200;
        game.p.h = 200;
        game.p.me = 150;
        game.p.e = 150;
        game.p.pw = 25;
        game.p.def = 5;
        game.p.c = 500;
        game.p.xn = 250;
    }
    
    if (!game.p.wp || !game.p.wp.length) {
        game.p.wp = [{ ...wpn.f, eq: true }];
    }
    game.selectedChapter = game.ch;
    updateUI();
}// ===== НАВИГАЦИЯ =====
function backToMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('shop').style.display = 'none';
    document.getElementById('weapons').style.display = 'none';
    document.getElementById('chapterSelect').style.display = 'none';
    document.getElementById('dailyBonus').style.display = 'none';
    updateUI();
}

function showChapterSelect() {
    backToMenu();
    document.getElementById('chapterSelect').style.display = 'block';
    renderChapterGrid();
}

function startGame() {
    backToMenu();
    document.getElementById('game').style.display = 'block';
    startBattle();
}

function showStats() {
    backToMenu();
    document.getElementById('stats').style.display = 'block';
    updateUI();
}

function showShop() {
    backToMenu();
    document.getElementById('shop').style.display = 'block';
    document.getElementById('sc2').textContent = game.p.c;
}

function showWeapons() {
    backToMenu();
    document.getElementById('weapons').style.display = 'block';
    updateWeapons();
}

function showDailyBonus() {
    backToMenu();
    document.getElementById('dailyBonus').style.display = 'block';
    updateDailyUI();
}

// ===== ВЫБОР БОССА =====
function renderChapterGrid() {
    let grid = document.getElementById('chapterGrid');
    grid.innerHTML = '';
    let maxShow = 100;
    document.getElementById('selectLvl').textContent = game.p.lvl;
    let available = 0;
    for (let i = 1; i <= maxShow; i++) {
        let enemy = enemies[i];
        if (!enemy) continue;
        let isUnlocked = game.p.lvl >= Math.ceil(i / 10) + 1;
        if (isUnlocked) available++;
        let isSelected = i === game.selectedChapter;
        let btn = document.createElement('button');
        btn.className = '';
        if (isSelected) btn.className += ' active';
        if (enemy.b) btn.className += ' boss';
        if (!isUnlocked) btn.className += ' locked';
        btn.innerHTML = `${enemy.ic}<span style="display:block;font-size:9px;">${i}</span><span class="req-level">${isUnlocked ? '✅' : '🔒' + (Math.ceil(i/10)+1)}</span>`;
        btn.onclick = function() {
            if (!isUnlocked) { alert('🔒 Нужен ' + (Math.ceil(i/10)+1) + ' уровень!'); return; }
            game.selectedChapter = i;
            renderChapterGrid();
        };
        grid.appendChild(btn);
    }
    document.getElementById('selectAvailable').textContent = available;
}

function startSelectedChapter() {
    let ch = game.selectedChapter;
    let reqLvl = Math.ceil(ch / 10) + 1;
    if (game.p.lvl < reqLvl) { alert('🔒 Нужен ' + reqLvl + ' уровень!'); return; }
    game.ch = ch;
    backToMenu();
    document.getElementById('game').style.display = 'block';
    startBattle();
}

// ===== БОЕВАЯ СИСТЕМА =====
function startBattle() {
    let d = enemies[game.ch];
    if (!d) { alert('🏆 Все боссы побеждены!'); backToMenu(); return; }
    let reqLvl = Math.ceil(game.ch / 10) + 1;
    if (game.p.lvl < reqLvl) { alert('🔒 Нужен ' + reqLvl + ' уровень!'); backToMenu(); return; }
    
    game.en = { ...d };
    game.eh = game.en.h;
    game.fg = true;
    game.p.h = game.p.mh;
    game.p.e = game.p.me;

    document.getElementById('ch').textContent = game.ch;
    document.getElementById('lvl').textContent = game.p.lvl;
    document.getElementById('gc').textContent = game.p.c;
    document.getElementById('bossEmoji').textContent = game.en.ic;
    document.getElementById('enemyName').textContent = game.en.ic + ' ' + game.en.n + (game.en.b ? ' 👑' : '');
    document.getElementById('log').innerHTML = '';
    addLog('⚔️ Бой с ' + game.en.ic + ' ' + game.en.n + (game.en.b ? ' (БОСС!)' : '') + '!');
    addLog('💪 Сила: ' + game.en.pw + ' | 🛡️ Защита: ' + game.en.d);
    updateHealth();

    document.getElementById('ctrl').innerHTML = `
        <button class="g" onclick="attack()">🗡️ Атака</button>
        <button class="r" onclick="defend()">🛡️ Защита</button>
    `;
}

function getWeapon() {
    let w = game.p.wp.find(w => w.eq);
    return w || { ...wpn.f };
}

function attack() {
    if (!game.fg) return;
    let w = getWeapon();
    let dmg = w.d + Math.floor(game.p.pw * 0.6);
    dmg = Math.floor(dmg * (0.75 + Math.random() * 0.5));
    dmg = Math.max(1, dmg - Math.floor(game.en.d * 0.2));
    if (Math.random() < 0.15) {
        dmg = Math.floor(dmg * 1.8);
        addLog('💥 КРИТ!');
    }
    game.eh = Math.max(0, game.eh - dmg);
    game.p.e = Math.max(0, game.p.e - 8);

    document.getElementById('enemyName').className = 'shake';
    setTimeout(() => document.getElementById('enemyName').className = '', 300);
    addLog('🎯 ' + w.ic + ' ' + w.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.eh <= 0) { victory(); return; }
    setTimeout(enemyTurn, 500);
}

function enemyTurn() {
    if (!game.fg) return;
    let dmg = Math.floor(game.en.pw * (0.5 + Math.random() * 0.6));
    dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.3));
    if (game.en.b && Math.random() < 0.2) {
        dmg = Math.floor(dmg * 1.5);
        addLog('💢 Босс использует суперудар!');
    }
    game.p.h = Math.max(0, game.p.h - dmg);

    document.getElementById('pht').className = 'shake';
    setTimeout(() => document.getElementById('pht').className = '', 300);
    addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.p.h <= 0) { defeat(); return; }
    game.p.e = Math.min(game.p.me, game.p.e + 5);
    updateHealth();
    addLog('🔄 Ваш ход!');
}

function defend() {
    if (!game.fg) return;
    let heal = Math.floor(15 + Math.random() * 20);
    if (game.p.potion > 0) {
        heal += 20;
        game.p.potion--;
        addLog('💊 Использовано зелье!');
    }
    game.p.h = Math.min(game.p.mh, game.p.h + heal);
    addLog('🛡️ Защита +' + heal + ' HP');
    updateHealth();
    setTimeout(() => {
        let dmg = Math.floor(game.en.pw * 0.25);
        dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.2));
        game.p.h = Math.max(0, game.p.h - dmg);
        addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона (ослаб)');
        updateHealth();
        if (game.p.h <= 0) { defeat(); } else { addLog('🔄 Ваш ход!'); }
    }, 500);
}

function victory() {
    game.fg = false;
    game.p.w++;
    game.p.t++;
    game.p.c += game.en.r;
    let xp = Math.floor(15 + game.en.h * 0.08 + game.en.pw * 0.3);
    if (game.en.b) {
        xp = Math.floor(xp * 2.5);
        addLog('👑 Бонус за босса!');
    }
    addXP(xp);
    addLog('🎉 ПОБЕДА! +' + game.en.r + '🪙 +' + xp + '⭐');
    save();
    setTimeout(() => {
        let ctrl = document.getElementById('ctrl');
        let nextCh = game.ch + 1;
        if (nextCh <= 100) {
            ctrl.innerHTML = `
                <button class="g" onclick="nextBoss()" style="grid-column:span 2;">⚔️ След босс</button>
                <button class="b" onclick="showChapterSelect()" style="grid-column:span 2;">📖 Выбрать</button>
                <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
            `;
        } else {
            ctrl.innerHTML = `<button class="gold" onclick="backToMenu()" style="grid-column:span 2;">🏆 Все боссы побеждены!</button>`;
        }
    }, 800);
}

function nextBoss() {
    game.ch++;
    startBattle();
}

function defeat() {
    game.fg = false;
    game.p.l++;
    game.p.t++;
    let xp = Math.floor(3 + game.ch * 0.5);
    addXP(xp);
    addLog('💀 Поражение... +' + xp + '⭐');
    save();
    setTimeout(() => {
        document.getElementById('ctrl').innerHTML = `
            <button class="r" onclick="restart()" style="grid-column:span 2;">🔄 Реванш</button>
            <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
        `;
    }, 800);
}

function restart() {
    game.p.h = game.p.mh;
    game.p.e = game.p.me;
    game.eh = game.en.h;
    game.fg = true;
    updateHealth();
    addLog('🔄 Новый бой!');
    document.getElementById('ctrl').innerHTML = `
        <button class="g" onclick="attack()">🗡️ Атака</button>
        <button class="r" onclick="defend()">🛡️ Защита</button>
    `;
}// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function addXP(a) {
    game.p.xp += a;
    while (game.p.xp >= game.p.xn) {
        game.p.xp -= game.p.xn;
        game.p.lvl++;
        game.p.xn = Math.floor(game.p.xn * 1.5) + 60;
        game.p.mh += 20;
        game.p.h = game.p.mh;
        game.p.me += 12;
        game.p.e = game.p.me;
        game.p.pw += 3;
        game.p.def += 1;
        addLog('🎊 УРОВЕНЬ ' + game.p.lvl + '!');
        let lvl = game.p.lvl;
        Object.values(wpn).forEach(w => {
            if (w.lvl <= lvl && !game.p.wp.find(p => p.id === w.id)) {
                game.p.wp.push({ ...w, eq: false });
                addLog('🗡️ ' + w.ic + ' ' + w.n);
            }
        });
    }
}

function addLog(msg) {
    let log = document.getElementById('log');
    if (!log) return;
    let p = document.createElement('p');
    p.textContent = msg;
    if (msg.includes('урона') || msg.includes('💢')) p.className = 'd';
    else if (msg.includes('Защита') || msg.includes('+')) p.className = 'h';
    else if (msg.includes('КРИТ') || msg.includes('⚡')) p.className = 's';
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    if (log.children.length > 30) log.removeChild(log.firstChild);
}

function updateHealth() {
    let pH = (game.p.h / game.p.mh) * 100;
    let eH = (game.eh / game.en.h) * 100;
    document.getElementById('ph').style.width = Math.max(0, pH) + '%';
    document.getElementById('eh').style.width = Math.max(0, eH) + '%';
    document.getElementById('pht').textContent = Math.floor(game.p.h) + '/' + game.p.mh;
    document.getElementById('eht').textContent = Math.floor(game.eh) + '/' + game.en.h;
    document.getElementById('en').textContent = Math.floor(game.p.e);
    document.getElementById('gc').textContent = game.p.c;
}

function updateUI() {
    let el = (id) => document.getElementById(id);
    if (el('sw')) el('sw').textContent = game.p.w;
    if (el('sl')) el('sl').textContent = game.p.l;
    if (el('st')) el('st').textContent = game.p.t;
    if (el('sc')) el('sc').textContent = game.ch;
    if (el('slvl')) el('slvl').textContent = game.p.lvl;
    if (el('sxp')) el('sxp').textContent = game.p.xp;
    if (el('spw')) el('spw').textContent = game.p.pw;
    if (el('shp')) el('shp').textContent = game.p.mh;
    if (el('sen')) el('sen').textContent = game.p.me;
    if (el('scoin')) el('scoin').textContent = game.p.c;
    if (el('sdef')) el('sdef').textContent = game.p.def;
    if (el('spotion')) el('spotion').textContent = game.p.potion || 0;
    if (el('sc2')) el('sc2').textContent = game.p.c;
    if (el('menuLvl')) el('menuLvl').textContent = game.p.lvl;
    if (el('menuXp')) el('menuXp').textContent = game.p.xp + '/' + game.p.xn;
    if (el('menuCoin')) el('menuCoin').textContent = game.p.c;
    if (el('menuCh')) el('menuCh').textContent = game.ch;
    if (el('menuProgress')) {
        let pct = (game.p.xp / game.p.xn) * 100;
        el('menuProgress').style.width = Math.min(100, pct) + '%';
    }
}

function updateWeapons() {
    let container = document.getElementById('wl');
    if (!container) return;
    container.innerHTML = '';
    let sorted = Object.values(wpn).sort((a, b) => a.lvl - b.lvl);
    sorted.forEach(w => {
        let owned = game.p.wp.find(p => p.id === w.id);
        let eq = owned && owned.eq;
        let lock = w.lvl > game.p.lvl;
        let div = document.createElement('div');
        div.className = 'weapon-item' + (eq ? ' eq' : '') + (lock ? ' lock' : '');
        let act = '';
        if (lock) act = '🔒 ' + w.lvl + 'ур';
        else if (!owned) act = '<button onclick="buyWeapon(\'' + w.id + '\')">' + w.pr + '🪙</button>';
        else if (eq) act = '✅';
        else act = '<button onclick="equipWeapon(\'' + w.id + '\')">Экип</button>';
        div.innerHTML = '<div><span style="font-size:22px">' + w.ic + '</span> <b>' + w.n + '</b> <span style="font-size:11px;opacity:.6">(' + w.d + ')</span></div><div>' + act + '</div>';
        container.appendChild(div);
    });
}

function buyWeapon(id) {
    let w = wpn[id];
    if (game.p.c < w.pr) { alert('Нет монет!'); return; }
    if (game.p.wp.find(p => p.id === id)) { alert('Уже есть!'); return; }
    game.p.c -= w.pr;
    game.p.wp.push({ ...w, eq: false });
    save();
    updateWeapons();
    updateUI();
    addLog('🛒 ' + w.ic + ' ' + w.n);
}

function equipWeapon(id) {
    game.p.wp.forEach(w => w.eq = false);
    let w = game.p.wp.find(w => w.id === id);
    if (w) {
        w.eq = true;
        save();
        updateWeapons();
        addLog('🗡️ ' + w.ic + ' ' + w.n);
    }
}

function buy(type) {
    let costs = { power: 50, health: 40, energy: 30, potion: 25 };
    if (game.p.c < costs[type]) { alert('Нет монет!'); return; }
    game.p.c -= costs[type];
    if (type == 'power') {
        game.p.pw += 5;
        alert('💪 Сила +5 (' + game.p.pw + ')');
    } else if (type == 'health') {
        game.p.mh += 25;
        game.p.h = game.p.mh;
        alert('❤️ HP +25 (' + game.p.mh + ')');
    } else if (type == 'energy') {
        game.p.me += 15;
        game.p.e = game.p.me;
        alert('⚡ Энергия +15 (' + game.p.me + ')');
    } else if (type == 'potion') {
        game.p.potion = (game.p.potion || 0) + 1;
        alert('💊 Зелье +1 (' + game.p.potion + ')');
    }
    save();
    document.getElementById('sc2').textContent = game.p.c;
    updateUI();
}

// ===== ЕЖЕДНЕВНЫЙ БОНУС =====
function updateDailyUI() {
    let now = Date.now();
    let last = game.daily.lastClaim || 0;
    let diff = now - last;
    let hours = Math.floor((24 * 3600000 - diff) / 3600000);
    let minutes = Math.floor(((24 * 3600000 - diff) % 3600000) / 60000);
    document.getElementById('dailyDay').textContent = game.daily.day || 1;
    document.getElementById('dailyStreak').textContent = game.daily.streak || 0;
    let reward = 50 + (game.daily.streak || 0) * 10;
    document.getElementById('dailyReward').textContent = '🪙 ' + reward;
    if (diff < 24 * 3600000) {
        document.getElementById('dailyTimer').textContent = '⏳ Доступно через ' + hours + 'ч ' + minutes + 'м';
        document.getElementById('dailyBtn').disabled = true;
        document.getElementById('dailyBtn').textContent = '⏳ Ожидание';
    } else {
        document.getElementById('dailyTimer').textContent = '✅ Доступно сейчас!';
        document.getElementById('dailyBtn').disabled = false;
        document.getElementById('dailyBtn').textContent = '🎁 Забрать';
    }
}

function claimDaily() {
    let now = Date.now();
    let last = game.daily.lastClaim || 0;
    if (now - last < 24 * 3600000) { alert('⏳ Подожди 24 часа!'); return; }
    let reward = 50 + (game.daily.streak || 0) * 10;
    game.p.c += reward;
    game.daily.streak = (game.daily.streak || 0) + 1;
    game.daily.day = (game.daily.day || 1) + 1;
    game.daily.lastClaim = now;
    save();
    updateDailyUI();
    updateUI();
    addLog('🎁 Бонус: +' + reward + '🪙');
    alert('🎁 Получено ' + reward + ' монет!');
}

function save() {
    try {
        localStorage.setItem('gd', JSON.stringify({ p: game.p, ch: game.ch, daily: game.daily }));
    } catch(e) {}
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', function() {
    init();
    console.log('✅ Игра загружена! Стартовый уровень: 10');
    updateDailyUI();
});

// ===== АВТООБНОВЛЕНИЕ =====
setInterval(function() {
    try {
        updateUI();
        if (typeof updateDailyUI === 'function') updateDailyUI();
        save();
    } catch(e) {}
}, 10000);// ============================================
//  СИСТЕМА ЭКСПЕДИЦИЙ
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== ДАННЫЕ ЭКСПЕДИЦИЙ =====
const expeditions = {
    forest: {
        name: '🌲 Тёмный лес',
        duration: 30, // секунд
        reward: { coins: 50, exp: 30 },
        minLevel: 1
    },
    desert: {
        name: '🏜️ Горячая пустыня',
        duration: 60,
        reward: { coins: 120, exp: 80 },
        minLevel: 5
    },
    mountain: {
        name: '⛰️ Ледяные горы',
        duration: 120,
        reward: { coins: 300, exp: 200 },
        minLevel: 10
    },
    dungeon: {
        name: '🏚️ Древнее подземелье',
        duration: 300,
        reward: { coins: 800, exp: 500 },
        minLevel: 20
    },
    castle: {
        name: '🏰 Замок тьмы',
        duration: 600,
        reward: { coins: 2000, exp: 1200 },
        minLevel: 35
    },
    void: {
        name: '🌌 Бездна',
        duration: 1200,
        reward: { coins: 5000, exp: 3000 },
        minLevel: 50
    }
};

// ===== СОСТОЯНИЕ ЭКСПЕДИЦИЙ =====
if (!game.expedition) {
    game.expedition = {
        active: false,
        type: null,
        startTime: 0,
        endTime: 0,
        completed: false,
        rewardClaimed: false
    };
}

// ===== ФУНКЦИИ ЭКСПЕДИЦИЙ =====
function showExpeditions() {
    backToMenu();
    let expDiv = document.getElementById('expeditions');
    if (!expDiv) {
        let app = document.getElementById('app');
        let newDiv = document.createElement('div');
        newDiv.id = 'expeditions';
        newDiv.style.display = 'none';
        newDiv.innerHTML = `
            <h2>🗺️ Экспедиции</h2>
            <div id="expeditionStatus" style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;margin:10px 0;font-size:13px;">
                <div>📊 Статус: <span id="expStatus">Свободен</span></div>
                <div id="expTimer" style="color:#ffd93d;"></div>
                <div id="expReward" style="color:#51cf66;"></div>
            </div>
            <div id="expeditionList"></div>
            <button class="back" onclick="backToMenu()">🔙 Назад</button>
        `;
        app.appendChild(newDiv);
        expDiv = document.getElementById('expeditions');
    }
    expDiv.style.display = 'block';
    renderExpeditions();
    updateExpeditionUI();
}

function renderExpeditions() {
    let list = document.getElementById('expeditionList');
    list.innerHTML = '';
    
    Object.keys(expeditions).forEach(key => {
        let exp = expeditions[key];
        let isUnlocked = game.p.lvl >= exp.minLevel;
        let isActive = game.expedition.active && game.expedition.type === key;
        let isCompleted = game.expedition.completed && game.expedition.type === key;
        
        let div = document.createElement('div');
        div.className = 'daily-card';
        div.style.cssText = `
            opacity: ${isUnlocked ? 1 : 0.4};
            border-color: ${isActive ? '#ffd93d' : isCompleted ? '#51cf66' : '#6c5ce7'};
        `;
        
        let btnText = '🚀 Отправить';
        let btnAction = `startExpedition('${key}')`;
        let btnClass = 'g';
        
        if (!isUnlocked) {
            btnText = '🔒 ' + exp.minLevel + ' уровень';
            btnAction = '';
            btnClass = 'back';
        } else if (isActive) {
            btnText = '⏳ В процессе...';
            btnAction = '';
            btnClass = 'back';
            btnText = '⏳ Идёт...';
        } else if (isCompleted) {
            btnText = '🎁 Забрать награду';
            btnAction = `claimExpedition('${key}')`;
            btnClass = 'gold';
        }
        
        div.innerHTML = `
            <div style="font-size:20px;font-weight:bold;">${exp.name}</div>
            <div style="font-size:12px;opacity:0.7;">⏱️ ${exp.duration} сек | 🏆 ${exp.reward.coins}🪙 ${exp.reward.exp}⭐</div>
            <div style="font-size:11px;color:#a29bfe;">Требуется уровень: ${exp.minLevel}</div>
            ${isCompleted ? '<div style="color:#51cf66;">✅ Завершено!</div>' : ''}
            ${isActive ? '<div style="color:#ffd93d;">🔄 Выполняется...</div>' : ''}
            <button class="${btnClass}" onclick="${btnAction}" ${!isUnlocked || isActive ? 'disabled' : ''}>${btnText}</button>
        `;
        list.appendChild(div);
    });
}

function startExpedition(type) {
    let exp = expeditions[type];
    if (!exp) return;
    if (game.p.lvl < exp.minLevel) { alert('🔒 Нужен ' + exp.minLevel + ' уровень!'); return; }
    if (game.expedition.active) { alert('⏳ Экспедиция уже выполняется!'); return; }
    
    game.expedition.active = true;
    game.expedition.type = type;
    game.expedition.startTime = Date.now();
    game.expedition.endTime = Date.now() + exp.duration * 1000;
    game.expedition.completed = false;
    game.expedition.rewardClaimed = false;
    
    addLog('🗺️ Экспедиция в ' + exp.name + ' началась! (' + exp.duration + ' сек)');
    save();
    renderExpeditions();
    updateExpeditionUI();
    updateUI();
}

function claimExpedition(type) {
    let exp = expeditions[type];
    if (!exp) return;
    if (!game.expedition.completed) { alert('⏳ Экспедиция ещё не завершена!'); return; }
    if (game.expedition.rewardClaimed) { alert('🎁 Награда уже получена!'); return; }
    
    game.p.c += exp.reward.coins;
    addXP(exp.reward.exp);
    game.expedition.rewardClaimed = true;
    game.expedition.active = false;
    game.expedition.type = null;
    
    addLog('🎉 Экспедиция в ' + exp.name + ' завершена! +' + exp.reward.coins + '🪙 +' + exp.reward.exp + '⭐');
    save();
    renderExpeditions();
    updateExpeditionUI();
    updateUI();
    alert('🎁 Получено: ' + exp.reward.coins + '🪙 и ' + exp.reward.exp + '⭐');
}

function updateExpeditionUI() {
    let statusEl = document.getElementById('expStatus');
    let timerEl = document.getElementById('expTimer');
    let rewardEl = document.getElementById('expReward');
    
    if (!statusEl) return;
    
    if (game.expedition.active) {
        let now = Date.now();
        let remaining = Math.max(0, game.expedition.endTime - now);
        let seconds = Math.floor(remaining / 1000);
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        
        statusEl.textContent = '⏳ В экспедиции...';
        statusEl.style.color = '#ffd93d';
        timerEl.textContent = '⏱️ Осталось: ' + minutes + 'м ' + seconds + 'с';
        timerEl.style.color = '#ffd93d';
        rewardEl.textContent = '';
        
        // Проверка завершения
        if (remaining <= 0 && !game.expedition.completed) {
            game.expedition.completed = true;
            game.expedition.active = false;
            save();
            renderExpeditions();
            updateExpeditionUI();
            addLog('✅ Экспедиция завершена! Забери награду!');
            alert('✅ Экспедиция завершена! Зайди в экспедиции и забери награду!');
        }
    } else if (game.expedition.completed && !game.expedition.rewardClaimed) {
        statusEl.textContent = '🎁 Есть награда!';
        statusEl.style.color = '#51cf66';
        timerEl.textContent = '✅ Забери награду!';
        timerEl.style.color = '#51cf66';
        let exp = expeditions[game.expedition.type];
        if (exp) {
            rewardEl.textContent = '🏆 Награда: ' + exp.reward.coins + '🪙 + ' + exp.reward.exp + '⭐';
        }
    } else {
        statusEl.textContent = '✅ Свободен';
        statusEl.style.color = '#51cf66';
        timerEl.textContent = '📋 Выбери экспедицию ниже';
        timerEl.style.color = '#a29bfe';
        rewardEl.textContent = '';
    }
}

// ===== АВТООБНОВЛЕНИЕ ЭКСПЕДИЦИЙ =====
// Добавляем проверку экспедиций в существующий интервал
// Находим существующий setInterval и добавляем туда updateExpeditionUI

// ===== ДОБАВЛЯЕМ КНОПКУ В МЕНЮ =====
// Добавляем кнопку в меню через JS после загрузки
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем кнопку экспедиций в меню
    let menu = document.getElementById('menu');
    if (menu) {
        let btn = document.createElement('button');
        btn.className = 'p';
        btn.textContent = '🗺️ Экспедиции';
        btn.onclick = showExpeditions;
        // Вставляем перед последним элементом
        let lastBtn = menu.querySelector('.back');
        if (lastBtn) {
            menu.insertBefore(btn, lastBtn);
        } else {
            menu.appendChild(btn);
        }
    }
});

// ===== ОБНОВЛЕНИЕ ЭКСПЕДИЦИЙ В ИНТЕРВАЛЕ =====
// Добавляем в существующий интервал обновление экспедиций
// Для этого сохраняем старый интервал и создаём новый с добавлением
(function() {
    // Сохраняем ссылку на старый интервал если есть
    let oldInterval = window._gameInterval;
    if (oldInterval) {
        clearInterval(oldInterval);
    }
    
    // Создаём новый интервал с обновлением экспедиций
    window._gameInterval = setInterval(function() {
        try {
            updateUI();
            if (typeof updateDailyUI === 'function') updateDailyUI();
            if (typeof updateExpeditionUI === 'function') updateExpeditionUI();
            if (typeof checkAchievements === 'function') checkAchievements();
            save();
        } catch(e) {}
    }, 5000); // Каждые 5 секунд (быстрее для обновления таймера)
})();

console.log('🗺️ Система экспедиций загружена!');// ============================================
//  GAME PASS - 900 УРОВНЕЙ
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== ДАННЫЕ GAME PASS =====
if (!game.gamePass) {
    game.gamePass = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        premium: false,
        claimed: [],
        totalXp: 0
    };
}

// ===== НАГРАДЫ ЗА УРОВНИ =====
function getPassReward(level) {
    let rewards = [];
    
    // Базовые награды за каждый уровень
    let coins = 10 + level * 2;
    let exp = 5 + level;
    
    // Особые награды каждые 10 уровней
    if (level % 10 === 0) {
        coins = coins * 3;
        exp = exp * 3;
        rewards.push({ type: 'special', icon: '🌟', name: 'Бонусный уровень!' });
    }
    
    // Особые награды каждые 50 уровней
    if (level % 50 === 0) {
        rewards.push({ type: 'weapon', icon: '🗡️', name: 'Легендарное оружие' });
        coins = coins * 5;
    }
    
    // Особые награды каждые 100 уровней
    if (level % 100 === 0) {
        rewards.push({ type: 'skin', icon: '🎨', name: 'Эксклюзивный скин' });
        coins = coins * 10;
        exp = exp * 5;
    }
    
    // Особые награды каждые 300 уровней
    if (level % 300 === 0) {
        rewards.push({ type: 'pass', icon: '👑', name: 'Премиум доступ' });
        coins = coins * 20;
    }
    
    rewards.push({ type: 'coins', icon: '🪙', amount: coins });
    rewards.push({ type: 'exp', icon: '⭐', amount: exp });
    
    return rewards;
}

// ===== ФУНКЦИИ GAME PASS =====
function showGamePass() {
    backToMenu();
    let passDiv = document.getElementById('gamePass');
    if (!passDiv) {
        let app = document.getElementById('app');
        let newDiv = document.createElement('div');
        newDiv.id = 'gamePass';
        newDiv.style.display = 'none';
        newDiv.innerHTML = `
            <h2>🎖️ GAME PASS</h2>
            <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:10px;margin:10px 0;">
                <div style="display:flex;justify-content:space-between;font-size:14px;">
                    <span>🏆 Уровень: <span id="passLevel" style="color:#ffd93d;">1</span></span>
                    <span>⭐ Опыт: <span id="passXp" style="color:#ffd93d;">0</span>/<span id="passXpNext">100</span></span>
                </div>
                <div class="level-progress"><div class="fill" id="passProgress" style="width:0%"></div></div>
                <div style="font-size:12px;opacity:0.7;margin-top:5px;">
                    🪙 Всего опыта: <span id="passTotalXp" style="color:#ffd93d;">0</span>
                </div>
                <div style="font-size:12px;margin-top:5px;" id="passStatus">
                    ${game.gamePass.premium ? '🌟 Премиум активен' : '🔓 Купи премиум за 1000🪙'}
                </div>
                <button class="gold" onclick="buyPremiumPass()" id="premiumBtn">
                    ${game.gamePass.premium ? '✅ Премиум куплен' : '💎 Купить премиум (1000🪙)'}
                </button>
            </div>
            <div id="passRewardsList" style="max-height:400px;overflow-y:auto;"></div>
            <button class="back" onclick="backToMenu()">🔙 Назад</button>
        `;
        app.appendChild(newDiv);
        passDiv = document.getElementById('gamePass');
    }
    passDiv.style.display = 'block';
    updatePassUI();
}

function updatePassUI() {
    document.getElementById('passLevel').textContent = game.gamePass.level;
    document.getElementById('passXp').textContent = game.gamePass.xp;
    document.getElementById('passXpNext').textContent = game.gamePass.xpToNext;
    document.getElementById('passTotalXp').textContent = game.gamePass.totalXp || 0;
    
    let progress = (game.gamePass.xp / game.gamePass.xpToNext) * 100;
    document.getElementById('passProgress').style.width = Math.min(100, progress) + '%';
    
    let status = document.getElementById('passStatus');
    if (game.gamePass.premium) {
        status.innerHTML = '🌟 Премиум активен (+50% опыта!)';
        status.style.color = '#ffd93d';
    } else {
        status.innerHTML = '🔓 Купи премиум за 1000🪙 (+50% опыта)';
        status.style.color = '#a29bfe';
    }
    
    let btn = document.getElementById('premiumBtn');
    if (game.gamePass.premium) {
        btn.textContent = '✅ Премиум куплен';
        btn.disabled = true;
    } else {
        btn.textContent = '💎 Купить премиум (1000🪙)';
        btn.disabled = false;
    }
    
    renderPassRewards();
}

function renderPassRewards() {
    let container = document.getElementById('passRewardsList');
    container.innerHTML = '';
    
    let currentLevel = game.gamePass.level;
    let showLevels = Math.min(currentLevel + 10, 900);
    
    for (let i = 1; i <= showLevels; i++) {
        let rewards = getPassReward(i);
        let isUnlocked = i <= currentLevel;
        let isCurrent = i === currentLevel;
        let isNext = i === currentLevel + 1;
        
        let div = document.createElement('div');
        div.style.cssText = `
            background: ${isUnlocked ? 'rgba(0,184,148,0.1)' : isCurrent ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.03)'};
            border: ${isCurrent ? '2px solid #ffd93d' : isUnlocked ? '1px solid #00b894' : '1px solid transparent'};
            border-radius: 8px;
            padding: 8px 12px;
            margin: 4px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            opacity: ${isUnlocked || isCurrent ? 1 : 0.5};
        `;
        
        let rewardText = rewards.map(r => {
            if (r.type === 'coins') return r.icon + r.amount;
            if (r.type === 'exp') return r.icon + r.amount;
            return r.icon + ' ' + r.name;
        }).join(' | ');
        
        let statusText = '';
        if (isUnlocked) statusText = '✅';
        else if (isCurrent) statusText = '⬅️ ТЕКУЩИЙ';
        else statusText = '🔒';
        
        div.innerHTML = `
            <div>
                <span style="font-weight:bold;">${isCurrent ? '⭐' : ''} Уровень ${i}</span>
                <span style="font-size:11px;opacity:0.7;display:block;">${rewardText}</span>
            </div>
            <div>${statusText}</div>
        `;
        container.appendChild(div);
    }
    
    if (currentLevel < 900) {
        let more = document.createElement('div');
        more.style.cssText = 'text-align:center;padding:10px;opacity:0.5;font-size:12px;';
        more.textContent = `... и ещё ${900 - showLevels} уровней`;
        container.appendChild(more);
    }
}

function addPassXP(amount) {
    if (game.gamePass.premium) {
        amount = Math.floor(amount * 1.5); // +50% за премиум
    }
    
    game.gamePass.xp += amount;
    game.gamePass.totalXp = (game.gamePass.totalXp || 0) + amount;
    
    // Проверка повышения уровня
    while (game.gamePass.xp >= game.gamePass.xpToNext && game.gamePass.level < 900) {
        game.gamePass.xp -= game.gamePass.xpToNext;
        game.gamePass.level++;
        game.gamePass.xpToNext = Math.floor(game.gamePass.xpToNext * 1.15) + 50;
        
        // Получаем награду за уровень
        let rewards = getPassReward(game.gamePass.level);
        let rewardMsg = rewards.map(r => {
            if (r.type === 'coins') {
                game.p.c += r.amount;
                return r.amount + '🪙';
            }
            if (r.type === 'exp') {
                addXP(r.amount);
                return r.amount + '⭐';
            }
            if (r.type === 'special') return r.name;
            if (r.type === 'weapon') {
                // Даём случайное оружие
                let wpnKeys = Object.keys(wpn);
                let randomWpn = wpnKeys[Math.floor(Math.random() * wpnKeys.length)];
                if (!game.p.wp.find(p => p.id === randomWpn)) {
                    game.p.wp.push({ ...wpn[randomWpn], eq: false });
                    return r.icon + ' ' + r.name;
                }
                return r.icon + ' Дубликат (+100🪙)';
            }
            if (r.type === 'skin') {
                return r.icon + ' ' + r.name;
            }
            if (r.type === 'pass') {
                if (!game.gamePass.premium) {
                    game.gamePass.premium = true;
                    return '👑 Премиум получен!';
                }
                return '👑 +1000🪙';
            }
            return '';
        }).join(' + ');
        
        addLog('🎖️ GAME PASS: Уровень ' + game.gamePass.level + '! Награда: ' + rewardMsg);
        
        // Уведомление о награде
        if (game.gamePass.level % 10 === 0) {
            alert('🎖️ GAME PASS уровень ' + game.gamePass.level + '!\nНаграда: ' + rewardMsg);
        }
        
        save();
        updatePassUI();
        updateUI();
    }
    
    save();
    updatePassUI();
    updateUI();
}

function buyPremiumPass() {
    if (game.gamePass.premium) {
        alert('✅ Премиум уже активен!');
        return;
    }
    if (game.p.c < 1000) {
        alert('🔒 Нужно 1000 монет!');
        return;
    }
    game.p.c -= 1000;
    game.gamePass.premium = true;
    addLog('🌟 Куплен премиум Game Pass! +50% опыта');
    alert('🌟 Премиум Game Pass активирован! +50% опыта!');
    save();
    updatePassUI();
    updateUI();
}

function checkPassProgress() {
    // Проверяем не пропущены ли уровни
    while (game.gamePass.level < 900 && game.gamePass.xp >= game.gamePass.xpToNext) {
        game.gamePass.xp -= game.gamePass.xpToNext;
        game.gamePass.level++;
        game.gamePass.xpToNext = Math.floor(game.gamePass.xpToNext * 1.15) + 50;
        addLog('🎖️ GAME PASS: Авто-уровень ' + game.gamePass.level);
    }
    save();
}

// ===== ДОБАВЛЯЕМ ВЫДАЧУ XP ЗА БОССОВ =====
// Перехватываем функцию victory, чтобы добавлять XP в Game Pass
(function() {
    // Сохраняем оригинальную функцию victory
    let originalVictory = window.victory;
    
    // Переопределяем victory
    window.victory = function() {
        // Вызываем оригинальную функцию
        if (originalVictory) originalVictory();
        
        // Добавляем XP в Game Pass за убийство босса
        let xpGain = 10 + game.en.h * 0.05;
        if (game.en.b) {
            xpGain = xpGain * 2; // Двойной XP за босса
        }
        xpGain = Math.floor(xpGain);
        
        addPassXP(xpGain);
        addLog('🎖️ Game Pass +' + xpGain + ' XP');
        save();
        updatePassUI();
    };
})();

// ===== ДОБАВЛЯЕМ КНОПКУ В МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    let menu = document.getElementById('menu');
    if (menu) {
        // Проверяем, есть ли уже кнопка
        let existing = document.getElementById('gamePassBtn');
        if (!existing) {
            let btn = document.createElement('button');
            btn.id = 'gamePassBtn';
            btn.className = 'gold';
            btn.textContent = '🎖️ Game Pass';
            btn.onclick = showGamePass;
            
            // Вставляем перед кнопкой "Выбрать босса"
            let selectBtn = document.querySelector('[onclick="showChapterSelect()"]');
            if (selectBtn) {
                menu.insertBefore(btn, selectBtn);
            } else {
                menu.appendChild(btn);
            }
        }
    }
});

// ===== ЗАПУСК =====
console.log('🎖️ Game Pass загружен! (900 уровней)');
console.log('🏆 Убивай боссов, получай XP и прокачивай Game Pass!');// ============================================
//  КВЕСТЫ ДЛЯ GAME PASS
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== ДАННЫЕ КВЕСТОВ =====
if (!game.gamePassQuests) {
    game.gamePassQuests = {
        daily: [],
        weekly: [],
        completed: [],
        lastReset: Date.now()
    };
}

// ===== ГЕНЕРАЦИЯ КВЕСТОВ =====
function generateDailyQuests() {
    const dailyQuests = [
        { id: 'd1', name: 'Убить 5 боссов', target: 5, reward: 50, icon: '⚔️', type: 'kill' },
        { id: 'd2', name: 'Заработать 200 монет', target: 200, reward: 30, icon: '🪙', type: 'coins' },
        { id: 'd3', name: 'Провести 3 боя', target: 3, reward: 40, icon: '⚔️', type: 'battle' },
        { id: 'd4', name: 'Убить 1 босса', target: 1, reward: 25, icon: '👑', type: 'boss' },
        { id: 'd5', name: 'Получить 100 опыта', target: 100, reward: 35, icon: '⭐', type: 'exp' }
    ];
    return dailyQuests;
}

function generateWeeklyQuests() {
    const weeklyQuests = [
        { id: 'w1', name: 'Убить 50 боссов', target: 50, reward: 200, icon: '⚔️', type: 'kill' },
        { id: 'w2', name: 'Заработать 2000 монет', target: 2000, reward: 150, icon: '🪙', type: 'coins' },
        { id: 'w3', name: 'Провести 20 боёв', target: 20, reward: 180, icon: '⚔️', type: 'battle' },
        { id: 'w4', name: 'Убить 10 боссов', target: 10, reward: 120, icon: '👑', type: 'boss' },
        { id: 'w5', name: 'Получить 1000 опыта', target: 1000, reward: 160, icon: '⭐', type: 'exp' }
    ];
    return weeklyQuests;
}

// ===== ИНИЦИАЛИЗАЦИЯ КВЕСТОВ =====
function initQuests() {
    let now = Date.now();
    let dayDiff = Math.floor((now - (game.gamePassQuests.lastReset || 0)) / (24 * 3600000));
    
    // Сбрасываем ежедневные квесты раз в день
    if (dayDiff >= 1 || !game.gamePassQuests.daily || game.gamePassQuests.daily.length === 0) {
        game.gamePassQuests.daily = generateDailyQuests().map(q => ({
            ...q,
            progress: 0,
            done: false,
            claimed: false
        }));
        game.gamePassQuests.lastReset = now;
        addLog('📋 Ежедневные квесты обновлены!');
    }
    
    // Сбрасываем еженедельные квесты раз в неделю
    if (dayDiff >= 7 || !game.gamePassQuests.weekly || game.gamePassQuests.weekly.length === 0) {
        game.gamePassQuests.weekly = generateWeeklyQuests().map(q => ({
            ...q,
            progress: 0,
            done: false,
            claimed: false
        }));
        addLog('📋 Еженедельные квесты обновлены!');
    }
    
    if (!game.gamePassQuests.completed) {
        game.gamePassQuests.completed = [];
    }
    
    save();
}

// ===== ОБНОВЛЕНИЕ ПРОГРЕССА КВЕСТОВ =====
function updateQuestProgress(type, amount) {
    if (!game.gamePassQuests) return;
    
    // Обновляем ежедневные квесты
    if (game.gamePassQuests.daily) {
        game.gamePassQuests.daily.forEach(q => {
            if (!q.done && q.type === type) {
                q.progress = (q.progress || 0) + amount;
                if (q.progress >= q.target) {
                    q.done = true;
                    addLog('✅ Квест выполнен: ' + q.icon + ' ' + q.name + '!');
                }
            }
        });
    }
    
    // Обновляем еженедельные квесты
    if (game.gamePassQuests.weekly) {
        game.gamePassQuests.weekly.forEach(q => {
            if (!q.done && q.type === type) {
                q.progress = (q.progress || 0) + amount;
                if (q.progress >= q.target) {
                    q.done = true;
                    addLog('✅ Еженедельный квест выполнен: ' + q.icon + ' ' + q.name + '!');
                }
            }
        });
    }
    
    save();
    updateQuestsUI();
}

// ===== ПОЛУЧЕНИЕ НАГРАДЫ ЗА КВЕСТ =====
function claimQuestReward(questId, type) {
    let quests = type === 'daily' ? game.gamePassQuests.daily : game.gamePassQuests.weekly;
    let quest = quests.find(q => q.id === questId);
    
    if (!quest) return;
    if (!quest.done) { alert('Квест ещё не выполнен!'); return; }
    if (quest.claimed) { alert('Награда уже получена!'); return; }
    
    // Начисляем награду
    game.p.c += quest.reward;
    addPassXP(quest.reward);
    
    quest.claimed = true;
    game.gamePassQuests.completed.push(quest.id);
    
    addLog('🎁 Награда за квест: +' + quest.reward + '🪙 +' + quest.reward + ' XP');
    alert('🎁 Получено: ' + quest.reward + '🪙 и ' + quest.reward + ' XP');
    
    save();
    updateQuestsUI();
    updateUI();
}

// ===== ОТОБРАЖЕНИЕ КВЕСТОВ =====
function showQuests() {
    backToMenu();
    let questDiv = document.getElementById('questsPanel');
    if (!questDiv) {
        let app = document.getElementById('app');
        let newDiv = document.createElement('div');
        newDiv.id = 'questsPanel';
        newDiv.style.display = 'none';
        newDiv.innerHTML = `
            <h2>📋 Квесты Game Pass</h2>
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;margin:10px 0;font-size:13px;">
                <div style="display:flex;justify-content:space-between;">
                    <span>📅 Ежедневные: <span id="dailyCount">0</span>/5</span>
                    <span>📅 Еженедельные: <span id="weeklyCount">0</span>/5</span>
                </div>
                <div style="font-size:11px;opacity:0.7;margin-top:5px;">
                    🎁 Выполняй квесты и получай XP для Game Pass!
                </div>
            </div>
            <div id="questsList" style="max-height:400px;overflow-y:auto;"></div>
            <button class="back" onclick="backToMenu()">🔙 Назад</button>
        `;
        app.appendChild(newDiv);
        questDiv = document.getElementById('questsPanel');
    }
    questDiv.style.display = 'block';
    updateQuestsUI();
}

function updateQuestsUI() {
    let container = document.getElementById('questsList');
    if (!container) return;
    container.innerHTML = '';
    
    let dailyDone = 0;
    let weeklyDone = 0;
    
    // Ежедневные квесты
    if (game.gamePassQuests.daily) {
        let dailyTitle = document.createElement('div');
        dailyTitle.style.cssText = 'font-weight:bold;color:#ffd93d;margin:10px 0 5px 0;font-size:14px;';
        dailyTitle.textContent = '📅 Ежедневные квесты';
        container.appendChild(dailyTitle);
        
        game.gamePassQuests.daily.forEach(q => {
            dailyDone += q.done ? 1 : 0;
            container.appendChild(createQuestElement(q, 'daily'));
        });
    }
    
    // Еженедельные квесты
    if (game.gamePassQuests.weekly) {
        let weeklyTitle = document.createElement('div');
        weeklyTitle.style.cssText = 'font-weight:bold;color:#ffd93d;margin:15px 0 5px 0;font-size:14px;';
        weeklyTitle.textContent = '📅 Еженедельные квесты';
        container.appendChild(weeklyTitle);
        
        game.gamePassQuests.weekly.forEach(q => {
            weeklyDone += q.done ? 1 : 0;
            container.appendChild(createQuestElement(q, 'weekly'));
        });
    }
    
    document.getElementById('dailyCount').textContent = dailyDone;
    document.getElementById('weeklyCount').textContent = weeklyDone;
}

function createQuestElement(quest, type) {
    let div = document.createElement('div');
    let progress = Math.min(100, (quest.progress / quest.target) * 100);
    let isDone = quest.done;
    let isClaimed = quest.claimed;
    
    div.style.cssText = `
        background: ${isDone ? 'rgba(0,184,148,0.1)' : 'rgba(255,255,255,0.03)'};
        border: ${isDone ? '1px solid #00b894' : '1px solid transparent'};
        border-radius: 8px;
        padding: 10px;
        margin: 4px 0;
        opacity: ${isClaimed ? 0.5 : 1};
    `;
    
    let statusText = '';
    let btnHtml = '';
    
    if (isClaimed) {
        statusText = '✅ Получено';
    } else if (isDone) {
        statusText = '🎁 Готово к получению!';
        btnHtml = `<button class="gold" onclick="claimQuestReward('${quest.id}', '${type}')" style="margin-top:5px;padding:6px;font-size:12px;">🎁 Забрать</button>`;
    } else {
        statusText = `📊 ${quest.progress}/${quest.target}`;
    }
    
    div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
                <span style="font-size:16px;">${quest.icon}</span>
                <span style="font-weight:bold;">${quest.name}</span>
            </div>
            <div style="font-size:12px;color:${isDone ? '#51cf66' : '#ffd93d'};">${statusText}</div>
        </div>
        <div class="hp" style="margin:5px 0;">
            <div class="hpf" style="width:${progress}%;background:${isDone ? 'linear-gradient(90deg,#00b894,#00cec9)' : 'linear-gradient(90deg,#ffd93d,#f7971e)'};"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.7;">
            <span>🎁 Награда: ${quest.reward}🪙 + ${quest.reward} XP</span>
            ${btnHtml}
        </div>
    `;
    
    return div;
}

// ===== ОБНОВЛЕНИЕ КВЕСТОВ В ИНТЕРВАЛЕ =====
function checkQuestsReset() {
    let now = Date.now();
    let dayDiff = Math.floor((now - (game.gamePassQuests.lastReset || 0)) / (24 * 3600000));
    
    if (dayDiff >= 1) {
        game.gamePassQuests.daily = generateDailyQuests().map(q => ({
            ...q,
            progress: 0,
            done: false,
            claimed: false
        }));
        game.gamePassQuests.lastReset = now;
        addLog('📋 Ежедневные квесты обновлены!');
        save();
        updateQuestsUI();
    }
}

// ===== ДОБАВЛЯЕМ КНОПКУ КВЕСТОВ В МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    let menu = document.getElementById('menu');
    if (menu) {
        let existing = document.getElementById('questsBtn');
        if (!existing) {
            let btn = document.createElement('button');
            btn.id = 'questsBtn';
            btn.className = 'p';
            btn.textContent = '📋 Квесты';
            btn.onclick = showQuests;
            
            let passBtn = document.getElementById('gamePassBtn');
            if (passBtn) {
                menu.insertBefore(btn, passBtn);
            } else {
                menu.appendChild(btn);
            }
        }
    }
    
    // Инициализируем квесты
    initQuests();
});

// ===== ПЕРЕХВАТ СОБЫТИЙ ДЛЯ КВЕСТОВ =====
(function() {
    // Сохраняем оригинальную victory
    let origVictory = window.victory;
    window.victory = function() {
        if (origVictory) origVictory();
        
        // Обновляем квесты
        updateQuestProgress('kill', 1);
        if (game.en && game.en.b) {
            updateQuestProgress('boss', 1);
        }
        updateQuestProgress('battle', 1);
        updateQuestProgress('coins', game.en ? game.en.r : 0);
        updateQuestProgress('exp', game.en ? Math.floor(game.en.h * 0.05) : 0);
        
        checkQuestsReset();
    };
})();

console.log('📋 Система квестов Game Pass загружена!');
console.log('📅 Ежедневные и еженедельные квесты доступны!');// ===== СТАРТ С 10 УРОВНЯ (НОВЫЕ ИГРОКИ) =====
if (!localStorage.getItem('gd')) {
    game.p.lvl = 10;
    game.p.mh = 200;
    game.p.h = 200;
    game.p.me = 150;
    game.p.e = 150;
    game.p.pw = 25;
    game.p.def = 5;
    game.p.c = 500;
    game.p.xp = 0;
    game.p.xn = 250;
    game.p.giftClaimed = true;
    save();
    updateUI();
    console.log('🎉 Новый игрок получил 10 уровень!');// ============================================
//  ИВЕНТОВЫЕ БОССЫ НА 10 ДНЕЙ
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== ДАННЫЕ ИВЕНТОВЫХ БОССОВ =====
const eventBosses = {
    1: {
        name: '🔥 Огненный титан',
        hp: 50000,
        power: 80,
        defense: 20,
        reward: 1500,
        exp: 800,
        icon: '🔥',
        minLevel: 5,
        day: 1
    },
    2: {
        name: '❄️ Ледяной дракон',
        hp: 50000,
        power: 85,
        defense: 25,
        reward: 1600,
        exp: 850,
        icon: '❄️',
        minLevel: 5,
        day: 2
    },
    3: {
        name: '⚡ Громовой великан',
        hp: 100000,
        power: 120,
        defense: 35,
        reward: 2500,
        exp: 1500,
        icon: '⚡',
        minLevel: 10,
        day: 3
    },
    4: {
        name: '🌑 Теневой властелин',
        hp: 50000,
        power: 90,
        defense: 30,
        reward: 1700,
        exp: 900,
        icon: '🌑',
        minLevel: 5,
        day: 4
    },
    5: {
        name: '🌟 Космический страж',
        hp: 100000,
        power: 130,
        defense: 40,
        reward: 2600,
        exp: 1600,
        icon: '🌟',
        minLevel: 10,
        day: 5
    },
    6: {
        name: '💀 Повелитель смерти',
        hp: 50000,
        power: 95,
        defense: 35,
        reward: 1800,
        exp: 950,
        icon: '💀',
        minLevel: 5,
        day: 6
    },
    7: {
        name: '🐉 Древний дракон',
        hp: 100000,
        power: 140,
        defense: 45,
        reward: 2700,
        exp: 1700,
        icon: '🐉',
        minLevel: 10,
        day: 7
    },
    8: {
        name: '👿 Князь тьмы',
        hp: 50000,
        power: 100,
        defense: 40,
        reward: 1900,
        exp: 1000,
        icon: '👿',
        minLevel: 5,
        day: 8
    },
    9: {
        name: '⚔️ Бог войны',
        hp: 100000,
        power: 150,
        defense: 50,
        reward: 3000,
        exp: 2000,
        icon: '⚔️',
        minLevel: 10,
        day: 9
    },
    10: {
        name: '👑 Император тьмы',
        hp: 100000,
        power: 160,
        defense: 55,
        reward: 3500,
        exp: 2500,
        icon: '👑',
        minLevel: 10,
        day: 10
    }
};

// ===== ИВЕНТОВОЕ ОРУЖИЕ =====
const eventWeapons = {
    1: { id: 'ew1', name: '🔥 Пламенный клинок', damage: 45, icon: '🔥', day: 1 },
    2: { id: 'ew2', name: '❄️ Ледяной меч', damage: 48, icon: '❄️', day: 2 },
    3: { id: 'ew3', name: '⚡ Громовой топор', damage: 55, icon: '⚡', day: 3 },
    4: { id: 'ew4', name: '🌑 Теневой кинжал', damage: 50, icon: '🌑', day: 4 },
    5: { id: 'ew5', name: '🌟 Космический посох', damage: 60, icon: '🌟', day: 5 },
    6: { id: 'ew6', name: '💀 Кость смерти', damage: 52, icon: '💀', day: 6 },
    7: { id: 'ew7', name: '🐉 Драконий клинок', damage: 65, icon: '🐉', day: 7 },
    8: { id: 'ew8', name: '👿 Тёмный клинок', damage: 55, icon: '👿', day: 8 },
    9: { id: 'ew9', name: '⚔️ Божественный меч', damage: 70, icon: '⚔️', day: 9 },
    10: { id: 'ew10', name: '👑 Императорский клинок', damage: 80, icon: '👑', day: 10 }
};

// ===== СОСТОЯНИЕ ИВЕНТА =====
if (!game.eventBossSystem) {
    game.eventBossSystem = {
        currentDay: 1,
        defeated: {},
        weaponsCollected: [],
        lastCheck: Date.now()
    };
}

// ===== ФУНКЦИИ ИВЕНТА =====
function getCurrentEventDay() {
    let now = new Date();
    let startDate = new Date(2024, 0, 1); // Начало отсчёта
    let diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    let day = (diffDays % 10) + 1;
    return day;
}

function getCurrentEventBoss() {
    let day = getCurrentEventDay();
    return eventBosses[day];
}

function getEventWeapon(day) {
    return eventWeapons[day];
}

function showEventBosses() {
    backToMenu();
    let eventDiv = document.getElementById('eventBosses');
    if (!eventDiv) {
        let app = document.getElementById('app');
        let newDiv = document.createElement('div');
        newDiv.id = 'eventBosses';
        newDiv.style.display = 'none';
        newDiv.innerHTML = `
            <h2>🌟 ИВЕНТОВЫЕ БОССЫ</h2>
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;margin:10px 0;font-size:13px;">
                <div style="display:flex;justify-content:space-between;">
                    <span>📅 День: <span id="eventDay" style="color:#ffd93d;">1</span>/10</span>
                    <span>🏆 Побеждено: <span id="eventDefeated" style="color:#51cf66;">0</span>/10</span>
                </div>
                <div style="font-size:11px;opacity:0.7;margin-top:5px;">
                    🎯 Каждый день новый босс! Побеждай и получай ивентовое оружие!
                </div>
            </div>
            <div id="eventBossList"></div>
            <button class="back" onclick="backToMenu()">🔙 Назад</button>
        `;
        app.appendChild(newDiv);
        eventDiv = document.getElementById('eventBosses');
    }
    eventDiv.style.display = 'block';
    renderEventBosses();
}

function renderEventBosses() {
    let container = document.getElementById('eventBossList');
    container.innerHTML = '';
    
    let currentDay = getCurrentEventDay();
    document.getElementById('eventDay').textContent = currentDay;
    
    let defeatedCount = Object.keys(game.eventBossSystem.defeated).length;
    document.getElementById('eventDefeated').textContent = defeatedCount;
    
    Object.keys(eventBosses).forEach(key => {
        let boss = eventBosses[key];
        let day = parseInt(key);
        let isDefeated = game.eventBossSystem.defeated[day] || false;
        let isAvailable = day <= currentDay;
        let isCurrent = day === currentDay;
        let weapon = getEventWeapon(day);
        let weaponCollected = game.eventBossSystem.weaponsCollected.includes(day);
        
        let div = document.createElement('div');
        div.style.cssText = `
            background: ${isDefeated ? 'rgba(0,184,148,0.1)' : isCurrent ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.03)'};
            border: ${isCurrent ? '2px solid #ffd93d' : isDefeated ? '1px solid #00b894' : '1px solid transparent'};
            border-radius: 10px;
            padding: 12px;
            margin: 6px 0;
            opacity: ${isAvailable ? 1 : 0.4};
        `;
        
        let statusText = '';
        let btnHtml = '';
        
        if (isDefeated) {
            statusText = '✅ Побеждён!';
            if (!weaponCollected && weapon) {
                btnHtml = `<button class="gold" onclick="claimEventWeapon(${day})" style="margin-top:5px;padding:6px;font-size:12px;">🎁 Забрать оружие</button>`;
            } else if (weaponCollected) {
                statusText += ' 🗡️ Оружие получено!';
            }
        } else if (isCurrent && isAvailable) {
            if (game.p.lvl >= boss.minLevel) {
                statusText = '⚔️ Доступен!';
                btnHtml = `<button class="g" onclick="startEventBoss(${day})" style="margin-top:5px;padding:6px;font-size:12px;">⚔️ Сразиться</button>`;
            } else {
                statusText = '🔒 Нужен ' + boss.minLevel + ' уровень';
            }
        } else if (isAvailable) {
            statusText = '📅 Будет позже...';
        } else {
            statusText = '🔒 Заблокирован';
        }
        
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="font-size:24px;">${boss.icon}</span>
                    <span style="font-weight:bold;">${boss.name}</span>
                    <span style="font-size:11px;opacity:0.7;display:block;">
                        ❤️ ${boss.hp} | 💪 ${boss.power} | 🛡️ ${boss.defense}
                    </span>
                </div>
                <div style="font-size:12px;color:${isDefeated ? '#51cf66' : isCurrent ? '#ffd93d' : '#666'};">
                    ${statusText}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.7;margin-top:5px;">
                <span>🎁 ${boss.reward}🪙 ${boss.exp}⭐</span>
                <span>${weapon ? '🗡️ ' + weapon.name : ''}</span>
                ${btnHtml}
            </div>
        `;
        container.appendChild(div);
    });
}

function startEventBoss(day) {
    let boss = eventBosses[day];
    if (!boss) return;
    if (game.p.lvl < boss.minLevel) {
        alert('🔒 Нужен ' + boss.minLevel + ' уровень!');
        return;
    }
    if (game.eventBossSystem.defeated[day]) {
        alert('✅ Этот босс уже побеждён!');
        return;
    }
    
    // Создаём босса
    let eventEnemy = {
        n: '🌟 ' + boss.name + ' (ИВЕНТ)',
        h: boss.hp,
        pw: boss.power,
        d: boss.defense,
        r: boss.reward,
        exp: boss.exp,
        b: true,
        ic: boss.icon,
        isEvent: true,
        day: day
    };
    
    game.en = eventEnemy;
    game.eh = eventEnemy.h;
    game.fg = true;
    game.p.h = game.p.mh;
    game.p.e = game.p.me;
    game.isEventBoss = true;

    document.getElementById('ch').textContent = 'ИВЕНТ ' + day;
    document.getElementById('lvl').textContent = game.p.lvl;
    document.getElementById('gc').textContent = game.p.c;
    document.getElementById('bossEmoji').textContent = boss.icon;
    document.getElementById('enemyName').textContent = '🌟 ' + boss.name + ' (ИВЕНТ)';
    document.getElementById('log').innerHTML = '';
    addLog('🌟 ИВЕНТ: Бой с ' + boss.icon + ' ' + boss.name + '!');
    addLog('💪 Сила: ' + boss.power + ' | 🛡️ Защита: ' + boss.defense);
    addLog('📅 День ' + day + ' из 10');
    
    backToMenu();
    document.getElementById('game').style.display = 'block';
    updateHealth();

    document.getElementById('ctrl').innerHTML = `
        <button class="g" onclick="attackEventBoss()">🗡️ Атака</button>
        <button class="r" onclick="defendEventBoss()">🛡️ Защита</button>
    `;
}

function attackEventBoss() {
    if (!game.fg) return;
    let w = getWeapon();
    let dmg = (w.d + Math.floor(game.p.pw * 0.6)) * 1.2;
    dmg = Math.floor(dmg * (0.75 + Math.random() * 0.5));
    dmg = Math.max(1, dmg - Math.floor(game.en.d * 0.2));
    if (Math.random() < 0.15) {
        dmg = Math.floor(dmg * 1.8);
        addLog('💥 КРИТ!');
    }
    game.eh = Math.max(0, game.eh - dmg);
    game.p.e = Math.max(0, game.p.e - 8);

    addLog('🎯 ' + w.ic + ' ' + w.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.eh <= 0) { eventBossVictory(); return; }
    setTimeout(enemyTurnEventBoss, 500);
}

function enemyTurnEventBoss() {
    if (!game.fg) return;
    let dmg = Math.floor(game.en.pw * (0.5 + Math.random() * 0.6));
    dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.3));
    if (Math.random() < 0.2) {
        dmg = Math.floor(dmg * 1.5);
        addLog('💢 Босс использует суперудар!');
    }
    game.p.h = Math.max(0, game.p.h - dmg);

    addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.p.h <= 0) { eventBossDefeat(); return; }
    game.p.e = Math.min(game.p.me, game.p.e + 5);
    updateHealth();
    addLog('🔄 Ваш ход!');
}

function defendEventBoss() {
    if (!game.fg) return;
    let heal = Math.floor(15 + Math.random() * 20);
    if (game.p.potion > 0) {
        heal += 20;
        game.p.potion--;
        addLog('💊 Использовано зелье!');
    }
    game.p.h = Math.min(game.p.mh, game.p.h + heal);
    addLog('🛡️ Защита +' + heal + ' HP');
    updateHealth();
    setTimeout(() => {
        let dmg = Math.floor(game.en.pw * 0.25);
        dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.2));
        game.p.h = Math.max(0, game.p.h - dmg);
        addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона (ослаб)');
        updateHealth();
        if (game.p.h <= 0) { eventBossDefeat(); } else { addLog('🔄 Ваш ход!'); }
    }, 500);
}

function eventBossVictory() {
    game.fg = false;
    let day = game.en.day;
    let boss = eventBosses[day];
    
    game.p.w++;
    game.p.t++;
    game.p.c += boss.reward;
    let xp = boss.exp;
    addXP(xp);
    
    game.eventBossSystem.defeated[day] = true;
    
    addLog('🎉 ИВЕНТ: ' + boss.icon + ' ' + boss.name + ' побеждён! +' + boss.reward + '🪙 +' + xp + '⭐');
    addLog('🗡️ Получено ивентовое оружие: ' + eventWeapons[day].name);
    
    save();
    updateUI();
    
    setTimeout(() => {
        document.getElementById('ctrl').innerHTML = `
            <button class="gold" onclick="showEventBosses()" style="grid-column:span 2;">🌟 Вернуться к ивентам</button>
            <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
        `;
    }, 800);
}

function eventBossDefeat() {
    game.fg = false;
    game.p.l++;
    game.p.t++;
    addLog('💀 Поражение от ивентового босса...');
    save();
    setTimeout(() => {
        document.getElementById('ctrl').innerHTML = `
            <button class="r" onclick="startEventBoss(${game.en.day})" style="grid-column:span 2;">🔄 Попробовать снова</button>
            <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
        `;
    }, 800);
}

function claimEventWeapon(day) {
    if (game.eventBossSystem.weaponsCollected.includes(day)) {
        alert('✅ Оружие уже получено!');
        return;
    }
    if (!game.eventBossSystem.defeated[day]) {
        alert('🔒 Сначала победи босса!');
        return;
    }
    
    let weapon = eventWeapons[day];
    if (!weapon) return;
    
    // Добавляем оружие игроку
    let newWeapon = {
        id: weapon.id,
        n: weapon.name,
        d: weapon.damage,
        pr: 0,
        ic: weapon.icon,
        lvl: game.p.lvl,
        isEvent: true
    };
    
    game.p.wp.push({ ...newWeapon, eq: false });
    game.eventBossSystem.weaponsCollected.push(day);
    
    addLog('🗡️ Получено ивентовое оружие: ' + weapon.icon + ' ' + weapon.name + ' (+' + weapon.damage + ' урона)');
    alert('🗡️ Получено ивентовое оружие:\n' + weapon.icon + ' ' + weapon.name + '\nУрон: ' + weapon.damage);
    
    save();
    updateUI();
    renderEventBosses();
}

// ===== ДОБАВЛЯЕМ КНОПКУ В МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    let menu = document.getElementById('menu');
    if (menu) {
        let existing = document.getElementById('eventBossBtn');
        if (!existing) {
            let btn = document.createElement('button');
            btn.id = 'eventBossBtn';
            btn.className = 'event-btn';
            btn.textContent = '🌟 Ивент-боссы';
            btn.onclick = showEventBosses;
            
            let passBtn = document.getElementById('gamePassBtn');
            if (passBtn) {
                menu.insertBefore(btn, passBtn);
            } else {
                menu.appendChild(btn);
            }
        }
    }
});

console.log('🌟 Система ивентовых боссов на 10 дней загружена!');
console.log('📅 Каждый день новый босс!');
console.log('🗡️ Побеждай и получай ивентовое оружие!');
}// ============================================
//  ИВЕНТОВЫЕ БОССЫ НА 10 ДНЕЙ
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== ДАННЫЕ ИВЕНТОВЫХ БОССОВ =====
const eventBosses = {
    1: {
        name: '🔥 Огненный титан',
        hp: 50000,
        power: 80,
        defense: 20,
        reward: 1500,
        exp: 800,
        icon: '🔥',
        minLevel: 5,
        day: 1
    },
    2: {
        name: '❄️ Ледяной дракон',
        hp: 50000,
        power: 85,
        defense: 25,
        reward: 1600,
        exp: 850,
        icon: '❄️',
        minLevel: 5,
        day: 2
    },
    3: {
        name: '⚡ Громовой великан',
        hp: 100000,
        power: 120,
        defense: 35,
        reward: 2500,
        exp: 1500,
        icon: '⚡',
        minLevel: 10,
        day: 3
    },
    4: {
        name: '🌑 Теневой властелин',
        hp: 50000,
        power: 90,
        defense: 30,
        reward: 1700,
        exp: 900,
        icon: '🌑',
        minLevel: 5,
        day: 4
    },
    5: {
        name: '🌟 Космический страж',
        hp: 100000,
        power: 130,
        defense: 40,
        reward: 2600,
        exp: 1600,
        icon: '🌟',
        minLevel: 10,
        day: 5
    },
    6: {
        name: '💀 Повелитель смерти',
        hp: 50000,
        power: 95,
        defense: 35,
        reward: 1800,
        exp: 950,
        icon: '💀',
        minLevel: 5,
        day: 6
    },
    7: {
        name: '🐉 Древний дракон',
        hp: 100000,
        power: 140,
        defense: 45,
        reward: 2700,
        exp: 1700,
        icon: '🐉',
        minLevel: 10,
        day: 7
    },
    8: {
        name: '👿 Князь тьмы',
        hp: 50000,
        power: 100,
        defense: 40,
        reward: 1900,
        exp: 1000,
        icon: '👿',
        minLevel: 5,
        day: 8
    },
    9: {
        name: '⚔️ Бог войны',
        hp: 100000,
        power: 150,
        defense: 50,
        reward: 3000,
        exp: 2000,
        icon: '⚔️',
        minLevel: 10,
        day: 9
    },
    10: {
        name: '👑 Император тьмы',
        hp: 100000,
        power: 160,
        defense: 55,
        reward: 3500,
        exp: 2500,
        icon: '👑',
        minLevel: 10,
        day: 10
    }
};

// ===== ИВЕНТОВОЕ ОРУЖИЕ =====
const eventWeapons = {
    1: { id: 'ew1', name: '🔥 Пламенный клинок', damage: 45, icon: '🔥', day: 1 },
    2: { id: 'ew2', name: '❄️ Ледяной меч', damage: 48, icon: '❄️', day: 2 },
    3: { id: 'ew3', name: '⚡ Громовой топор', damage: 55, icon: '⚡', day: 3 },
    4: { id: 'ew4', name: '🌑 Теневой кинжал', damage: 50, icon: '🌑', day: 4 },
    5: { id: 'ew5', name: '🌟 Космический посох', damage: 60, icon: '🌟', day: 5 },
    6: { id: 'ew6', name: '💀 Кость смерти', damage: 52, icon: '💀', day: 6 },
    7: { id: 'ew7', name: '🐉 Драконий клинок', damage: 65, icon: '🐉', day: 7 },
    8: { id: 'ew8', name: '👿 Тёмный клинок', damage: 55, icon: '👿', day: 8 },
    9: { id: 'ew9', name: '⚔️ Божественный меч', damage: 70, icon: '⚔️', day: 9 },
    10: { id: 'ew10', name: '👑 Императорский клинок', damage: 80, icon: '👑', day: 10 }
};

// ===== СОСТОЯНИЕ ИВЕНТА =====
if (!game.eventBossSystem) {
    game.eventBossSystem = {
        currentDay: 1,
        defeated: {},
        weaponsCollected: [],
        lastCheck: Date.now()
    };
}

// ===== ФУНКЦИИ ИВЕНТА =====
function getCurrentEventDay() {
    let now = new Date();
    let startDate = new Date(2024, 0, 1); // Начало отсчёта
    let diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    let day = (diffDays % 10) + 1;
    return day;
}

function getCurrentEventBoss() {
    let day = getCurrentEventDay();
    return eventBosses[day];
}

function getEventWeapon(day) {
    return eventWeapons[day];
}

function showEventBosses() {
    backToMenu();
    let eventDiv = document.getElementById('eventBosses');
    if (!eventDiv) {
        let app = document.getElementById('app');
        let newDiv = document.createElement('div');
        newDiv.id = 'eventBosses';
        newDiv.style.display = 'none';
        newDiv.innerHTML = `
            <h2>🌟 ИВЕНТОВЫЕ БОССЫ</h2>
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;margin:10px 0;font-size:13px;">
                <div style="display:flex;justify-content:space-between;">
                    <span>📅 День: <span id="eventDay" style="color:#ffd93d;">1</span>/10</span>
                    <span>🏆 Побеждено: <span id="eventDefeated" style="color:#51cf66;">0</span>/10</span>
                </div>
                <div style="font-size:11px;opacity:0.7;margin-top:5px;">
                    🎯 Каждый день новый босс! Побеждай и получай ивентовое оружие!
                </div>
            </div>
            <div id="eventBossList"></div>
            <button class="back" onclick="backToMenu()">🔙 Назад</button>
        `;
        app.appendChild(newDiv);
        eventDiv = document.getElementById('eventBosses');
    }
    eventDiv.style.display = 'block';
    renderEventBosses();
}

function renderEventBosses() {
    let container = document.getElementById('eventBossList');
    container.innerHTML = '';
    
    let currentDay = getCurrentEventDay();
    document.getElementById('eventDay').textContent = currentDay;
    
    let defeatedCount = Object.keys(game.eventBossSystem.defeated).length;
    document.getElementById('eventDefeated').textContent = defeatedCount;
    
    Object.keys(eventBosses).forEach(key => {
        let boss = eventBosses[key];
        let day = parseInt(key);
        let isDefeated = game.eventBossSystem.defeated[day] || false;
        let isAvailable = day <= currentDay;
        let isCurrent = day === currentDay;
        let weapon = getEventWeapon(day);
        let weaponCollected = game.eventBossSystem.weaponsCollected.includes(day);
        
        let div = document.createElement('div');
        div.style.cssText = `
            background: ${isDefeated ? 'rgba(0,184,148,0.1)' : isCurrent ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.03)'};
            border: ${isCurrent ? '2px solid #ffd93d' : isDefeated ? '1px solid #00b894' : '1px solid transparent'};
            border-radius: 10px;
            padding: 12px;
            margin: 6px 0;
            opacity: ${isAvailable ? 1 : 0.4};
        `;
        
        let statusText = '';
        let btnHtml = '';
        
        if (isDefeated) {
            statusText = '✅ Побеждён!';
            if (!weaponCollected && weapon) {
                btnHtml = `<button class="gold" onclick="claimEventWeapon(${day})" style="margin-top:5px;padding:6px;font-size:12px;">🎁 Забрать оружие</button>`;
            } else if (weaponCollected) {
                statusText += ' 🗡️ Оружие получено!';
            }
        } else if (isCurrent && isAvailable) {
            if (game.p.lvl >= boss.minLevel) {
                statusText = '⚔️ Доступен!';
                btnHtml = `<button class="g" onclick="startEventBoss(${day})" style="margin-top:5px;padding:6px;font-size:12px;">⚔️ Сразиться</button>`;
            } else {
                statusText = '🔒 Нужен ' + boss.minLevel + ' уровень';
            }
        } else if (isAvailable) {
            statusText = '📅 Будет позже...';
        } else {
            statusText = '🔒 Заблокирован';
        }
        
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="font-size:24px;">${boss.icon}</span>
                    <span style="font-weight:bold;">${boss.name}</span>
                    <span style="font-size:11px;opacity:0.7;display:block;">
                        ❤️ ${boss.hp} | 💪 ${boss.power} | 🛡️ ${boss.defense}
                    </span>
                </div>
                <div style="font-size:12px;color:${isDefeated ? '#51cf66' : isCurrent ? '#ffd93d' : '#666'};">
                    ${statusText}
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.7;margin-top:5px;">
                <span>🎁 ${boss.reward}🪙 ${boss.exp}⭐</span>
                <span>${weapon ? '🗡️ ' + weapon.name : ''}</span>
                ${btnHtml}
            </div>
        `;
        container.appendChild(div);
    });
}

function startEventBoss(day) {
    let boss = eventBosses[day];
    if (!boss) return;
    if (game.p.lvl < boss.minLevel) {
        alert('🔒 Нужен ' + boss.minLevel + ' уровень!');
        return;
    }
    if (game.eventBossSystem.defeated[day]) {
        alert('✅ Этот босс уже побеждён!');
        return;
    }
    
    // Создаём босса
    let eventEnemy = {
        n: '🌟 ' + boss.name + ' (ИВЕНТ)',
        h: boss.hp,
        pw: boss.power,
        d: boss.defense,
        r: boss.reward,
        exp: boss.exp,
        b: true,
        ic: boss.icon,
        isEvent: true,
        day: day
    };
    
    game.en = eventEnemy;
    game.eh = eventEnemy.h;
    game.fg = true;
    game.p.h = game.p.mh;
    game.p.e = game.p.me;
    game.isEventBoss = true;

    document.getElementById('ch').textContent = 'ИВЕНТ ' + day;
    document.getElementById('lvl').textContent = game.p.lvl;
    document.getElementById('gc').textContent = game.p.c;
    document.getElementById('bossEmoji').textContent = boss.icon;
    document.getElementById('enemyName').textContent = '🌟 ' + boss.name + ' (ИВЕНТ)';
    document.getElementById('log').innerHTML = '';
    addLog('🌟 ИВЕНТ: Бой с ' + boss.icon + ' ' + boss.name + '!');
    addLog('💪 Сила: ' + boss.power + ' | 🛡️ Защита: ' + boss.defense);
    addLog('📅 День ' + day + ' из 10');
    
    backToMenu();
    document.getElementById('game').style.display = 'block';
    updateHealth();

    document.getElementById('ctrl').innerHTML = `
        <button class="g" onclick="attackEventBoss()">🗡️ Атака</button>
        <button class="r" onclick="defendEventBoss()">🛡️ Защита</button>
    `;
}

function attackEventBoss() {
    if (!game.fg) return;
    let w = getWeapon();
    let dmg = (w.d + Math.floor(game.p.pw * 0.6)) * 1.2;
    dmg = Math.floor(dmg * (0.75 + Math.random() * 0.5));
    dmg = Math.max(1, dmg - Math.floor(game.en.d * 0.2));
    if (Math.random() < 0.15) {
        dmg = Math.floor(dmg * 1.8);
        addLog('💥 КРИТ!');
    }
    game.eh = Math.max(0, game.eh - dmg);
    game.p.e = Math.max(0, game.p.e - 8);

    addLog('🎯 ' + w.ic + ' ' + w.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.eh <= 0) { eventBossVictory(); return; }
    setTimeout(enemyTurnEventBoss, 500);
}

function enemyTurnEventBoss() {
    if (!game.fg) return;
    let dmg = Math.floor(game.en.pw * (0.5 + Math.random() * 0.6));
    dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.3));
    if (Math.random() < 0.2) {
        dmg = Math.floor(dmg * 1.5);
        addLog('💢 Босс использует суперудар!');
    }
    game.p.h = Math.max(0, game.p.h - dmg);

    addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.p.h <= 0) { eventBossDefeat(); return; }
    game.p.e = Math.min(game.p.me, game.p.e + 5);
    updateHealth();
    addLog('🔄 Ваш ход!');
}

function defendEventBoss() {
    if (!game.fg) return;
    let heal = Math.floor(15 + Math.random() * 20);
    if (game.p.potion > 0) {
        heal += 20;
        game.p.potion--;
        addLog('💊 Использовано зелье!');
    }
    game.p.h = Math.min(game.p.mh, game.p.h + heal);
    addLog('🛡️ Защита +' + heal + ' HP');
    updateHealth();
    setTimeout(() => {
        let dmg = Math.floor(game.en.pw * 0.25);
        dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.2));
        game.p.h = Math.max(0, game.p.h - dmg);
        addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона (ослаб)');
        updateHealth();
        if (game.p.h <= 0) { eventBossDefeat(); } else { addLog('🔄 Ваш ход!'); }
    }, 500);
}

function eventBossVictory() {
    game.fg = false;
    let day = game.en.day;
    let boss = eventBosses[day];
    
    game.p.w++;
    game.p.t++;
    game.p.c += boss.reward;
    let xp = boss.exp;
    addXP(xp);
    
    game.eventBossSystem.defeated[day] = true;
    
    addLog('🎉 ИВЕНТ: ' + boss.icon + ' ' + boss.name + ' побеждён! +' + boss.reward + '🪙 +' + xp + '⭐');
    addLog('🗡️ Получено ивентовое оружие: ' + eventWeapons[day].name);
    
    save();
    updateUI();
    
    setTimeout(() => {
        document.getElementById('ctrl').innerHTML = `
            <button class="gold" onclick="showEventBosses()" style="grid-column:span 2;">🌟 Вернуться к ивентам</button>
            <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
        `;
    }, 800);
}

function eventBossDefeat() {
    game.fg = false;
    game.p.l++;
    game.p.t++;
    addLog('💀 Поражение от ивентового босса...');
    save();
    setTimeout(() => {
        document.getElementById('ctrl').innerHTML = `
            <button class="r" onclick="startEventBoss(${game.en.day})" style="grid-column:span 2;">🔄 Попробовать снова</button>
            <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
        `;
    }, 800);
}

function claimEventWeapon(day) {
    if (game.eventBossSystem.weaponsCollected.includes(day)) {
        alert('✅ Оружие уже получено!');
        return;
    }
    if (!game.eventBossSystem.defeated[day]) {
        alert('🔒 Сначала победи босса!');
        return;
    }
    
    let weapon = eventWeapons[day];
    if (!weapon) return;
    
    // Добавляем оружие игроку
    let newWeapon = {
        id: weapon.id,
        n: weapon.name,
        d: weapon.damage,
        pr: 0,
        ic: weapon.icon,
        lvl: game.p.lvl,
        isEvent: true
    };
    
    game.p.wp.push({ ...newWeapon, eq: false });
    game.eventBossSystem.weaponsCollected.push(day);
    
    addLog('🗡️ Получено ивентовое оружие: ' + weapon.icon + ' ' + weapon.name + ' (+' + weapon.damage + ' урона)');
    alert('🗡️ Получено ивентовое оружие:\n' + weapon.icon + ' ' + weapon.name + '\nУрон: ' + weapon.damage);
    
    save();
    updateUI();
    renderEventBosses();
}

// ===== ДОБАВЛЯЕМ КНОПКУ В МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    let menu = document.getElementById('menu');
    if (menu) {
        let existing = document.getElementById('eventBossBtn');
        if (!existing) {
            let btn = document.createElement('button');
            btn.id = 'eventBossBtn';
            btn.className = 'event-btn';
            btn.textContent = '🌟 Ивент-боссы';
            btn.onclick = showEventBosses;
            
            let passBtn = document.getElementById('gamePassBtn');
            if (passBtn) {
                menu.insertBefore(btn, passBtn);
            } else {
                menu.appendChild(btn);
            }
        }
    }
});

console.log('🌟 Система ивентовых боссов на 10 дней загружена!');
console.log('📅 Каждый день новый босс!');
console.log('🗡️ Побеждай и получай ивентовое оружие!');// ============================================
//  ИВЕНТОВЫЕ БОССЫ - 20 ДНЕЙ (3 БОССА В ДЕНЬ)
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== 20 ДНЕЙ × 3 БОССА (60 БОССОВ) =====
const eventBosses20 = {};

// Генерация боссов
const bossNames = [
    ['🔥 Огненный голем', '💧 Водяной дух', '🌪️ Ветреный титан'],
    ['⚡ Громовой зверь', '❄️ Ледяной великан', '🌑 Теневой волк'],
    ['☀️ Солнечный рыцарь', '🌙 Лунный страж', '⭐ Звёздный дракон'],
    ['🐉 Древний дракон', '🦁 Царь зверей', '🦅 Небесный орёл'],
    ['🌀 Космический змей', '🌋 Вулканический гигант', '🌊 Океанский властелин'],
    ['⚔️ Воин света', '🛡️ Страж тьмы', '🗡️ Клинок судьбы'],
    ['👑 Король демонов', '🧙 Архимаг', '🧛 Владыка вампиров'],
    ['🐺 Вождь волков', '🐻 Медвежий король', '🦊 Лисьий дух'],
    ['🌳 Древесный страж', '🗿 Каменный голем', '🪨 Земляной титан'],
    ['☄️ Метеоритный дракон', '🌌 Звёздный странник', '🪐 Планетарный страж'],
    ['💀 Костяной король', '🦴 Скелетный воин', '👻 Призрачный лорд'],
    ['🔥 Феникс', '❄️ Ледяной дракон', '⚡ Молниеносный зверь'],
    ['🌙 Лунный волк', '☀️ Солнечный орёл', '⭐ Звёздный тигр'],
    ['🌊 Водный дракон', '🌋 Огненный титан', '🌪️ Ветреный страж'],
    ['🛡️ Святой паладин', '⚔️ Тёмный рыцарь', '🗡️ Клинок правосудия'],
    ['👾 Космический захватчик', '🚀 Звёздный десантник', '🌌 Вселенский страж'],
    ['🧟 Король зомби', '🧛 Ночной вампир', '👹 Демонический лорд'],
    ['🐲 Император драконов', '🦄 Единорог-воин', '🐉 Дракон тьмы'],
    ['⚡ Бог грома', '🌊 Бог моря', '🔥 Бог огня'],
    ['👑 Император вселенной', '⭐ Космический бог', '♾️ Бесконечный страж']
];

const bossIcons = [
    ['🔥','💧','🌪️'],
    ['⚡','❄️','🌑'],
    ['☀️','🌙','⭐'],
    ['🐉','🦁','🦅'],
    ['🌀','🌋','🌊'],
    ['⚔️','🛡️','🗡️'],
    ['👑','🧙','🧛'],
    ['🐺','🐻','🦊'],
    ['🌳','🗿','🪨'],
    ['☄️','🌌','🪐'],
    ['💀','🦴','👻'],
    ['🔥','❄️','⚡'],
    ['🌙','☀️','⭐'],
    ['🌊','🌋','🌪️'],
    ['🛡️','⚔️','🗡️'],
    ['👾','🚀','🌌'],
    ['🧟','🧛','👹'],
    ['🐲','🦄','🐉'],
    ['⚡','🌊','🔥'],
    ['👑','⭐','♾️']
];

// Создаём боссов
for (let day = 1; day <= 20; day++) {
    let dayIndex = day - 1;
    let dayBosses = [];
    
    // Определяем HP в зависимости от дня
    let baseHP = 20000 + day * 2000;
    let basePower = 40 + day * 3;
    let baseDefense = 10 + Math.floor(day / 2);
    let baseReward = 500 + day * 50;
    let baseExp = 300 + day * 30;
    let minLevel = Math.max(1, Math.floor(day / 2));
    
    for (let b = 0; b < 3; b++) {
        let bossNum = b + 1;
        let hp = baseHP + b * 5000;
        let power = basePower + b * 5;
        let defense = baseDefense + b * 2;
        let reward = baseReward + b * 100;
        let exp = baseExp + b * 50;
        let minLvl = minLevel + b;
        
        let key = day + '_' + bossNum;
        eventBosses20[key] = {
            name: bossNames[dayIndex][b] || 'Босс ' + day + '-' + bossNum,
            hp: hp,
            power: power,
            defense: defense,
            reward: reward,
            exp: exp,
            icon: bossIcons[dayIndex][b] || '👾',
            day: day,
            bossNum: bossNum,
            minLevel: minLvl
        };
    }
}

// ===== ИВЕНТОВОЕ ОРУЖИЕ (20 ШТУК) =====
const eventWeapons20 = {};
const weaponNames = [
    '🔥 Пламенный клинок', '💧 Водяной меч', '🌪️ Ветреный кинжал',
    '⚡ Громовой топор', '❄️ Ледяной посох', '🌑 Теневой клинок',
    '☀️ Солнечный меч', '🌙 Лунный кинжал', '⭐ Звёздный посох',
    '🐉 Драконий клинок', '🦁 Коготь зверя', '🦅 Крыло орла',
    '🌀 Космический клинок', '🌋 Вулканический меч', '🌊 Трезубец океана',
    '⚔️ Клинок света', '🛡️ Щит тьмы', '🗡️ Клинок судьбы',
    '👑 Императорский меч', '⭐ Звёздный клинок'
];

for (let i = 0; i < 20; i++) {
    let day = i + 1;
    let damage = 30 + i * 3;
    let icon = bossIcons[i] ? bossIcons[i][0] : '⭐';
    eventWeapons20[day] = {
        id: 'ew20_' + day,
        name: weaponNames[i] || 'Оружие ' + day,
        damage: damage,
        icon: icon,
        day: day
    };
}

// ===== СОСТОЯНИЕ ИВЕНТА =====
if (!game.eventBossSystem20) {
    game.eventBossSystem20 = {
        defeated: {},
        weaponsCollected: [],
        lastCheck: Date.now()
    };
}

// ===== ФУНКЦИИ =====
function getCurrentEventDay20() {
    let now = new Date();
    let startDate = new Date(2024, 0, 1);
    let diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    let day = (diffDays % 20) + 1;
    return day;
}

function getBossesForDay(day) {
    let result = [];
    for (let b = 1; b <= 3; b++) {
        let key = day + '_' + b;
        if (eventBosses20[key]) {
            result.push(eventBosses20[key]);
        }
    }
    return result;
}

function showEventBosses20() {
    backToMenu();
    let eventDiv = document.getElementById('eventBosses20');
    if (!eventDiv) {
        let app = document.getElementById('app');
        let newDiv = document.createElement('div');
        newDiv.id = 'eventBosses20';
        newDiv.style.display = 'none';
        newDiv.innerHTML = `
            <h2>🌟 ИВЕНТ - 20 ДНЕЙ</h2>
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;margin:10px 0;font-size:13px;">
                <div style="display:flex;justify-content:space-between;">
                    <span>📅 День: <span id="eventDay20" style="color:#ffd93d;">1</span>/20</span>
                    <span>🏆 Побеждено: <span id="eventDefeated20" style="color:#51cf66;">0</span>/60</span>
                </div>
                <div style="font-size:11px;opacity:0.7;margin-top:5px;">
                    ⚔️ 3 босса каждый день! Побеждай и получай ивентовое оружие!
                </div>
            </div>
            <div id="eventBossList20"></div>
            <button class="back" onclick="backToMenu()">🔙 Назад</button>
        `;
        app.appendChild(newDiv);
        eventDiv = document.getElementById('eventBosses20');
    }
    eventDiv.style.display = 'block';
    renderEventBosses20();
}

function renderEventBosses20() {
    let container = document.getElementById('eventBossList20');
    container.innerHTML = '';
    
    let currentDay = getCurrentEventDay20();
    document.getElementById('eventDay20').textContent = currentDay;
    
    let defeatedCount = Object.keys(game.eventBossSystem20.defeated).length;
    document.getElementById('eventDefeated20').textContent = defeatedCount;
    
    // Показываем только текущий день + прошлые дни
    for (let day = 1; day <= currentDay; day++) {
        let bosses = getBossesForDay(day);
        if (bosses.length === 0) continue;
        
        // Заголовок дня
        let dayTitle = document.createElement('div');
        dayTitle.style.cssText = `
            font-weight: bold;
            color: ${day === currentDay ? '#ffd93d' : '#a29bfe'};
            margin: 10px 0 5px 0;
            font-size: 14px;
            background: rgba(255,255,255,0.03);
            padding: 5px 10px;
            border-radius: 6px;
        `;
        dayTitle.textContent = `📅 День ${day} ${day === currentDay ? '(СЕГОДНЯ)' : ''}`;
        container.appendChild(dayTitle);
        
        // Боссы дня
        bosses.forEach(boss => {
            let key = day + '_' + boss.bossNum;
            let isDefeated = game.eventBossSystem20.defeated[key] || false;
            let isAvailable = day <= currentDay;
            let weapon = eventWeapons20[day];
            let weaponCollected = game.eventBossSystem20.weaponsCollected.includes(day);
            let isCurrent = day === currentDay;
            
            let div = document.createElement('div');
            div.style.cssText = `
                background: ${isDefeated ? 'rgba(0,184,148,0.1)' : isCurrent ? 'rgba(255,217,61,0.15)' : 'rgba(255,255,255,0.03)'};
                border: ${isCurrent ? '2px solid #ffd93d' : isDefeated ? '1px solid #00b894' : '1px solid transparent'};
                border-radius: 8px;
                padding: 10px 12px;
                margin: 4px 0;
                opacity: ${isAvailable ? 1 : 0.4};
            `;
            
            let statusText = '';
            let btnHtml = '';
            
            if (isDefeated) {
                statusText = '✅ Побеждён!';
                if (!weaponCollected && weapon && day === currentDay) {
                    btnHtml = `<button class="gold" onclick="claimEventWeapon20(${day})" style="margin-top:4px;padding:4px 10px;font-size:11px;">🎁 Забрать оружие</button>`;
                } else if (weaponCollected) {
                    statusText += ' 🗡️';
                }
            } else if (isAvailable) {
                if (game.p.lvl >= boss.minLevel) {
                    statusText = '⚔️ Доступен!';
                    btnHtml = `<button class="g" onclick="startEventBoss20('${key}')" style="margin-top:4px;padding:4px 10px;font-size:11px;">⚔️ Сразиться</button>`;
                } else {
                    statusText = '🔒 ' + boss.minLevel + ' ур.';
                }
            } else {
                statusText = '🔒 Заблокирован';
            }
            
            div.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span style="font-size:20px;">${boss.icon}</span>
                        <span style="font-weight:bold;font-size:13px;">${boss.name}</span>
                        <span style="font-size:10px;opacity:0.6;display:block;">
                            ❤️ ${boss.hp} | 💪 ${boss.power} | 🛡️ ${boss.defense}
                        </span>
                    </div>
                    <div style="font-size:11px;text-align:right;">
                        <div style="color:${isDefeated ? '#51cf66' : isCurrent ? '#ffd93d' : '#666'};">${statusText}</div>
                        <div style="font-size:10px;opacity:0.6;">🎁 ${boss.reward}🪙 ${boss.exp}⭐</div>
                        ${btnHtml}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }
}

function startEventBoss20(key) {
    let boss = eventBosses20[key];
    if (!boss) return;
    if (game.p.lvl < boss.minLevel) {
        alert('🔒 Нужен ' + boss.minLevel + ' уровень!');
        return;
    }
    if (game.eventBossSystem20.defeated[key]) {
        alert('✅ Этот босс уже побеждён!');
        return;
    }
    
    let eventEnemy = {
        n: '🌟 ' + boss.name + ' (ИВЕНТ)',
        h: boss.hp,
        pw: boss.power,
        d: boss.defense,
        r: boss.reward,
        exp: boss.exp,
        b: true,
        ic: boss.icon,
        isEvent: true,
        day: boss.day,
        bossKey: key
    };
    
    game.en = eventEnemy;
    game.eh = eventEnemy.h;
    game.fg = true;
    game.p.h = game.p.mh;
    game.p.e = game.p.me;
    game.isEventBoss = true;

    document.getElementById('ch').textContent = 'ИВЕНТ ' + boss.day + '-' + boss.bossNum;
    document.getElementById('lvl').textContent = game.p.lvl;
    document.getElementById('gc').textContent = game.p.c;
    document.getElementById('bossEmoji').textContent = boss.icon;
    document.getElementById('enemyName').textContent = '🌟 ' + boss.name + ' (ИВЕНТ)';
    document.getElementById('log').innerHTML = '';
    addLog('🌟 ИВЕНТ: Бой с ' + boss.icon + ' ' + boss.name + '!');
    addLog('💪 Сила: ' + boss.power + ' | 🛡️ Защита: ' + boss.defense);
    addLog('📅 День ' + boss.day + ' | Босс ' + boss.bossNum + '/3');
    
    backToMenu();
    document.getElementById('game').style.display = 'block';
    updateHealth();

    document.getElementById('ctrl').innerHTML = `
        <button class="g" onclick="attackEventBoss20()">🗡️ Атака</button>
        <button class="r" onclick="defendEventBoss20()">🛡️ Защита</button>
    `;
}

function attackEventBoss20() {
    if (!game.fg) return;
    let w = getWeapon();
    let dmg = (w.d + Math.floor(game.p.pw * 0.6)) * 1.2;
    dmg = Math.floor(dmg * (0.75 + Math.random() * 0.5));
    dmg = Math.max(1, dmg - Math.floor(game.en.d * 0.2));
    if (Math.random() < 0.15) {
        dmg = Math.floor(dmg * 1.8);
        addLog('💥 КРИТ!');
    }
    game.eh = Math.max(0, game.eh - dmg);
    game.p.e = Math.max(0, game.p.e - 8);

    addLog('🎯 ' + w.ic + ' ' + w.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.eh <= 0) { eventBossVictory20(); return; }
    setTimeout(enemyTurnEventBoss20, 500);
}

function enemyTurnEventBoss20() {
    if (!game.fg) return;
    let dmg = Math.floor(game.en.pw * (0.5 + Math.random() * 0.6));
    dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.3));
    if (Math.random() < 0.2) {
        dmg = Math.floor(dmg * 1.5);
        addLog('💢 Босс использует суперудар!');
    }
    game.p.h = Math.max(0, game.p.h - dmg);

    addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона');
    updateHealth();
    if (game.p.h <= 0) { eventBossDefeat20(); return; }
    game.p.e = Math.min(game.p.me, game.p.e + 5);
    updateHealth();
    addLog('🔄 Ваш ход!');
}

function defendEventBoss20() {
    if (!game.fg) return;
    let heal = Math.floor(15 + Math.random() * 20);
    if (game.p.potion > 0) {
        heal += 20;
        game.p.potion--;
        addLog('💊 Использовано зелье!');
    }
    game.p.h = Math.min(game.p.mh, game.p.h + heal);
    addLog('🛡️ Защита +' + heal + ' HP');
    updateHealth();
    setTimeout(() => {
        let dmg = Math.floor(game.en.pw * 0.25);
        dmg = Math.max(1, dmg - Math.floor(game.p.def * 0.2));
        game.p.h = Math.max(0, game.p.h - dmg);
        addLog('💢 ' + game.en.ic + ' ' + game.en.n + ' → ' + dmg + ' урона (ослаб)');
        updateHealth();
        if (game.p.h <= 0) { eventBossDefeat20(); } else { addLog('🔄 Ваш ход!'); }
    }, 500);
}

function eventBossVictory20() {
    game.fg = false;
    let key = game.en.bossKey;
    let boss = eventBosses20[key];
    let day = game.en.day;
    
    game.p.w++;
    game.p.t++;
    game.p.c += boss.reward;
    let xp = boss.exp;
    addXP(xp);
    
    game.eventBossSystem20.defeated[key] = true;
    
    addLog('🎉 ИВЕНТ: ' + boss.icon + ' ' + boss.name + ' побеждён! +' + boss.reward + '🪙 +' + xp + '⭐');
    
    // Проверяем, убиты ли все 3 босса дня
    let dayBosses = getBossesForDay(day);
    let allDefeated = dayBosses.every(b => game.eventBossSystem20.defeated[day + '_' + b.bossNum]);
    
    if (allDefeated && !game.eventBossSystem20.weaponsCollected.includes(day)) {
        let weapon = eventWeapons20[day];
        if (weapon) {
            addLog('🗡️ Все боссы дня побеждены! Получено оружие: ' + weapon.icon + ' ' + weapon.name);
            alert('🎉 Все 3 босса дня побеждены!\n🗡️ Получено оружие: ' + weapon.icon + ' ' + weapon.name + ' (+' + weapon.damage + ' урона)');
            claimEventWeapon20(day);
        }
    }
    
    save();
    updateUI();
    
    setTimeout(() => {
        document.getElementById('ctrl').innerHTML = `
            <button class="gold" onclick="showEventBosses20()" style="grid-column:span 2;">🌟 Вернуться к ивентам</button>
            <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
        `;
    }, 800);
}

function eventBossDefeat20() {
    game.fg = false;
    game.p.l++;
    game.p.t++;
    addLog('💀 Поражение от ивентового босса...');
    save();
    setTimeout(() => {
        document.getElementById('ctrl').innerHTML = `
            <button class="r" onclick="startEventBoss20('${game.en.bossKey}')" style="grid-column:span 2;">🔄 Попробовать снова</button>
            <button class="back" onclick="backToMenu()" style="grid-column:span 2;">🔙 В меню</button>
        `;
    }, 800);
}

function claimEventWeapon20(day) {
    if (game.eventBossSystem20.weaponsCollected.includes(day)) {
        return;
    }
    
    let weapon = eventWeapons20[day];
    if (!weapon) return;
    
    let newWeapon = {
        id: weapon.id,
        n: weapon.name,
        d: weapon.damage,
        pr: 0,
        ic: weapon.icon,
        lvl: game.p.lvl,
        isEvent: true
    };
    
    game.p.wp.push({ ...newWeapon, eq: false });
    game.eventBossSystem20.weaponsCollected.push(day);
    
    addLog('🗡️ Получено ивентовое оружие: ' + weapon.icon + ' ' + weapon.name);
    save();
    updateUI();
}

// ===== ДОБАВЛЯЕМ КНОПКУ В МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    let menu = document.getElementById('menu');
    if (menu) {
        let existing = document.getElementById('eventBossBtn20');
        if (!existing) {
            let btn = document.createElement('button');
            btn.id = 'eventBossBtn20';
            btn.className = 'event-btn';
            btn.textContent = '🌟 Ивент 20 дней';
            btn.onclick = showEventBosses20;
            
            let passBtn = document.getElementById('gamePassBtn');
            if (passBtn) {
                menu.insertBefore(btn, passBtn);
            } else {
                menu.appendChild(btn);
            }
        }
    }
});

console.log('🌟 Ивент на 20 дней загружен!');
console.log('⚔️ 3 босса каждый день (всего 60 боссов)!');
console.log('🗡️ 20 видов ивентового оружия!');
// ============================================
//  СИСТЕМА ПРОВЕРКИ ОБНОВЛЕНИЙ - ЧАСТЬ 1
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== ВЕРСИЯ ИГРЫ =====
const GAME_VERSION = '2.5.0';
const UPDATE_DATE = '26.07.2026';

// ===== ФУНКЦИЯ ПРОВЕРКИ ОБНОВЛЕНИЙ =====
function checkForUpdates() {
    let currentVersion = localStorage.getItem('gameVersion') || '1.0.0';
    let latestVersion = GAME_VERSION;
    
    if (currentVersion !== latestVersion) {
        // Есть обновление
        let updateMsg = '🔄 ДОСТУПНО ОБНОВЛЕНИЕ!\n\n';
        updateMsg += '📌 Текущая версия: ' + currentVersion + '\n';
        updateMsg += '📌 Новая версия: ' + latestVersion + '\n';
        updateMsg += '📅 Дата: ' + UPDATE_DATE + '\n\n';
        updateMsg += '✅ Что нового:\n';
        updateMsg += '• Ивент на 20 дней (60 боссов)\n';
        updateMsg += '• 20 видов ивентового оружия\n';
        updateMsg += '• Game Pass 900 уровней\n';
        updateMsg += '• Экспедиции\n';
        updateMsg += '• Система квестов\n';
        updateMsg += '• Подарок на 10 уровне\n\n';
        updateMsg += '🔄 Обнови страницу (Ctrl+F5)';
        
        alert(updateMsg);
        localStorage.setItem('gameVersion', latestVersion);
    } else {
        alert('✅ Игра обновлена до последней версии ' + latestVersion + '!\n📅 ' + UPDATE_DATE);
    }
}

// ===== ДОБАВЛЯЕМ КНОПКУ В МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    let menu = document.getElementById('menu');
    if (menu) {
        let existing = document.getElementById('updateBtn');
        if (!existing) {
            let btn = document.createElement('button');
            btn.id = 'updateBtn';
            btn.className = 'gold';
            btn.textContent = '🔄 Проверить обновление';
            btn.onclick = checkForUpdates;
            btn.style.cssText = 'background: linear-gradient(45deg, #00b894, #00cec9); color: #fff; animation: glow 2s infinite;';
            
            let stats = menu.querySelector('.player-stats');
            if (stats) {
                stats.after(btn);
            } else {
                menu.appendChild(btn);
            }
        }
    }
});

// ===== ПРИ ЗАГРУЗКЕ ПРОВЕРЯЕМ ОБНОВЛЕНИЕ =====
(function() {
    let savedVersion = localStorage.getItem('gameVersion');
    if (!savedVersion) {
        localStorage.setItem('gameVersion', GAME_VERSION);
        console.log('✅ Игра установлена, версия: ' + GAME_VERSION);
    } else if (savedVersion !== GAME_VERSION) {
        console.log('🔄 Доступно обновление! ' + savedVersion + ' → ' + GAME_VERSION);
        let lastNotify = localStorage.getItem('lastUpdateNotify') || 0;
        if (Date.now() - lastNotify > 3600000) {
            setTimeout(() => {
                alert('🔄 Доступно обновление игры!\nНажмите "Проверить обновление" в меню.');
            }, 2000);
            localStorage.setItem('lastUpdateNotify', Date.now());
        }
    } else {
        console.log('✅ Игра обновлена, версия: ' + GAME_VERSION);
    }
})();

console.log('🔄 Система обновлений загружена! Версия: ' + GAME_VERSION);
console.log('📅 Дата обновления: ' + UPDATE_DATE);
// ============================================
//  МАГАЗИН ИВЕНТОВОГО ОРУЖИЯ
//  ВСТАВЬ В КОНЕЦ ФАЙЛА game.js
// ============================================

// ===== ДАННЫЕ МАГАЗИНА =====
const eventShopWeapons = {
    1: { id: 'es1', name: '🔥 Пламенный клинок', damage: 45, price: 500, icon: '🔥', day: 1 },
    2: { id: 'es2', name: '💧 Водяной меч', damage: 48, price: 800, icon: '💧', day: 2 },
    3: { id: 'es3', name: '🌪️ Ветреный кинжал', damage: 50, price: 1000, icon: '🌪️', day: 3 },
    4: { id: 'es4', name: '⚡ Громовой топор', damage: 55, price: 1200, icon: '⚡', day: 4 },
    5: { id: 'es5', name: '❄️ Ледяной посох', damage: 58, price: 1500, icon: '❄️', day: 5 },
    6: { id: 'es6', name: '🌑 Теневой клинок', damage: 60, price: 1800, icon: '🌑', day: 6 },
    7: { id: 'es7', name: '☀️ Солнечный меч', damage: 65, price: 2000, icon: '☀️', day: 7 },
    8: { id: 'es8', name: '🌙 Лунный кинжал', damage: 68, price: 2200, icon: '🌙', day: 8 },
    9: { id: 'es9', name: '⭐ Звёздный посох', damage: 72, price: 2500, icon: '⭐', day: 9 },
    10: { id: 'es10', name: '🐉 Драконий клинок', damage: 78, price: 2800, icon: '🐉', day: 10 },
    11: { id: 'es11', name: '🦁 Коготь зверя', damage: 80, price: 3000, icon: '🦁', day: 11 },
    12: { id: 'es12', name: '🦅 Крыло орла', damage: 85, price: 3200, icon: '🦅', day: 12 },
    13: { id: 'es13', name: '🌀 Космический клинок', damage: 88, price: 3500, icon: '🌀', day: 13 },
    14: { id: 'es14', name: '🌋 Вулканический меч', damage: 92, price: 3800, icon: '🌋', day: 14 },
    15: { id: 'es15', name: '🌊 Трезубец океана', damage: 95, price: 4000, icon: '🌊', day: 15 },
    16: { id: 'es16', name: '⚔️ Клинок света', damage: 100, price: 4200, icon: '⚔️', day: 16 },
    17: { id: 'es17', name: '🛡️ Щит тьмы', damage: 105, price: 4500, icon: '🛡️', day: 17 },
    18: { id: 'es18', name: '🗡️ Клинок судьбы', damage: 110, price: 4700, icon: '🗡️', day: 18 },
    19: { id: 'es19', name: '👑 Императорский меч', damage: 120, price: 4900, icon: '👑', day: 19 },
    20: { id: 'es20', name: '⭐ Звёздный клинок', damage: 130, price: 5000, icon: '⭐', day: 20 }
};

// ===== СОСТОЯНИЕ МАГАЗИНА =====
if (!game.eventShop) {
    game.eventShop = {
        purchased: [],
        available: true
    };
}

// ===== ПРОВЕРКА ИВЕНТА =====
function isEventActive() {
    // Ивент активен всегда (цикл 20 дней)
    return true;
}

function getEventDay() {
    let now = new Date();
    let startDate = new Date(2024, 0, 1);
    let diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    return (diffDays % 20) + 1;
}

// ===== ФУНКЦИЯ МАГАЗИНА =====
function showEventShop() {
    backToMenu();
    let shopDiv = document.getElementById('eventShop');
    if (!shopDiv) {
        let app = document.getElementById('app');
        let newDiv = document.createElement('div');
        newDiv.id = 'eventShop';
        newDiv.style.display = 'none';
        newDiv.innerHTML = `
            <h2>🏪 ИВЕНТОВЫЙ МАГАЗИН</h2>
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;margin:10px 0;font-size:13px;">
                <div style="display:flex;justify-content:space-between;">
                    <span>📅 День: <span id="shopEventDay" style="color:#ffd93d;">1</span>/20</span>
                    <span>🪙 Монет: <span id="shopCoins" style="color:#ffd93d;">0</span></span>
                </div>
                <div style="font-size:11px;opacity:0.7;margin-top:5px;">
                    ⚠️ Оружие исчезнет после окончания ивента!
                </div>
            </div>
            <div id="eventShopList"></div>
            <button class="back" onclick="backToMenu()">🔙 Назад</button>
        `;
        app.appendChild(newDiv);
        shopDiv = document.getElementById('eventShop');
    }
    shopDiv.style.display = 'block';
    renderEventShop();
}

function renderEventShop() {
    let container = document.getElementById('eventShopList');
    container.innerHTML = '';
    
    let currentDay = getEventDay();
    document.getElementById('shopEventDay').textContent = currentDay;
    document.getElementById('shopCoins').textContent = game.p.c;
    
    Object.keys(eventShopWeapons).forEach(key => {
        let weapon = eventShopWeapons[key];
        let isPurchased = game.eventShop.purchased.includes(weapon.id);
        let isAvailable = weapon.day <= currentDay;
        let canAfford = game.p.c >= weapon.price;
        
        let div = document.createElement('div');
        div.style.cssText = `
            background: ${isPurchased ? 'rgba(0,184,148,0.1)' : 'rgba(255,255,255,0.03)'};
            border: ${isPurchased ? '1px solid #00b894' : '1px solid transparent'};
            border-radius: 8px;
            padding: 10px 12px;
            margin: 4px 0;
            opacity: ${isAvailable ? 1 : 0.4};
        `;
        
        let statusText = '';
        let btnHtml = '';
        
        if (isPurchased) {
            statusText = '✅ Куплено';
        } else if (!isAvailable) {
            statusText = '🔒 День ' + weapon.day;
        } else if (canAfford) {
            statusText = '🪙 ' + weapon.price;
            btnHtml = `<button class="gold" onclick="buyEventWeapon(${key})" style="margin-top:4px;padding:4px 10px;font-size:11px;">Купить</button>`;
        } else {
            statusText = '💰 Нет монет';
        }
        
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="font-size:20px;">${weapon.icon}</span>
                    <span style="font-weight:bold;font-size:13px;">${weapon.name}</span>
                    <span style="font-size:10px;opacity:0.6;display:block;">
                        ⚔️ Урон: ${weapon.damage} | 📅 День ${weapon.day}
                    </span>
                </div>
                <div style="font-size:12px;text-align:right;">
                    <div style="color:${isPurchased ? '#51cf66' : canAfford ? '#ffd93d' : '#666'};">${statusText}</div>
                    ${btnHtml}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// ===== ПОКУПКА ОРУЖИЯ =====
function buyEventWeapon(key) {
    let weapon = eventShopWeapons[key];
    if (!weapon) return;
    
    if (game.eventShop.purchased.includes(weapon.id)) {
        alert('✅ Это оружие уже куплено!');
        return;
    }
    
    let currentDay = getEventDay();
    if (weapon.day > currentDay) {
        alert('🔒 Это оружие откроется на ' + weapon.day + ' день!');
        return;
    }
    
    if (game.p.c < weapon.price) {
        alert('💰 Недостаточно монет! Нужно ' + weapon.price + '🪙');
        return;
    }
    
    // Покупка
    game.p.c -= weapon.price;
    game.eventShop.purchased.push(weapon.id);
    
    // Добавляем оружие игроку
    let newWeapon = {
        id: weapon.id,
        n: weapon.name + ' (ИВЕНТ)',
        d: weapon.damage,
        pr: 0,
        ic: weapon.icon,
        lvl: game.p.lvl,
        isEvent: true,
        eventDay: weapon.day
    };
    
    game.p.wp.push({ ...newWeapon, eq: false });
    
    addLog('🛒 Куплено ивентовое оружие: ' + weapon.icon + ' ' + weapon.name + ' (' + weapon.damage + ' урона)');
    alert('🛒 Куплено: ' + weapon.icon + ' ' + weapon.name + '\n⚔️ Урон: ' + weapon.damage + '\n🪙 Цена: ' + weapon.price);
    
    save();
    updateUI();
    renderEventShop();
    document.getElementById('shopCoins').textContent = game.p.c;
}

// ===== ПРОВЕРКА И УДАЛЕНИЕ ОРУЖИЯ ПОСЛЕ ИВЕНТА =====
function checkEventWeapons() {
    // Ивент всегда активен (цикл 20 дней)
    // Если хотите удалять оружие после 20 дней - раскомментируйте код ниже
    
    /*
    let currentDay = getEventDay();
    let allDaysPassed = false; // Проверка, прошло ли 20 дней
    
    // Если прошло больше 20 дней с начала
    let now = new Date();
    let startDate = new Date(2024, 0, 1);
    let diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 20) {
        allDaysPassed = true;
    }
    
    if (allDaysPassed) {
        // Удаляем ивентовое оружие у игрока
        let removed = 0;
        game.p.wp = game.p.wp.filter(w => {
            if (w.isEvent) {
                removed++;
                return false;
            }
            return true;
        });
        
        if (removed > 0) {
            addLog('🗑️ Ивент закончился! Удалено ' + removed + ' ивентовых оружий');
            game.eventShop.purchased = [];
            save();
            updateUI();
        }
    }
    */
}

// ===== ДОБАВЛЯЕМ КНОПКУ В МЕНЮ =====
document.addEventListener('DOMContentLoaded', function() {
    let menu = document.getElementById('menu');
    if (menu) {
        let existing = document.getElementById('eventShopBtn');
        if (!existing) {
            let btn = document.createElement('button');
            btn.id = 'eventShopBtn';
            btn.className = 'o';
            btn.textContent = '🏪 Ивент-магазин';
            btn.onclick = showEventShop;
            
            let eventBtn = document.getElementById('eventBossBtn20');
            if (eventBtn) {
                menu.insertBefore(btn, eventBtn);
            } else {
                menu.appendChild(btn);
            }
        }
    }
    
    // Проверяем ивент при загрузке (раскомментировать если нужно)
    // checkEventWeapons();
});

console.log('🏪 Ивентовый магазин загружен!');
console.log('📅 20 видов оружия с ценами от 0 до 5000 монет');
console.log('⚠️ Оружие исчезнет после окончания ивента!');
