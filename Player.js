class Player extends Ant
{
    constructor(pos)
    {
        super(pos);
        
        this.carryingFood = false;
        this.arrowData = {
            visible: false,
            getAngle: () => 0,
            taskIdx: -1
        };
        this.textBox = new TextBox([""], adapt(200), () => {}, "cyan");
    }

    update()
    {
        this.updateAnim();
        this.textBox.update();

        let vel = joystick.dir().normalize().mult(adapt(2));

        if(vel.dist()) {
            this.angle = vel.angle() + Math.PI / 2;
            this.setAnim(textures.ant.walking);
        } else {
            this.setAnim(textures.ant.idle);
        }

        const nextPos = this.pos.copy().add(vel);

        let found = false;
        for(let i = 0; i < terrain.nodes.length; ++i) {
            const node = terrain.nodes[i];
            if(node.contains(nextPos)) {
                this.currNode = i;
                found = true;
                if(node.displayInfo($(".node-info")))
                    $(".node-info").style.display = "block";
                break;
            }
        }
        
        if(!found) {
            $(".node-info").style.display = "none";
            
            for(const path of terrain.paths)
                if(path.contains(nextPos)) {
                    found = true;
                    break;
                }
        }
        
        
        if(found)
            this.pos = nextPos;

        for(const npc of npcs)
        {
            if(npc.pos.copy().sub(this.pos).dist() < adapt(50)) {
                npc.activate();
            } else {
                npc.deactivate();
            }
        }
    }

    renderCustom()
    {
        if(this.carryingFood) {
            ctx.save();
            ctx.translate(...this.pos);
            const foodPos = new Vec2(Math.cos(this.angle - Math.PI / 2), Math.sin(this.angle - Math.PI / 2)).mult(this.dims.y / 2);
            ctx.translate(...foodPos);
            ctx.fillStyle = "green";
            const r = adapt(10);
            
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }

        if(this.arrowData.visible) {
            ctx.save();
            ctx.translate(...this.pos);
            ctx.translate(0, adapt(-200));
            ctx.rotate(this.arrowData.getAngle());
            const w = adapt(100);
            ctx.drawImage(textures.arrow, -w / 2, -w / 2, w, w);
            ctx.restore();
        }

        ctx.save();
        const halfdims = this.dims.copy().div(2);
        ctx.translate(...this.pos);
        ctx.rotate(this.angle);
        ctx.save();
        ctx.translate(...new Vec2().sub(halfdims));
        ctx.drawImage(textures.outline, 0, 0, ...this.dims);
        ctx.restore();

        ctx.rotate(-this.angle);
        ctx.translate(0, -this.dims.y / 2)
        this.textBox.render();

        ctx.restore();
        
    }

    speak(text)
    {
        if(this.textBox.visible) return;
        this.textBox.setTexts([text]);
        this.textBox.reset();
        this.textBox.visible = true;
    }
}