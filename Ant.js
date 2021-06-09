class Ant extends Animatable
{
    constructor(pos)
    {
        super(new Vec2(150, 150).modify(adapt));
        this.pos = pos.copy();
        this.setAnim(textures.ant.walking);
    }

    update()
    {
        this.updateAnim();

        const vel = joystick.dir().normalize().mult(8);
        this.pos.add(vel);
    }

    render()
    {
        ctx.save();
        const halfdims = this.dims.copy().div(2);
        const pos = this.pos.copy().sub(halfdims);

        ctx.drawImage(this.anim[this.animIndex], ...pos, ...this.dims);

        // ctx.strokeStyle = "red";
        // ctx.strokeRect(0, 0, ...this.dims);
        ctx.restore();
    }
}