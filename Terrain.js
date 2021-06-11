class Terrain
{
    constructor(n, nodes = [], pairs = [])
    {
        this.pairs = pairs;
        this.matrix = Array(n).fill(0).map(_ => Array(n).fill(0));
        this.nodes = nodes;
        this.paths = [];
        
        for(const [i, j] of pairs)
            this.matrix[i][j] = this.matrix[j][i] = 1;
    }

    drawPath(i, j) {
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];
        const w = adapt(50);
        const v = node1.pos.copy().sub(node2.pos);

        ctx.save();

        ctx.translate(...node1.pos.copy().add(node2.pos).div(2)); // translating to the middle
        ctx.rotate(v.angle() + Math.PI / 2); // this is self-explainatory
        ctx.translate(0, -v.dist() / 2) // to center the whole path vertically
        ctx.translate(-w * 3/4 , -w * 3/4); // to center the tile relatively
        
        // draw the relative path
        for(let i = 0; i <= v.dist(); i += w)
        {
            ctx.drawImage(textures.path, 0, i, w * 3/2, w * 3/2);
        }

        ctx.restore();
    }

    render()
    {
        ctx.save();

        for(const node of this.nodes)
            node.render();

        for(const [i, j] of this.pairs)
            this.drawPath(i, j);

        ctx.restore();
    }
}