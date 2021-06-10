class Node
{
    constructor(pos, w, id)
    {
        this.id = id;
        this.w = w;
        this.pos = pos.copy();
    }

    render()
    {
        ctx.save();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(...this.pos, this.w / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    collided(pos)
    {
        return this.pos.copy().sub(pos).dist() < this.w / 2;
    }
}