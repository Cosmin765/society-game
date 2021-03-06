class Npc extends Ant
{
    constructor(pos, character = false, outfit = null, actions = [])
    {
        super(pos);
        this.actions = actions;
        this.actionIndex = 0;
        const texts = character ? this.actions[this.actionIndex].dialog : [];
        this.textBox = new TextBox(texts, adapt(200), this.finishedTextHandler.bind(this));
        this.activated = false;
        this.idle = true;
        this.speed = adapt(character ? 2 : random(1, 3));
        this.character = character;
        this.outfit = outfit;
    }

    getID()
    {
        if(!this.character) return null;
        for(const type in characters) {
            if(characters[type] === this) {
                return type;
            }
        }
    }

    progressStory()
    {
        const condition = this.actions[this.actionIndex]?.condition; // which is a function
        return (!condition || condition(this)) && !player.textBox.visible;
    }

    update()
    {
        this.updateAnim();
        this.speak();
        if(this.progressStory())
            this.textBox.update();

        if(this.path.length) {
            this.idle = false;
            this.setAnim(textures.ant.walking);
            const vel = terrain.nodes[this.path[0]].pos.copy().sub(this.pos).normalize().mult(this.speed);

            const velAngle = vel.angle() + Math.PI / 2;
            const changes = [ velAngle, velAngle + 2 * Math.PI, velAngle - 2 * Math.PI ];
            let smallest = Math.abs(this.angle - changes[0]);
            let change = changes[0];
            for(let i = 1; i < changes.length; ++i)
            {
                const dist = Math.abs(this.angle - changes[i]);
                if(dist < smallest) {
                    smallest = dist;
                    change = changes[i];
                }
            }

            this.angle = 0.9 * this.angle + 0.1 * change; // to interpolate
            this.angle %= 2 * Math.PI;

            this.pos.add(vel);

            if(terrain.nodes[this.path[0]].contains(this.pos, adapt(20)))
                this.currNode = this.path.shift();
        } else {
            this.setAnim(textures.ant.idle);
            wait(200).then(() => {
                if(this.anim === textures.ant.idle)
                    this.idle = true;
            });
            if(!this.character)
                this.setTargetNode((Math.random() * terrain.nodes.length) | 0, false);
        }
    }

    finishedTextHandler()
    {
        this.actions[this.actionIndex].finishedTextHandler(this);
        if(this.actionIndex < this.actions.length - 1)
            this.textBox.setTexts(this.actions[++this.actionIndex].dialog);
        
        const id = this.getID();
        if(id) progress[id]++;
    }

    speak() {
        if(this.textBox.visible || !this.idle || !this.progressStory() || (this.pos.copy().sub(player.pos).dist() > adapt(50))) return;

        if(this.progressStory()) {
            this.textBox.reset();
            this.textBox.visible = true;        
        }
    }

    stopSpeaking() {
        this.textBox.visible = false;
    }

    activate()
    {
        if(!this.activated && this.idle) {
            // this.speak();
            this.activated = true;
        }
    }

    deactivate()
    {
        if(this.activated) {
            this.stopSpeaking();
            this.activated = false;
        }
    }

    renderCustom()
    {
        ctx.save();
        ctx.translate(...this.pos);

        if(this.outfit) {
            ctx.save();
            ctx.rotate(this.angle);
            const halfdims = this.dims.copy().div(2);
            ctx.translate(...new Vec2().sub(halfdims));
            ctx.drawImage(this.outfit, 0, 0, ...this.dims);
            ctx.restore();
        }
        
        ctx.translate(0, -this.dims.y / 2)
        this.textBox.render();
        ctx.restore();
    }
}