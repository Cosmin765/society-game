class Ant extends Animatable
{
    constructor(pos)
    {
        super(new Vec2(100, 100).modify(adapt));
        this.pos = pos.copy();
        this.setAnim(textures.ant.idle);
        this.angle = 0;
        this.currNode = this.calculateCurrNode();
        this.path = [];
    }

    calculateCurrNode()
    {
        for(let i = 0; i < terrain.nodes.length; ++i)
            if(terrain.nodes[i].contains(this.pos))
                return i;
        return -1;
    }
    
    setTargetNode(index, shortest = true)
    {
        const paths = []; //
        const path = []; // these are just containers
        this.findPath(this.currNode, index, path, paths, !shortest);

        if(!paths.length) // if there is no way to the node
            return;

        if(!shortest) {
            this.path = [...paths[0]];
        } else {
            this.path = this.getOptimalPath(paths);
        }

        this.path.shift(); // removing the current node
    }
    
    getOptimalPath(paths)
    {
        let minCost = Infinity, index = -1;
        for(let i = 0; i < paths.length; ++i)
        {
            let cost = 0;
            for(let j = 1; j < paths[i].length; ++j)
                cost += terrain.nodes[paths[i][j]].pos.copy().sub(terrain.nodes[paths[i][j - 1]].pos).dist();

            if(cost < minCost) {
                minCost = cost;
                index = i;
            }
        }
        
        return [...paths[index]];
    }

    findPath(index, finalIdx, path, paths, every)
    {
        path.push(index);
        if(index === finalIdx) {
            paths.push([...path]);
            return;
        }

        for(let i = 0; i < terrain.matrix[index].length; ++i)
        {
            if(terrain.matrix[index][i]) {
                terrain.matrix[index][i] = terrain.matrix[i][index] = 0;
                
                if((every && !paths.length) || !every)
                    this.findPath(i, finalIdx, path, paths, every);
                
                terrain.matrix[index][i] = terrain.matrix[i][index] = 1;
                path.pop();
            }
        }
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