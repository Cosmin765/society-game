window.onload = main;

const $ = name => document.querySelector(name);
const canvas = $("#c"), ctx = canvas.getContext("2d");
let joystick, player, terrain, nodesData;

const resolutions = [
    [ 640, 360 ],
    [ 854, 480 ],
    [ 960, 540 ],
    [ 1024, 576 ],
    [ 1280, 720 ],
    [ 1366, 768 ],
    [ 1600, 900 ],
    [ 1920, 1080 ]
];

const [ height, width ] = resolutions[2];
const adapt = val => val * width / 480;
let ratio = 1;

const textures = {
    ant: {
        idle: [],
        walking: [],
    },
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

    nodesData = await (await fetch("./data/nodes.json")).json();
    
}

async function main()
{
    await preload();

    // setup

    canvas.width = width;
    canvas.height = height;
    if(innerHeight / innerWidth > 16 / 9) {
        canvas.style.width = "100vw";
        ratio = width / innerWidth;
    } else {
        canvas.style.height = "100vh";
        ratio = height / innerHeight;
    }

    joystick = new Joystick(new Vec2(width / 2, height * 3 / 4));
    player = new Ant(new Vec2(...nodesData[0]));

    const w = adapt(80);
    const nodes = nodesData.map((data, i) => new Node(new Vec2(...data), w, i));
    
    const paths = [
        [1, 2],
        [0, 1]
    ];
    terrain = new Terrain(nodes.length, nodes, paths);

    setupEvents();

    // end setup

    window.requestAnimationFrame(render);
}

function update()
{
    player.update();
}

function render()
{
    update();

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    terrain.render();

    joystick.render();
    player.render();
    window.requestAnimationFrame(render);
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
                break;
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
    });
}