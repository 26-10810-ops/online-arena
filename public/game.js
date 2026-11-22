// ==============================

// ONLINE ARENA - game.js

// ==============================



const socket = io();

// ==============================
// UI SOUND SYSTEM
// ==============================

let uiAudioContext = null;

function getUIAudioContext() {
    if (!uiAudioContext) {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        uiAudioContext = new AudioContext();
    }

    if (uiAudioContext.state === "suspended") {
        uiAudioContext.resume();
    }

    return uiAudioContext;
}

function playUISound(type = "click") {
    const context = getUIAudioContext();

    if (!context) {
        return;
    }

    const settings = {
        click: {
            frequency: 520,
            endFrequency: 620,
            duration: 0.07,
            volume: 0.045
        },
        confirm: {
            frequency: 620,
            endFrequency: 820,
            duration: 0.11,
            volume: 0.055
        },
        cancel: {
            frequency: 430,
            endFrequency: 300,
            duration: 0.10,
            volume: 0.05
        },
        open: {
            frequency: 560,
            endFrequency: 760,
            duration: 0.13,
            volume: 0.045
        },
        error: {
            frequency: 260,
            endFrequency: 190,
            duration: 0.14,
            volume: 0.05
        }
    };

    const sound = settings[type] || settings.click;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
        sound.frequency,
        context.currentTime
    );
    oscillator.frequency.exponentialRampToValueAtTime(
        sound.endFrequency,
        context.currentTime + sound.duration
    );

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        sound.volume,
        context.currentTime + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + sound.duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + sound.duration + 0.02);
}

// ==============================
// GAME SOUND SYSTEM
// ==============================

const gameSounds = {

    // 나이트
    knightAttack:
        "sounds/Knight_sword_attack.wav",

    knightSkill1:
        "sounds/Knight_shield_attack.wav",

    knightSkill2:
        "sounds/Knight_sword_energy.mp3",


    // 닌자
    ninjaAttack:
        "sounds/Ninja_shuriken.wav",

    ninjaSkill1:
        "sounds/Ninja_dash.wav",

    ninjaSkill2:
        "sounds/Ninja_shuriken.wav",


    // 마법사
    wizardAttack:
        "sounds/Wizard_fireball.wav",

    wizardSkill1:
        "sounds/Wizard_explosion.wav",

    wizardSkill2:
        "sounds/wizard_barrier.wav",


    // 로봇
    robotAttack:
        "sounds/Robot_hit.wav",

    robotSkill1:
        "sounds/Robot_Emp.mp3",

    robotSkill2:
        "sounds/Robot_explosion.wav",


    // 플레이어 피격
    playerHit:
        "sounds/Player_hit.wav",
    playerWin:
        "sounds/Player_win.wav",
    playerDefeat:
        "sounds/Player_defeat.wav"


};


// ==============================
// 사운드 재생
// ==============================

function playGameSound(
    soundName,
    volume = 0.6
) {

    const src =
        gameSounds[soundName];

    if (!src) {
        return;
    }


    const audio =
        new Audio(src);

    audio.volume =
        volume;


    audio.currentTime =
        0;


    audio.play()
        .catch(() => {
            // 브라우저가 오디오 재생을
            // 차단한 경우 무시
        });

}
function playVictorySound() {

    playGameSound(
        "playerWin",
        0.7
    );

}


function playDefeatSound() {

    playGameSound(
        "playerDefeat",
        0.7
    );

}


// ==============================
// 캐릭터별 공격음
// ==============================

function playCharacterAttackSound(
    character
) {

    if (
        character === "knight"
    ) {

        playGameSound(
            "knightAttack"
        );

    }

    else if (
        character === "ninja"
    ) {

        playGameSound(
            "ninjaAttack"
        );

    }

    else if (
        character === "wizard"
    ) {

        playGameSound(
            "wizardAttack"
        );

    }

    else if (
        character === "robot"
    ) {

        playGameSound(
            "robotAttack"
        );

    }

}


// ==============================
// 캐릭터별 스킬음
// ==============================

function playCharacterSkillSound(
    character,
    skill
) {

    if (
        character === "knight"
    ) {

        if (skill === 1) {

            playGameSound(
                "knightSkill1"
            );

        }

        else if (skill === 2) {

            playGameSound(
                "knightSkill2"
            );

        }

    }

    else if (
        character === "ninja"
    ) {

        if (skill === 1) {

            playGameSound(
                "ninjaSkill1"
            );

        }

        else if (skill === 2) {

            playGameSound(
                "ninjaSkill2"
            );

        }

    }

    else if (
        character === "wizard"
    ) {

        if (skill === 1) {

            playGameSound(
                "wizardSkill1"
            );

        }

        else if (skill === 2) {

            playGameSound(
                "wizardSkill2"
            );

        }

    }

    else if (
        character === "robot"
    ) {

        if (skill === 1) {

            playGameSound(
                "robotSkill1"
            );

        }

        else if (skill === 2) {

            playGameSound(
                "robotSkill2"
            );

        }

    }

}



// ==============================

// 캐릭터

// ==============================



const characters = {

    knight: {

        name: "나이트",

        icon: "⚔️",

        description:
            "근접전에서 강력한 전투형 캐릭터",

        hp: 120,

        damage: 15,

        speed: 90,

        range: 100,

        basicAttack: "근접 검격",

        maxAmmo: 8,

        reloadTime: 1200,

        skill1Name: "방패 강타",

        skill1Cooldown: 3000,

        skill2Name: "검의 충격파",

        skill2Cooldown: 4500

    },


    ninja: {

        name: "닌자",

        icon: "🥷",

        description:
            "빠른 이동과 지속 피해에 특화된 기동형 캐릭터",

        hp: 90,

        damage: 10,

        speed: 130,

        range: 300,

        basicAttack: "수리검",

        maxAmmo: 6,

        reloadTime: 1500,

        skill1Name: "연속 대시 베기",

        skill1Cooldown: 4000,

        skill2Name: "독 수리검",

        skill2Cooldown: 5000

    },


    wizard: {

        name: "마법사",

        icon: "🧙",

        description:
            "긴 사거리와 강력한 마법 공격을 사용하는 원거리 캐릭터",

        hp: 80,

        damage: 12,

        speed: 85,

        range: 350,

        basicAttack: "파이어볼",

        maxAmmo: 5,

        reloadTime: 1800,

        skill1Name: "대형 파이어볼",

        skill1Cooldown: 4000,

        skill2Name: "마법 방어막",

        skill2Cooldown: 6000

    },


    robot: {

        name: "로봇",

        icon: "🤖",

        description:
            "높은 체력과 강력한 순간 화력을 가진 중전투형 캐릭터",

        hp: 140,

        damage: 18,

        speed: 100,

        range: 100,

        basicAttack: "근접 공격",

        maxAmmo: 7,

        reloadTime: 1400,

        skill1Name: "EMP 폭발",

        skill1Cooldown: 4500,

        skill2Name: "미사일 발사",

        skill2Cooldown: 5000

    }

};
// ==============================
// 캐릭터별 스킬 목록
// ==============================

const characterSkillPool = {

    knight: [
        {
            id: "shieldBash",
            name: "방패 강타",
            description: "방패로 적을 강하게 공격합니다."
        },
        {
            id: "swordWave",
            name: "검의 충격파",
            description: "검기를 날려 원거리 공격을 합니다."
        },
        {
            id: "dashSlash",
            name: "돌진 베기",
            description: "적을 향해 빠르게 돌진하며 공격합니다."
        },
        {
            id: "spinSlash",
            name: "회전 베기",
            description: "주변의 적을 회전하며 공격합니다."
        },
        {
            id: "groundSmash",
            name: "지면 강타",
            description: "지면을 내려쳐 주변에 피해를 줍니다."
        },
        {
            id: "counter",
            name: "반격",
            description: "잠시 동안 적의 공격에 대응합니다."
        }
    ],


    ninja: [
        {
            id: "dashSlash",
            name: "연속 대시 베기",
            description: "빠르게 이동하며 여러 번 공격합니다."
        },
        {
            id: "poisonShuriken",
            name: "독 수리검",
            description: "적에게 지속 피해를 주는 수리검을 던집니다."
        },
        {
            id: "smoke",
            name: "연막",
            description: "연막을 만들어 적의 움직임을 방해합니다."
        },
        {
            id: "shurikenRain",
            name: "수리검 난사",
            description: "여러 개의 수리검을 빠르게 발사합니다."
        },
        {
            id: "shadowStep",
            name: "그림자 이동",
            description: "짧은 거리를 순간적으로 이동합니다."
        },
        {
            id: "tripleStrike",
            name: "삼연격",
            description: "빠르게 세 번 공격합니다."
        }
    ],


    wizard: [
        {
            id: "bigFireball",
            name: "대형 파이어볼",
            description: "강력한 대형 화염구를 발사합니다."
        },
        {
            id: "barrier",
            name: "마법 방어막",
            description: "일정 시간 동안 피해를 막습니다."
        },
        {
            id: "ice",
            name: "빙결",
            description: "적의 움직임을 둔화시킵니다."
        },
        {
            id: "teleport",
            name: "순간이동",
            description: "짧은 거리를 순간이동합니다."
        },
        {
            id: "meteor",
            name: "메테오",
            description: "지정한 위치에 강력한 공격을 합니다."
        },
        {
            id: "magicArrow",
            name: "마법 화살",
            description: "빠른 마법 투사체를 발사합니다."
        }
    ],


    robot: [
        {
            id: "emp",
            name: "EMP 폭발",
            description: "주변의 적에게 강력한 전자기 공격을 합니다."
        },
        {
            id: "missile",
            name: "미사일 발사",
            description: "적을 추적하는 미사일을 발사합니다."
        },
        {
            id: "rocketPunch",
            name: "로켓 펀치",
            description: "강력한 근접 공격을 합니다."
        },
        {
            id: "laser",
            name: "레이저",
            description: "전방으로 강력한 레이저를 발사합니다."
        },
        {
            id: "armor",
            name: "강화 장갑",
            description: "받는 피해를 감소시킵니다."
        },
        {
            id: "drone",
            name: "공격 드론",
            description: "공격 드론을 소환합니다."
        }
    ]

};





// ==============================

// DOM

// ==============================



const startScreen =

    document.getElementById("startScreen");



const gameScreen =

    document.getElementById("gameScreen");



const roomPanel =

    document.getElementById("roomPanel");


const authPanel =

    document.getElementById("authPanel");


const loginPanel =

    document.getElementById("loginPanel");


const accountPanel =

    document.getElementById("accountPanel");


const usernameInput =

    document.getElementById("usernameInput");


const passwordInput =

    document.getElementById("passwordInput");


const loginButton =

    document.getElementById("loginButton");


const registerButton =

    document.getElementById("registerButton");


const logoutButton =

    document.getElementById("logoutButton");


const authMessage =

    document.getElementById("authMessage");


const accountText =

    document.getElementById("accountText");


const profileButton =

    document.getElementById("profileButton");


const profilePanel =

    document.getElementById("profilePanel");


const profileCloseButton =

    document.getElementById("profileCloseButton");


const profileUsername =

    document.getElementById("profileUsername");


const profileWins =

    document.getElementById("profileWins");


const profileLosses =

    document.getElementById("profileLosses");


const profileGames =

    document.getElementById("profileGames");


const profileWinRate =

    document.getElementById("profileWinRate");


const profileSummary =

    document.getElementById("profileSummary");



const roomInfo =

    document.getElementById("roomInfo");



const roomCodeInput =

    document.getElementById("roomCodeInput");



const roomCodeText =

    document.getElementById("roomCodeText");



const roomStatus =

    document.getElementById("roomStatus");



const createRoomButton =

    document.getElementById("createRoomButton");



const joinRoomButton =

    document.getElementById("joinRoomButton");



const deleteRoomButton =

    document.getElementById("deleteRoomButton");



const characterSelect =

    document.getElementById("characterSelect");



const characterCards =

    document.querySelectorAll(

        ".character-card"

    );
const characterPickerModal =
    document.getElementById(
        "characterPickerModal"
    );


const characterPickerClose =
    document.getElementById(
        "characterPickerClose"
    );


const characterPreviewButton =
    document.getElementById(
        "characterPreviewButton"
    );
const characterDetail =
    document.getElementById(
        "characterDetail"
    );

const detailIcon =
    document.getElementById(
        "detailIcon"
    );

const detailName =
    document.getElementById(
        "detailName"
    );

const detailDescription =
    document.getElementById(
        "detailDescription"
    );

const detailHp =
    document.getElementById(
        "detailHp"
    );

const detailDamage =
    document.getElementById(
        "detailDamage"
    );

const detailSpeed =
    document.getElementById(
        "detailSpeed"
    );

const detailRange =
    document.getElementById(
        "detailRange"
    );

const detailBasicAttack =
    document.getElementById(
        "detailBasicAttack"
    );


const skillSlotQ =
    document.getElementById(
        "skillSlotQ"
    );


const skillSlotE =
    document.getElementById(
        "skillSlotE"
    );


const selectedSkillQ =
    document.getElementById(
        "selectedSkillQ"
    );


const selectedSkillE =
    document.getElementById(
        "selectedSkillE"
    );


const skillPicker =
    document.getElementById(
        "skillPicker"
    );


const skillPickerTitle =
    document.getElementById(
        "skillPickerTitle"
    );


const skillCount =
    document.getElementById(
        "skillCount"
    );


const skillOptionList =
    document.getElementById(
        "skillOptionList"
    );


const skillSelectionStatus =
    document.getElementById(
        "skillSelectionStatus"
    );


const loadoutMainIcon =
    document.getElementById(
        "loadoutMainIcon"
    );


const loadoutMainName =
    document.getElementById(
        "loadoutMainName"
    );


const selectCharacterButton =
    document.getElementById(
        "selectCharacterButton"
    );



const selectedCharacterText =

    document.getElementById(

        "selectedCharacter"

    );



const readyButton =

    document.getElementById(

        "readyButton"

    );



const readyStatus =

    document.getElementById(

        "readyStatus"

    );



const player =

    document.getElementById(

        "player"

    );



const enemy =

    document.getElementById(

        "enemy"

    );



const gameArea =

    document.getElementById(

        "gameArea"

    );



const rangeIndicator =

    document.getElementById(

        "rangeIndicator"

    );



const aimLine =

    document.getElementById(

        "aimLine"

    );



const ping =

    document.getElementById(

        "ping"

    );


const attackEffect =

    document.getElementById(

        "attackEffect"

    );



const skillEffect =

    document.getElementById(

        "skillEffect"

    );



const hpBar =

    document.getElementById(

        "hpBar"

    );



const hpText =

    document.getElementById(

        "hpText"

    );



const playerName =

    document.getElementById(

        "playerName"

    );



const normalAttackText =

    document.getElementById(

        "normalAttackText"

    );



const skill1Name =

    document.getElementById(

        "skill1Name"

    );



const skill2Name =

    document.getElementById(

        "skill2Name"

    );



const skill1Cooldown =

    document.getElementById(

        "skill1Cooldown"

    );



const skill2Cooldown =

    document.getElementById(

        "skill2Cooldown"

    );



const message =

    document.getElementById(

        "message"

    );



const menuButton =

    document.getElementById(

        "menuButton"

    );



const ammoBar =

    document.getElementById(

        "ammoBar"

    );



const ammoText =

    document.getElementById(

        "ammoText"

    );
const resultOverlay =
    document.getElementById("resultOverlay");

const resultBox =
    document.getElementById("resultBox");

const resultIcon =
    document.getElementById("resultIcon");

const resultTitle =
    document.getElementById("resultTitle");

const resultSubtitle =
    document.getElementById("resultSubtitle");

const resultCharacter =
    document.getElementById("resultCharacter");

const resultButton =
    document.getElementById("resultButton");

resultButton.addEventListener(
    "click",
    () => {

        // 결과 화면 숨기기
        resultOverlay.style.display = "none";

        // 게임 화면 숨기기
        gameScreen.style.display = "none";

        // 같은 방의 캐릭터 선택 화면으로 복귀
        startScreen.style.display = "flex";
        roomPanel.style.display = "none";
        roomInfo.style.display = "block";
        
        characterDetail.style.display = "block";
        showCharacterDetail(selectedCharacter);

        // 게임 상태 초기화
        gameRunning = false;

        // 결과 화면 상태 초기화
        resultBox.classList.remove("defeat");

        // 기존 메시지 초기화
        message.textContent = "";

    }
);




// ==============================

// 상태

// ==============================



let myId = null;



let roomCode = null;



let selectedCharacter = "knight";



let gameRunning = false;



let keys = {};



let players = {};



let projectiles = {};



let pingDirection = {

    x: 1,

    y: 0

};



let mouseX = 0;



let mouseY = 0;



let cooldownTimers = {

    1: null,

    2: null

};
let myHpBar = null;
let enemyHpBar = null;

let aimpoint = null;
let aimPoint = null;

myHpBar = createHpBar(player);
enemyHpBar = createHpBar(enemy);

let attackRangeIndicator = null;
let attackRangeTimer = null;



// ==============================
// 로그인 / 회원가입
// ==============================

let currentUser = null;

function getAuthToken() {
    return localStorage.getItem("onlineArenaToken");
}

function setAuthMessage(text) {
    authMessage.textContent = text;
}

function showLoggedOutUI() {
    loginPanel.style.display = "block";
    accountPanel.style.display = "none";
    profilePanel.style.display = "none";
    roomPanel.style.display = "none";
    roomInfo.style.display = "none";
    characterSelect.style.display = "none";
    gameScreen.style.display = "none";
}

function showLoggedInUI(user) {
    currentUser = user;
    loginPanel.style.display = "none";
    accountPanel.style.display = "flex";
    profilePanel.style.display = "none";
    accountText.textContent = user.username;
    updateProfileUI(user);
    roomPanel.style.display = "flex";
    roomInfo.style.display = "none";
    characterSelect.style.display = "none";
    gameScreen.style.display = "none";
    authMessage.textContent = "";
}

function updateProfileUI(user) {
    if (!user) return;

    const wins = Number(user.wins || 0);
    const losses = Number(user.losses || 0);
    const games = wins + losses;
    const winRate = games === 0 ? 0 : Math.round((wins / games) * 1000) / 10;

    profileUsername.textContent = user.username;
    profileWins.textContent = wins;
    profileLosses.textContent = losses;
    profileGames.textContent = games;
    profileWinRate.textContent = `${winRate}%`;

    if (games === 0) {
        profileSummary.textContent = "아직 전적이 없습니다. 첫 경기를 시작해보세요!";
    } else if (wins > losses) {
        profileSummary.textContent = `현재 ${games}경기에서 ${wins}승을 기록하고 있습니다. 좋은 흐름이에요!`;
    } else if (wins < losses) {
        profileSummary.textContent = `현재 ${games}경기를 플레이했습니다. 다음 경기에서 반전을 노려보세요!`;
    } else {
        profileSummary.textContent = `${games}경기 ${wins}승 ${losses}패로 승패가 팽팽합니다.`;
    }
}

async function refreshProfile() {
    const token = getAuthToken();
    if (!token) return;

    try {
        const response = await fetch("/api/me", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();
        currentUser = data.user;
        updateProfileUI(currentUser);
    } catch (error) {
        // 프로필 갱신 실패는 게임 진행을 막지 않습니다.
    }
}

profileButton.addEventListener("click", async () => {
    if (!currentUser) return;
    await refreshProfile();
    updateProfileUI(currentUser);
    profilePanel.style.display = "block";
});

profileCloseButton.addEventListener("click", () => {
    profilePanel.style.display = "none";
});

async function authRequest(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "요청에 실패했습니다.");
    }

    return data;
}

async function login() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        setAuthMessage("아이디와 비밀번호를 입력하세요.");
        return;
    }

    try {
        setAuthMessage("로그인 중...");

        const data = await authRequest("/api/login", {
            username,
            password
        });

        localStorage.setItem("onlineArenaToken", data.token);
        showLoggedInUI(data.user);

        socket.emit("authenticate", data.token);
    } catch (error) {
        setAuthMessage(error.message);
    }
}

async function register() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        setAuthMessage("아이디와 비밀번호를 입력하세요.");
        return;
    }

    try {
        setAuthMessage("회원가입 중...");

        await authRequest("/api/register", {
            username,
            password
        });

        setAuthMessage("회원가입 완료! 이제 로그인하세요.");
        passwordInput.value = "";
    } catch (error) {
        setAuthMessage(error.message);
    }
}

async function checkLogin() {
    const token = getAuthToken();

    if (!token) {
        showLoggedOutUI();
        return;
    }

    try {
        const response = await fetch("/api/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("로그인 세션이 만료되었습니다.");
        }

        const data = await response.json();
        showLoggedInUI(data.user);
        socket.emit("authenticate", token);
    } catch (error) {
        localStorage.removeItem("onlineArenaToken");
        currentUser = null;
        showLoggedOutUI();
        setAuthMessage(error.message);
    }
}

loginButton.addEventListener("click", login);
registerButton.addEventListener("click", register);

passwordInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        login();
    }
});

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("onlineArenaToken");
    currentUser = null;
    socket.emit("logout");
    showLoggedOutUI();
    usernameInput.value = "";
    passwordInput.value = "";
    setAuthMessage("로그아웃되었습니다.");
});

checkLogin();


// ==============================

// Socket 연결

// ==============================



socket.on(

    "connect",

    () => {



        myId =

            socket.id;



    }

);





// ==============================

// 방 만들기

// ==============================



createRoomButton.addEventListener(

    "click",

    () => {

        if (!currentUser) {
            setAuthMessage("먼저 로그인하세요.");
            return;
        }

        socket.emit(

            "createRoom"

        );



    }

);





// ==============================

// 방 참가

// ==============================



joinRoomButton.addEventListener(

    "click",

    () => {

        if (!currentUser) {
            setAuthMessage("먼저 로그인하세요.");
            return;
        }

        const code =

            roomCodeInput

                .value

                .trim()

                .toUpperCase();





        if (code.length !== 6) {



            showRoomError(

                "6자리 방 코드를 입력하세요."

            );



            return;

        }





        socket.emit(

            "joinRoom",

            code

        );



    }

);





// Enter로 참가



roomCodeInput.addEventListener(

    "keydown",

    event => {



        if (

            event.key === "Enter"

        ) {



            joinRoomButton.click();



        }



    }

);





// ==============================

// 방 삭제

// ==============================



deleteRoomButton.addEventListener(

    "click",

    () => {



        socket.emit(

            "deleteRoom"

        );



    }

);





// ==============================

// 방 입장

// ==============================



function enterRoom(code) {



    roomCode = code;





    roomPanel.style.display =

        "none";





    roomInfo.style.display =

        "block";





    characterSelect.style.display =

        "block";





    roomCodeText.textContent =

        `방 코드: ${code}`;





    roomStatus.textContent =

        "상대방을 기다리는 중...";





    readyStatus.textContent =

        "캐릭터를 선택하세요.";





    readyButton.textContent =

        "준비";





    gameScreen.style.display =

        "none";





    startScreen.style.display =

        "flex";



}





// ==============================

// 방 오류

// ==============================



function showRoomError(

    text

) {



    roomStatus.textContent =

        text;





    roomInfo.style.display =

        "block";





    roomPanel.style.display =

        "flex";



}





// ==============================

// 방 생성

// ==============================



socket.on(

    "roomCreated",

    data => {



        enterRoom(

            data.roomCode

        );



    }

);





// ==============================

// 방 참가

// ==============================



socket.on(

    "roomJoined",

    data => {



        enterRoom(

            data.roomCode

        );



    }

);





// ==============================

// 오류

// ==============================



socket.on(

    "roomError",

    text => {



        showRoomError(

            text

        );



    }

);





// ==============================
// 캐릭터 상세 정보
// ==============================

let detailCharacter = "knight";
// ==============================
// 현재 선택한 스킬
// ==============================

let selectedSkillLoadout = {
    1: null, // E
    2: null  // Q
};


let activeSkillSlot = null;


// ==============================
// 캐릭터 상세 정보
// ==============================

function showCharacterDetail(
    character
) {

    const data =
        characters[character];

    if (!data) {
        return;
    }


    detailCharacter =
        character;


    // 캐릭터 정보

    detailIcon.textContent =
        data.icon;

    detailName.textContent =
        data.name;

    detailDescription.textContent =
        data.description;


    // 기본 공격

    detailBasicAttack.textContent =
        data.basicAttack;


    // 중앙 캐릭터

    loadoutMainIcon.textContent =
        data.icon;

    loadoutMainName.textContent =
        data.name;


    // 스킬 초기화

    selectedSkillLoadout = {
        1: null,
        2: null
    };


    selectedSkillQ.textContent =
        "+";

    selectedSkillE.textContent =
        "+";


    skillPicker.style.display =
        "none";


    updateSkillSelectionStatus();


    characterDetail.style.display =
        "block";

}
// ==============================
// 스킬 선택창 열기
// ==============================

function openSkillPicker(
    slot
) {

    activeSkillSlot =
        slot;


    skillPickerTitle.textContent =
        slot === 2
            ? "Q 스킬 선택"
            : "E 스킬 선택";


    skillOptionList.innerHTML =
        "";


    const skills =
        characterSkillPool[
            detailCharacter
        ] || [];


    skills.forEach(
        skill => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "skill-option";


            // 이미 다른 슬롯에서 사용 중인지 확인

            const otherSlot =
                slot === 1
                    ? 2
                    : 1;


            const alreadyUsed =
                selectedSkillLoadout[
                    otherSlot
                ] === skill.id;


            if (alreadyUsed) {

                button.classList.add(
                    "disabled"
                );

                button.disabled = true;

            }


            button.innerHTML = `

                <strong>
                    ${skill.name}
                </strong>

                <span>
                    ${skill.description}
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    selectSkill(
                        slot,
                        skill
                    );

                }
            );


            skillOptionList.appendChild(
                button
            );

        }
    );


    skillPicker.style.display =
        "block";


    updateSkillCount();

}
// ==============================
// 스킬 선택
// ==============================

function selectSkill(
    slot,
    skill
) {

    selectedSkillLoadout[
        slot
    ] = skill.id;


    if (slot === 2) {

        selectedSkillQ.textContent =
            skill.name;

    } else {

        selectedSkillE.textContent =
            skill.name;

    }


    skillPicker.style.display =
        "none";


    activeSkillSlot =
        null;


    updateSkillCount();

    updateSkillSelectionStatus();

}
// ==============================
// 선택 개수
// ==============================

function updateSkillCount() {

    let count = 0;


    if (
        selectedSkillLoadout[1]
    ) {

        count++;

    }


    if (
        selectedSkillLoadout[2]
    ) {

        count++;

    }


    skillCount.textContent =
        `${count} / 2`;

}
// ==============================
// 스킬 선택 상태
// ==============================

function updateSkillSelectionStatus() {

    const count =
        Number(
            Boolean(
                selectedSkillLoadout[1]
            )
        ) +
        Number(
            Boolean(
                selectedSkillLoadout[2]
            )
        );


    if (count === 0) {

        skillSelectionStatus.textContent =
            "스킬을 2개 선택하세요.";

    }

    else if (count === 1) {

        skillSelectionStatus.textContent =
            "스킬을 1개 더 선택하세요.";

    }

    else {

        skillSelectionStatus.textContent =
            "✓ 스킬 2개 선택 완료";

    }

}
// ==============================
// Q / E 스킬 슬롯 클릭
// ==============================

skillSlotQ.addEventListener(
    "click",
    () => {

        if (gameRunning) {
            return;
        }

        openSkillPicker(2);

    }
);


skillSlotE.addEventListener(
    "click",
    () => {

        if (gameRunning) {
            return;
        }

        openSkillPicker(1);

    }
);


// ==============================
// 캐릭터 카드 클릭
// ==============================

characterCards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {

                if (gameRunning) {
                    return;
                }

                const character =
                    card.dataset.character;

                showCharacterDetail(
                    character
                );
                characterPickerModal.style.display =
                "none";

            }
        );

    }
);
// ==============================
// 캐릭터 선택 팝업 열기
// ==============================

characterPreviewButton.addEventListener(
    "click",
    () => {

        if (gameRunning) {
            return;
        }

        characterPickerModal.style.display =
            "flex";

        playUISound("open");

    }
);
// ==============================
// 캐릭터 선택 팝업 닫기
// ==============================

characterPickerClose.addEventListener(
    "click",
    () => {

        characterPickerModal.style.display =
            "none";

        playUISound("cancel");

    }
);


// ==============================
// 캐릭터 선택 버튼
// ==============================

selectCharacterButton.addEventListener(
    "click",
    () => {

        if (gameRunning) {
            return;
        }


        // 스킬 2개 선택 확인

        if (
            !selectedSkillLoadout[1] ||
            !selectedSkillLoadout[2]
        ) {

            skillSelectionStatus.textContent =
                "⚠️ Q와 E 스킬을 모두 선택하세요.";

            return;

        }


        selectedCharacter =
            detailCharacter;


        // 카드 선택 표시
        characterCards.forEach(
            card => {

                card.classList.toggle(
                    "selected",
                    card.dataset.character ===
                        selectedCharacter
                );

            }
        );


        // 선택한 캐릭터 표시
        selectedCharacterText.textContent =
            characters[
                selectedCharacter
            ].name;


        // 서버에 실제 캐릭터 선택 전달
        socket.emit(
            "selectCharacter",
            {
                character:
                    selectedCharacter,

                skillLoadout: {
                    1:
                        selectedSkillLoadout[1],

                    2:
                        selectedSkillLoadout[2]
                }
            }
        );


        readyStatus.textContent =
        `${characters[selectedCharacter].name} 선택 완료 — 스킬 2개를 선택했습니다.`;

    }
);





// ==============================

// 준비

// ==============================



readyButton.addEventListener(
    "click",
    () => {

        if (
            !selectedSkillLoadout[1] ||
            !selectedSkillLoadout[2]
        ) {

            readyStatus.textContent =
                "⚠️ Q와 E 스킬을 먼저 선택하세요.";

            return;

        }


        socket.emit(
            "ready"
        );

    }
);





// ==============================

// 방 상태

// ==============================



socket.on(

    "roomState",

    data => {



        roomCode =

            data.roomCode;





        roomCodeText.textContent =

            `방 코드: ${roomCode}`;





        const list =

            Object.values(

                data.players

            );





        const me =

            data.players[

                myId

            ];





        const other =

            list.find(

                p =>

                    p.id !== myId

            );
// 방장*



        if (

            data.hostId === myId

        ) {



            deleteRoomButton.style.display =

                "inline-block";



        } else {



            deleteRoomButton.style.display =

                "none";



        }
// 상대방*



        if (!other) {



            roomStatus.textContent =

                "상대방을 기다리는 중...";



        } else if (

            me?.ready &&

            other?.ready

        ) {



            roomStatus.textContent =

                "게임 시작 중...";



        } else {



            roomStatus.textContent =

                `상대방: ${

                    characters[

                        other.character

                    ]?.name

                    || "캐릭터"

                }`;



        }
// 내 정보*



        if (me) {



            selectedCharacter =

                me.character;





            selectedCharacterText.textContent =

                characters[

                    me.character

                ].name;





            characterCards.forEach(

                card => {



                    card.classList.toggle(

                        "selected",

                        card.dataset.character ===

                            me.character

                    );



                }

            );





            readyButton.textContent =

                me.ready

                    ? "준비 취소"

                    : "준비";





            readyStatus.textContent =

                me.ready

                    ? "준비 완료"

                    : "준비 버튼을 눌러주세요.";



        }



    }

);





// ==============================

// 게임 시작

// ==============================



socket.on(
    "gameStart",
    () => {

        gameRunning = true;

        playerRenderState = {};
        projectileRenderState = {};

        // HP바 생성
        if (!myHpBar) {
            myHpBar =
                createHpBar(player);
        }

        if (!enemyHpBar) {
            enemyHpBar =
                createHpBar(enemy);
        }

        startScreen.style.display =
            "none";

        gameScreen.style.display =
            "flex";

        message.textContent =
            "마우스로 핑을 찍고 F/E/Q로 공격하세요.";

        updateCharacterUI(
            selectedCharacter
        );

        requestAnimationFrame(
            gameLoop
        );
        createAimUI();

    }
);





// ==============================

// 게임 종료

// ==============================

// ==============================
// 게임 종료
// ==============================

socket.on(
    "gameOver",
    data => {

        gameRunning = false;

        const won =
            data.winnerId === myId;

        resultBox.classList.remove("defeat");

        if (won) {
            
            playVictorySound();
            resultIcon.textContent = "🏆";

            resultTitle.textContent =
                "VICTORY";

            resultSubtitle.textContent =
                "전투에서 승리했습니다!";

        } else {
            playDefeatSound();

            resultIcon.textContent = "💀";

            resultTitle.textContent =
                "DEFEAT";

            resultSubtitle.textContent =
                "전투에서 패배했습니다.";

            resultBox.classList.add("defeat");
        }

        const myCharacter =
            characters[selectedCharacter];

        resultCharacter.textContent =
            `${myCharacter.icon} ${myCharacter.name}`;

        refreshProfile();

        resultOverlay.style.display = "flex";
    }
);







// ==============================

// 방 삭제

// ==============================



socket.on(

    "roomDeleted",

    () => {



        resetToStart();



        roomStatus.textContent =

            "방이 삭제되었습니다.";



    }

);





// ==============================

// 상대방 연결 종료

// ==============================



socket.on(

    "opponentDisconnected",

    () => {



        gameRunning = false;





        gameScreen.style.display =

            "none";





        startScreen.style.display =

            "flex";





        roomPanel.style.display =

            "none";





        roomInfo.style.display =

            "block";





        characterSelect.style.display =

            "block";





        roomStatus.textContent =

            "상대방이 나갔습니다. 새로운 상대방을 기다리는 중...";



    }

);





// ==============================

// 시작 화면 초기화

// ==============================



function resetToStart() {



    roomCode = null;



    gameRunning = false;





    roomPanel.style.display =

        "flex";





    roomInfo.style.display =

        "none";





    characterSelect.style.display =

        "none";





    gameScreen.style.display =

        "none";





    startScreen.style.display =

        "flex";





    roomCodeInput.value =

        "";





    players = {};

    playerRenderState = {};

    projectiles = {};

    projectileRenderState = {};





    document

        .querySelectorAll(

            ".remote-player, .projectile"

        )

        .forEach(

            element => {



                element.remove();



            }

        );



}





// ==============================

// 방으로 돌아가기

// ==============================



menuButton.addEventListener(

    "click",

    () => {



        gameRunning = false;





        gameScreen.style.display =

            "none";





        startScreen.style.display =

            "flex";





        characterSelect.style.display =

            "block";





        roomInfo.style.display =

            "block";





        roomPanel.style.display =

            "none";





        message.textContent =

            "방으로 돌아왔습니다.";



    }

);





// ==============================

// 캐릭터 UI

// ==============================



function updateCharacterUI(

    character

) {



    const data =

        characters[

            character

        ];





    if (!data) {

        return;

    }





    player.textContent =

        data.icon;





    playerName.textContent =

        `🔵 ${data.name}`;





    normalAttackText.textContent =

        data.basicAttack;





    skill1Name.textContent =

        data.skill1Name;





    skill2Name.textContent =

        data.skill2Name;



}





// ==============================

// 키보드

// ==============================



window.addEventListener(

    "keydown",

    event => {



        const key =

            event.key.toLowerCase();





        keys[key] = true;





        if (!gameRunning) {

            return;

        }





        if (key === "f") {



            normalAttack();



        }





        if (key === "e") {



            useSkill(1);



        }





        if (key === "q") {



            useSkill(2);



        }



    }

);





window.addEventListener(

    "keyup",

    event => {



        keys[

            event.key.toLowerCase()

        ] = false;



    }

);





// ==============================

// 마우스 이동

// ==============================



gameArea.addEventListener(

    "mousemove",

    event => {



        const rect =

            gameArea.getBoundingClientRect();





        mouseX =

            event.clientX -

            rect.left;





        mouseY =

            event.clientY -

            rect.top;





        updateAim();



    }

);

function createAttackRangeIndicator() {

    if (attackRangeIndicator) {
        return;
    }

    attackRangeIndicator =
        document.createElement("div");

    attackRangeIndicator.style.position =
        "absolute";

    attackRangeIndicator.style.border =
        "2px solid rgba(255, 255, 255, 0.5)";

    attackRangeIndicator.style.borderRadius =
        "50%";

    attackRangeIndicator.style.background =
        "rgba(255, 255, 255, 0.05)";

    attackRangeIndicator.style.pointerEvents =
        "none";

    attackRangeIndicator.style.zIndex =
        "5";

    attackRangeIndicator.style.display =
        "none";

    gameArea.appendChild(
        attackRangeIndicator
    );
}

function showAttackRange() {

    if (!player) {
        return;
    }

    if (!attackRangeIndicator) {
        createAttackRangeIndicator();
    }

    const me = players[myId];

    if (!me) {
        return;
    }

    let range = 100;

    // ==============================
    // 캐릭터별 일반 공격 사거리
    // ==============================

    if (me.character === "knight") {

        range = 100;

    }

    else if (me.character === "ninja") {

        range = 300;

    }

    else if (me.character === "wizard") {

        range = 350;

    }

    else if (me.character === "robot") {

        range = 100;

    }

    // ==============================
    // 원형 크기
    // ==============================

    const size =
        range * 2;

    attackRangeIndicator.style.width =
        `${size}px`;

    attackRangeIndicator.style.height =
        `${size}px`;

    // ==============================
    // 플레이어 중심에 원 배치
    // ==============================

    const centerX =
        player.offsetLeft +
        player.offsetWidth / 2;

    const centerY =
        player.offsetTop +
        player.offsetHeight / 2;

    attackRangeIndicator.style.left =
        `${centerX - range}px`;

    attackRangeIndicator.style.top =
        `${centerY - range}px`;

    // ==============================
    // 표시
    // ==============================

    attackRangeIndicator.style.display =
        "block";

    clearTimeout(
        attackRangeTimer
    );

    attackRangeTimer =
        setTimeout(
            () => {

                hideAttackRange();

            },
            300
        );
}

function hideAttackRange() {

    if (!attackRangeIndicator) {
        return;
    }

    attackRangeIndicator.style.display =
        "none";
}

function normalAttack() {

    const me = players[myId];

    if (!me) return;

    if (me.ammo <= 0) {

        if (!me.reloading) {
            socket.emit("reload");
        }

        return;
    }

    showAttackRange();

    playCharacterAttackSound(
        me.character
    );

    socket.emit(
        "playerAttack",
        {
            direction:
                pingDirection
        }
    );
}





// ==============================

// 마우스 클릭 = 핑

// ==============================



gameArea.addEventListener(

    "mousedown",

    event => {



        if (!gameRunning) {

            return;

        }





        const rect =

            gameArea.getBoundingClientRect();





        const x =

            event.clientX -

            rect.left;





        const y =

            event.clientY -

            rect.top;





        const me =

            players[myId];





        if (!me) {

            return;

        }





        const centerX =

            me.x + 27.5;





        const centerY =

            me.y + 27.5;





        pingDirection =

            normalize(

                x - centerX,

                y - centerY

            );





        socket.emit(

            "ping",

            pingDirection

        );





        showPing(

            x,

            y

        );





        updateAim();



    }

);





// ==============================

// 정규화

// ==============================



function normalize(

    x,

    y

) {



    const length =

        Math.hypot(

            x,

            y

        );





    if (!length) {



        return {

            x: 1,

            y: 0

        };



    }





    return {



        x:

            x / length,



        y:

            y / length



    };



}





// ==============================

// 핑 표시

// ==============================



function showPing(

    x,

    y

) {



    ping.style.left =

        `${x - 6}px`;





    ping.style.top =

        `${y - 6}px`;





    ping.style.display =

        "block";





    clearTimeout(

        showPing.timer

    );





    showPing.timer =

        setTimeout(

            () => {



                ping.style.display =

                    "none";



            },

            700

        );



}
function createAimUI() {

    if (aimPoint) {
        return;
    }

    aimPoint =
        document.createElement("div");

    aimPoint.className =
        "aim-line";

    aimPoint.style.position =
        "absolute";

    aimPoint.style.height =
        "2px";

    aimPoint.style.background =
        "rgba(255,255,255,0.7)";

    aimPoint.style.transformOrigin =
        "left center";

    aimPoint.style.pointerEvents =
        "none";

    aimPoint.style.zIndex =
        "6";

    gameArea.appendChild(
        aimPoint
    );
}





// ==============================

// 조준선

// ==============================



function updateAim() {



    if (!gameRunning) {

        return;

    }





    const me =

        players[myId];





    if (!me) {

        return;

    }





    const centerX =

        me.x + 27.5;





    const centerY =

        me.y + 27.5;





    const dx =

        mouseX -

        centerX;





    const dy =

        mouseY -

        centerY;





    const distance =

        Math.hypot(

            dx,

            dy

        );





    const angle =

        Math.atan2(

            dy,

            dx

        ) *

        180 /

        Math.PI;





    aimLine.style.display =

        "block";





    aimLine.style.left =

        `${centerX}px`;





    aimLine.style.top =

        `${centerY}px`;





    aimLine.style.width =

        `${Math.min(

            distance,

            500

        )}px`;





    aimLine.style.transform =

        `rotate(${angle}deg)`;





    rangeIndicator.style.display =

        "block";





    rangeIndicator.style.left =

        `${centerX}px`;





    rangeIndicator.style.top =

        `${centerY}px`;





    rangeIndicator.style.transform =

        `rotate(${angle}deg)`;



}





// ==============================

// 이동

// ==============================



// ==============================
// 이동
// ==============================

let lastMove = 0;

const MOVE_SPEED = 100;

// 모든 플레이어를 서버 위치 기준으로 렌더링
let playerRenderState = {};

let projectileRenderState = {};


// ==============================
// 입력 방향
// ==============================

function getInputDirection() {

    let dx = 0;
    let dy = 0;

    if (keys.w) dy--;
    if (keys.s) dy++;
    if (keys.a) dx--;
    if (keys.d) dx++;

    if (dx === 0 && dy === 0) {
        return {
            x: 0,
            y: 0
        };
    }

    const length = Math.hypot(dx, dy);

    return {
        x: dx / length,
        y: dy / length
    };
}


// ==============================
// 서버에 이동 입력 전송
// ==============================

function sendMovement(now) {

    if (
        !gameRunning ||
        now - lastMove < 50
    ) {
        return;
    }

    lastMove = now;

    socket.emit(
        "playerMove",
        getInputDirection()
    );
}


// ==============================
// 플레이어 위치 보간
// ==============================

function updatePlayerInterpolation() {

    const smoothing = 0.35;

    for (
        const id of Object.keys(playerRenderState)
    ) {

        const state =
            playerRenderState[id];

        if (!players[id]) {
            continue;
        }


        // 서버 위치로 부드럽게 이동
        state.x +=
            (state.targetX - state.x)
            * smoothing;

        state.y +=
            (state.targetY - state.y)
            * smoothing;


        // 내 캐릭터
        if (id === myId) {

            player.style.left =
                `${state.x}px`;

            player.style.top =
                `${state.y}px`;

        }

        // 상대 캐릭터
        else {

            enemy.style.left =
                `${state.x}px`;

            enemy.style.top =
                `${state.y}px`;

        }

    }

}


// ==============================
// 투사체 보간
// ==============================

function updateProjectileInterpolation() {

    const smoothing = 0.35;

    for (
        const id of Object.keys(
            projectileRenderState
        )
    ) {

        const state =
            projectileRenderState[id];

        const element =
            projectiles[id];

        if (!element) {
            continue;
        }

        state.x +=
            (state.targetX - state.x)
            * smoothing;

        state.y +=
            (state.targetY - state.y)
            * smoothing;

        element.style.transform =
            `translate3d(
                ${state.x - state.radius}px,
                ${state.y - state.radius}px,
                0
            )`;
    }
}

// ==============================

// 기본 공격

// ==============================



function normalAttack() {

    const me = players[myId];

    if (!me) return;


    // 탄약이 없으면 재장전
    if (me.ammo <= 0) {

        if (!me.reloading) {
            socket.emit("reload");
        }

        return;

    }

    showAttackRange();

    playCharacterAttackSound(
        me.character
    );


    // 재장전 중이어도 현재 남아 있는 탄약으로 공격 가능
    socket.emit(
        "playerAttack",
        {
            direction: pingDirection
        }
    );

}





// ==============================

// 스킬

// ==============================



function useSkill(

    number

) {



    const element =

        number === 1

            ? skill1Cooldown

            : skill2Cooldown;





    if (

        element.dataset.busy === "1"

    ) {



        return;



    }





    element.dataset.busy =

        "1";
    
    
        playCharacterSkillSound(
        selectedCharacter,
        number
    );
    socket.emit(

        "playerSkill",

        {

            skill: number,



            direction:

                pingDirection

        }

    );





    const key =

        number === 1

            ? "skill1Cooldown"

            : "skill2Cooldown";





    const duration =

        characters[

            selectedCharacter

        ][key];





    startCooldown(

        element,

        duration,

        number

    );



}





// ==============================

// 쿨타임

// ==============================



function startCooldown(

    element,

    duration,

    number

) {



    clearInterval(

        cooldownTimers[number]

    );





    const start =

        Date.now();





    element.textContent =

        `${(

            duration / 1000

        ).toFixed(1)}초`;





    cooldownTimers[number] =

        setInterval(

            () => {



                const remaining =

                    Math.max(

                        0,

                        duration -

                        (

                            Date.now() -

                            start

                        )

                    );





                element.textContent =

                    `${(

                        remaining /

                        1000

                    ).toFixed(1)}초`;





                if (

                    remaining <= 0

                ) {



                    clearInterval(

                        cooldownTimers[

                            number

                        ]

                    );





                    element.dataset.busy =

                        "0";





                    element.textContent =

                        "준비";



                }



            },

            100

        );



}





function clearCooldowns() {



    clearInterval(

        cooldownTimers[1]

    );





    clearInterval(

        cooldownTimers[2]

    );





    skill1Cooldown.dataset.busy =

        "0";





    skill2Cooldown.dataset.busy =

        "0";





    skill1Cooldown.textContent =

        "준비";





    skill2Cooldown.textContent =

        "준비";



}





// ==============================

// 서버 게임 상태

// ==============================



// ==============================
// 서버 게임 상태
// ==============================

socket.on(
    "gameState",
    data => {

        // 서버가 보낸 플레이어 상태 저장
        players = {};

        for (const p of data.players) {

            players[p.id] = p;
        }


        // ==========================
        // 플레이어 렌더링 상태 갱신
        // ==========================

        for (const p of data.players) {

            const id = p.id;


            // 처음 받은 위치
            if (!playerRenderState[id]) {

                playerRenderState[id] = {

                    x: p.x,
                    y: p.y,

                    targetX: p.x,
                    targetY: p.y
                };

            }

            // 서버의 최신 위치를 목표 위치로 설정
            else {

                const state =
                    playerRenderState[id];

                const error =
                    Math.hypot(
                        p.x - state.x,
                        p.y - state.y
                    );


                // 너무 크게 차이 나면 즉시 동기화
                if (error > 100) {

                    state.x = p.x;
                    state.y = p.y;
                }


                state.targetX = p.x;
                state.targetY = p.y;
            }
            if (id === myId) {
                updateHpBar(
                    myHpBar,
                    p.hp,
                    p.maxHp
                );
            } else {
                updateHpBar(
                    enemyHpBar,
                    p.hp,
                    p.maxHp
                );
            }
        }


        // 존재하지 않는 플레이어 렌더 상태 삭제
        for (
            const id of Object.keys(
                playerRenderState
            )
        ) {

            if (!players[id]) {

                delete playerRenderState[id];
            }
        }


        // ==========================
        // 내 캐릭터
        // ==========================

        const me =
            players[myId];

        if (me) {

            selectedCharacter =
                me.character;

            updateCharacterUI(
                me.character
            );

            updateHP(
                me.hp,
                me.maxHp
            );

            updateAmmo(
                me.ammo,
                me.maxAmmo,
                me.reloading
            );


            player.style.boxShadow =
                me.shield
                    ? "0 0 35px #b77cff"
                    : "0 0 20px rgba(60,160,255,0.5)";
        }


        // ==========================
        // 상대 캐릭터
        // ==========================

        const other =
            data.players.find(
                p => p.id !== myId
            );

        if (other) {

            enemy.style.display =
                "flex";

            enemy.textContent =
                characters[
                    other.character
                ]?.icon || "⚔️";


            enemy.style.boxShadow =
                other.shield
                    ? "0 0 35px #b77cff"
                    : "0 0 20px rgba(255,70,70,0.45)";
        }

        else {

            enemy.style.display =
                "none";
        }


        // ==========================
        // 투사체
        // ==========================

        renderProjectiles(
            data.projectiles || []
        );
    }
);

// ==============================

// HP

// ==============================



function updateHP(

    hp,

    max

) {



    hpBar.style.width =

        `${Math.max(

            0,

            hp / max * 100

        )}%`;





    hpText.textContent =

        `HP: ${hp} / ${max}`;



}





// ==============================

// 탄창

// ==============================



function updateAmmo(

    ammo,

    max,

    reloading

) {



    ammoBar.style.width =

        `${Math.max(

            0,

            ammo / max * 100

        )}%`;





    ammoText.textContent =

        reloading

            ? "재장전"

            : `${ammo} / ${max}`;



}





// ==============================

// 투사체

// ==============================



function renderProjectiles(

    list

) {



    const active =

        new Set();





    for (

        const projectile of

        list

    ) {



        active.add(

            projectile.id

        );





        let element =

            projectiles[

                projectile.id

            ];





        if (!element) {



            element =

                document.createElement(

                    "div"

                );





            element.className =

                "projectile";





            element.style.position =

                "absolute";





            element.style.pointerEvents =

                "none";





            element.style.zIndex =

                "7";





            gameArea.appendChild(

                element

            );





            projectiles[

                projectile.id

            ] =

                element;



        }





        element.className =

            `projectile projectile-${projectile.type}`;
        if (!projectileRenderState[projectile.id]) {
            projectileRenderState[projectile.id] = { x: projectile.x, y: projectile.y, targetX: projectile.x, targetY: projectile.y, radius: projectile.radius };
        } else {
            projectileRenderState[projectile.id].targetX = projectile.x;
            projectileRenderState[projectile.id].targetY = projectile.y;
            projectileRenderState[projectile.id].radius = projectile.radius;
        }

        const rs = projectileRenderState[projectile.id];
        element.style.left = "0px";
        element.style.top = "0px";
        let rotation = 0;

        if (
            projectile.type === "shuriken" ||
            projectile.type === "poisonShuriken"
        ) {
            rotation =
                performance.now() * 0.5;
        }

        element.style.transform =
            `translate3d(
                ${rs.x - projectile.radius}px,
                ${rs.y - projectile.radius}px,
                0
            ) rotate(${rotation}deg)`;





        element.style.width =

            `${projectile.radius * 2}px`;





        element.style.height =

            `${projectile.radius * 2}px`;





        element.style.borderRadius =

            "50%";





        element.style.display =

            "flex";





        element.style.alignItems =

            "center";





        element.style.justifyContent =

            "center";





        if (
            projectile.type ===
            "shuriken"
        ) {

            element.textContent =
                "✦";

            element.style.color =
                "#ffffff";

            element.style.fontSize =
                "25px";

            element.style.textShadow =
                "0 0 8px white, 0 0 18px #8ee7ff";

            element.style.filter =
                "drop-shadow(0 0 6px white)";

            // 수리검 회전
            element.style.transform =
                `translate3d(
                    ${rs.x - projectile.radius}px,
                    ${rs.y - projectile.radius}px,
                    0
                ) rotate(${performance.now() * 0.5}deg)`;

        }


        else if (
            projectile.type ===
            "poisonShuriken"
        ) {

            element.textContent =
                "✦";

            element.style.color =
                "#75ff5c";

            element.style.fontSize =
                "28px";

            element.style.textShadow =
                "0 0 8px #39ff14, 0 0 20px #39ff14";

            element.style.filter =
                "drop-shadow(0 0 8px #39ff14)";

            element.style.background =
                "radial-gradient(circle, rgba(80,255,40,0.25), transparent 70%)";

        }


        else if (
            projectile.type ===
            "fireball"
        ) {

            element.textContent =
                "🔥";

            element.style.fontSize =
                "25px";

            element.style.filter =
                "drop-shadow(0 0 8px #ff7b22)";

            element.style.textShadow =
                "0 0 15px #ff6a00";

        }


        else if (
            projectile.type ===
            "bigFireball"
        ) {

            element.textContent =
                "🔥";

            element.style.fontSize =
                "45px";

            element.style.filter =
                "drop-shadow(0 0 15px #ff4500)";

            element.style.textShadow =
                "0 0 20px #ff8c00, 0 0 40px #ff4500";

        }


        else if (
            projectile.type ===
            "swordWave"
        ) {

            element.textContent =
                "⚔️";

            element.style.fontSize =
                "30px";

            element.style.filter =
                "drop-shadow(0 0 10px #7ddcff)";

            element.style.textShadow =
                "0 0 15px #7ddcff";

        }



    }





    Object.keys(

        projectiles

    ).forEach(

        id => {



            if (

                !active.has(id)

            ) {



                projectiles[

                    id

                ].remove();





                delete projectiles[

                    id

                ];



            }



        }

    );



}





// ==============================

// 기본 공격 효과

// ==============================



socket.on(

    "normalAttackEffect",

    data => {



        const p =

            players[

                data.playerId

            ];





        if (!p) {

            return;

        }





        showAttackEffect(

            p.x,

            p.y,

            data.character

        );



    }

);





// ==============================
// 스킬 효과
// ==============================

socket.on(
    "skillEffect",
    data => {

        const p =
            players[
                data.playerId
            ];

        if (!p) {
            return;
        }


        // 닌자 대시
        if (
            data.character === "ninja" &&
            data.skill === 1
        ) {

            showDashEffect(
                p.x,
                p.y,
                p.direction
            );

            return;
        }


        // 마법 방어막
        if (
            data.character === "wizard" &&
            data.skill === 2
        ) {

            showShieldEffect(
                p.x,
                p.y
            );

            return;
        }


        showSkillEffect(
            p.x,
            p.y,
            data.character,
            data.skill
        );

    }
);


// ==============================
// 대시 효과
// ==============================

socket.on(
    "dashEffect",
    data => {

        const p =
            players[
                data.playerId
            ];

        if (!p) {
            return;
        }

        showDashEffect(
            p.x,
            p.y,
            p.direction
        );

    }
);


// ==============================
// VFX 생성
// ==============================

function createVFX(
    className,
    x,
    y,
    width,
    height
) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        `skill-vfx ${className}`;

    element.style.position =
        "absolute";

    element.style.left =
        `${x - width / 2}px`;

    element.style.top =
        `${y - height / 2}px`;

    element.style.width =
        `${width}px`;

    element.style.height =
        `${height}px`;

    element.style.pointerEvents =
        "none";

    element.style.zIndex =
        "8";

    element.style.boxSizing =
        "border-box";

    gameArea.appendChild(
        element
    );


    // ==============================
    // VFX 자동 삭제
    // ==============================

    // 모든 스킬 효과는 최대 약 900ms 정도만
    // 화면에 남기 때문에 1.2초 후 제거
    setTimeout(
        () => {

            if (element.isConnected) {

                element.remove();

            }

        },
        1200
    );


    return element;
}

function updateHpBar(
    bar,
    hp,
    maxHp
) {
    if (!bar) {
        return;
    }

    const fill =
        bar.querySelector(".hp-fill");

    if (!fill) {
        return;
    }

    if (
        !Number.isFinite(hp) ||
        !Number.isFinite(maxHp) ||
        maxHp <= 0
    ) {
        return;
    }

    const ratio =
        Math.max(
            0,
            Math.min(
                1,
                hp / maxHp
            )
        );

    fill.style.width =
        `${ratio * 100}%`;
}

function createHpBar(parent) {
    const bar = document.createElement("div");

    bar.className = "hp-bar";

    bar.style.position = "absolute";
    bar.style.width = "55px";
    bar.style.height = "7px";
    bar.style.left = "50%";
    bar.style.top = "-12px";
    bar.style.transform = "translateX(-50%)";

    bar.style.background = "#333";
    bar.style.border = "1px solid #111";
    bar.style.borderRadius = "5px";
    bar.style.overflow = "hidden";
    bar.style.zIndex = "20";

    const fill = document.createElement("div");

    fill.className = "hp-fill";

    fill.style.width = "100%";
    fill.style.height = "100%";
    fill.style.background = "#ff3b3b";
    fill.style.borderRadius = "4px";

    bar.appendChild(fill);
    parent.appendChild(bar);

    return bar;
}

// ==============================
// 나이트 / 닌자 / 마법사 / 로봇
// 스킬 효과
// ==============================

function showSkillEffect(
    x,
    y,
    character,
    skill
) {

    const centerX =
        x + 27.5;

    const centerY =
        y + 27.5;


    // ==========================
    // 나이트
    // ==========================

    if (
        character === "knight"
    ) {

        // 방패 강타
if (skill === 1) {

    // ==============================
    // 강한 중앙 충격
    // ==============================

    const impact =
        createVFX(
            "knight-bash-impact",
            centerX,
            centerY,
            70,
            70
        );

    impact.style.border =
        "4px solid #fff4a3";

    impact.style.borderRadius =
        "50%";

    impact.style.background =
        "radial-gradient(circle, rgba(255,240,150,.55), rgba(255,180,40,.15), transparent 70%)";

    impact.style.boxShadow =
        "0 0 20px #ffd84d, 0 0 45px #ffb52e";

    impact.animate(
        [
            {
                transform:
                    "scale(.1)",
                opacity: 1
            },

            {
                transform:
                    "scale(1)",
                opacity: 1
            },

            {
                transform:
                    "scale(1.5)",
                opacity: 0
            }
        ],
        {
            duration: 280,
            easing: "ease-out"
        }
    );


    // ==============================
    // 방패 충격파
    // ==============================

    const ring =
        createVFX(
            "knight-bash",
            centerX,
            centerY,
            120,
            120
        );

    ring.style.border =
        "5px solid rgba(255,220,100,0.95)";

    ring.style.borderRadius =
        "50%";

    ring.style.background =
        "radial-gradient(circle, transparent 45%, rgba(255,210,70,.08) 60%, transparent 72%)";

    ring.style.boxShadow =
        "0 0 15px #ffd84d, 0 0 35px rgba(255,190,40,.8)";

    ring.animate(
        [
            {
                transform:
                    "scale(.15)",
                opacity: 1
            },

            {
                transform:
                    "scale(1.15)",
                opacity: .9
            },

            {
                transform:
                    "scale(1.8)",
                opacity: 0
            }
        ],
        {
            duration: 400,
            easing: "ease-out"
        }
    );


    // ==============================
    // 충격 방향 선
    // ==============================

    createSlashLines(
        centerX,
        centerY,
        "#ffd84d"
    );


    // ==============================
    // 추가 충격 파티클
    // ==============================

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const particle =
            createVFX(
                "knight-bash-particle",
                centerX,
                centerY,
                6,
                6
            );

        particle.style.background =
            i % 2 === 0
                ? "#fff4a3"
                : "#ffd84d";

        particle.style.borderRadius =
            "50%";

        particle.style.boxShadow =
            "0 0 8px #ffd84d";


        const angle =
            Math.random() *
            Math.PI *
            2;

        const distance =
            30 +
            Math.random() * 45;


        particle.animate(
            [
                {
                    transform:
                        "translate(0,0) scale(1)",
                    opacity: 1
                },

                {
                    transform:
                        `translate(
                            ${Math.cos(angle) * distance}px,
                            ${Math.sin(angle) * distance}px
                        )
                        scale(.2)`,
                    opacity: 0
                }
            ],
            {
                duration:
                    250 +
                    Math.random() * 180,
                easing: "ease-out"
            }
        );
    }
}


        // 검의 충격파
        else if (skill === 2) {

            const wave =
                createVFX(
                    "knight-wave",
                    centerX,
                    centerY,
                    150,
                    150
                );

            wave.style.border =
                "5px solid #ffffff";

            wave.style.borderTopColor =
                "#8ee7ff";

            wave.style.borderBottomColor =
                "#62bfff";

            wave.style.borderRadius =
                "50%";

            wave.style.boxShadow =
                "0 0 20px #62caff";

            wave.animate(
                [
                    {
                        transform:
                            "scale(.1) rotate(0deg)",
                        opacity: 1
                    },

                    {
                        transform:
                            "scale(.9) rotate(180deg)",
                        opacity: .8
                    },

                    {
                        transform:
                            "scale(1.5) rotate(360deg)",
                        opacity: 0
                    }
                ],
                {
                    duration: 450,
                    easing: "ease-out"
                }
            );

            createSlashLines(
                centerX,
                centerY,
                "#8ee7ff"
            );

        }

    }


    // ==========================
    // 닌자
    // ==========================

    else if (
        character === "ninja"
    ) {

        // 독 수리검
        if (skill === 2) {

            const poison =
                createVFX(
                    "ninja-poison",
                    centerX,
                    centerY,
                    80,
                    80
                );

            poison.style.border =
                "3px solid #72ff65";

            poison.style.borderRadius =
                "50%";

            poison.style.boxShadow =
                "0 0 15px #39ff14, 0 0 30px #39ff14";

            poison.style.background =
                "radial-gradient(circle, rgba(100,255,80,.45), rgba(0,255,80,.05) 65%, transparent)";

            poison.animate(
                [
                    {
                        transform:
                            "scale(.2) rotate(0deg)",
                        opacity: 1
                    },

                    {
                        transform:
                            "scale(1.3) rotate(180deg)",
                        opacity: .8
                    },

                    {
                        transform:
                            "scale(1.8) rotate(360deg)",
                        opacity: 0
                    }
                ],
                {
                    duration: 500,
                    easing: "ease-out"
                }
            );

            createPoisonParticles(
                centerX,
                centerY
            );

        }

    }


    // ==========================
    // 마법사
    // ==========================

    else if (
    character === "wizard"
) {

    // ==============================
    // 대형 파이어볼 폭발
    // ==============================

    if (skill === 1) {

        // 중심 폭발
        const fire =
            createVFX(
                "wizard-fire",
                centerX,
                centerY,
                150,
                150
            );

        fire.style.border =
            "5px solid #ff8a3d";

        fire.style.borderRadius =
            "50%";

        fire.style.background =
            "radial-gradient(circle, rgba(255,255,180,.9) 0%, rgba(255,150,30,.65) 30%, rgba(255,60,0,.3) 60%, transparent 75%)";

        fire.style.boxShadow =
            "0 0 20px #fff0a0, 0 0 40px #ffb347, 0 0 70px #ff4500";

        fire.animate(
            [
                {
                    transform:
                        "scale(.15)",
                    opacity: 1
                },

                {
                    transform:
                        "scale(1.15)",
                    opacity: 1
                },

                {
                    transform:
                        "scale(1.8)",
                    opacity: 0
                }
            ],
            {
                duration: 550,
                easing: "cubic-bezier(.1,.7,.3,1)"
            }
        );


        // ==============================
        // 바깥쪽 충격파
        // ==============================

        const shockwave =
            createVFX(
                "wizard-shockwave",
                centerX,
                centerY,
                100,
                100
            );

        shockwave.style.border =
            "4px solid rgba(255,180,60,.9)";

        shockwave.style.borderRadius =
            "50%";

        shockwave.style.boxShadow =
            "0 0 15px #ff9d32";

        shockwave.animate(
            [
                {
                    transform:
                        "scale(.2)",
                    opacity: .9
                },

                {
                    transform:
                        "scale(2.2)",
                    opacity: 0
                }
            ],
            {
                duration: 450,
                easing: "ease-out"
            }
        );


        // ==============================
        // 불꽃 파티클
        // ==============================

        createFireParticles(
            centerX,
            centerY
        );


        // ==============================
        // 추가 불씨
        // ==============================

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const spark =
                createVFX(
                    "wizard-spark",
                    centerX,
                    centerY,
                    6,
                    6
                );

            spark.style.background =
                i % 2 === 0
                    ? "#fff59d"
                    : "#ff7b22";

            spark.style.borderRadius =
                "50%";

            spark.style.boxShadow =
                "0 0 8px #ff9d32";

            const angle =
                Math.random() *
                Math.PI *
                2;

            const distance =
                35 +
                Math.random() * 55;

            spark.animate(
                [
                    {
                        transform:
                            "translate(0,0) scale(1)",
                        opacity: 1
                    },

                    {
                        transform:
                            `translate(
                                ${Math.cos(angle) * distance}px,
                                ${Math.sin(angle) * distance}px
                            )
                            scale(.2)`,
                        opacity: 0
                    }
                ],
                {
                    duration:
                        350 +
                        Math.random() * 250,
                    easing: "ease-out"
                }
            );
        }

    }

}


    // ==========================
    // 로봇
    // ==========================

    else if (
        character === "robot"
    ) {

        // EMP
        if (skill === 1) {

            const emp =
                createVFX(
                    "robot-emp",
                    centerX,
                    centerY,
                    170,
                    170
                );

            emp.style.border =
                "4px solid #4deaff";

            emp.style.borderRadius =
                "50%";

            emp.style.boxShadow =
                "0 0 20px #00eaff, 0 0 45px #008cff";

            emp.style.background =
                "radial-gradient(circle, rgba(0,220,255,.25), transparent 65%)";

            emp.animate(
                [
                    {
                        transform:
                            "scale(.1)",
                        opacity: 1
                    },

                    {
                        transform:
                            "scale(.8)",
                        opacity: .9
                    },

                    {
                        transform:
                            "scale(1.5)",
                        opacity: 0
                    }
                ],
                {
                    duration: 550,
                    easing: "ease-out"
                }
            );

            createElectricLines(
                centerX,
                centerY
            );

        }


        // 미사일
        else if (skill === 2) {

            createExplosion(
                centerX,
                centerY,
                "#ff7b3d",
                150
            );

        }

    }

}


// ==============================
// 닌자 대시
// ==============================

function showDashEffect(
    x,
    y,
    direction
) {

    const centerX =
        x + 27.5;

    const centerY =
        y + 27.5;

    const dir =
        direction ||
        {
            x: 1,
            y: 0
        };


    // ==============================
    // 대시 잔상
    // ==============================

    for (
        let i = 1;
        i <= 4;
        i++
    ) {

        const trailX =
            centerX -
            dir.x * (i * 18);

        const trailY =
            centerY -
            dir.y * (i * 18);

        const trail =
            createVFX(
                "dash-trail",
                trailX,
                trailY,
                48,
                48
            );

        trail.style.borderRadius =
            "50%";

        trail.style.background =
            "radial-gradient(circle, rgba(95,255,224,0.35), rgba(0,255,170,0.08), transparent 70%)";

        trail.style.boxShadow =
            "0 0 12px rgba(95,255,224,0.8)";

        trail.style.opacity =
            String(
                0.65 -
                i * 0.1
            );

        trail.animate(
            [
                {
                    transform:
                        "scale(0.8)",
                    opacity:
                        0.55 -
                        i * 0.08
                },

                {
                    transform:
                        "scale(1.15)",
                    opacity: 0
                }
            ],
            {
                duration:
                    250 +
                    i * 30,
                easing:
                    "ease-out"
            }
        );
    }


    // ==============================
    // 대시 충격파
    // ==============================

    const burst =
        createVFX(
            "dash-burst",
            centerX,
            centerY,
            75,
            75
        );

    burst.style.border =
        "3px solid #5fffe0";

    burst.style.borderRadius =
        "50%";

    burst.style.boxShadow =
        "0 0 15px #5fffe0, 0 0 30px #00ffaa";

    burst.animate(
        [
            {
                transform:
                    "scale(.2)",
                opacity: 1
            },

            {
                transform:
                    "scale(1.5)",
                opacity: 0
            }
        ],
        {
            duration: 220,
            easing: "ease-out"
        }
    );


    // ==============================
    // 대시 방향 속도선
    // ==============================

    const angle =
        Math.atan2(
            dir.y,
            dir.x
        ) *
        180 /
        Math.PI;


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const distance =
            20 + i * 12;

        const line =
            createVFX(
                "dash-line",
                centerX -
                    dir.x *
                    distance,
                centerY -
                    dir.y *
                    distance,
                45,
                4
            );

        line.style.background =
            "#5fffe0";

        line.style.borderRadius =
            "10px";

        line.style.boxShadow =
            "0 0 10px #5fffe0";

        line.style.transform =
            `rotate(${angle}deg)`;

        line.animate(
            [
                {
                    opacity: 0.8,

                    transform:
                        `rotate(${angle}deg)
                         translateX(0)`
                },

                {
                    opacity: 0,

                    transform:
                        `rotate(${angle}deg)
                         translateX(-35px)`
                }
            ],
            {
                duration:
                    180 +
                    i * 20,
                easing:
                    "ease-out"
            }
        );
    }


    // ==============================
    // 검격 효과
    // ==============================

    const slash =
        createVFX(
            "dash-slash",
            centerX +
                dir.x * 28,
            centerY +
                dir.y * 28,
            70,
            12
        );

    slash.style.background =
        "linear-gradient(90deg, transparent, #ffffff, #5fffe0, transparent)";

    slash.style.borderRadius =
        "50%";

    slash.style.boxShadow =
        "0 0 12px #ffffff, 0 0 25px #5fffe0";

    slash.style.transform =
        `rotate(${angle}deg)`;

    slash.animate(
        [
            {
                opacity: 0,
                transform:
                    `rotate(${angle}deg)
                     scaleX(0.2)`
            },

            {
                opacity: 1,
                transform:
                    `rotate(${angle}deg)
                     scaleX(1)`
            },

            {
                opacity: 0,
                transform:
                    `rotate(${angle}deg)
                     scaleX(1.4)`
            }
        ],
        {
            duration: 180,
            easing: "ease-out"
        }
    );
}


function showShieldEffect(
    x,
    y
) {

    const centerX =
        x + 27.5;

    const centerY =
        y + 27.5;


    // ==============================
    // 보호막 본체
    // ==============================

    const shield =
        createVFX(
            "wizard-shield",
            centerX,
            centerY,
            85,
            85
        );

    shield.style.border =
        "3px solid rgba(100,200,255,.95)";

    shield.style.borderRadius =
        "50%";

    shield.style.background =
        "radial-gradient(circle, rgba(100,200,255,.18), rgba(80,150,255,.08) 55%, transparent 75%)";

    shield.style.boxShadow =
        "0 0 15px #64c8ff, 0 0 35px #368cff, inset 0 0 20px rgba(100,200,255,.5)";


    // 보호막이 나타나는 효과
    shield.animate(
        [
            {
                transform:
                    "scale(.5)",
                opacity: 0
            },

            {
                transform:
                    "scale(1)",
                opacity: 1
            },

            {
                transform:
                    "scale(1.08)",
                opacity: .85
            },

            {
                transform:
                    "scale(1)",
                opacity: 1
            }
        ],
        {
            duration: 500,
            easing: "ease-out"
        }
    );


    // ==============================
    // 바깥쪽 마법진
    // ==============================

    const magicCircle =
        createVFX(
            "wizard-magic-circle",
            centerX,
            centerY,
            105,
            105
        );

    magicCircle.style.border =
        "2px dashed rgba(150,220,255,.9)";

    magicCircle.style.borderRadius =
        "50%";

    magicCircle.style.boxShadow =
        "0 0 12px #64c8ff";


    magicCircle.animate(
        [
            {
                transform:
                    "rotate(0deg) scale(.9)",
                opacity: .2
            },

            {
                transform:
                    "rotate(180deg) scale(1)",
                opacity: .8
            },

            {
                transform:
                    "rotate(360deg) scale(.9)",
                opacity: .2
            }
        ],
        {
            duration: 1200,
            easing: "linear"
        }
    );


    // ==============================
    // 작은 마법 파티클
    // ==============================

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const angle =
            (Math.PI * 2 / 8) * i;

        const radius = 42;

        const particle =
            createVFX(
                "shield-particle",
                centerX +
                    Math.cos(angle) * radius,
                centerY +
                    Math.sin(angle) * radius,
                6,
                6
            );

        particle.style.background =
            "#b8e8ff";

        particle.style.borderRadius =
            "50%";

        particle.style.boxShadow =
            "0 0 10px #64c8ff";

        particle.animate(
            [
                {
                    transform:
                        "scale(.5)",
                    opacity: .3
                },

                {
                    transform:
                        "scale(1.4)",
                    opacity: 1
                },

                {
                    transform:
                        "scale(.5)",
                    opacity: .3
                }
            ],
            {
                duration:
                    500 +
                    i * 50,
                iterations:
                    2
            }
        );
    }
}


// ==============================
// 검격 선
// ==============================

function createSlashLines(
    x,
    y,
    color
) {

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const line =
            createVFX(
                "slash-line",
                x,
                y,
                100 + i * 15,
                5
            );

        line.style.background =
            color;

        line.style.borderRadius =
            "10px";

        line.style.boxShadow =
            `0 0 12px ${color}`;

        const angle =
            -35 +
            i * 35;

        line.style.transform =
            `rotate(${angle}deg)`;

        line.animate(
            [
                {
                    opacity: 1,
                    transform:
                        `rotate(${angle}deg) scaleX(.2)`
                },

                {
                    opacity: 0,
                    transform:
                        `rotate(${angle}deg) scaleX(1.2)`
                }
            ],
            {
                duration: 300
            }
        );

    }

}


// ==============================
// 독 파티클
// ==============================

function createPoisonParticles(
    x,
    y
) {

    // ==============================
    // 중앙 독 폭발
    // ==============================

    const burst =
        createVFX(
            "poison-burst",
            x,
            y,
            35,
            35
        );

    burst.style.border =
        "2px solid #5cff5c";

    burst.style.borderRadius =
        "50%";

    burst.style.background =
        "radial-gradient(circle, rgba(92,255,92,0.5), rgba(57,255,20,0.15), transparent 70%)";

    burst.style.boxShadow =
        "0 0 15px #39ff14, 0 0 30px #39ff14";

    burst.animate(
        [
            {
                transform:
                    "scale(0.3)",
                opacity: 1
            },

            {
                transform:
                    "scale(2)",
                opacity: 0
            }
        ],
        {
            duration: 350,
            easing: "ease-out"
        }
    );


    // ==============================
    // 독 파티클
    // ==============================

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const particle =
            createVFX(
                "poison-particle",
                x,
                y,
                7,
                7
            );

        particle.style.background =
            i % 2 === 0
                ? "#5cff5c"
                : "#b6ff70";

        particle.style.borderRadius =
            "50%";

        particle.style.boxShadow =
            "0 0 8px #39ff14, 0 0 15px #39ff14";


        const angle =
            Math.random() *
            Math.PI *
            2;

        const distance =
            25 +
            Math.random() *
            45;


        const startScale =
            0.6 +
            Math.random() *
            0.5;


        const endScale =
            0.2 +
            Math.random() *
            0.4;


        particle.animate(
            [
                {
                    transform:
                        `translate(0,0)
                         scale(${startScale})`,
                    opacity: 1
                },

                {
                    transform:
                        `translate(
                            ${Math.cos(angle) * distance}px,
                            ${Math.sin(angle) * distance}px
                        )
                        scale(${endScale})`,
                    opacity: 0
                }
            ],
            {
                duration:
                    350 +
                    Math.random() * 300,

                easing:
                    "ease-out"
            }
        );
    }


    // ==============================
    // 위로 올라가는 독 연기
    // ==============================

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const smoke =
            createVFX(
                "poison-smoke",
                x +
                    (Math.random() * 20 - 10),
                y +
                    (Math.random() * 20 - 10),
                12,
                12
            );

        smoke.style.borderRadius =
            "50%";

        smoke.style.background =
            "radial-gradient(circle, rgba(92,255,92,0.45), transparent 70%)";

        smoke.style.boxShadow =
            "0 0 10px rgba(57,255,20,0.7)";


        const drift =
            Math.random() * 20 - 10;


        smoke.animate(
            [
                {
                    transform:
                        "translateY(0) scale(0.5)",
                    opacity: 0.7
                },

                {
                    transform:
                        `translate(
                            ${drift}px,
                            -${35 + Math.random() * 20}px
                        )
                        scale(1.4)`,
                    opacity: 0
                }
            ],
            {
                duration:
                    500 +
                    Math.random() * 250,

                easing:
                    "ease-out"
            }
        );
    }
}


// ==============================
// 불꽃 파티클
// ==============================

function createFireParticles(
    x,
    y
) {

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        const particle =
            createVFX(
                "fire-particle",
                x,
                y,
                8,
                8
            );

        particle.style.background =
            i % 2 === 0
                ? "#ffd34d"
                : "#ff5722";

        particle.style.borderRadius =
            "50%";

        particle.style.boxShadow =
            "0 0 10px #ff6a00";

        const angle =
            Math.random() *
            Math.PI *
            2;

        const distance =
            35 +
            Math.random() * 45;

        particle.animate(
            [
                {
                    transform:
                        "translate(0,0) scale(1)",
                    opacity: 1
                },

                {
                    transform:
                        `translate(
                            ${Math.cos(angle) * distance}px,
                            ${Math.sin(angle) * distance}px
                        )
                        scale(.1)`,
                    opacity: 0
                }
            ],
            {
                duration:
                    350 +
                    Math.random() * 250
            }
        );

    }

}


// ==============================
// EMP 전기선
// ==============================

function createElectricLines(
    x,
    y
) {

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const line =
            createVFX(
                "electric-line",
                x,
                y,
                50,
                3
            );

        line.style.background =
            "#63efff";

        line.style.boxShadow =
            "0 0 8px #00eaff";

        const angle =
            (
                i *
                45
            );

        line.style.transform =
            `rotate(${angle}deg)`;

        line.animate(
            [
                {
                    opacity: 1,
                    transform:
                        `rotate(${angle}deg) scaleX(.2)`
                },

                {
                    opacity: 0,
                    transform:
                        `rotate(${angle}deg) scaleX(2)`
                }
            ],
            {
                duration: 350
            }
        );

    }

}


// ==============================
// 폭발
// ==============================

function createExplosion(
    x,
    y,
    color,
    size
) {

    const explosion =
        createVFX(
            "explosion",
            x,
            y,
            size,
            size
        );

    explosion.style.border =
        `5px solid ${color}`;

    explosion.style.borderRadius =
        "50%";

    explosion.style.background =
        `radial-gradient(
            circle,
            rgba(255,230,120,.9) 0%,
            rgba(255,100,30,.5) 35%,
            transparent 70%
        )`;

    explosion.style.boxShadow =
        `0 0 20px ${color},
         0 0 50px ${color}`;

    explosion.animate(
        [
            {
                transform:
                    "scale(.1)",
                opacity: 1
            },

            {
                transform:
                    "scale(.7)",
                opacity: 1
            },

            {
                transform:
                    "scale(1.4)",
                opacity: 0
            }
        ],
        {
            duration: 500,
            easing: "ease-out"
        }
    );


    createFireParticles(
        x,
        y
    );

}
// ==============================
// 피격 효과
// ==============================

socket.on(
    "damageEffect",
    data => {

        const target =
            data.targetId === myId
                ? player
                : enemy;

        if (!target) {
            return;
        }
        if (
            data.targetId === myId
        ) {
            playGameSound(
                "playerHit",
                0.6
            );
        }

        // 캐릭터 흔들림
        target.animate(
            [
                {
                    transform:
                        "translate3d(0, 0, 0) rotate(0deg) scale(1)"
                },
                {
                    transform:
                        "translate3d(-7px, 2px, 0) rotate(-4deg) scale(1.05)"
                },
                {
                    transform:
                        "translate3d(8px, -2px, 0) rotate(4deg) scale(1.05)"
                },
                {
                    transform:
                        "translate3d(-5px, 1px, 0) rotate(-2deg) scale(1.02)"
                },
                {
                    transform:
                        "translate3d(0, 0, 0) rotate(0deg) scale(1)"
                }
            ],
            {
                duration: 180,
                easing: "ease-out"
            }
        );


        // 빨간색 피격 플래시
        const flash =
            document.createElement("div");

        flash.style.position = "absolute";
        flash.style.left =
            `${target.offsetLeft - 5}px`;

        flash.style.top =
            `${target.offsetTop - 5}px`;

        flash.style.width = "65px";
        flash.style.height = "65px";

        flash.style.borderRadius = "50%";

        flash.style.background =
            "rgba(255, 60, 60, 0.45)";

        flash.style.boxShadow =
            "0 0 25px rgba(255, 40, 40, 0.9)";

        flash.style.pointerEvents = "none";
        flash.style.zIndex = "9";

        gameArea.appendChild(flash);


        flash.animate(
            [
                {
                    opacity: 1,
                    transform: "scale(0.7)"
                },
                {
                    opacity: 0,
                    transform: "scale(1.5)"
                }
            ],
            {
                duration: 180,
                easing: "ease-out"
            }
        );


        setTimeout(
            () => flash.remove(),
            200
        );


        // 충격파
        const impact =
            document.createElement("div");

        impact.style.position = "absolute";

        impact.style.left =
            `${target.offsetLeft + 27.5}px`;

        impact.style.top =
            `${target.offsetTop + 27.5}px`;

        impact.style.width = "20px";
        impact.style.height = "20px";

        impact.style.border =
            "3px solid white";

        impact.style.borderRadius = "50%";

        impact.style.boxShadow =
            "0 0 15px white";

        impact.style.pointerEvents = "none";
        impact.style.zIndex = "10";

        gameArea.appendChild(impact);


        impact.animate(
            [
                {
                    opacity: 1,
                    transform:
                        "translate(-50%, -50%) scale(0.3)"
                },
                {
                    opacity: 0,
                    transform:
                        "translate(-50%, -50%) scale(2.5)"
                }
            ],
            {
                duration: 250,
                easing: "ease-out"
            }
        );


        setTimeout(
            () => impact.remove(),
            300
        );


        // 데미지 숫자
        showDamageNumber(
            target.offsetLeft + 27.5,
            target.offsetTop + 5,
            data.damage
        );

    }
);
// ==============================
// 데미지 숫자
// ==============================

function showDamageNumber(
    x,
    y,
    damage
) {

    const number =
        document.createElement("div");

    number.textContent =
        `-${damage}`;

    number.style.position = "absolute";

    number.style.left =
        `${x}px`;

    number.style.top =
        `${y}px`;

    number.style.color = "#ff4444";

    number.style.fontSize = "24px";

    number.style.fontWeight = "900";

    number.style.fontFamily =
        "Arial, sans-serif";

    number.style.textShadow =
        "0 0 5px black, 0 0 12px #ff0000";

    number.style.pointerEvents = "none";

    number.style.zIndex = "20";

    gameArea.appendChild(number);


    number.animate(
        [
            {
                opacity: 0,
                transform:
                    "translate(-50%, 10px) scale(0.7)"
            },
            {
                opacity: 1,
                transform:
                    "translate(-50%, -5px) scale(1.15)"
            },
            {
                opacity: 1,
                transform:
                    "translate(-50%, -20px) scale(1)"
            },
            {
                opacity: 0,
                transform:
                    "translate(-50%, -45px) scale(0.9)"
            }
        ],
        {
            duration: 700,
            easing: "ease-out"
        }
    );


    setTimeout(
        () => number.remove(),
        750
    );

}




// ==============================

// 재장전

// ==============================



socket.on(

    "reloadStart",

    data => {



        if (

            data.playerId ===

            myId

        ) {



            message.textContent =

                "🔄 재장전 중...";



        }



    }

);





socket.on(

    "reloadEnd",

    data => {



        if (

            data.playerId ===

            myId

        ) {



            message.textContent =

                "🔋 재장전 완료!";



        }



    }

);





// ==============================

// 스킬 준비

// ==============================



socket.on(

    "skillReady",

    data => {



        if (

            data.playerId !==

            myId

        ) {



            return;



        }





        const element =

            data.skill === 1

                ? skill1Cooldown

                : skill2Cooldown;





        element.textContent =

            "준비";





        element.dataset.busy =

            "0";



    }

);





// ==============================

// 상대방 핑

// ==============================



socket.on(

    "playerPing",

    data => {



        const p =

            players[

                data.playerId

            ];





        if (!p) {

            return;

        }





        const x =

            p.x +

            27.5 +

            data.direction.x *

            180;





        const y =

            p.y +

            27.5 +

            data.direction.y *

            180;





        showPing(

            x,

            y

        );



    }

);





// ==============================

// 게임 루프

// ==============================



function gameLoop(now) {

    if (!gameRunning) {
        return;
    }

    // 이동 입력 전송
    sendMovement(now);

    // 서버 위치를 기준으로 두 플레이어 모두 보간
    updatePlayerInterpolation();

    // 투사체 보간
    updateProjectileInterpolation();

    // 조준선
    updateAim();

    requestAnimationFrame(
        gameLoop
    );
}





// ==============================

// 초기 상태

// ==============================



startScreen.style.display =

    "flex";





gameScreen.style.display =

    "none";

// ==============================
// UI 효과음 연결
// ==============================

function addUISound(button, type = "click") {
    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        playUISound(type);
    });
}

addUISound(loginButton, "confirm");
addUISound(registerButton, "open");
addUISound(logoutButton, "cancel");
addUISound(createRoomButton, "confirm");
addUISound(joinRoomButton, "confirm");
addUISound(deleteRoomButton, "cancel");
addUISound(selectCharacterButton, "confirm");
addUISound(readyButton, "confirm");
addUISound(resultButton, "open");
addUISound(menuButton, "cancel");
addUISound(profileButton, "open");
addUISound(profileCloseButton, "cancel");

characterCards.forEach(card => {
    card.addEventListener("click", () => {
        if (!gameRunning) {
            playUISound("click");
        }
    });
});
