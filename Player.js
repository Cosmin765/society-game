class Player extends Ant
{
    constructor(pos)
    {
        super(pos);
        
        this.nodeId = -1;
        this.nextNodeId = -1;
        this.available = [];
        this.strict = false;
    }

    update()
    {
        this.updateAnim();

        let vel = joystick.dir().normalize().mult(2);

        if(vel.dist()) {
            this.angle = vel.angle() + Math.PI / 2;
            this.setAnim(textures.ant.walking);
        } else {
            this.setAnim(textures.ant.idle);
        }

        const nextPos = this.pos.copy().add(vel);
        for(const elem of [...terrain.paths, ...terrain.nodes])
        {
            if(elem.contains(nextPos)) {
                this.pos = nextPos;
                break;
            }
        }

        for(const npc of npcs)
        {
            if(npc.pos.copy().sub(this.pos).dist() < adapt(50)) {
                npc.activate();
            } else {
                npc.deactivate();
            }
        }
    }
}