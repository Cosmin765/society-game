window.onload = main;

const $ = name => document.querySelector(name);
const canvas = $("#c"), ctx = canvas.getContext("2d");
let joystick, player, terrain, nodesData, nodesInfo, offset;
let npcs = [];
let buttons = {};

const infoMap = {};

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
let ratio = 1;

const textures = {
    ant: {
        idle: [],
        walking: [],
    },
    path: null,
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

    nodesData = await (await fetch("./data/nodes.json")).json();
    nodesInfo = await (await fetch("./data/nodesInfo.json")).json();
}

async function main()
{
    await preload();

    // setup

    const info = [ 
        [ "food", "This is the food source of the colony." ],
        [ "storage", "This is where the colony stores all its resources." ]
    ];
    for(const [type, description ] of info)
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

    joystick = new Joystick(new Vec2(width / 2, height * 3 / 4));
    // player = new Player(new Vec2(...nodesData[0][0]).modify(adapt));
    player = new Player(new Vec2());

    const nodesPos = nodesData[0].map(pos => new Vec2(...pos).modify(adapt));
    const pairs = nodesData[1];

    terrain = new Terrain(nodesPos, pairs, nodesInfo);

    for(let i = 0; i < 100; ++i) {
        const npc = new Npc(new Vec2(...nodesData[0][Math.random() * nodesData[0].length | 0]).modify(adapt));
        npcs.push(npc);
    }

    const btnPos = new Vec2(width - adapt(100), height * 3 / 4);

    function foodHandler() {
        player.carryingFood = true;
        this.displayCondition = () => !player.carryingFood;
    };

    function releaseHandler() {
        player.carryingFood = false;
        this.displayCondition = () => player.carryingFood;
    }

    buttons["food"] = new ActionButton(btnPos.copy(), "Pick up", foodHandler);
    buttons["storage"] = new ActionButton(btnPos.copy(), "Release", releaseHandler);

    offset = new Vec2();

    setupEvents();

    // end setup

    window.requestAnimationFrame(render);
}

function update()
{
    for(const type in buttons)
        buttons[type].visible = false; // reseting the visibility

    player.update();

    for(const npc of npcs)
        npc.update();

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
            const pos = new Vec2(touch.pageX, touch.pageY);
            pos.mult(ratio);

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

    addEventListener("touchmove", e => {
        for(let i = 0; i < e.touches.length; ++i)
        {
            const touch = e.touches[i];
            const pos = new Vec2(touch.pageX, touch.pageY);
            pos.mult(ratio);

            if(joystick.touchID === touch.identifier)
            joystick.update(pos);
        }
    });

    addEventListener("touchend", e => {
        let present = false;

        for(let i = 0; i < e.touches.length; ++i)
        {
            const touch = e.touches[i];
            const pos = new Vec2(touch.pageX, touch.pageY);
            pos.mult(ratio);

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
                const pos = adjustVec(new Vec2(touch.pageX, touch.pageY));

                if(btn.clicked(pos)) {
                    present = true;
                    break;
                }
            }

            if(!present)
                btn.release();
        }
    });
}