class Node
{
    constructor(pos, info = {})
    {
        this.w = adapt(110);
        this.pos = pos.copy();
        this.type = this.desc = null;
        this.setInfo(info);
        this.img = null;
    }

    displayInfo(el)
    {
        if(!this.type) return false;

        el.innerHTML = `
            <h2>${this.type.toUpperCase()}</h2>
            <p>${this.desc}</p>
        `;

        return true;
    }

    setInfo(info)
    {
        this.desc = info.description;
        this.type = info.type;
    }

    setImg(img)
    {
        this.img = img;
    }

    render()
    {
        ctx.save();

        ctx.fillStyle = "rgb(179, 179, 18)";
        ctx.beginPath();
        ctx.arc(...this.pos, this.w / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        if(this.img) {
            ctx.translate(...this.pos);
            const w = this.w * 3 / 4;
            ctx.drawImage(this.img, -w / 2, -w / 2, w, w);
        }

        // ctx.font = "30px Arial";
        // ctx.fillStyle = "black";
        // ctx.translate(0, -adapt(100));
        // ctx.fillText(terrain.nodes.indexOf(this), ...this.pos);

        ctx.restore();
    }

    contains(pos, constraint)
    {
        const dist = this.pos.copy().sub(pos).dist();
        if(constraint) return dist < constraint;
        return dist < this.w / 2;
    }
}