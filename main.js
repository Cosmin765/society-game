window.onload = main;

const $ = name => document.querySelector(name);
const canvas = $("#c"), ctx = canvas.getContext("2d");
let joystick, player, terrain, nodesData, offset;

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

const [ height, width ] = resolutions[7];
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
    player = new Ant(new Vec2(...nodesData[0][0]).modify(adapt));

    const w = adapt(150);
    const nodes = nodesData[0].map((data, i) => new Node(new Vec2(...data).modify(adapt), w, i));
    
    const pairs = nodesData[1];
    terrain = new Terrain(nodes.length, nodes, pairs);

    offset = new Vec2();

    setupEvents();

    // end setup

    window.requestAnimationFrame(render);
}

function update()
{
    player.update();

    offset = new Vec2(width / 2, height / 2).sub(player.pos);
}

function render()
{
    update();
    ctx.fillStyle = "rgb(110, 77, 0)";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(...offset);

    terrain.render();
    player.render();

    ctx.restore();

    joystick.render();
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