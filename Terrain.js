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

        this.initPaths();
    }

    initPaths()
    {
        for(const [i, j] of this.pairs)
            this.paths.push(new Path(this.nodes[i], this.nodes[j]));
    }

    render()
    {
        ctx.save();

        for(const node of this.nodes)
            node.render();

        for(const path of this.paths)
            path.render();

        ctx.restore();
    }
}