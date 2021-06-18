class ActionButton extends Interactive
{
    constructor(pos, text)
    {
        const size = new Vec2(150, 75).modify(adapt);

        super(pos.x - size.x / 2, pos.y - size.y / 2, ...size);
        this.pos = pos.copy();
        this.size = size;
        this.text = text;
        this.pressed = false;
        this.disabled = false;
    }

    press()
    {
        this.pressed = true;
    }

    release()
    {
        this.pressed = false;
    }

    render()
    {
        ctx.strokeStyle = this.pressed ? "red" : "#00ccff";
        if(this.disabled) {
            ctx.fillStyle = "grey";
        } else {
            ctx.fillStyle = this.pressed ? "rgba(99, 159, 255, 0.8)" : "rgba(28, 106, 232, 0.5)";
        }

        const rectData = [...this.pos.copy().sub(new Vec2(this.size.x, this.size.y).div(2)), this.size.x, this.size.y];
        ctx.fillRect(...rectData);
        ctx.strokeRect(...rectData);
        
        ctx.font = `${adapt(28)}px Arial`;
        ctx.fillStyle = this.pressed ? "red" : "#000";
        const textWidth = ctx.measureText(this.text).width;
        ctx.fillText(this.text, ...this.pos.copy().add(new Vec2(-textWidth / 2, adapt(10))));
    }
}