class Ant extends Animatable
{
    constructor(pos)
    {
        super(new Vec2(130, 130).modify(adapt));
        this.pos = pos.copy();
        this.setAnim(textures.ant.walking);
        this.angle = 0;
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

        // finding whether or not I'm outside the nodes
        this.strict = true;
        for(const node of terrain.nodes)
        {
            if(node.collided(this.pos)) {
                this.available = [ node.id ];
                for(let i = 0; i < terrain.nodes.length; ++i)
                    if(terrain.matrix[node.id][i])
                        this.available.push(i);

                this.nodeId = node.id;
                this.strict = false;
                break;
            }
        }
        if(this.strict && this.nodeId !== -1) {
            this.available = [ this.nodeId, this.nextNodeId ];
            this.nodeId = -1;
        }

        if(this.strict) {
            if(this.nextNodeId !== -1 && vel.dist()) {
                const fixedVel = terrain.nodes[this.nextNodeId].pos.copy().sub(this.pos).normalize().mult(2);
                const angle = fixedVel.angle() + Math.PI / 2;
                
                if(Math.abs(this.angle - angle) < 0.6)
                    this.pos.add(fixedVel.modify(adapt));
            }
        } else {
            this.pos.add(vel.modify(adapt));
        }

        // finding the next node
        for(const node of terrain.nodes)
        {
            const angle = node.pos.copy().sub(this.pos).angle() + Math.PI / 2;

            if(Math.abs(this.angle - angle) < 0.8 && this.available.includes(node.id) && node.id != this.nodeId) {
                this.nextNodeId = node.id;
            }
        }

        // $(".info").innerHTML = `
        //     Available: ${this.available}<br>
        //     Current: ${this.nodeId}<br>
        //     Next: ${this.nextNodeId}<br>
        //     Strict: ${this.strict}<br>
        // `;
    }

    render()
    {
        ctx.save();
        const halfdims = this.dims.copy().div(2);
        const pos = this.pos.copy().sub(halfdims);

        ctx.translate(...this.pos);
        ctx.rotate(this.angle);
        ctx.translate(...new Vec2().sub(halfdims));

        ctx.drawImage(this.anim[this.animIndex], 0, 0, ...this.dims);

        // ctx.strokeStyle = "red";
        // ctx.strokeRect(0, 0, ...this.dims);
        ctx.restore();
    }
}