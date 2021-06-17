class Node
{
    constructor(pos)
    {
        this.w = adapt(110);
        this.pos = pos.copy();
    }

    render()
    {
        // console.log(terrain.nodes.indexOf(this));

        ctx.save();

        ctx.fillStyle = "rgb(179, 179, 18)";
        ctx.beginPath();
        ctx.arc(...this.pos, this.w / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.font = "30px Arial";
        ctx.fillStyle = "black";
        ctx.translate(0, -adapt(100));
        ctx.fillText(terrain.nodes.indexOf(this), ...this.pos);

        ctx.restore();
    }

    contains(pos, constraint)
    {
        const dist = this.pos.copy().sub(pos).dist();
        if(constraint) return dist < constraint;
        return dist < this.w / 2;
    }
}