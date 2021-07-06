window.onload = main;

const $ = name => document.querySelector(name);
const $$ = name => document.querySelectorAll(name);
const canvas = $("#c"), ctx = canvas.getContext("2d");
let joystick, player, terrain, nodesData, nodesInfo, offset, taskManager;
let npcs = [];
let buttons = {};

const progress = {
    movedFood: 0,
    manager: 0
};

const infoMap = {};

const characters = {};

function createNodeInfo(type, description)
{
    return { type, description };
}

const resolutions = [
    [  640,  360  ],
    [  854,  480  ],
    [  960,  540  ],
    [  1024, 576  ],
    [  1280, 720  ],
    [  1366, 768  ],
    [  1600, 900  ],
    [  1920, 1080 ]
];

const wait = amount => new Promise(resolve => setTimeout(resolve, amount));

const [ height, width ] = resolutions[2];
const adapt = val => val * width / 480;
const random = (min, max) => Math.random() * (max - min) + min;
let ratio = 1;

const textures = {
    ant: {
        idle: [],
        walking: [],
    },
    path: null,
    arrow: null,
    managerOutfit: null,
    outline: null,
    pills: null
};

function loadImg(path)
{
    return new Promise(resolve => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
    });
}

async function preload()
{
    for(let i = 0; i <= 4; ++i) {
        const img = await loadImg(`./assets/Walking_${i}.png`);
        textures.ant.walking.push(img);
    }
    const img = await loadImg(`./assets/Idle_0.png`);
    textures.ant.idle.push(img);
    textures.path = await loadImg(`./assets/path.png`);
    textures.arrow = await loadImg(`./assets/arrow.png`);
    textures.managerOutfit = await loadImg(`./assets/manager.png`);
    textures.outline = await loadImg(`./assets/outline.png`);
    textures.pills = await loadImg(`./assets/pills.png`);

    nodesData = await (await fetch("./data/nodes.json")).json();
    nodesInfo = await (await fetch("./data/nodesInfo.json")).json();
}

async function endGame()
{
    render = update = () => {};
    [ "#c", ".tasks", ".node-info", ".slider" ].forEach(el => $(el).style.display = "none");

    const cards = $$(".end-game div");
    const values = [ 1, 0 ];

    $(".end-game").style.display = "block";

    for(const card of cards) {
        for(const val of values) {
            await wait(2000);
            card.style.opacity = val;
        }
    }
}

async function main()
{
    await preload();

    // setup

    const info = [ 
        [ "food", "This is the food source of the colony." ],
        [ "storage", "This is where the colony stores all its resources." ]
    ];
    for(const [type, description] of info)
    {
        infoMap[type] = createNodeInfo(type, description);
    }

    canvas.width = width;
    canvas.height = height;
    if(innerHeight / innerWidth > 16 / 9) {
        canvas.style.width = "100vw";
        ratio = width / innerWidth;
    } else {
        canvas.style.height = "100vh";
        ratio = height / innerHeight;
    }

    $(".node-info").style.width = `${width / ratio * 0.8}px`;
    $(".node-info").style.left = `${width / ratio * 0.1}px`;

    $(".slider").style.width = `${width / ratio * 0.95}px`;

    const nodesPos = nodesData[0].map(pos => new Vec2(...pos).modify(adapt));
    const pairs = nodesData[1];

    terrain = new Terrain(nodesPos, pairs, nodesInfo);

    joystick = new Joystick(new Vec2(width / 2, height * 3 / 4));
    player = new Player(new Vec2(...nodesData[0][2]).modify(adapt));

    const managerActions = [
        {
            dialog: [
                "Hello, Joe!",
                "As I understood, you have become an adult and now you are searching for a job",
                "Don't worry, we have a lot of work for you around the colony",
                "Follow me!"
            ],
            finishedTextHandler: npc => {
                player.speak("Ok..?");
                npc.setTargetNode(6);
                taskManager.addTasks([
                    {
                        getText: () => "Follow the manager",
                        done: () => characters["manager"].pos.copy().sub(player.pos).dist() < adapt(50) && characters["manager"].idle,
                        getTarget: () => characters["manager"].pos.copy()
                    }
                ]);
            }
        },
        {
            dialog: [
                "This is the place where you're gonna prepare food",
                "Come!"
            ],
            finishedTextHandler: npc => {
                npc.setTargetNode(8);
                taskManager.addTasks([
                    {
                        getText: () => "Follow the manager",
                        done: () => characters["manager"].pos.copy().sub(player.pos).dist() < adapt(50) && characters["manager"].idle,
                        getTarget: () => characters["manager"].pos.copy()
                    }
                ]);
            },
            condition: npc => terrain.nodes[6].contains(npc.pos)
        },
        {
            dialog: [
                "And this is where you're gonna store it",
                "For your first job, you're gonna have to produce and store 8 pieces of food",
                "Why 8? I don't know",
                "You can see the location target of each task by pressing on that specific task",
                "in the left bottom panel",
                "Bring up that panel by pressing on the arrow button",
                "After you're done, come and visit me"
            ],
            finishedTextHandler: npc => {
                npc.setTargetNode(0);
                player.speak("I hate this");
                taskManager.addTasks([
                    {
                        getText: () => `Prepare and store 8 pieces of food: ${progress.movedFood} / 8`,
                        done: () => {
                            if(progress.movedFood >= 8) {
                                taskManager.addTasks([
                                    {
                                        getText: () => "Go to the manager",
                                        done: () => characters["manager"].pos.copy().sub(player.pos).dist() < adapt(50),
                                        getTarget: () => characters["manager"].pos.copy()
                                    }
                                ]);

                                return true;
                            }
                            return false;
                        },
                        getTarget: () => terrain.nodes[player.carryingFood ? 8 : 6].pos.copy()
                    }
                ]);
            },
            condition: npc => terrain.nodes[8].contains(npc.pos)
        },
        {
            dialog: [
                "Good, I see you're done!",
            ],
            finishedTextHandler: npc => {
                player.speak("...");
            },
            condition: () => progress.movedFood >= 8
        },
        {
            dialog: [
                "Why are you sad?"
            ],
            finishedTextHandler: npc => {
                player.speak("I thought being an adult would be cool");
            }
        },
        {
            dialog: [
                "It is, you get to do all of these cool things, like paying taxes and worrying about your budget"
            ],
            finishedTextHandler: () => {
                player.speak("If this is what is means to be an adult, then I wanna be a child again");
            }
        },
        {
            dialog: [
                "Wouldn't we all?...",
                "Well.. you have to embrace all of this, because this is what you'll be doing for the rest of your life",
                "Anyway, can you bring my sleeping pills to me?"
            ],
            finishedTextHandler: () => {
                player.speak("Sure, where are they?");
            }
        },
        {
            dialog: [
                "Check your tasks panel"
            ],
            finishedTextHandler: () => {
                player.speak("...");
                taskManager.addTasks([
                    {
                        getText: () => "Go find the manager's pills",
                        done: () => terrain.nodes[11].contains(player.pos),
                        getTarget: () => terrain.nodes[11].pos.copy()
                    }
                ]);
                terrain.nodes[11].setImg(textures.pills);
                const btnData = {
                    text: "Escape reality",
                    handler: () => endGame(),
                    displayCondition: () => terrain.nodes[11].contains(player.pos)
                };
                buttons["pills"] = new ActionButton(btnData);
            }
        }
    ];

    for(let i = 0; i < 30; ++i) {
        const npc = new Npc(new Vec2(...nodesData[0][Math.random() * nodesData[0].length | 0]).modify(adapt));
        npcs.push(npc);
    }

    characters["manager"] = new Npc(terrain.nodes[4].pos.copy(), true, textures.managerOutfit, managerActions);

    for(const type in characters)
        npcs.push(characters[type]);

    const foodBtnData = {
        text: "Pick up",
        handler: () => player.carryingFood = true,
        displayCondition: () => !player.carryingFood && terrain.nodes[nodesInfo["food"]].contains(player.pos)
    };

    const storageBtnData = {
        text: "Release",
        handler: () => {
            player.carryingFood = false;
            progress.movedFood++;
        },
        displayCondition: () => player.carryingFood && terrain.nodes[nodesInfo["storage"]].contains(player.pos)
    };

    buttons["food"] = new ActionButton(foodBtnData);
    buttons["storage"] = new ActionButton(storageBtnData);

    const tasks = [
        {
            getText: () => "Go meet the manager",
            done: () => characters["manager"].pos.copy().sub(player.pos).dist() < adapt(50),
            getTarget: () => characters["manager"].pos.copy()
        }
    ];

    taskManager = new TaskManager(tasks);

    offset = new Vec2();

    setupEvents();

    // end setup

    window.requestAnimationFrame(render);
}

function update()
{
    for(const type in buttons)
        buttons[type].update()

    player.update();

    for(const npc of npcs)
        npc.update();

    taskManager.update();

    offset = new Vec2(width / 2, height / 2).sub(player.pos);
}

function render()
{
    update();
    ctx.fillStyle = "rgb(110, 77, 0)";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale($(".slider").value, $(".slider").value);
    ctx.translate(-width / 2, -height / 2);
    ctx.translate(...offset);

    terrain.render();

    for(const npc of npcs)
        npc.render();

    player.render();

    ctx.restore();

    joystick.render();
    for(const type in buttons)
        buttons[type].render();

    window.requestAnimationFrame(render);
}

function getRot(a)
{
    return [
        [ Math.cos(a), -Math.sin(a) ],
        [ Math.sin(a),  Math.cos(a) ]
    ];
}

function setupEvents()
{
    addEventListener("touchstart", e => {
        for(let i = 0; i < e.touches.length; ++i)
        {
            const touch = e.touches[i];
            const pos = new Vec2(touch.pageX, touch.pageY).mult(ratio);

            if(joystick.clicked(pos)) {
                joystick.setTouch(touch.identifier, pos);
                continue;
            }

            for(const type in buttons)
            {
                const btn = buttons[type];
                if(btn.clicked(pos))
                    btn.press();
            }
        }
    });

    addEventListener("mousedown", e => {
        const pos = new Vec2(e.clientX, e.clientY).mult(ratio);

        if(joystick.clicked(pos)) {
            joystick.setTouch(true, pos);
        }

        for(const type in buttons)
        {
            const btn = buttons[type];
            if(btn.clicked(pos))
                btn.press();
        }
    });

    addEventListener("touchmove", e => {
        for(let i = 0; i < e.touches.length; ++i)
        {
            const touch = e.touches[i];
            const pos = new Vec2(touch.pageX, touch.pageY).mult(ratio);

            if(joystick.touchID === touch.identifier)
                joystick.update(pos);
        }
    });

    addEventListener("mousemove", e => {
        const pos = new Vec2(e.clientX, e.clientY).mult(ratio);

        if(joystick.touchID)
            joystick.update(pos);
    });

    addEventListener("touchend", e => {
        let present = false;

        for(let i = 0; i < e.touches.length; ++i)
        {
            const touch = e.touches[i];
            const pos = new Vec2(touch.pageX, touch.pageY).mult(ratio);

            if(pos.equals(joystick.lastPos)) {
                present = true;
                break;
            }
        }

        if(!present) {
            joystick.removeTouch();
        }

        for(const type in buttons)
        {
            const btn = buttons[type];
            let present = false;

            for(let i = 0; i < e.touches.length; ++i)
            {
                const touch = e.touches[i];
                const pos = new Vec2(touch.pageX, touch.pageY).mult(ratio);

                if(btn.clicked(pos)) {
                    present = true;
                    break;
                }
            }

            if(!present)
                btn.release();
        }
    });

    addEventListener("mouseup", e => {
        joystick.removeTouch();

        for(const type in buttons)
            buttons[type].release();
    });

    $(".toggle-btn").addEventListener("click", () => {
        const elements = [ $(".tasks"), $(".toggle-btn img") ];

        if(elements[0].className.includes("invisible")) {
            for(const el of elements)
                el.className = el.className.replace("invisible", "visible");
        } else {
            for(const el of elements)
                el.className = el.className.replace("visible", "invisible");
        }
    });
}