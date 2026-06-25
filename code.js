//-------------------------------------------------------------------------------------------------------------------------------
//    VARIABLES
//-------------------------------------------------------------------------------------------------------------------------------

let Stamina = 0;
const _enemyHpOverride = localStorage.getItem('enemyHpOverride');
localStorage.removeItem('enemyHpOverride');
let enemyHp = _enemyHpOverride ? parseInt(_enemyHpOverride) : 200;
let fullEnemyHp = _enemyHpOverride ? parseInt(_enemyHpOverride) : 200;
let cardType = null;
let cardNumber = 0;
let defender_immune_counter = null;
let defender_anger = false;
let enemy_stunned = false;
let enemy_weakened = 0;
let enemy_stamina = 0;
let enemy_plan = 0;
let enemy_chance = 0;
let enemy_attack = "defend";
let enemy_main_stamina = 4;
let main_cancel = 0;
let main_damage_dealt = 0;
let enemy_main_charging = false;
let shieldTarget = null;
let healTarget = null;
let lastHealAmount = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const bgMusic = new Audio('Boss_Music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0;
let musicStarted = false;
let musicMuted = false;
let musicFadeId = null;

const atkbtn = document.getElementById("attack-button");
const atkbtn2 = document.getElementById("attack-button-2");
const atkbtn3 = document.getElementById("attack-button-3");

const mainbtn = document.getElementById("main-button");
const mainbtn2 = document.getElementById("main-button-2");
const mainbtn3 = document.getElementById("main-button-3");

const secbtn = document.getElementById("second-button");
const secbtn2 = document.getElementById("second-button-2");
const secbtn3 = document.getElementById("second-button-3");

const defbtn = document.getElementById("defend-button");
const defbtn2 = document.getElementById("defend-button-2");
const defbtn3 = document.getElementById("defend-button-3");

const defCooldownText1 = document.getElementById("def-cooldown-1");
const mainCooldownText1 = document.getElementById("main-cooldown-1");
const defCooldownText2 = document.getElementById("def-cooldown-2");
const defCooldownText3 = document.getElementById("def-cooldown-3");
const secCooldownText2 = document.getElementById("sec-cooldown-2");
const enrageCounterText = document.getElementById("enrage-counter");

const shieldTargetDiv = document.getElementById("shield-target-div");
const shieldBtn1 = document.getElementById("shield-btn-1");
const shieldBtn2 = document.getElementById("shield-btn-2");
const shieldBtn3 = document.getElementById("shield-btn-3");

const healTargetDiv = document.getElementById("heal-target-div");
const healBtn1 = document.getElementById("heal-btn-1");
const healBtn2 = document.getElementById("heal-btn-2");
const healBtn3 = document.getElementById("heal-btn-3");
const player1ShieldDisplay = document.getElementById("player1-shield");
const player2ShieldDisplay = document.getElementById("player2-shield");
const player3ShieldDisplay = document.getElementById("player3-shield");

const stamina_display = document.getElementById("stamina");

const player1HpDisplay = document.getElementById("player1-hp");
const player2HpDisplay = document.getElementById("player2-hp");
const player3HpDisplay = document.getElementById("player3-hp");
const enemyHpDisplay = document.getElementById("enemy-hp");
enemyHpDisplay.textContent = "Enemy HP: " + enemyHp;

const spriteAttacker = document.getElementById("sprite-attacker");
const spriteDefender = document.getElementById("sprite-defender");
const spriteHealer = document.getElementById("sprite-healer");
const spriteEnemy = document.getElementById("sprite-enemy");

document.getElementById('action-content-1').classList.remove('action-hidden');
document.getElementById('tab-1').classList.add('tab-active');

class Players {
    constructor(name, state, move, health, max_health, current_damage, damage_min, damage_max, defend_impact, main_attack, main_stamina_amount, secondary_attack, secondary_stamina_amount) {
        this.name = name;
        this.state = state;
        this.move = move;
        this.health = health;
        this.max_hp = max_health;
        this.dmg_current = current_damage;
        this.dmg_min = damage_min;
        this.dmg_max = damage_max;
        this.def_imp = defend_impact;
        this.main_atk = main_attack;
        this.main_stm_amt = main_stamina_amount;
        this.sec_atk = secondary_attack;
        this.sec_stm_amt = secondary_stamina_amount;
        this.health_gained = 0;
        this.def_cooldown = 0;
        this.main_cooldown = 0;
        this.sec_cooldown = 0;
        this.shield_hp = 0;
        this.shield_turns = 0;
        this.stunned = false;
    }
}

const ATTACKER = new Players('Attacker', "default", "null", 100, 100, 0, 10, 50, 3, "Flintlock", 6, "Card Toss", 3);
const DEFENDER = new Players('Defender', "default", "null", 130, 130, 0, 20, 30, 6, "Knight Blunder", 6, "Backup Shield", 3);
const HEALER = new Players('Healer', "default", "null", 80, 80, 0, 10, 20, 2, "Fresh Air", 6, "Medical Aid", 2);

player1HpDisplay.textContent = ATTACKER.name + " HP: " + ATTACKER.health.toFixed(0);
player2HpDisplay.textContent = DEFENDER.name + " HP: " + DEFENDER.health.toFixed(0);
player3HpDisplay.textContent = HEALER.name + " HP: " + HEALER.health.toFixed(0);

Player1 = ATTACKER
Player2 = DEFENDER
Player3 = HEALER

shieldBtn1.textContent = "Shield " + ATTACKER.name;
shieldBtn2.textContent = "Shield " + DEFENDER.name;
shieldBtn3.textContent = "Shield " + HEALER.name;

healBtn1.textContent = "Heal " + ATTACKER.name;
healBtn2.textContent = "Heal " + DEFENDER.name;
healBtn3.textContent = "Heal " + HEALER.name;

mainbtn.disabled = true;
secbtn.disabled = true;
mainbtn2.disabled = true;
secbtn2.disabled = true;
mainbtn3.disabled = true;
secbtn3.disabled = true;

//-------------------------------------------------------------------------------------------------------------------------------
//    FUNCTIONS
//-------------------------------------------------------------------------------------------------------------------------------

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateShieldDisplays() {
    if (ATTACKER.shield_hp > 0) {
        player1ShieldDisplay.textContent = "| Shield: " + ATTACKER.shield_hp.toFixed(0) + "hp (" + ATTACKER.shield_turns + (ATTACKER.shield_turns === 1 ? " turn)" : " turns)");
        player1HpDisplay.classList.add("hp-shielded");
    } else {
        player1ShieldDisplay.textContent = "";
        player1HpDisplay.classList.remove("hp-shielded");
    }
    if (DEFENDER.shield_hp > 0) {
        player2ShieldDisplay.textContent = "| Shield: " + DEFENDER.shield_hp.toFixed(0) + "hp (" + DEFENDER.shield_turns + (DEFENDER.shield_turns === 1 ? " turn)" : " turns)");
        player2HpDisplay.classList.add("hp-shielded");
    } else {
        player2ShieldDisplay.textContent = "";
        player2HpDisplay.classList.remove("hp-shielded");
    }
    if (HEALER.shield_hp > 0) {
        player3ShieldDisplay.textContent = "| Shield: " + HEALER.shield_hp.toFixed(0) + "hp (" + HEALER.shield_turns + (HEALER.shield_turns === 1 ? " turn)" : " turns)");
        player3HpDisplay.classList.add("hp-shielded");
    } else {
        player3ShieldDisplay.textContent = "";
        player3HpDisplay.classList.remove("hp-shielded");
    }
}

function playSound(type) {
    if (type == "defend-hit") {
        soundtype = getRandomInteger(1, 3)
        if (soundtype == 1) {
            audio = new Audio('hitsound.mp3');
        } else if (soundtype == 2) {
            audio = new Audio('hitsound2.mp3');
        } else if (soundtype == 3) {
            audio = new Audio('hitsound3.mp3');
        }
    } else if (type == "lose") {
        audio = new Audio('lose.mp3')
    } else if (type == "light-charge") {
        audio = new Audio('lightning-charge.mp3')
    } else if (type == "light-attack") {
        audio = new Audio('lightning-attack.mp3')
    } else if (type == "win") {
        audio = new Audio('win.mp3')
    } else if (type == "heal") {
        audio = new Audio('heal.mp3')
    } else if (type == "fresh-air") {
        audio = new Audio('fresh-air.mp3')
    } else if (type == "enemy-heal") {
        audio = new Audio('enemy_heal.mp3')
    } else if (type == "roar") {
        audio = new Audio('roar.mp3')
    } else if (type == "explo") {
        audio = new Audio('explosion.mp3')
    } else if (type == "dead") {
        audio = new Audio('dead.mp3')
    } else if (type == "hit") {
        soundtype = getRandomInteger(1, 6)
        if (soundtype == 1) {
            audio = new Audio('hit1.mp3');
        } else if (soundtype == 2) {
            audio = new Audio('hit2.mp3');
        } else if (soundtype == 3) {
            audio = new Audio('hit3.mp3');
        } else if (soundtype == 4) {
            audio = new Audio('hit4.mp3');
        } else if (soundtype == 5) {
            audio = new Audio('hit5.mp3');
        } else if (soundtype == 6) {
            audio = new Audio('hit6.mp3');
        }
    }
    audio.play();

}

function fadeMusicIn(targetVolume, duration) {
    if (musicFadeId) clearInterval(musicFadeId);
    bgMusic.volume = 0;
    bgMusic.play().catch(() => {});
    const steps = 40;
    const stepTime = duration / steps;
    let currentStep = 0;
    musicFadeId = setInterval(() => {
        currentStep++;
        bgMusic.volume = Math.min(targetVolume, currentStep * (targetVolume / steps));
        if (currentStep >= steps) { clearInterval(musicFadeId); musicFadeId = null; }
    }, stepTime);
}

function fadeMusicOut(duration) {
    if (musicFadeId) clearInterval(musicFadeId);
    const startVolume = bgMusic.volume;
    if (startVolume === 0) { bgMusic.pause(); return; }
    const steps = 40;
    const stepTime = duration / steps;
    let currentStep = 0;
    musicFadeId = setInterval(() => {
        currentStep++;
        bgMusic.volume = Math.max(0, startVolume - currentStep * (startVolume / steps));
        if (currentStep >= steps) { clearInterval(musicFadeId); musicFadeId = null; bgMusic.pause(); }
    }, stepTime);
}

function toggleMute() {
    musicMuted = !musicMuted;
    const btn = document.getElementById('mute-btn');
    if (musicMuted) {
        bgMusic.volume = 0;
        btn.textContent = 'Unmute Music';
    } else {
        btn.textContent = 'Mute Music';
        if (musicStarted) {
            if (bgMusic.paused) {
                fadeMusicIn(0.35, 1000);
            } else {
                bgMusic.volume = 0.35;
            }
        }
    }
}

function shakeSprite(element) {
    if (!element) return;
    element.classList.remove('shake');
    void element.offsetWidth;
    element.classList.add('shake');
    element.addEventListener('animationend', () => element.classList.remove('shake'), { once: true });
}

function updateSpriteState(player, isDead) {
    const map = {
        Attacker: { el: spriteAttacker, dead: 'Attacker_dead.png', alive: 'Attacker_final.png', headDead: 'Attacker_head2.png', headAlive: 'Attacker_head.png', headAlt: 'Attacker-head' },
        Defender: { el: spriteDefender, dead: 'Defender_dead.png', alive: 'Defender_final.png', headDead: 'Defender_head2.png', headAlive: 'Defender_head.png', headAlt: 'Defender-head' },
        Healer:   { el: spriteHealer,   dead: 'Healer_dead.png',   alive: 'Healer_final.png',   headDead: 'Healer_head2.png',   headAlive: 'Healer_head.png',   headAlt: 'Healer-head'   },
    };
    const entry = map[player.name];
    if (!entry) return;
    entry.el.querySelector('img').src = isDead ? entry.dead : entry.alive;
    const headEl = document.querySelector('[alt="' + entry.headAlt + '"]');
    if (headEl) headEl.src = isDead ? entry.headDead : entry.headAlive;
}

function setPlayerSprite(player, variant) {
    const map = {
        Attacker: spriteAttacker,
        Defender: spriteDefender,
        Healer:   spriteHealer,
    };
    const el = map[player.name];
    if (!el) return;
    const img = el.querySelector('img');
    if (img) img.src = player.name + '_' + variant + '.png';
}

function playShieldAnimation(targetPlayer) {
    const defSlot = document.getElementById('sprite-defender');
    let targetSlot;
    if (targetPlayer === ATTACKER) targetSlot = document.getElementById('sprite-attacker');
    else if (targetPlayer === DEFENDER) targetSlot = document.getElementById('sprite-defender');
    else targetSlot = document.getElementById('sprite-healer');

    const defRect = defSlot.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();

    const startX = defRect.left + defRect.width / 2 - 35;
    const startY = defRect.top + defRect.height / 2 - 35;
    const dx = (targetRect.left + targetRect.width / 2 - 35) - startX;
    const dy = (targetRect.top + targetRect.height / 2 - 35) - startY;

    const shieldImg = document.createElement('img');
    shieldImg.src = 'Defender_Shield.png';
    Object.assign(shieldImg.style, {
        position: 'fixed',
        width: '70px',
        height: 'auto',
        imageRendering: 'pixelated',
        zIndex: '500',
        pointerEvents: 'none',
        opacity: '0',
        left: startX + 'px',
        top: startY + 'px',
        transition: 'opacity 0.3s ease, transform 0.7s ease',
    });
    document.body.appendChild(shieldImg);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            shieldImg.style.opacity = '1';
            shieldImg.style.transform = `translate(${dx}px, ${dy}px)`;
            setTimeout(() => {
                shieldImg.style.transition = 'opacity 0.4s ease';
                shieldImg.style.opacity = '0';
                setTimeout(() => shieldImg.remove(), 450);
            }, 1200);
        });
    });
}



function showEndScreen(type) {
    fadeMusicOut(2000);
    const img = document.createElement('img');
    img.src = type === 'win' ? 'Win_Text.png' : 'Lose_Text.png';
    const sceneEl = document.querySelector('.battle-scene');
    const statsBar = document.querySelector('.stats-bar');
    const battleArea = document.querySelector('.battle-area');

    Object.assign(img.style, {
        position: 'absolute',
        height: 'auto',
        imageRendering: 'pixelated',
        zIndex: '9999',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.8s ease, top 0.8s ease',
        filter: 'drop-shadow(3px 4px 0px rgba(0,0,0,0.2))',
    });
    sceneEl.appendChild(img);
    if (type == "win") {
        playSound("win");
    } else if (type == "lose") {
        playSound("lose");
    }
    

    function animate() {
        const sceneW = sceneEl.offsetWidth;
        const statsH = statsBar.offsetHeight;
        const areaH = battleArea.offsetHeight;
        const sceneH = sceneEl.offsetHeight;
        const imgW = Math.round(sceneW * 0.55);
        const imgH = Math.round(img.naturalHeight * (imgW / img.naturalWidth));
        img.style.width = imgW + 'px';
        img.style.left = (sceneW / 2 - imgW / 2) + 'px';
        img.style.top = sceneH + 'px';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                img.style.opacity = '1';
                img.style.top = (statsH + areaH / 2 - imgH / 2) + 'px';
            });
        });
    }

    if (img.complete && img.naturalWidth > 0) {
        animate();
    } else {
        img.onload = animate;
    }
}

function applyHeal(player) {
    const healAmount = Math.min(30, player.max_hp - player.health);
    player.health += healAmount;
    lastHealAmount = healAmount;
    healTarget = player;
    healTargetDiv.style.display = "none";
    if (player === ATTACKER) player1HpDisplay.textContent = ATTACKER.name + " HP: " + ATTACKER.health.toFixed(0);
    if (player === DEFENDER) player2HpDisplay.textContent = DEFENDER.name + " HP: " + DEFENDER.health.toFixed(0);
    if (player === HEALER) player3HpDisplay.textContent = HEALER.name + " HP: " + HEALER.health.toFixed(0);
    HEALER.health = Math.min(HEALER.health + 10, HEALER.max_hp);
    player3HpDisplay.textContent = HEALER.name + " HP: " + HEALER.health.toFixed(0);
    HEALER.move = "secondary";
    PlayerReady("3");
}

function applyShield(player) {
    player.shield_hp = 90;
    player.shield_turns = 2;
    shieldTarget = player;
    shieldTargetDiv.style.display = "none";
    updateShieldDisplays();
    DEFENDER.move = "secondary";
    PlayerReady("2");
}

function CardTossChance(number) {
    CardChance = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        return number = CardChance
}

function CardTossType(type) {
    CardChancetype = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    if (CardChancetype == 1) {
        return type = "Hearts"
    } else if (CardChancetype == 2) {
        return type = "Diamonds"
    } else if (CardChancetype == 3) {
        return type = "Clubs"
    } else if (CardChancetype == 4) {
        return type = "Spades"
    }
}

function CheckStamina() {
    if (ATTACKER.state !== "dead" && ATTACKER.state !== "ready") {
            if (Stamina >= ATTACKER.main_stm_amt && ATTACKER.main_cooldown === 0) {
                mainbtn.disabled = false;
            } else {
                mainbtn.disabled = true;
            }
            if (Stamina >= ATTACKER.sec_stm_amt) {
                secbtn.disabled = false;
            } else {
                secbtn.disabled = true;
            }
            ATTACKER.state = "default";
        }
        if (DEFENDER.state !== "dead" && DEFENDER.state !== "ready") {
            if (Stamina >= DEFENDER.main_stm_amt) {
                mainbtn2.disabled = false;
            } else {
                mainbtn2.disabled = true;
            }
            if (Stamina >= DEFENDER.sec_stm_amt && DEFENDER.sec_cooldown === 0) {
                secbtn2.disabled = false;
            } else {
                secbtn2.disabled = true;
            }
            DEFENDER.state = "default";
        }
        if (HEALER.state !== "dead" && HEALER.state !== "ready") {
            if (Stamina >= HEALER.main_stm_amt) {
                mainbtn3.disabled = false;
            } else {
                mainbtn3.disabled = true;
            }
            if (Stamina >= HEALER.sec_stm_amt) {
                secbtn3.disabled = false;
            } else {
                secbtn3.disabled = true;
            }
            HEALER.state = "default";
        }
}

function EnemyPlan() {
    enemy_chance = getRandomInteger(1, 100)
    if (enemy_stamina >= enemy_main_stamina) {
        if (enemyHp == fullEnemyHp) {
            if (enemy_chance <= 40) {
                return enemy_attack = "attack"
            } else if (enemy_chance <= 80){
                return enemy_attack = "main"
            } else {
                return enemy_attack = "defend"
            }
        }else if (enemyHp >= (fullEnemyHp / 2)) {
            if (enemy_chance <= 30) {
                return enemy_attack = "attack"
            } else if (enemy_chance <= 50){
                return enemy_attack = "main"
            }else if (enemy_chance <= 75) {
                return enemy_attack = "defend"
            } else {
                return enemy_attack = "heal"
            }
        } else {
            if (enemy_chance <= 30) {
                return enemy_attack = "heal"
            } else if (enemy_chance <= 50) {
                return enemy_attack = "main"
            } else if (enemy_chance <= 70) {
                return enemy_attack = "attack"
            } else {
                return enemy_attack = "defend"
            }
        }
    } else {
        if (enemyHp == fullEnemyHp) {
            if (enemy_chance <= 60) {
                return enemy_attack = "attack"
            } else {
                return enemy_attack = "defend"
            }
        }else if (enemyHp >= (fullEnemyHp / 2)) {
            if (enemy_chance <= 50) {
                return enemy_attack = "attack"
            } else if (enemy_chance <= 75) {
                return enemy_attack = "defend"
            } else {
                return enemy_attack = "heal"
            }
        } else {
            if (enemy_chance <= 30) {
                return enemy_attack = "heal"
            } else if (enemy_chance <= 70) {
                return enemy_attack = "attack"
            } else {
                return enemy_attack = "defend"
            }
        }
    }
    
}

function switchTab(playerNum) {
    if (shieldTargetDiv.style.display !== 'none' || healTargetDiv.style.display !== 'none') return;
    const tab = document.getElementById('tab-' + playerNum);
    if (tab.classList.contains('tab-dead') || tab.classList.contains('tab-ready') || tab.classList.contains('tab-stunned')) return;
    [1, 2, 3].forEach(n => {
        document.getElementById('action-content-' + n).classList.add('action-hidden');
        document.getElementById('tab-' + n).classList.remove('tab-active');
    });
    document.getElementById('action-content-' + playerNum).classList.remove('action-hidden');
    tab.classList.add('tab-active');
    activeTab = playerNum;
}

function updateTabStates() {
    const players = [ATTACKER, DEFENDER, HEALER];
    for (let i = 0; i < 3; i++) {
        const tab = document.getElementById('tab-' + (i + 1));
        tab.classList.remove('tab-ready', 'tab-dead', 'tab-stunned', 'tab-active');
        if (players[i].state === 'dead') {
            tab.classList.add('tab-dead');
        } else if (players[i].stunned) {
            tab.classList.add('tab-stunned');
        } else if (players[i].state === 'ready') {
            tab.classList.add('tab-ready');
        }
    }
    const activeTabEl = document.getElementById('tab-' + activeTab);
    if (!activeTabEl.classList.contains('tab-dead') && !activeTabEl.classList.contains('tab-ready') && !activeTabEl.classList.contains('tab-stunned')) {
        activeTabEl.classList.add('tab-active');
    }
}

function switchToNextActiveTab() {
    for (let i = 1; i <= 3; i++) {
        const player = [ATTACKER, DEFENDER, HEALER][i - 1];
        if (player.state !== 'dead' && player.state !== 'ready' && !player.stunned) {
            switchTab(i);
            return;
        }
    }
}

function CheckReady() {
    if (((ATTACKER.state == "ready" || ATTACKER.state == "dead") && (DEFENDER.state == "ready" || DEFENDER.state == "dead") && (HEALER.state == "ready" || HEALER.state == "dead")) && (!((ATTACKER.state == "dead") && (DEFENDER.state == "dead") && (HEALER.state == "dead")))) {
        BeginAttack()
    }
}

function PlayerReady(player) {
    if (player == "1") {
        ATTACKER.state = "ready"
        atkbtn.disabled = true;
        mainbtn.disabled = true;
        secbtn.disabled = true;
        defbtn.disabled = true;
    } else if (player == "2") {
        DEFENDER.state = "ready"
        atkbtn2.disabled = true;
        mainbtn2.disabled = true;
        secbtn2.disabled = true;
        defbtn2.disabled = true;
    } else if (player == "3") {
        HEALER.state = "ready"
        atkbtn3.disabled = true;
        mainbtn3.disabled = true;
        secbtn3.disabled = true;
        defbtn3.disabled = true;
    }

    updateTabStates();
    switchToNextActiveTab();
    CheckReady()
}

//-------------------------------------------------------------------------------------------------------------------------------
//    START ATTACK
//-------------------------------------------------------------------------------------------------------------------------------

async function BeginAttack() {
    if (!musicStarted) {
        musicStarted = true;
        if (!musicMuted) fadeMusicIn(0.35, 2000);
    }
    if (enemy_main_charging) {
        enemy_attack = "main";
        spriteEnemy.querySelector('img').src = 'enemy_main.png';
    } else if (enemy_stunned == false) {
        enemy_attack = "main" //EnemyPlan()
        if (enemy_attack == "defend") {
            queueText("Enemy defends itself...", textSpeeds.normal, () => { spriteEnemy.querySelector('img').src = 'Enemy_defend.png'; });
            await sleep (2000);
        } else if (enemy_attack == "heal") {
            queueText("The enemy looks wounded and prepares to heal...", textSpeeds.normal, () => { spriteEnemy.querySelector('img').src = 'Enemy_heal.png'; })
            await sleep (2000);
        }

    }
    if (ATTACKER.state == "ready") {
        if (ATTACKER.move == "basic") {
            let player1Damage = getRandomInteger(10, 25);
            if (defender_anger) player1Damage = Math.round(player1Damage * 1.1);

            queueText(ATTACKER.name + " did " + player1Damage.toFixed(0) + " damage" + (defender_anger ? " (Enraged!)" : ""), textSpeeds.normal, () => shakeSprite(spriteEnemy));
            if (enemy_attack == "defend") {
                playSound("defend-hit");
                queueText("But the enemy defended the attack, and takes " + Math.round(player1Damage / 6) + " dmg");
                enemyHp -= Math.round(player1Damage / 6)
                enemy_stamina += 0.5;
                await sleep(2500);
            } else {
                playSound("hit");
                enemyHp -= player1Damage;
                if (enemy_attack == "main" && enemy_main_charging) main_damage_dealt += player1Damage;
            }
            if (enemyHp < 0) enemyHp = 0;
            enemyHpDisplay.textContent = "Enemy HP: " + enemyHp.toFixed(0);

        } else if (ATTACKER.move == "defend") {
            ATTACKER.state = "defend"
            queueText(ATTACKER.name + " defends himself", textSpeeds.normal, () => setPlayerSprite(ATTACKER, 'defend'));

        } else if (ATTACKER.move == "main") {
            queueText(ATTACKER.name + " pulls out a giant flintlock and aims at the enemy...");
            await sleep(1500);
            playSound('explo');
            const flintlock_chance = getRandomInteger(1, 100)
            gun_damage = ((flintlock_chance / 5) + 80)
            if (flintlock_chance % 2 === 0) {
                let finalGunDamage = Math.round(gun_damage);
                if (defender_anger) finalGunDamage = Math.round(finalGunDamage * 1.1);
                queueText("It shoots a giant bullet towards the enemy, doing " + finalGunDamage + " Damage towards the enemy" + (defender_anger ? " (Enraged!)" : ""), textSpeeds.normal, () => shakeSprite(spriteEnemy));
                if (enemy_attack == "defend") {
                    playSound("defend-hit");
                    queueText("But the enemy defended the attack, and takes " + Math.round(finalGunDamage / 6) + " dmg");
                    enemyHp -= Math.round(finalGunDamage / 6)
                    enemy_stamina += 0.5;
                    await sleep(2500);
                } else {
                    enemyHp -= finalGunDamage;
                    if (enemy_attack == "main" && enemy_main_charging) main_damage_dealt += finalGunDamage;
                }
                if (enemyHp < 0) enemyHp = 0;
                enemyHpDisplay.textContent = "Enemy HP: " + enemyHp.toFixed(0);

            } else {
                queueText("The gun blows up, doing " + Math.round(gun_damage) + " Damage towards " + ATTACKER.name, textSpeeds.normal, () => shakeSprite(spriteAttacker));
                ATTACKER.health -= Math.round(gun_damage)
                if (ATTACKER.health <= 0) {
                    ATTACKER.health = 0;
                    ATTACKER.state = "dead";
                    ATTACKER.shield_hp = 0;
                    ATTACKER.shield_turns = 0;
                    playSound('dead');
                    queueText(ATTACKER.name + " has fallen!", textSpeeds.normal, () => updateSpriteState(ATTACKER, true));
                    defCooldownText1.textContent = "";
                    mainCooldownText1.textContent = "";
                    player1HpDisplay.textContent = ATTACKER.name + " HP: 0";
                    updateShieldDisplays();
                }
            }
        } else if (ATTACKER.move == "secondary") {
            cardNumber = CardTossChance(cardNumber)
            cardType = CardTossType(cardType)
            queueText(ATTACKER.name + " Throws a card at the enemy...");
            await sleep(1000);
            if (cardNumber == 1) {
                if (cardType == "Hearts") {
                    ATTACKER.dmg_current = 30
                    ATTACKER.health = Math.min(ATTACKER.health + 40, ATTACKER.max_hp);
                    player1HpDisplay.textContent = ATTACKER.name + " HP: " + ATTACKER.health.toFixed(0);
                    queueText("It was a QUEEN OF HEARTS! Did 30 damage towards the enemy and gained 40hp", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                } else if (cardType == "Diamonds") {
                    ATTACKER.dmg_current = 50;
                    weakened_amount = 25;
                    enemy_weakened = 2;
                    queueText("It was an ACE! Did 70 damage towards the enemy and weakened the enemy's attack by 25%!", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                } else if (cardType == "Clubs") {
                    ATTACKER.dmg_current = 50
                    enemy_stunned = true;
                    queueText("It was a JACK OF TRADES! Did 70 damage towards the enemy and stunned the enemy for 1 turn!", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                } else if (cardType == "Spades") {
                    ATTACKER.dmg_current = 70
                    queueText("It was a KING OF SPADES! Did 70 damage towards the enemy", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                }

            } else {
                queueText(" It was a '" + cardNumber + " of " + cardType + "' Card");
                if (cardType == "Hearts") {
                    ATTACKER.dmg_current = (cardNumber * (cardNumber / 4))
                    ATTACKER.health_gained = (ATTACKER.dmg_current + (cardNumber / 1.5))
                    queueText("It did " + ATTACKER.dmg_current.toFixed(0) + " damage and " + ATTACKER.name + " gained " + Math.round(ATTACKER.health_gained) + "hp", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                    ATTACKER.health = Math.min(ATTACKER.health + ATTACKER.health_gained, ATTACKER.max_hp);
                    player1HpDisplay.textContent = ATTACKER.name + " HP: " + ATTACKER.health.toFixed(0);
                } else if (cardType == "Diamonds") {
                    ATTACKER.dmg_current = (cardNumber * (cardNumber / 3))
                    weakened_amount = (cardNumber * 2)
                    enemy_weakened = 2;
                    queueText("It did " + ATTACKER.dmg_current.toFixed(0) + " damage and weakened the enemy's attack by " + weakened_amount + "%", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                } else if (cardType == "Clubs") {
                    ATTACKER.dmg_current = (cardNumber * (cardNumber / 3))
                    stun_chance = getRandomInteger(2, 21);
                    if (stun_chance <= cardNumber) {
                        enemy_stunned = true;
                        queueText("It did " + ATTACKER.dmg_current.toFixed(0) + " damage and stunned the enemy for 1 turn!", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                    } else {
                        queueText("It did " + ATTACKER.dmg_current.toFixed(0) + " damage", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                    }
                } else if (cardType == "Spades") {
                    ATTACKER.dmg_current = (cardNumber * (cardNumber / 2))
                    queueText("He did " + ATTACKER.dmg_current.toFixed(0) + " damage", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                }
            }

            let cardDamage = ATTACKER.dmg_current;
            if (defender_anger) {
                const enrageBonus = Math.round(cardDamage * 0.1);
                cardDamage += enrageBonus;
                queueText("(+" + enrageBonus + " Enraged!)");
            }
            if (enemy_attack == "defend") {
                playSound("defend-hit");
                queueText("But the enemy defended the attack, and takes " + Math.round(cardDamage / 6) + " dmg");
                enemyHp -= Math.round(cardDamage / 6)
                enemy_stamina += 0.5;
                await sleep(2500);
            } else {
                playSound("hit");
                enemyHp -= cardDamage;
                if (enemy_attack == "main" && enemy_main_charging) main_damage_dealt += cardDamage;
            }
            if (enemy_stunned == true) {
                enemy_attack = null
            }
            if (enemyHp < 0) enemyHp = 0;
            enemyHpDisplay.textContent = "Enemy HP: " + enemyHp.toFixed(0);
        }

        await sleep(2000);
    }

    if (DEFENDER.state == "ready") {
        if (DEFENDER.move == "basic") {
            const player2Damage = getRandomInteger(5, 20);
            queueText(DEFENDER.name + " did " + player2Damage.toFixed(0) + " damage", textSpeeds.normal, () => shakeSprite(spriteEnemy));
            if (enemy_attack == "defend") {
                playSound("defend-hit");
                queueText("But the enemy defended the attack, and takes " + Math.round(player2Damage / 6) + " dmg");
                enemyHp -= Math.round(player2Damage / 6)
                enemy_stamina += 0.5;
                await sleep(2500);
            } else {
                playSound("hit");
                enemyHp -= player2Damage;
                if (enemy_attack == "main" && enemy_main_charging) main_damage_dealt += player2Damage;
            }
            if (enemyHp < 0) enemyHp = 0;
            enemyHpDisplay.textContent = "Enemy HP: " + enemyHp.toFixed(0);

        } else if (DEFENDER.move == "defend") {
            DEFENDER.state = "defend"
            queueText(DEFENDER.name + " defends himself", textSpeeds.normal, () => setPlayerSprite(DEFENDER, 'defend'));
        } else if (DEFENDER.move == "main") {
            playSound('roar');
            defender_immune_counter = 3
            defender_anger = true;
            enrageCounterText.textContent = "Enraged: 3 turns";
            queueText(DEFENDER.name + " let out a terrifying roar and defends himself, all enemies do less damage and cannot attack " + DEFENDER.name + ", lasts for 3 turns");
        } else if (DEFENDER.move == "secondary") {
            queueText(DEFENDER.name + " creates a backup shield for " + shieldTarget.name + ", (" + shieldTarget.shield_hp + "hp, 2 turns)", textSpeeds.normal, () => playShieldAnimation(shieldTarget));
        } else if (DEFENDER.move == "skip") {
            queueText(DEFENDER.name + " is taking a break");
        }
        await sleep(2000);
    }

    if (HEALER.state == "ready") {
        if (HEALER.move == "basic") {
            let player3Damage = getRandomInteger(1, 15);
            if (defender_anger) player3Damage = Math.round(player3Damage * 1.1);
            queueText(HEALER.name + " did " + player3Damage.toFixed(0) + " damage" + (defender_anger ? " (Enraged)" : ""), textSpeeds.normal, () => shakeSprite(spriteEnemy));
            if (enemy_attack == "defend") {
                playSound("defend-hit");
                queueText("But the enemy defended the attack, and takes " + Math.round(player3Damage / 6) + " dmg");
                enemyHp -= Math.round(player3Damage / 6)
                enemy_stamina += 0.5;
                await sleep(2500);
            } else {
                playSound("hit");
                enemyHp -= player3Damage;
                if (enemy_attack == "main" && enemy_main_charging) main_damage_dealt += player3Damage;
            }
            if (enemyHp < 0) enemyHp = 0;
            enemyHpDisplay.textContent = "Enemy HP: " + enemyHp.toFixed(0);

        } else if (HEALER.move == "defend") {
            HEALER.state = "defend"
            queueText(HEALER.name + " defends herself", textSpeeds.normal, () => setPlayerSprite(HEALER, 'defend'));
        } else if (HEALER.move == "secondary") {
            const selfNote = healTarget === HEALER ? "" : " and restores 10hp to themselves";
            playSound("heal");
            queueText(HEALER.name + " uses Medical Aid on " + healTarget.name + ", (+" + Math.round(lastHealAmount) + "hp)" + selfNote, textSpeeds.normal, () => {
                setPlayerSprite(HEALER, 'heal');
                setTimeout(() => { if (HEALER.health > 0) setPlayerSprite(HEALER, 'final'); }, 1500);
            });
        } else if (HEALER.move == "main") {
            const alivePlayers = [ATTACKER, DEFENDER, HEALER].filter(p => p.health > 0);
            playSound("fresh-air");

            if (alivePlayers.length === 3) {
                [ATTACKER, DEFENDER, HEALER].forEach(p => {
                    p.health = Math.min(p.health + 40, p.max_hp);
                });
                queueText(HEALER.name + " uses Fresh Air, healing the whole team for 40hp", textSpeeds.normal, () => {
                    setPlayerSprite(HEALER, 'heal');
                    setTimeout(() => { if (HEALER.health > 0) setPlayerSprite(HEALER, 'final'); }, 1500);
                });
            } else if (alivePlayers.length === 2) {
                const deadPlayer = [ATTACKER, DEFENDER, HEALER].find(p => p.health <= 0);
                alivePlayers.forEach(p => {
                    p.health = Math.min(p.health + 20, p.max_hp);
                });
                deadPlayer.health = 30;
                deadPlayer.state = "default";
                updateSpriteState(deadPlayer, false);
                queueText(HEALER.name + " uses Fresh Air, healing the team for 20hp and reviving " + deadPlayer.name + " with 30hp", textSpeeds.normal, () => {
                    setPlayerSprite(HEALER, 'heal');
                    setTimeout(() => { if (HEALER.health > 0) setPlayerSprite(HEALER, 'final'); }, 1500);
                });
            } else {
                HEALER.health = Math.min(HEALER.health + 40, HEALER.max_hp);
                const revivedPlayer = Math.random() < 0.5 ? ATTACKER : DEFENDER;
                revivedPlayer.health = 40;
                revivedPlayer.state = "default";
                updateSpriteState(revivedPlayer, false);
                queueText(HEALER.name + " uses Fresh Air, healing themselves for 40hp and reviving " + revivedPlayer.name + " with 40hp", textSpeeds.normal, () => {
                    setPlayerSprite(HEALER, 'heal');
                    setTimeout(() => { if (HEALER.health > 0) setPlayerSprite(HEALER, 'final'); }, 1500);
                });
            }

            player1HpDisplay.textContent = ATTACKER.name + " HP: " + ATTACKER.health.toFixed(0);
            player2HpDisplay.textContent = DEFENDER.name + " HP: " + DEFENDER.health.toFixed(0);
            player3HpDisplay.textContent = HEALER.name + " HP: " + HEALER.health.toFixed(0);
        }

        await sleep(2000);
    }

    if (enemyHp <= 0) {
        playSound('dead');
        setOnQueueEmpty(() => showEndScreen('win'));
        queueText("The enemy died", textSpeeds.normal, () => { spriteEnemy.querySelector('img').src = 'Enemy_dead2.png'; });
        queueText("You win");
        atkbtn.disabled = true;
        return;
    }

    setTimeout(function () {
        const livingPlayers = [];
        if (ATTACKER.health > 0) livingPlayers.push(1);
        if (DEFENDER.health > 0) livingPlayers.push(2);
        if (HEALER.health > 0) livingPlayers.push(3);

        if (livingPlayers.length === 0) {
            queueText("The enemy wins");
            atkbtn.disabled = true;
            setOnQueueEmpty(() => showEndScreen('lose'));
            return;
        }

        if (enemy_stunned) {
            enemy_stunned = false;
            queueText("The enemy is stunned and cannot attack this turn!");
        } else if (enemy_attack == "defend") {
            queueText("The enemy focused on defending and did not attack!", textSpeeds.normal, () => { spriteEnemy.querySelector('img').src = 'Enemy_final.png'; });
        } else if (enemy_attack == "heal") {
            playSound("enemy-heal");
            const healAmount = getRandomInteger(20, 40);
            enemyHp = Math.min(enemyHp + healAmount, fullEnemyHp);
            enemyHpDisplay.textContent = "Enemy HP: " + enemyHp.toFixed(0);
            queueText("The enemy heals itself for " + healAmount + " hp!", textSpeeds.normal, () => { spriteEnemy.querySelector('img').src = 'Enemy_final.png'; });
        } else if (enemy_attack == "main") {
            if (!enemy_main_charging) {
                enemy_stamina -= enemy_main_stamina;
                main_cancel = getRandomInteger(20, 30);
                main_damage_dealt = 0;
                spriteEnemy.querySelector('img').src = 'enemy_main.png';
                queueText("The enemy is charging up its special attack! You need to do " + main_cancel + " damage to cancel the attack!");
                playSound("light-charge")
                enemy_main_charging = true;
            } else {
            if (main_damage_dealt >= main_cancel) {
                spriteEnemy.querySelector('img').src = 'Enemy_main_cancel.png';
                queueText("The enemy took too much damage and couldn't do the attack!");
            } else {
                let mainAttackDamage = getRandomInteger(80, 110);
                const target = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
                const targetSprite = [spriteAttacker, spriteDefender, spriteHealer][target - 1];
                const targetName = [ATTACKER, DEFENDER, HEALER][target - 1].name;
                spriteEnemy.querySelector('img').src = 'Enemy_main_attack.png';
                playSound("light-attack")
                queueText("The enemy's special attack hits " + targetName + " for " + mainAttackDamage + " damage!", textSpeeds.normal, () => shakeSprite(targetSprite));
                if (target == 1) {
                    if (ATTACKER.shield_hp > 0) {
                        let shield_damage = mainAttackDamage - ATTACKER.shield_hp;
                        if (shield_damage > 0) {
                            ATTACKER.shield_hp = 0;
                            ATTACKER.shield_turns = 0;
                            ATTACKER.health -= shield_damage;
                            queueText("The shield broke and " + ATTACKER.name + " takes " + shield_damage.toFixed(0) + " damage!");
                        } else {
                            ATTACKER.shield_hp -= mainAttackDamage;
                            queueText("The shield absorbed all the damage! (" + ATTACKER.shield_hp.toFixed(0) + "hp remaining)");
                        }
                        updateShieldDisplays();
                    } else if (ATTACKER.state == "defend") {
                        playSound("defend-hit");
                        ATTACKER.health -= (mainAttackDamage / 5);
                        queueText("But " + ATTACKER.name + " defends and takes " + (mainAttackDamage / 5).toFixed(0) + " damage", textSpeeds.normal, () => setPlayerSprite(ATTACKER, 'final'));
                        Stamina += 2;
                    } else {
                        ATTACKER.health -= mainAttackDamage;
                    }
                    if (ATTACKER.health <= 0) {
                        ATTACKER.health = 0;
                        ATTACKER.state = "dead";
                        ATTACKER.shield_hp = 0;
                        ATTACKER.shield_turns = 0;
                        playSound('dead');
                        queueText(ATTACKER.name + " has fallen", textSpeeds.normal, () => updateSpriteState(ATTACKER, true));
                        defCooldownText1.textContent = "";
                        mainCooldownText1.textContent = "";
                        updateShieldDisplays();
                    }
                    player1HpDisplay.textContent = ATTACKER.name + " HP: " + ATTACKER.health.toFixed(0);
                } else if (target == 2) {
                    if (DEFENDER.shield_hp > 0) {
                        let shield_damage = mainAttackDamage - DEFENDER.shield_hp;
                        if (shield_damage > 0) {
                            DEFENDER.shield_hp = 0;
                            DEFENDER.shield_turns = 0;
                            DEFENDER.health -= shield_damage;
                            queueText("The shield broke and " + DEFENDER.name + " takes " + shield_damage.toFixed(0) + " damage!");
                        } else {
                            DEFENDER.shield_hp -= mainAttackDamage;
                            queueText("The shield absorbed all the damage! (" + DEFENDER.shield_hp.toFixed(0) + "hp remaining)");
                        }
                        updateShieldDisplays();
                    } else if (DEFENDER.state == "defend") {
                        playSound("defend-hit");
                        DEFENDER.health -= (mainAttackDamage / 5);
                        queueText("But " + DEFENDER.name + " defends and takes " + (mainAttackDamage / 5).toFixed(0) + " damage", textSpeeds.normal, () => setPlayerSprite(DEFENDER, 'final'));
                        Stamina += 2;
                    } else {
                        DEFENDER.health -= mainAttackDamage;
                    }
                    if (DEFENDER.health <= 0) {
                        DEFENDER.health = 0;
                        DEFENDER.state = "dead";
                        DEFENDER.shield_hp = 0;
                        DEFENDER.shield_turns = 0;
                        playSound('dead');
                        queueText(DEFENDER.name + " has fallen", textSpeeds.normal, () => updateSpriteState(DEFENDER, true));
                        defCooldownText2.textContent = "";
                        secCooldownText2.textContent = "";
                        enrageCounterText.textContent = "";
                        updateShieldDisplays();
                    }
                    player2HpDisplay.textContent = DEFENDER.name + " HP: " + DEFENDER.health.toFixed(0);
                } else {
                    if (HEALER.shield_hp > 0) {
                        let shield_damage = mainAttackDamage - HEALER.shield_hp;
                        if (shield_damage > 0) {
                            HEALER.shield_hp = 0;
                            HEALER.shield_turns = 0;
                            HEALER.health -= shield_damage;
                            queueText("The shield broke and " + HEALER.name + " takes " + shield_damage.toFixed(0) + " damage!");
                        } else {
                            HEALER.shield_hp -= mainAttackDamage;
                            queueText("The shield absorbed all the damage! (" + HEALER.shield_hp.toFixed(0) + "hp remaining)");
                        }
                        updateShieldDisplays();
                    } else if (HEALER.state == "defend") {
                        playSound("defend-hit");
                        HEALER.health -= (mainAttackDamage / 5);
                        queueText("But " + HEALER.name + " defends and takes " + (mainAttackDamage / 5).toFixed(0) + " damage", textSpeeds.normal, () => setPlayerSprite(HEALER, 'final'));
                        Stamina += 2;
                    } else {
                        HEALER.health -= mainAttackDamage;
                    }
                    if (HEALER.health <= 0) {
                        HEALER.health = 0;
                        HEALER.state = "dead";
                        HEALER.shield_hp = 0;
                        HEALER.shield_turns = 0;
                        playSound('dead');
                        queueText(HEALER.name + " has fallen", textSpeeds.normal, () => updateSpriteState(HEALER, true));
                        defCooldownText3.textContent = "";
                        updateShieldDisplays();
                    }
                    player3HpDisplay.textContent = HEALER.name + " HP: " + HEALER.health.toFixed(0);
                }
                if ((ATTACKER.health <= 0) && (DEFENDER.health <= 0) && (HEALER.health <= 0)) {
                    queueText("The enemy wins");
                    atkbtn.disabled = true;
                    setOnQueueEmpty(() => showEndScreen('lose'));
                    return;
                }
            }
            enemy_main_charging = false;
            }
        } else {
            let enemyDamage = getRandomInteger(40, 70);
            let weakenedNote = "";
            if (enemy_weakened > 0) {
                enemyDamage = Math.round(enemyDamage * ((100 - weakened_amount) * 0.01));
                weakenedNote = " (Weakened -" + weakened_amount + "%, " + enemy_weakened + (enemy_weakened === 1 ? " turn" : " turns") + " remaining)";
                enemy_weakened--;
            }

            const target = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
            const targetSprite = [spriteAttacker, spriteDefender, spriteHealer][target - 1];
            const targetName = [ATTACKER, DEFENDER, HEALER][target - 1].name;

            if (defender_anger == true) {
                enemyDamage -= (enemyDamage / 1.5)
                queueText("The enemy is scared of " + DEFENDER.name + " but still tries to attack " + targetName + " for " + enemyDamage.toFixed(0) + " damage" + weakenedNote, textSpeeds.normal, () => shakeSprite(targetSprite));
            } else {
                queueText("The enemy attacks " + targetName + " for " + enemyDamage.toFixed(0) + " damage" + weakenedNote, textSpeeds.normal, () => shakeSprite(targetSprite));
            }

            if (target == 1) {
                if (ATTACKER.shield_hp > 0) {
                    let shield_damage = enemyDamage - ATTACKER.shield_hp;
                    if (shield_damage > 0) {
                        ATTACKER.shield_hp = 0;
                        ATTACKER.shield_turns = 0;
                        ATTACKER.health -= shield_damage;
                        queueText("The shield broke and " + ATTACKER.name + " takes " + shield_damage.toFixed(0) + " damage!");
                    } else {
                        ATTACKER.shield_hp -= enemyDamage;
                        queueText("The shield absorbed all the damage! (" + ATTACKER.shield_hp.toFixed(0) + "hp remaining)");
                    }
                    updateShieldDisplays();
                } else if (ATTACKER.state == "defend") {
                    playSound("defend-hit");
                    ATTACKER.health -= (enemyDamage / 5)
                    queueText("But " + ATTACKER.name + " protects himself and takes " + (enemyDamage / 5).toFixed(0) + " damage", textSpeeds.normal, () => setPlayerSprite(ATTACKER, 'final'));
                    Stamina += 2
                } else {
                    playSound("hit");
                    ATTACKER.health -= enemyDamage;
                }

                if (ATTACKER.health <= 0) {
                    ATTACKER.health = 0;
                    ATTACKER.state = "dead";
                    ATTACKER.shield_hp = 0;
                    ATTACKER.shield_turns = 0;
                    playSound('dead');
                    queueText(ATTACKER.name + " has fallen", textSpeeds.normal, () => updateSpriteState(ATTACKER, true));
                    defCooldownText1.textContent = "";
                    mainCooldownText1.textContent = "";
                    updateShieldDisplays();
                }
                player1HpDisplay.textContent = ATTACKER.name + " HP: " + ATTACKER.health.toFixed(0);

            } else if (target == 2) {
                if (defender_anger == true) {
                    queueText("But " + DEFENDER.name + " grabs the enemy, slams them with a mace, and throws them 10 feet away, doing 80 damage!", textSpeeds.normal, () => shakeSprite(spriteEnemy));
                    enemyHp -= 80
                    defender_anger = false
                    defender_immune_counter = null
                    enrageCounterText.textContent = "";
                    DEFENDER.main_cooldown = 1;
                    enemyHpDisplay.textContent = "Enemy HP: " + enemyHp.toFixed(0);
                    queueText(DEFENDER.name + " calmed down and is back to normal");
                } else if (DEFENDER.shield_hp > 0) {
                    let shield_damage = enemyDamage - DEFENDER.shield_hp;
                    if (shield_damage > 0) {
                        DEFENDER.shield_hp = 0;
                        DEFENDER.shield_turns = 0;
                        DEFENDER.health -= shield_damage;
                        queueText("The shield broke and " + DEFENDER.name + " takes " + shield_damage.toFixed(0) + " damage!");
                    } else {
                        DEFENDER.shield_hp -= enemyDamage;
                        queueText("The shield absorbed all the damage! (" + DEFENDER.shield_hp.toFixed(0) + "hp remaining)");
                    }
                    updateShieldDisplays();
                } else if (DEFENDER.state == "defend") {
                    playSound("defend-hit");
                    DEFENDER.health -= (enemyDamage / 5)
                    queueText("But " + DEFENDER.name + " protects himself and takes " + (enemyDamage / 5).toFixed(0) + " damage", textSpeeds.normal, () => setPlayerSprite(DEFENDER, 'final'));
                    Stamina += 2
                } else {
                    playSound("hit");
                    DEFENDER.health -= enemyDamage;
                }

                if (DEFENDER.health <= 0) {
                    DEFENDER.health = 0;
                    DEFENDER.state = "dead";
                    DEFENDER.shield_hp = 0;
                    DEFENDER.shield_turns = 0;
                    playSound('dead');
                    queueText(DEFENDER.name + " has fallen", textSpeeds.normal, () => updateSpriteState(DEFENDER, true));
                    defCooldownText2.textContent = "";
                    secCooldownText2.textContent = "";
                    enrageCounterText.textContent = "";
                    updateShieldDisplays();
                }
                player2HpDisplay.textContent = DEFENDER.name + " HP: " + DEFENDER.health.toFixed(0);

            } else {
                if (HEALER.shield_hp > 0) {
                    let shield_damage = enemyDamage - HEALER.shield_hp;
                    if (shield_damage > 0) {
                        HEALER.shield_hp = 0;
                        HEALER.shield_turns = 0;
                        HEALER.health -= shield_damage;
                        queueText("The shield broke and " + HEALER.name + " takes " + shield_damage.toFixed(0) + " damage!");
                    } else {
                        HEALER.shield_hp -= enemyDamage;
                        queueText("The shield absorbed all the damage! (" + HEALER.shield_hp.toFixed(0) + "hp remaining)");
                    }
                    updateShieldDisplays();
                } else if (HEALER.state == "defend") {
                    playSound("defend-hit");
                    HEALER.health -= (enemyDamage / 5)
                    queueText("But " + HEALER.name + " protects herself and takes " + (enemyDamage / 5).toFixed(0) + " damage", textSpeeds.normal, () => setPlayerSprite(HEALER, 'final'));
                    Stamina += 2
                } else {
                    playSound("hit");
                    HEALER.health -= enemyDamage;
                }

                if (HEALER.health <= 0) {
                    HEALER.health = 0;
                    HEALER.state = "dead";
                    HEALER.shield_hp = 0;
                    HEALER.shield_turns = 0;
                    playSound('dead');
                    queueText(HEALER.name + " has fallen", textSpeeds.normal, () => updateSpriteState(HEALER, true));
                    defCooldownText3.textContent = "";
                    updateShieldDisplays();
                }
                player3HpDisplay.textContent = HEALER.name + " HP: " + HEALER.health.toFixed(0);
            }

            if ((ATTACKER.health <= 0) && (DEFENDER.health <= 0) && (HEALER.health <= 0)) {
                queueText("The enemy wins");
                atkbtn.disabled = true;
                setOnQueueEmpty(() => showEndScreen('lose'));
                return;
            }
        }

        Stamina += 1
        enemy_stamina += 1;
        stamina_display.textContent = Stamina;

        [ATTACKER, DEFENDER, HEALER].forEach(player => {
            if (player.shield_hp > 0) {
                player.shield_turns--;
                if (player.shield_turns <= 0) {
                    player.shield_hp = 0;
                    player.shield_turns = 0;
                }
            }
        });
        updateShieldDisplays();

        if (defender_anger == true) {
            defender_immune_counter -= 1
            if (defender_immune_counter == 0) {
                defender_anger = false;
                enrageCounterText.textContent = "";
                DEFENDER.main_cooldown = 1;
                queueText(DEFENDER.name + " calmed down and is back to normal");
            } else {
                enrageCounterText.textContent = "Enraged: " + defender_immune_counter + (defender_immune_counter === 1 ? " turn" : " turns");
            }
        }

        setOnQueueEmpty(function() {
            if (ATTACKER.state !== "dead") {
                atkbtn.disabled = false;
                defbtn.disabled = false;
                if (Stamina >= ATTACKER.main_stm_amt && ATTACKER.main_cooldown === 0) {
                    mainbtn.disabled = false;
                } else {
                    mainbtn.disabled = true;
                }
                if (Stamina >= ATTACKER.sec_stm_amt) {
                    secbtn.disabled = false;
                } else {
                    secbtn.disabled = true;
                }
                ATTACKER.state = "default";
            }
            if (DEFENDER.state !== "dead") {
                atkbtn2.disabled = false;
                defbtn2.disabled = false;
                if (Stamina >= DEFENDER.main_stm_amt) {
                    mainbtn2.disabled = false;
                } else {
                    mainbtn2.disabled = true;
                }
                if (Stamina >= DEFENDER.sec_stm_amt && DEFENDER.sec_cooldown === 0) {
                    secbtn2.disabled = false;
                } else {
                    secbtn2.disabled = true;
                }
                DEFENDER.state = "default";
            }
            if (HEALER.state !== "dead") {
                atkbtn3.disabled = false;
                defbtn3.disabled = false;
                if (Stamina >= HEALER.main_stm_amt) {
                    mainbtn3.disabled = false;
                } else {
                    mainbtn3.disabled = true;
                }
                if (Stamina >= HEALER.sec_stm_amt) {
                    secbtn3.disabled = false;
                } else {
                    secbtn3.disabled = true;
                }
                HEALER.state = "default";
            }

            if (ATTACKER.state !== "dead") { defbtn.disabled = false; ATTACKER.state = "default"; setPlayerSprite(ATTACKER, 'final'); }
            if (DEFENDER.state !== "dead") { defbtn2.disabled = false; DEFENDER.state = "default"; setPlayerSprite(DEFENDER, 'final'); }
            if (HEALER.state !== "dead") { defbtn3.disabled = false; HEALER.state = "default"; setPlayerSprite(HEALER, 'final'); }
            if (!enemy_main_charging) spriteEnemy.querySelector('img').src = 'Enemy_final.png';

            if (ATTACKER.state !== "dead") {
                if (ATTACKER.move === "defend") ATTACKER.def_cooldown = 1;
                if (ATTACKER.def_cooldown > 0) {
                    defbtn.disabled = true;
                    defCooldownText1.textContent = "→ 1 turn";
                    ATTACKER.def_cooldown--;
                } else {
                    defCooldownText1.textContent = "";
                }
                if (ATTACKER.move === "main") ATTACKER.main_cooldown = 2;
                if (ATTACKER.main_cooldown > 0) {
                    mainbtn.disabled = true;
                    mainCooldownText1.textContent = "→ " + ATTACKER.main_cooldown + (ATTACKER.main_cooldown === 1 ? " turn" : " turns");
                    ATTACKER.main_cooldown--;
                } else {
                    mainCooldownText1.textContent = "";
                }
            }
            if (DEFENDER.state !== "dead") {
                if (DEFENDER.main_cooldown > 0) {
                    atkbtn2.disabled = true;
                    defbtn2.disabled = true;
                    mainbtn2.disabled = true;
                    secbtn2.disabled = true;
                    defCooldownText2.textContent = "";
                    DEFENDER.state = "ready";
                    DEFENDER.move = "skip";
                    DEFENDER.main_cooldown--;
                } else {
                    if (DEFENDER.move === "defend") DEFENDER.def_cooldown = 1;
                    if (DEFENDER.def_cooldown > 0) {
                        defbtn2.disabled = true;
                        defCooldownText2.textContent = "→ 1 turn";
                        DEFENDER.def_cooldown--;
                    } else {
                        defCooldownText2.textContent = "";
                    }
                    if (DEFENDER.move === "secondary") DEFENDER.sec_cooldown = 3;
                    if (DEFENDER.sec_cooldown > 0) {
                        secbtn2.disabled = true;
                        DEFENDER.sec_cooldown--;
                        secCooldownText2.textContent = DEFENDER.sec_cooldown > 0 ? "→ " + DEFENDER.sec_cooldown + (DEFENDER.sec_cooldown === 1 ? " turn" : " turns") : "";
                    } else {
                        secCooldownText2.textContent = "";
                    }
                }
            }
            if (HEALER.state !== "dead") {
                if (HEALER.move === "defend") HEALER.def_cooldown = 1;
                if (HEALER.def_cooldown > 0) {
                    defbtn3.disabled = true;
                    defCooldownText3.textContent = "→ 1 turn";
                    HEALER.def_cooldown--;
                } else {
                    defCooldownText3.textContent = "";
                }
            }

            updateTabStates();
            switchToNextActiveTab();
            CheckReady();
        });

    });
};

let activeTab = 1;

atkbtn.addEventListener("click", function () {
    ATTACKER.move = "basic"
    PlayerReady("1")
});

atkbtn2.addEventListener("click", function () {
    DEFENDER.move = "basic"
    PlayerReady("2")
});

atkbtn3.addEventListener("click", function () {
    HEALER.move = "basic"
    PlayerReady("3")
});

mainbtn.addEventListener("click", function () {
    Stamina -= ATTACKER.main_stm_amt
    stamina_display.textContent = Stamina;
    CheckStamina()
    ATTACKER.move = "main"
    PlayerReady("1")
});

mainbtn2.addEventListener("click", function () {
    Stamina -= DEFENDER.main_stm_amt
    stamina_display.textContent = Stamina;
    CheckStamina()
    DEFENDER.move = "main"
    PlayerReady("2")
});

mainbtn3.addEventListener("click", function () {
    Stamina -= HEALER.main_stm_amt
    stamina_display.textContent = Stamina;
    CheckStamina()
    HEALER.move = "main"
    PlayerReady("3")
});

secbtn.addEventListener("click", function () {
    Stamina -= ATTACKER.sec_stm_amt
    stamina_display.textContent = Stamina;
    CheckStamina()
    ATTACKER.move = "secondary"
    PlayerReady("1")
});

secbtn2.addEventListener("click", function () {
    Stamina -= DEFENDER.sec_stm_amt;
    stamina_display.textContent = Stamina;
    CheckStamina();

    atkbtn2.disabled = true;
    mainbtn2.disabled = true;
    secbtn2.disabled = true;
    defbtn2.disabled = true;

    shieldBtn1.style.display = ATTACKER.state === "dead" ? "none" : "inline-block";
    shieldBtn2.style.display = DEFENDER.state === "dead" ? "none" : "inline-block";
    shieldBtn3.style.display = HEALER.state === "dead" ? "none" : "inline-block";
    shieldTargetDiv.style.display = "block";
});

defbtn.addEventListener("click", function () {
    ATTACKER.move = "defend"
    PlayerReady("1")
});

defbtn2.addEventListener("click", function () {
    DEFENDER.move = "defend"
    PlayerReady("2")
});

defbtn3.addEventListener("click", function () {
    HEALER.move = "defend"
    PlayerReady("3")
});

shieldBtn1.addEventListener("click", function () { applyShield(ATTACKER); });
shieldBtn2.addEventListener("click", function () { applyShield(DEFENDER); });
shieldBtn3.addEventListener("click", function () { applyShield(HEALER); });

secbtn3.addEventListener("click", function () {
    Stamina -= HEALER.sec_stm_amt;
    stamina_display.textContent = Stamina;
    CheckStamina();

    atkbtn3.disabled = true;
    mainbtn3.disabled = true;
    secbtn3.disabled = true;
    defbtn3.disabled = true;

    healBtn1.style.display = ATTACKER.state === "dead" ? "none" : "inline-block";
    healBtn2.style.display = DEFENDER.state === "dead" ? "none" : "inline-block";
    healBtn3.style.display = HEALER.state === "dead" ? "none" : "inline-block";
    healTargetDiv.style.display = "block";
});

healBtn1.addEventListener("click", function () { applyHeal(ATTACKER); });
healBtn2.addEventListener("click", function () { applyHeal(DEFENDER); });
healBtn3.addEventListener("click", function () { applyHeal(HEALER); });

function setEnemyHp() {
    const input = document.getElementById('hp-setter-input');
    if (input.value === '') return;
    const hp = parseInt(input.value);
    if (!isNaN(hp) && hp > 0) {
        localStorage.setItem('enemyHpOverride', hp);
        location.reload();
    }
}
