class Path
{
    constructor(node1, node2)
    {
        this.node1 = node1;
        this.node2 = node2;
        this.w = adapt(50);
        this.v = this.node1.pos.copy().sub(this.node2.pos);
        this.angle = this.v.angle() + Math.PI / 2;
        this.dist = this.v.dist();
        this.middle = this.node1.pos.copy().add(this.node2.pos).div(2);
    }

    render()
    {
        ctx.save();

        ctx.translate(...this.middle); // translating to the middle
        ctx.rotate(this.angle); // this is self-explainatory
        ctx.translate(0, -this.dist / 2) // to center the whole path vertically
        ctx.translate(-this.w * 3/4 , -this.w * 3/4); // to center the tile relatively
        
        // draw the relative path
        for(let i = 0; i <= this.dist; i += this.w)
            ctx.drawImage(textures.path, 0, i, this.w * 3/2, this.w * 3/2);
        
        ctx.restore();
    }

    contains(pos)
    {
        const height = this.dist + this.w;
        const rot = getRot(this.angle);
        const verts = [
            [-this.w / 2, -height / 2],
            [ this.w / 2, -height / 2],
            [ this.w / 2,  height / 2],
            [-this.w / 2,  height / 2]
        ].map(arr => new Vec2(...arr).multMat(rot).add(this.middle));

        const edges = [];
        for(let i = 0; i < verts.length; ++i)
        {
            const v1 = verts[i], v2 = verts[(i + 1) % verts.length];
            edges.push(v1.copy().sub(v2).normalize());
        }

        for(const edge of edges)
        {
            const projection = verts.map(v => v.dot(edge));
            const posPoint = pos.dot(edge);
            const interval = [Infinity, -Infinity];

            for(const point of projection)
            {
                if(point < interval[0]) interval[0] = point;
                if(point > interval[1]) interval[1] = point;
            }

            if(!(posPoint > interval[0] && posPoint < interval[1]))
                return false;
        }
        return true;
    }
}