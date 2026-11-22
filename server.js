const express = require("express");



const http = require("http");



const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const path = require("path");











const app = express();

app.use(express.json());

const db = new Database(path.join(__dirname, "online_arena.sqlite"));

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`).run();

const JWT_SECRET =
    process.env.JWT_SECRET || "online-arena-local-secret-change-this";

function createToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function getTokenFromRequest(req) {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        return null;
    }
    return header.slice(7);
}

function getUserFromToken(token) {
    if (!token) {
        return null;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = db.prepare(
            "SELECT id, username, wins, losses FROM users WHERE id = ?"
        ).get(payload.userId);
        return user || null;
    } catch {
        return null;
    }
}

app.post("/api/register", (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
        return res.status(400).json({
            message: "아이디는 3~16자의 영문, 숫자, 밑줄(_)만 사용할 수 있습니다."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "비밀번호는 6자 이상이어야 합니다."
        });
    }

    const exists = db.prepare(
        "SELECT id FROM users WHERE username = ?"
    ).get(username);

    if (exists) {
        return res.status(409).json({
            message: "이미 사용 중인 아이디입니다."
        });
    }

    const passwordHash = bcrypt.hashSync(password, 12);

    const result = db.prepare(`
        INSERT INTO users (username, password_hash)
        VALUES (?, ?)
    `).run(username, passwordHash);

    return res.status(201).json({
        message: "회원가입이 완료되었습니다.",
        userId: result.lastInsertRowid
    });
});

app.post("/api/login", (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    const user = db.prepare(
        "SELECT * FROM users WHERE username = ?"
    ).get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({
            message: "아이디 또는 비밀번호가 올바르지 않습니다."
        });
    }

    const token = createToken(user);

    return res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            wins: user.wins,
            losses: user.losses
        }
    });
});

app.get("/api/me", (req, res) => {
    const user = getUserFromToken(getTokenFromRequest(req));

    if (!user) {
        return res.status(401).json({
            message: "로그인이 필요합니다."
        });
    }

    return res.json({ user });
});








const server =



    http.createServer(app);







const io =



    new Server(server);











app.use(



    express.static("public")



);



















const WIDTH = 900;



const HEIGHT = 500;



const PLAYER_SIZE = 55;











const rooms = {};











// ==============================*



// 캐릭터 설정*



// ==============================*







const characters = {



    knight: {



        maxHp: 120,



        maxAmmo: 8,

        reloadTime: 1200,



        basicDamage: 15,

        basicRange: 100,



        skill1Damage: 20,

        skill1Range: 120,

        skill1Cooldown: 3000,



        skill2Damage: 25,

        skill2Range: 260,

        skill2Cooldown: 4500



    },





    ninja: {



        maxHp: 90,



        maxAmmo: 6,

        reloadTime: 1500,



        basicDamage: 10,

        basicRange: 300,



        skill1Damage: 8,

        skill1Range: 100,

        skill1Cooldown: 4000,



        skill2Damage: 8,

        skill2Range: 500,

        skill2Cooldown: 5000



    },





    wizard: {



        maxHp: 80,



        maxAmmo: 5,

        reloadTime: 1800,



        basicDamage: 12,

        basicRange: 350,



        skill1Damage: 30,

        skill1Range: 500,

        skill1Cooldown: 4000,



        skill2Damage: 0,

        skill2Range: 0,

        skill2Cooldown: 6000



    },





    robot: {



        maxHp: 140,



        maxAmmo: 7,

        reloadTime: 1400,



        basicDamage: 18,

        basicRange: 100,



        skill1Damage: 25,

        skill1Range: 160,

        skill1Cooldown: 4500,



        skill2Damage: 30,

        skill2Range: 500,

        skill2Cooldown: 5000



    }



};
// ==========================
// 선택 가능한 스킬 정보
// ==========================

const skillDefinitions = {

    // ==========================
    // 나이트
    // ==========================

    shieldBash: {

        name: "방패 강타",

        cooldown: 3000,

        damage: 20,

        type: "melee",

        range: 120

    },


    swordWave: {

        name: "검의 충격파",

        cooldown: 4500,

        damage: 25,

        type: "projectile",

        projectileType:
            "swordWave",

        speed: 9,

        radius: 16,

        life: 900,

        maxDistance: 260

    },


    dashSlash: {

        name: "돌진 베기",

        cooldown: 5000,

        damage: 22,

        type: "dash",

        range: 110

    },


    spinSlash: {

        name: "회전 베기",

        cooldown: 4000,

        damage: 18,

        type: "area",

        range: 140

    },


    groundSmash: {

        name: "지면 강타",

        cooldown: 5000,

        damage: 24,

        type: "area",

        range: 160

    },


    counter: {

        name: "반격",

        cooldown: 6000,

        damage: 25,

        type: "counter"

    }

};



// ==============================*

// 캐릭터 이동속도*

// ==============================*



const CHARACTER_SPEED = {



    knight: 90,

    ninja: 130,

    wizard: 85,

    robot: 100



};

// ==========================*

// 자연 회복*

// ==========================*



const HP_REGEN_AMOUNT = 2;      // 한 번에 회복되는 HP*

const HP_REGEN_INTERVAL = 1000; // 1초마다 회복*











// ==============================*



// 방 코드*



// ==============================*







function generateRoomCode() {







    const chars =



        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";











    let code;











    do {







        code = "";











        for (



            let i = 0;



            i < 6;



            i++



        ) {







            code +=



                chars[



                    Math.floor(



                        Math.random() *



                        chars.length



                    )



                ];







        }







    }



    while (



        rooms[code]



    );











    return code;







}











// ==============================*



// 플레이어 생성*



// ==============================*







function createPlayer(



    id,



    slot



) {







    return {







        id,

        userId: null,

        






        slot,











        x:



            slot === "p1"



                ? 100



                : 745,











        y: 220,











        hp: 120,

        maxHp: 120,











        character:



            "knight",











        ready: false,











        ammo: 8,







        maxAmmo: 8,







        reloading: false,











        shield: false,











        
        skillLoadout: {
            1: null,
            2: null
        },











        direction: {







            x:



                slot === "p1"



                    ? 1



                    : -1,







            y: 0







        },











        pingDirection: {







            x:



                slot === "p1"



                    ? 1



                    : -1,







            y: 0







        },











        dash: null,











        poison: null,

        input: { x: 0, y: 0 }



    };







}











// ==============================*



// 방 가져오기*



// ==============================*







function getRoom(



    socket



) {







    const code =



        socket.data.roomCode;











    if (!code) {



        return null;



    }











    return (



        rooms[code] ||



        null



    );







}











// ==============================*



// 상대 플레이어*



// ==============================*







function opponent(



    room,



    playerId



) {







    return Object.values(



        room.players



    ).find(



        player =>



            player.id !==



            playerId



    ) || null;







}











// ==============================*



// 방향 정규화*



// ==============================*







function normalize(



    x,



    y



) {







    const length =



        Math.hypot(



            x,



            y



        );











    if (



        length === 0



    ) {







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











// ==============================*



// 탄창 갱신*



// ==============================*







function updateAmmo(



    player



) {







    const data =



        characters[



            player.character



        ];











    player.maxAmmo =



        data.maxAmmo;











    player.ammo =



        data.maxAmmo;











    player.reloading =



        false;







}











// ==============================*



// 플레이어 초기화*



// ==============================*







function resetPlayer(



    player



) {







    player.x =



        player.slot === "p1"



            ? 100



            : 745;











    player.y =



        220;











    player.maxHp =

        characters[
            player.character
        ].maxHp;



    player.hp =

        player.maxHp;











    player.ready =



        false;











    player.shield =



        false;











    player.skill1Ready =



        true;











    player.skill2Ready =



        true;











    player.dash =



        null;

    player.input = {

        x: 0,

        y: 0

    };









    player.poison =



        null;











    player.pingDirection =



        player.slot === "p1"



            ? {



                x: 1,



                y: 0



            }



            : {



                x: -1,



                y: 0



            };











    updateAmmo(



        player



    );







}











// ==============================*



// 공개 플레이어 데이터*



// ==============================*







function publicPlayer(



    player



) {







    return {







        id:



            player.id,







        slot:



            player.slot,







        x:



            player.x,







        y:



            player.y,







        hp:



            player.hp,







        maxHp:



            player.maxHp,







        character:



            player.character,







        skillLoadout: {

            1:
                player.skillLoadout?.[1] || null,

            2:
                player.skillLoadout?.[2] || null

        },







        ready:



            player.ready,







        ammo:



            player.ammo,







        maxAmmo:



            player.maxAmmo,







        reloading:



            player.reloading,







        shield:



            player.shield,







        poison:



            !!player.poison,







        direction:



            player.direction







    };







}











// ==============================*



// 방 상태 전송*



// ==============================*







function broadcastRoom(



    room



) {







    io.to(



        room.code



    ).emit(



        "roomState",



        {







            roomCode:



                room.code,







            hostId:



                room.hostId,







            started:



                room.started,







            players:



                Object.fromEntries(







                    Object.entries(



                        room.players



                    ).map(



                        ([id, player]) => [







                            id,







                            publicPlayer(



                                player



                            )







                        ]



                    )







                )







        }



    );







}











// ==============================*



// 게임 상태 전송*



// ==============================*







function broadcastGame(



    room



) {







    io.to(



        room.code



    ).emit(



        "gameState",



        {







            players:



                Object.values(



                    room.players



                ).map(



                    publicPlayer



                ),







            projectiles:



                room.projectiles







        }



    );







}











// ==============================*



// 거리*



// ==============================*







function distance(



    a,



    b



) {







    return Math.hypot(







        (



            a.x +



            PLAYER_SIZE / 2



        )



        -



        (



            b.x +



            PLAYER_SIZE / 2



        ),







        (



            a.y +



            PLAYER_SIZE / 2



        )



        -



        (



            b.y +



            PLAYER_SIZE / 2



        )







    );







}











// ==============================*



// 피해*



// ==============================*







function damage(



    room,



    attacker,



    target,



    amount



) {







    if (



        !target ||



        target.hp <= 0 ||



        target.shield



    ) {







        return false;







    }











    target.hp =



        Math.max(



            0,



            target.hp -



            amount



        );











    io.to(



        room.code



    ).emit(



        "damageEffect",



        {







            attackerId:



                attacker?.id,







            targetId:



                target.id,







            damage:



                amount







        }



    );











    if (



        target.hp <= 0 &&



        attacker



    ) {







        endGame(



            room,



            attacker.id



        );







    }











    return true;







}











// ==============================*



// 근접 공격*



// ==============================*







function melee(



    room,



    player,



    damageAmount,



    range



) {







    const target =



        opponent(



            room,



            player.id



        );











    if (!target) {



        return;



    }











    if (



        target.shield



    ) {







        return;







    }











    if (



        distance(



            player,



            target



        ) <= range



    ) {







        damage(



            room,



            player,



            target,



            damageAmount



        );







    }







}
// ==========================
// 광역 공격
// ==========================

function areaDamage(
    room,
    player,
    damageAmount,
    range
) {

    const target =
        opponent(
            room,
            player.id
        );


    if (!target) {
        return;
    }


    if (
        target.shield
    ) {
        return;
    }


    if (
        distance(
            player,
            target
        ) <= range
    ) {

        damage(
            room,
            player,
            target,
            damageAmount
        );

    }

}











// ==============================*



// 투사체 생성*



// ==============================*







function addProjectile(



    room,



    player,



    type,



    direction



) {







    const settings = {







        shuriken: {

            speed: 11,

            damage: 10,

            radius: 12,

            life: 1000,

            maxDistance: 300

        },











        poisonShuriken: {







            speed: 10,



            damage: 8,



            radius: 13,



            life: 1200,



            maxDistance: 500







        },











        fireball: {

            speed: 8,

            damage: 12,

            radius: 14,

            life: 1500,

            maxDistance: 350

        },











        bigFireball: {







            speed: 7,



            damage: 40,



            radius: 30,



            life: 1700,



            maxDistance: 500







        }







    }[



        type



    ];











    if (!settings) {



        return;



    }











    const d =



        normalize(



            direction.x,



            direction.y



        );











    room.projectiles.push({







        id:



            `${Date.now()}\_${



                Math.random()



                    .toString(36)



                    .slice(2)



            }`,







        ownerId:



            player.id,







        type,







        x:



            player.x +



            PLAYER_SIZE / 2,







        y:



            player.y +



            PLAYER_SIZE / 2,







        vx:



            d.x *



            settings.speed,







        vy:



            d.y *



            settings.speed,







        damage:



            settings.damage,







        radius:



            settings.radius,







        life:



            settings.life,







        maxLife:



            settings.life,







        traveled: 0,







        maxDistance:



            settings.maxDistance







    });







}











// ==============================*



// 닌자 대시*



// ==============================*







function startDash(



    room,



    player,



    direction



) {







    const d =



        normalize(



            direction.x,



            direction.y



        );











    player.dash = {







        direction: d,







        steps: 5,







        stepDistance: 75,







        damage: 8







    };











    io.to(



        room.code



    ).emit(



        "dashEffect",



        {







            playerId:



                player.id,







            direction:



                d







        }



    );







}
// ==========================
// 선택한 스킬 실행
// ==========================

function executeSelectedSkill(
    room,
    player,
    skillId,
    direction
) {

    const skill =
        skillDefinitions[
            skillId
        ];


    if (!skill) {
        return;
    }


    // ==========================
    // 방패 강타
    // ==========================

    if (
        skillId ===
        "shieldBash"
    ) {

        melee(
            room,
            player,
            skill.damage,
            skill.range
        );

        return;

    }


    // ==========================
    // 검의 충격파
    // ==========================

    if (
        skillId ===
        "swordWave"
    ) {

        addProjectile(
            room,
            player,
            "fireball",
            direction
        );


        const projectile =
            room.projectiles[
                room.projectiles.length - 1
            ];


        if (projectile) {

            projectile.type =
                "swordWave";


            projectile.damage =
                skill.damage;


            projectile.vx =
                direction.x *
                skill.speed;


            projectile.vy =
                direction.y *
                skill.speed;


            projectile.radius =
                skill.radius;


            projectile.life =
                skill.life;


            projectile.maxLife =
                skill.life;


            projectile.maxDistance =
                skill.maxDistance;

        }

        return;

    }


    // ==========================
    // 돌진 베기
    // ==========================

    if (
        skillId ===
        "dashSlash"
    ) {

        startDash(
            room,
            player,
            direction
        );


        // 돌진 직후 근처 적에게 공격

        setTimeout(
            () => {

                const currentRoom =
                    rooms[
                        room.code
                    ];


                const currentPlayer =
                    currentRoom?.players[
                        player.id
                    ];


                if (
                    !currentRoom ||
                    !currentPlayer ||
                    !currentRoom.started
                ) {
                    return;
                }


                melee(
                    currentRoom,
                    currentPlayer,
                    skill.damage,
                    skill.range
                );

            },
            180
        );


        return;

    }


    // ==========================
    // 회전 베기
    // ==========================

    if (
        skillId ===
        "spinSlash"
    ) {

        areaDamage(
            room,
            player,
            skill.damage,
            skill.range
        );

        return;

    }


    // ==========================
    // 지면 강타
    // ==========================

    if (
        skillId ===
        "groundSmash"
    ) {

        areaDamage(
            room,
            player,
            skill.damage,
            skill.range
        );

        return;

    }


    // ==========================
    // 반격
    // ==========================

    if (
        skillId ===
        "counter"
    ) {

        player.shield =
            true;


        setTimeout(
            () => {

                const currentRoom =
                    rooms[
                        room.code
                    ];


                const currentPlayer =
                    currentRoom?.players[
                        player.id
                    ];


                if (
                    currentPlayer
                ) {

                    currentPlayer.shield =
                        false;

                }

            },
            1500
        );


        return;

    }

}











function useSkill1(
    room,
    player,
    direction
) {

    if (
        !room.started ||
        !player.skill1Ready
    ) {
        return;
    }


    const skillId =
        player.skillLoadout?.[1];


    const skill =
        skillDefinitions[
            skillId
        ];


    if (!skill) {
        return;
    }


    player.skill1Ready =
        false;


    executeSelectedSkill(
        room,
        player,
        skillId,
        direction
    );


    io.to(
        room.code
    ).emit(
        "skillEffect",
        {
            playerId:
                player.id,

            skill: 1,

            skillId:
                skillId,

            character:
                player.character,

            direction:
                normalize(
                    direction.x,
                    direction.y
                )
        }
    );


    setTimeout(
        () => {

            const currentRoom =
                rooms[
                    room.code
                ];


            const currentPlayer =
                currentRoom?.players[
                    player.id
                ];


            if (
                !currentPlayer
            ) {
                return;
            }


            currentPlayer.skill1Ready =
                true;


            io.to(
                room.code
            ).emit(
                "skillReady",
                {
                    playerId:
                        currentPlayer.id,

                    skill:
                        1,

                    skillId:
                        skillId
                }
            );

        },
        skill.cooldown
    );

}
function useSkill2(
    room,
    player,
    direction
) {

    if (
        !room.started ||
        !player.skill2Ready
    ) {
        return;
    }


    const skillId =
        player.skillLoadout?.[2];


    const skill =
        skillDefinitions[
            skillId
        ];


    if (!skill) {
        return;
    }


    player.skill2Ready =
        false;


    executeSelectedSkill(
        room,
        player,
        skillId,
        direction
    );


    io.to(
        room.code
    ).emit(
        "skillEffect",
        {
            playerId:
                player.id,

            skill: 2,

            skillId:
                skillId,

            character:
                player.character,

            direction:
                normalize(
                    direction.x,
                    direction.y
                )
        }
    );


    setTimeout(
        () => {

            const currentRoom =
                rooms[
                    room.code
                ];


            const currentPlayer =
                currentRoom?.players[
                    player.id
                ];


            if (
                !currentPlayer
            ) {
                return;
            }


            currentPlayer.skill2Ready =
                true;


            io.to(
                room.code
            ).emit(
                "skillReady",
                {
                    playerId:
                        currentPlayer.id,

                    skill:
                        2,

                    skillId:
                        skillId
                }
            );

        },
        skill.cooldown
    );

}























// ==============================*



// 재장전*



// ==============================*







function reload(

    room,

    player

) {



    if (

        player.reloading ||

        player.ammo >= player.maxAmmo

    ) {



        return;



    }





    player.reloading = true;





    const reloadTime =

        characters[

            player.character

        ].reloadTime;





    io.to(

        room.code

    ).emit(

        "reloadStart",

        {



            playerId:

                player.id,



            reloadTime:

                reloadTime



        }

    );





    const reloadOneBullet = () => {



        const currentRoom =

            rooms[

                room.code

            ];





        const currentPlayer =

            currentRoom?.players[

                player.id

            ];





        // 방이나 플레이어가 사라졌으면 중단*

        if (!currentPlayer) {



            return;



        }





        // 이미 탄창이 가득 찼으면 종료*

        if (

            currentPlayer.ammo >=

            currentPlayer.maxAmmo

        ) {



            currentPlayer.reloading =

                false;



            io.to(

                room.code

            ).emit(

                "reloadEnd",

                {



                    playerId:

                        currentPlayer.id



                }

            );



            return;



        }





        // 탄약 1발 충전*

        currentPlayer.ammo += 1;





        // 아직 탄약이 남아 있으면 다음 1발 예약*

        if (

            currentPlayer.ammo <

            currentPlayer.maxAmmo

        ) {



            setTimeout(

                reloadOneBullet,

                reloadTime

            );



        }



        // 마지막 탄약까지 충전했으면 종료*

        else {



            currentPlayer.reloading =

                false;



            io.to(

                room.code

            ).emit(

                "reloadEnd",

                {



                    playerId:

                        currentPlayer.id



                }

            );



        }



    };





    // 첫 번째 탄약 충전*

    setTimeout(

        reloadOneBullet,

        reloadTime

    );



}











// ==============================*



// 게임 종료*



// ==============================*







function endGame(



    room,



    winnerId



) {







    if (!room.started) {



        return;



    }











    room.started =



        false;











    io.to(



        room.code



    ).emit(



        "gameOver",



        {







            winnerId







        }



    );











    for (



        const player of



        Object.values(



            room.players



        )



    ) {

        if (player.userId) {
            if (player.id === winnerId) {
                db.prepare("UPDATE users SET wins = wins + 1 WHERE id = ?").run(player.userId);
            } else {
                db.prepare("UPDATE users SET losses = losses + 1 WHERE id = ?").run(player.userId);
            }
        }







        resetPlayer(



            player



        );







    }











    room.projectiles =



        [];











    broadcastRoom(



        room



    );







}











// ==============================*



// 게임 틱*



// ==============================*







function movementTick() {



    for (const room of Object.values(rooms)) {



        if (!room.started) {

            continue;

        }



        for (const player of Object.values(room.players)) {



            if (player.dash) {

                continue;

            }



            const input =

                player.input || {

                    x: 0,

                    y: 0

                };



            if (

                input.x === 0 &&

                input.y === 0

            ) {

                continue;

            }



            const speed =

                CHARACTER_SPEED[

                    player.character

                ] || 100;



            const step =

                speed / 60;



            player.x +=

                input.x * step;



            player.y +=

                input.y * step;



            player.x =

                Math.max(

                    0,

                    Math.min(

                        WIDTH -

                            PLAYER_SIZE,

                        player.x

                    )

                );



            player.y =

                Math.max(

                    0,

                    Math.min(

                        HEIGHT -

                            PLAYER_SIZE,

                        player.y

                    )

                );

        }

    }

}

function hpRegenTick() {



    for (const room of Object.values(rooms)) {



        if (!room.started) {

            continue;

        }



        for (

            const player of Object.values(room.players)

        ) {



            if (player.hp <= 0) {

                continue;

            }



            if (player.hp >= player.maxHp) {

                continue;

            }



            if (player.shield) {

                continue;

            }



            player.hp = Math.min(

                player.maxHp,

                player.hp + HP_REGEN_AMOUNT

            );

        }

    }

}



function gameTick() {







    const now =



        Date.now();











    for (



        const room of



        Object.values(



            rooms



        )



    ) {







        if (



            !room.started



        ) {







            continue;







        }

// ==========================**

// 대시**

// ==========================**







        for (



            const player of



            Object.values(



                room.players



            )



        ) {







            // ==========================*

            // 대시*

            // ==========================*



            if (

                room.started &&

                player.dash &&

                player.dash.steps > 0

            ) {



                const dash =

                    player.dash;





                player.x +=

                    dash.direction.x *

                    dash.stepDistance;



                player.y +=

                    dash.direction.y *

                    dash.stepDistance;





                player.x =

                    Math.max(

                        0,

                        Math.min(

                            WIDTH -

                                PLAYER_SIZE,

                            player.x

                        )

                    );





                player.y =

                    Math.max(

                        0,

                        Math.min(

                            HEIGHT -

                                PLAYER_SIZE,

                            player.y

                        )

                    );





                melee(

                    room,

                    player,

                    dash.damage,

                    75

                );





                // 공격으로 게임이 끝났다면*

                // endGame()에서 dash가 null이 되었을 수 있음*

                if (

                    !room.started ||

                    !player.dash

                ) {



                    continue;



                }





                player.dash.steps--;





                if (

                    player.dash.steps <= 0

                ) {



                player.dash = null;



                }



            }

// ======================**

// 독 데미지**

// ======================**







            if (



                player.poison



            ) {







                if (



                    now >=



                    player.poison.nextTick



                ) {







                    player.poison.nextTick +=



                        player.poison.tickInterval;











                    player.hp =



                        Math.max(



                            0,



                            player.hp -



                                player.poison



                                    .damagePerTick



                        );











                    if (



                        player.hp <= 0



                    ) {







                        const attacker =



                            room.players[



                                player.poison



                                    .sourceId



                            ];











                        player.poison =



                            null;











                        if (attacker) {







                            endGame(



                                room,



                                attacker.id



                            );







                        }







                    }







                }











                if (



                    player.poison &&



                    now >=



                        player.poison.endTime



                ) {







                    player.poison =



                        null;







                }







            }







        }

// ==========================**

// 투사체**

// ==========================**







        for (



            let i =



                room.projectiles.length -



                1;







            i >= 0;







            i--



        ) {







            const projectile =



                room.projectiles[i];











            projectile.x +=



                projectile.vx;











            projectile.y +=



                projectile.vy;











            projectile.traveled +=



                Math.hypot(



                    projectile.vx,



                    projectile.vy



                );











            projectile.life -=



                50;











            const target =



                Object.values(



                    room.players



                ).find(



                    player =>







                        player.id !==



                            projectile.ownerId &&







                        distancePointPlayer(



                            projectile,



                            player



                        ) <=



                            projectile.radius +



                            PLAYER_SIZE / 2







                );











            if (target) {







                const attacker =



                    room.players[



                        projectile.ownerId



                    ];











                if (



                    attacker &&



                    !target.shield



                ) {







                    damage(



                        room,



                        attacker,



                        target,



                        projectile.damage



                    );



                // 독 수리검**







                    if (



                        projectile.type ===



                            "poisonShuriken" &&



                        target.hp > 0



                    ) {







                        target.poison = {







                            sourceId:



                                attacker.id,







                            damagePerTick:



                                2,







                            tickInterval:



                                500,







                            nextTick:



                                now +



                                500,







                            endTime:



                                now +



                                3000







                        };







                    }







                }











                room.projectiles.splice(



                    i,



                    1



                );











                continue;







            }











            if (







                projectile.life <= 0 ||







                projectile.traveled >=



                    projectile.maxDistance ||







                projectile.x < -50 ||







                projectile.x >



                    WIDTH + 50 ||







                projectile.y < -50 ||







                projectile.y >



                    HEIGHT + 50







            ) {







                room.projectiles.splice(



                    i,



                    1



                );







            }







        }











        broadcastGame(



            room



        );







    }







}











// ==============================*



// 투사체와 플레이어 거리*



// ==============================*







function distancePointPlayer(



    projectile,



    player



) {







    return Math.hypot(







        projectile.x -



            (



                player.x +



                PLAYER_SIZE / 2



            ),







        projectile.y -



            (



                player.y +



                PLAYER_SIZE / 2



            )







    );







}











// ==============================*



// Socket.IO*



// ==============================*







io.on(



    "connection",



    socket => {











        console.log(



            "접속:",



            socket.id



        );

// ==========================**

// 방 만들기**

// ==========================**







        socket.on("authenticate", token => {
            const user = getUserFromToken(token);

            if (!user) {
                socket.emit("authError", {
                    message: "로그인 세션이 만료되었습니다."
                });
                return;
            }

            socket.data.userId = user.id;
            socket.data.username = user.username;

            socket.emit("authenticated", {
                user: {
                    id: user.id,
                    username: user.username,
                    wins: user.wins,
                    losses: user.losses
                }
            });
        });

        socket.on("logout", () => {
            socket.data.userId = null;
            socket.data.username = null;
            socket.data.roomCode = null;
        });


        socket.on(



            "createRoom",



            () => {

                if (!socket.data.userId) {
                    socket.emit("roomError", "로그인이 필요합니다.");
                    return;
                }







                if (



                    socket.data.roomCode



                ) {







                    return;







                }











                const code =



                    generateRoomCode();











                const room = {







                    code,







                    hostId:



                        socket.id,







                    started:



                        false,







                    players: {},







                    projectiles: []







                };











                room.players[



                    socket.id



                ] =



                    createPlayer(



                        socket.id,



                        "p1"



                    );

                room.players[socket.id].userId = socket.data.userId;











                rooms[code] =



                    room;











                socket.join(



                    code



                );











                socket.data.roomCode =



                    code;











                socket.emit(



                    "roomCreated",



                    {







                        roomCode:



                            code







                    }



                );











                broadcastRoom(



                    room



                );







            }



        );

// ==========================**

// 방 참가**

// ==========================**







        socket.on(



            "joinRoom",



            rawCode => {

                if (!socket.data.userId) {
                    socket.emit("roomError", "로그인이 필요합니다.");
                    return;
                }







                if (



                    socket.data.roomCode



                ) {







                    return;







                }











                const code =



                    String(



                        rawCode ||



                        ""



                    )



                    .trim()



                    .toUpperCase();











                const room =



                    rooms[code];











                if (!room) {







                    socket.emit(



                        "roomError",



                        "존재하지 않는 방입니다."



                    );







                    return;







                }











                if (



                    room.started



                ) {







                    socket.emit(



                        "roomError",



                        "이미 게임이 시작된 방입니다."



                    );







                    return;







                }











                if (



                    Object.keys(



                        room.players



                    ).length >= 2



                ) {







                    socket.emit(



                        "roomError",



                        "방이 가득 찼습니다."



                    );







                    return;







                }











                room.players[



                    socket.id



                ] =



                    createPlayer(



                        socket.id,



                        "p2"



                    );

                room.players[socket.id].userId = socket.data.userId;











                socket.join(



                    code



                );











                socket.data.roomCode =



                    code;











                socket.emit(



                    "roomJoined",



                    {







                        roomCode:



                            code







                    }



                );











                broadcastRoom(



                    room



                );







            }



        );

// ==========================
// 캐릭터 + 스킬 선택
// ==========================

socket.on(
    "selectCharacter",
    data => {

        const room =
            getRoom(socket);


        const player =
            room?.players[
                socket.id
            ];


        if (
            !room ||
            room.started ||
            !player
        ) {
            return;
        }


        // 기존에는 character 문자열만 받았지만
        // 이제 캐릭터 + 선택 스킬을 함께 받는다.

        const character =
            data?.character;


        const skillLoadout =
            data?.skillLoadout;


        if (
            !characters[character]
        ) {
            return;
        }


        // Q / E 둘 다 선택되어 있어야 한다.

        if (
            !skillLoadout ||
            !skillLoadout[1] ||
            !skillLoadout[2]
        ) {
            return;
        }


        // 같은 스킬을 Q와 E에 동시에 넣는 것을 방지

        if (
            skillLoadout[1] ===
            skillLoadout[2]
        ) {
            return;
        }


        player.character =
            character;


        player.skillLoadout = {

            1:
                skillLoadout[1],

            2:
                skillLoadout[2]

        };


        player.ready =
            false;


        player.maxHp =
            characters[
                character
            ].maxHp;


        player.hp =
            player.maxHp;


        updateAmmo(
            player
        );


        // 선택한 스킬을 방에 알림

        broadcastRoom(
            room
        );

    }
);









// ==========================**

// ==========================
// 준비
// ==========================

socket.on(
    "ready",
    data => {

        const room =
            getRoom(socket);

        const player =
            room?.players[
                socket.id
            ];

        if (
            !room ||
            room.started ||
            !player
        ) {
            return;
        }

        // 준비 버튼을 누를 때 현재 선택 정보를 함께 받는다.
        // 이렇게 하면 캐릭터/스킬 선택 이벤트와 준비 이벤트가
        // 서로 엇갈려 서버에 선택 정보가 없는 문제를 방지한다.

        const character =
            data?.character;

        const skillLoadout =
            data?.skillLoadout;

        if (
            character &&
            skillLoadout
        ) {

            if (
                !characters[character] ||
                !skillLoadout[1] ||
                !skillLoadout[2] ||
                skillLoadout[1] === skillLoadout[2]
            ) {

                socket.emit(
                    "readyError",
                    "캐릭터와 서로 다른 스킬 2개를 먼저 선택하세요."
                );

                return;
            }

            player.character =
                character;

            player.skillLoadout = {
                1:
                    skillLoadout[1],
                2:
                    skillLoadout[2]
            };

            player.maxHp =
                characters[
                    character
                ].maxHp;

            player.hp =
                player.maxHp;

            updateAmmo(
                player
            );
        }

        // 서버에 저장된 선택 정보가 없으면 준비할 수 없다.
        if (
            !player.character ||
            !player.skillLoadout?.[1] ||
            !player.skillLoadout?.[2]
        ) {

            socket.emit(
                "readyError",
                "캐릭터와 Q/E 스킬을 먼저 선택하세요."
            );

            return;
        }

        player.ready =
            !player.ready;

        const players =
            Object.values(
                room.players
            );

        if (
            players.length === 2 &&
            players.every(
                p =>
                    p.ready
            )
        ) {

            room.started =
                true;

            room.projectiles =
                [];

            for (
                const p of players
            ) {

                p.ready =
                    false;

                p.maxHp =
                    characters[
                        p.character
                    ].maxHp;

                p.hp =
                    p.maxHp;

                p.skill1Ready =
                    true;

                p.skill2Ready =
                    true;

                p.shield =
                    false;

                p.dash =
                    null;

                p.poison =
                    null;

                p.input = {
                    x: 0,
                    y: 0
                };

                updateAmmo(
                    p
                );
            }

            io.to(
                room.code
            ).emit(
                "gameStart"
            );
        }

        broadcastRoom(
            room
        );
    }
);

// ==========================
// 이동
// ==========================

socket.on(



            "playerMove",



            data => {







                const room =



                    getRoom(



                        socket



                    );











                const player =



                    room?.players[



                        socket.id



                    ];











                if (



                    !room ||



                    !room.started ||



                    !player ||



                    player.dash



                ) {







                    return;







                }

                const dx =

                    Number(data?.x) || 0;



                const dy =

                    Number(data?.y) || 0;





                // 아무 키도 누르지 않았으면 정지*

                if (

                    dx === 0 &&

                    dy === 0

                ) {



                    player.input = {

                        x: 0,

                        y: 0

                    };



                }

                else {



                    const direction =

                        normalize(

                            dx,

                            dy

                        );



                    player.input =

                        direction;



                    player.direction =

                        direction;



            } 







            }



        );

// ==========================**

// 핑**

// ==========================**







        socket.on(



    "ping",



    direction => {



        const room =

            getRoom(

                socket

            );



        const player =

            room?.players[

                socket.id

            ];



        if (

            !room ||

            !room.started ||

            !player

        ) {



            return;



        }



        player.pingDirection =

            normalize(

                Number(

                    direction?.x

                ) || 0,



                Number(

                    direction?.y

                ) || 0

            );



        socket.emit(

            "playerPing",

            {

                playerId:

                    player.id,



                direction:

                    player.pingDirection

            }

        );



    }

);

// ==========================**

// 기본 공격**

// ==========================**







        socket.on(



            "playerAttack",



            data => {







                const room =



                    getRoom(



                        socket



                    );











                const player =



                    room?.players[



                        socket.id



                    ];











                if (



                    !room ||



                    !room.started ||



                    !player ||



                    player.reloading ||



                    player.ammo <= 0



                ) {







                    return;







                }











                const direction =



                    normalize(







                        Number(



                            data?.direction?.x



                        ) || 0,







                        Number(



                            data?.direction?.y



                        ) || 0







                    );











                player.pingDirection =



                    direction;











                player.ammo--;

// 닌자**







                if (



                    player.character ===



                    "ninja"



                ) {







                    addProjectile(



                        room,



                        player,



                        "shuriken",



                        direction



                    );







                }

// 마법사**







                else if (



                    player.character ===



                    "wizard"



                ) {







                    addProjectile(



                        room,



                        player,



                        "fireball",



                        direction



                    );







                }

// 나이트**







                else if (



                    player.character ===



                    "knight"



                ) {







                    melee(



                        room,



                        player,



                        15,



                        90



                    );







                }

// 로봇**







                else if (



                    player.character ===



                    "robot"



                ) {







                    melee(



                        room,



                        player,



                        12,



                        90



                    );







                }











                io.to(



                    room.code



                ).emit(



                    "normalAttackEffect",



                    {







                        playerId:



                            player.id,







                        character:



                            player.character,







                        direction







                    }



                );











                if (



                    player.ammo <= 0



                ) {







                    reload(



                        room,



                        player



                    );







                }







            }



        );

// ==========================**

// 스킬**

// ==========================**







        socket.on(



            "playerSkill",



            data => {







                const room =



                    getRoom(



                        socket



                    );











                const player =



                    room?.players[



                        socket.id



                    ];











                if (



                    !room ||



                    !room.started ||



                    !player



                ) {







                    return;







                }











                const direction =



                    normalize(







                        Number(



                            data?.direction?.x



                        ) || 0,







                        Number(



                            data?.direction?.y



                        ) || 0







                    );











                if (



                    Number(



                        data?.skill



                    ) === 1



                ) {







                    useSkill1(



                        room,



                        player,



                        direction



                    );







                }











                if (



                    Number(



                        data?.skill



                    ) === 2



                ) {







                    useSkill2(



                        room,



                        player,



                        direction



                    );







                }







            }



        );

// ==========================**

// 재장전**

// ==========================**







        socket.on(



            "reload",



            () => {







                const room =



                    getRoom(



                        socket



                    );











                const player =



                    room?.players[



                        socket.id



                    ];











                if (



                    room &&



                    room.started &&



                    player



                ) {







                    reload(



                        room,



                        player



                    );







                }







            }



        );

// ==========================**

// 방 삭제**

// ==========================**







        socket.on(



            "deleteRoom",



            () => {







                const room =



                    getRoom(



                        socket



                    );











                if (!room) {



                    return;



                }











                if (



                    room.hostId !==



                    socket.id



                ) {







                    socket.emit(



                        "roomError",



                        "방장만 방을 삭제할 수 있습니다."



                    );







                    return;







                }











                io.to(



                    room.code



                ).emit(



                    "roomDeleted"



                );











                for (



                    const player of



                    Object.values(



                        room.players



                    )



                ) {







                    const targetSocket =



                        io.sockets.sockets.get(



                            player.id



                        );











                    if (



                        targetSocket



                    ) {







                        targetSocket.leave(



                            room.code



                        );











                        targetSocket.data.roomCode =



                            null;







                    }







                }











                delete rooms[



                    room.code



                ];







            }



        );

// ==========================**

// 접속 종료**

// ==========================**







        socket.on(



            "disconnect",



            () => {







                const roomCode =



                    socket.data.roomCode;











                if (!roomCode) {



                    return;



                }











                const room =



                    rooms[



                        roomCode



                    ];











                if (!room) {



                    return;



                }











                delete room.players[



                    socket.id



                ];











                if (



                    Object.keys(



                        room.players



                    ).length === 0



                ) {







                    delete rooms[



                        roomCode



                    ];







                    return;







                }











                const remaining =



                    Object.values(



                        room.players



                    )[0];











                remaining.slot =



                    "p1";











                room.hostId =



                    remaining.id;











                room.started =



                    false;











                resetPlayer(



                    remaining



                );











                io.to(



                    roomCode



                ).emit(



                    "opponentDisconnected"



                );











                broadcastRoom(



                    room



                );







            }



        );







    }



);











// ==============================*



// 게임 업데이트*



// ==============================*







setInterval(gameTick, 50);

setInterval(movementTick, 1000 / 60);

setInterval(

    hpRegenTick,

    HP_REGEN_INTERVAL

);











// ==============================*



// 서버 실행*



// ==============================*







const PORT = process.env.PORT || 3000;







server.listen(



    PORT,



    "0.0.0.0",



    () => {







        console.log(



            `서버 실행: http\\://localhost:${PORT}`



        );







    }



);