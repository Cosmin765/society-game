class Ant extends Animatable
{
    constructor(pos)
    {
        super(new Vec2(100, 100).modify(adapt));
        this.pos = pos.copy();
        this.setAnim(textures.ant.idle);
        this.angle = 0;
    }

    render()
    {
        ctx.save();
        const halfdims = this.dims.copy().div(2);

        ctx.translate(...this.pos);
        ctx.rotate(this.angle);
        ctx.translate(...new Vec2().sub(halfdims));

        ctx.drawImage(this.anim[this.animIndex], 0, 0, ...this.dims);

        ctx.restore();

        if(this.renderCustom)
            this.renderCustom();
    }
}