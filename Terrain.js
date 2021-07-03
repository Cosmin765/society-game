class Terrain
{
    constructor(nodesPos = [], pairs = [], nodesInfo = [])
    {
        this.pairs = pairs;
        this.nodes = nodesPos.map(pos => new Node(pos));
        this.paths = [];
        this.matrix = Array(this.nodes.length).fill(0).map(_ => Array(this.nodes.length).fill(0));

        for(const [i, j] of this.pairs)
        {
            this.paths.push(new Path(this.nodes[i], this.nodes[j]));
            this.matrix[i][j] = this.matrix[j][i] = 1;
        }

        for(const type in nodesInfo)
        {
            const index = nodesInfo[type];
            this.nodes[index].setInfo(infoMap[type]);
        }
    }

    addNode(pos)
    {
        if(!pos) return;

        this.nodes.push(new Node(pos));
        
        for(let i = 0; i < this.matrix.length; ++i)
            this.matrix[i].push(0);
        this.matrix.push(Array(this.nodes.length).fill(0));
    }
    
    addPath(i, j)
    {
        if(i >= this.nodes.length || j >= this.nodes.length)
            return console.log("out of bound");
        if(this.matrix[i][j])
            return;
        
        this.paths.push(new Path(this.nodes[i], this.nodes[j]));
        this.matrix[i][j] = this.matrix[j][i] = 1;
    }

    addData(data)
    {
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