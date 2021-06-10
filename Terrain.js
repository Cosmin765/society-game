class Terrain
{
    constructor(n, nodes = [], paths = [])
    {
        this.paths = paths;
        this.matrix = Array(n).fill(0).map(_ => Array(n).fill(0));
        this.nodes = nodes;
        
        for(const [i, j] of paths)
            this.matrix[i][j] = this.matrix[j][i] = 1;
    }

    drawLine(i, j) {
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];

        ctx.strokeStyle = "cyan";
        ctx.lineWidth = adapt(40);
        ctx.beginPath();
        ctx.moveTo(...node1.pos);
        ctx.lineTo(...node2.pos);
        ctx.stroke();
        ctx.closePath();
    }

    render()
    {
        ctx.save();
        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.fillRect(0, 0, width, height);

        for(const node of this.nodes)
            node.render();

        for(const [i, j] of this.paths)
            this.drawLine(i, j);

        ctx.restore();
    }
}