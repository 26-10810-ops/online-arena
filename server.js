const express = require("express");

const http = require("http");

const { Server } = require("socket.io");





const app = express();



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





// ==============================

// 캐릭터 설정

// ==============================



const characters = {



    knight: {



        maxAmmo: 8,

        reloadTime: 1200,



        skill1Damage: 30,

        skill1Range: 120,

        skill1Cooldown: 3000,



        skill2Damage: 25,

        skill2Range: 260,

        skill2Cooldown: 4500



    },





    ninja: {



        maxAmmo: 6,

        reloadTime: 1500,



        skill1Damage: 8,

        skill1Range: 100,

        skill1Cooldown: 4000,



        skill2Damage: 10,

        skill2Range: 500,

        skill2Cooldown: 5000



    },





    wizard: {



        maxAmmo: 5,

        reloadTime: 1800,



        skill1Damage: 40,

        skill1Range: 500,

        skill1Cooldown: 4000,



        skill2Damage: 0,

        skill2Range: 0,

        skill2Cooldown: 6000



    },





    robot: {



        maxAmmo: 7,

        reloadTime: 1400,



        skill1Damage: 20,

        skill1Range: 160,

        skill1Cooldown: 4500,



        skill2Damage: 24,

        skill2Range: 500,

        skill2Cooldown: 5000



    }



};
// ==========================
// 자연 회복
// ==========================

const HP_REGEN_AMOUNT = 2;      // 한 번에 회복되는 HP
const HP_REGEN_INTERVAL = 1000; // 1초마다 회복





// ==============================

// 방 코드

// ==============================



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





// ==============================

// 플레이어 생성

// ==============================



function createPlayer(

    id,

    slot

) {



    return {



        id,



        slot,





        x:

            slot === "p1"

                ? 100

                : 745,





        y: 220,





        hp: 100,



        maxHp: 100,





        character:

            "knight",





        ready: false,





        ammo: 8,



        maxAmmo: 8,



        reloading: false,





        shield: false,





        skill1Ready: true,



        skill2Ready: true,





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





// ==============================

// 방 가져오기

// ==============================



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





// ==============================

// 상대 플레이어

// ==============================



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





// ==============================

// 방향 정규화

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





// ==============================

// 탄창 갱신

// ==============================



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





// ==============================

// 플레이어 초기화

// ==============================



function resetPlayer(

    player

) {



    player.x =

        player.slot === "p1"

            ? 100

            : 745;





    player.y =

        220;





    player.hp =

        100;





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





// ==============================

// 공개 플레이어 데이터

// ==============================



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





// ==============================

// 방 상태 전송

// ==============================



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





// ==============================

// 게임 상태 전송

// ==============================



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





// ==============================

// 거리

// ==============================



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





// ==============================

// 피해

// ==============================



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





// ==============================

// 근접 공격

// ==============================



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





// ==============================

// 투사체 생성

// ==============================



function addProjectile(

    room,

    player,

    type,

    direction

) {



    const settings = {



        shuriken: {



            speed: 11,

            damage: 8,

            radius: 12,

            life: 1000,

            maxDistance: 500



        },





        poisonShuriken: {



            speed: 10,

            damage: 10,

            radius: 13,

            life: 1200,

            maxDistance: 500



        },





        fireball: {



            speed: 8,

            damage: 12,

            radius: 14,

            life: 1500,

            maxDistance: 500



        },





        bigFireball: {



            speed: 7,

            damage: 40,

            radius: 24,

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





// ==============================

// 닌자 대시

// ==============================



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





// ==============================

// 스킬 1

// ==============================



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





    player.skill1Ready =

        false;





    const data =

        characters[

            player.character

        ];
// 닌자*



    if (

        player.character ===

        "ninja"

    ) {



        startDash(

            room,

            player,

            direction

        );



    }
// 마법사*



    else if (

        player.character ===

        "wizard"

    ) {



        addProjectile(

            room,

            player,

            "bigFireball",

            direction

        );



    }
// 나이트*



    else if (

        player.character ===

        "knight"

    ) {



        melee(

            room,

            player,

            data.skill1Damage,

            data.skill1Range

        );



    }
// 로봇*



    else if (

        player.character ===

        "robot"

    ) {



        const target =

            opponent(

                room,

                player.id

            );





        if (

            target &&

            distance(

                player,

                target

            ) <=

                data.skill1Range

        ) {



            damage(

                room,

                player,

                target,

                data.skill1Damage

            );



        }



    }





    io.to(

        room.code

    ).emit(

        "skillEffect",

        {



            playerId:

                player.id,



            skill: 1,



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





            if (!currentPlayer) {

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



                    skill: 1



                }

            );



        },



        data.skill1Cooldown



    );



}





// ==============================

// 스킬 2

// ==============================



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





    player.skill2Ready =

        false;





    const data =

        characters[

            player.character

        ];
// 닌자*
// 독 수리검*



    if (

        player.character ===

        "ninja"

    ) {



        addProjectile(

            room,

            player,

            "poisonShuriken",

            direction

        );



    }
// 마법사*
// 방어막*



    else if (

        player.character ===

        "wizard"

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

            3000

        );



    }
// 나이트*
// 검의 충격파*



    else if (

        player.character ===

        "knight"

    ) {



        addProjectile(

            room,

            player,

            "fireball",

            direction

        );





        const projectile =

            room.projectiles[

                room.projectiles.length -

                1

            ];





        if (

            projectile

        ) {



            projectile.type =

                "swordWave";





            projectile.damage =

                data.skill2Damage;





            projectile.vx =

                normalize(

                    direction.x,

                    direction.y

                ).x * 9;





            projectile.vy =

                normalize(

                    direction.x,

                    direction.y

                ).y * 9;





            projectile.radius =

                16;





            projectile.life =

                900;





            projectile.maxLife =

                900;





            projectile.maxDistance =

                260;



        }



    }
// 로봇*
// 미사일*



    else if (

        player.character ===

        "robot"

    ) {



        for (

            let i = 0;

            i < 3;

            i++

        ) {



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

                        currentRoom &&

                        currentPlayer &&

                        currentRoom.started

                    ) {



                        addProjectile(

                            currentRoom,

                            currentPlayer,

                            "fireball",

                            {



                                x:

                                    direction.x +

                                    (

                                        Math.random() -

                                        0.5

                                    ) *

                                    0.12,



                                y:

                                    direction.y +

                                    (

                                        Math.random() -

                                        0.5

                                    ) *

                                    0.12



                            }

                        );



                    }



                },



                i * 150



            );



        }



    }





    io.to(

        room.code

    ).emit(

        "skillEffect",

        {



            playerId:

                player.id,



            skill: 2,



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





            if (!currentPlayer) {

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



                    skill: 2



                }

            );



        },



        data.skill2Cooldown



    );



}





// ==============================

// 재장전

// ==============================



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


        // 방이나 플레이어가 사라졌으면 중단
        if (!currentPlayer) {

            return;

        }


        // 이미 탄창이 가득 찼으면 종료
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


        // 탄약 1발 충전
        currentPlayer.ammo += 1;


        // 아직 탄약이 남아 있으면 다음 1발 예약
        if (
            currentPlayer.ammo <
            currentPlayer.maxAmmo
        ) {

            setTimeout(
                reloadOneBullet,
                reloadTime
            );

        }

        // 마지막 탄약까지 충전했으면 종료
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


    // 첫 번째 탄약 충전
    setTimeout(
        reloadOneBullet,
        reloadTime
    );

}





// ==============================

// 게임 종료

// ==============================



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





// ==============================

// 게임 틱

// ==============================



function movementTick() {
    const STEP = 100 / 60;
    for (const room of Object.values(rooms)) {
        if (!room.started) continue;
        for (const player of Object.values(room.players)) {
            if (player.dash) continue;
            const input = player.input || { x: 0, y: 0 };
            if (input.x === 0 && input.y === 0) continue;
            player.x += input.x * STEP;
            player.y += input.y * STEP;
            player.x = Math.max(0, Math.min(WIDTH - PLAYER_SIZE, player.x));
            player.y = Math.max(0, Math.min(HEIGHT - PLAYER_SIZE, player.y));
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
// ==========================*
// 대시*
// ==========================*



        for (

            const player of

            Object.values(

                room.players

            )

        ) {



            // ==========================
            // 대시
            // ==========================

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


                // 공격으로 게임이 끝났다면
                // endGame()에서 dash가 null이 되었을 수 있음
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
// ======================*
// 독 데미지*
// ======================*



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
// ==========================*
// 투사체*
// ==========================*



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
                // ==========================
                // 자연 HP 회복
                // ==========================

                if (
                    player.hp > 0 &&
                    player.hp < player.maxHp
                ) {

                    if (
                        !player.nextHpRegen
                    ) {

                        player.nextHpRegen =
                            now + 3000;

                    }

                    if (
                        now >=
                        player.nextHpRegen
                    ) {

                        player.hp =
                            Math.min(
                                player.maxHp,
                                player.hp + 2
                            );

                        player.nextHpRegen =
                            now + 1000;

                    }

                }
                else {

                    player.nextHpRegen = null;

                }
// 독 수리검*



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





// ==============================

// 투사체와 플레이어 거리

// ==============================



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





// ==============================

// Socket.IO

// ==============================



io.on(

    "connection",

    socket => {





        console.log(

            "접속:",

            socket.id

        );
// ==========================*
// 방 만들기*
// ==========================*



        socket.on(

            "createRoom",

            () => {



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
// ==========================*
// 방 참가*
// ==========================*



        socket.on(

            "joinRoom",

            rawCode => {



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
// ==========================*
// 캐릭터 선택*
// ==========================*



        socket.on(

            "selectCharacter",

            character => {



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

                    room.started ||

                    !player ||

                    !characters[

                        character

                    ]

                ) {



                    return;



                }





                player.character =

                    character;





                player.ready =

                    false;





                updateAmmo(

                    player

                );





                broadcastRoom(

                    room

                );



            }

        );
// ==========================*
// 준비*
// ==========================*



        socket.on(

            "ready",

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

                    !room ||

                    room.started ||

                    !player

                ) {



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

                        const p of

                        players

                    ) {



                        p.ready =

                            false;



                        p.hp =

                            100;



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
// ==========================*
// 이동*
// ==========================*



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


                // 아무 키도 누르지 않았으면 정지
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
// ==========================*
// 핑*
// ==========================*



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
// ==========================*
// 기본 공격*
// ==========================*



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
// 닌자*



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
// 마법사*



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
// 나이트*



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
// 로봇*



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
// ==========================*
// 스킬*
// ==========================*



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
// ==========================*
// 재장전*
// ==========================*



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
// ==========================*
// 방 삭제*
// ==========================*



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
// ==========================*
// 접속 종료*
// ==========================*



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





// ==============================

// 게임 업데이트

// ==============================



setInterval(gameTick, 50);
setInterval(movementTick, 1000 / 60);
setInterval(
    hpRegenTick,
    HP_REGEN_INTERVAL
);





// ==============================

// 서버 실행

// ==============================



const PORT = process.env.PORT || 3000;



server.listen(

    PORT,

    "0.0.0.0",

    () => {



        console.log(

            `서버 실행: http\://localhost:${PORT}`

        );



    }

);