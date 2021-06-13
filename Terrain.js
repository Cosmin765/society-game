class Terrain
{
    constructor(nodesPos = [], pairs = [])
    {
        this.pairs = pairs;
        this.nodes = nodesPos.map(pos => new Node(pos));
        this.paths = pairs.map(([i, j]) => new Path(this.nodes[i], this.nodes[j]));
    }

    addNode(pos)
    {
        if(!pos) return;

        this.nodes.push(new Node(pos));
    }
    
    addPath(i, j) {
        if(i >= this.nodes.length || j >= this.nodes.length)
            return console.log("out of bound");
        
        this.paths.push(new Path(this.nodes[i], this.nodes[j]));
    }

    addData(data) {
        for(const pos of data[0])
            this.addNode(pos);
        for(const [i, j] of data[1])
            this.addPath(i, j);
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