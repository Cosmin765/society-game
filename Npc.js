class Npc extends Ant
{
    constructor(pos)
    {
        super(pos);
        const texts = [
            "Hello, dear survivor. How are you?",
            "Anyway, we don't have much time. We need to get out of here!",
            "Let's go!!"
        ];
        this.textBox = new TextBox(texts, adapt(200));
        this.activated = false;
        this.currNode = this.calculateCurrNode();
        this.path = [];
    }

    setTargetNode(index)
    {
        const paths = []; //
        const path = []; // these are just containers
        this.findPath(this.currNode, index, path, paths);
        this.path = this.getOptimalPath(paths);
        this.path.shift();
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

    findPath(index, finalIdx, path, paths)
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
                
                this.findPath(i, finalIdx, path, paths);
                
                terrain.matrix[index][i] = terrain.matrix[i][index] = 1;
                path.pop();
            }
        }
    }

    calculateCurrNode()
    {
        for(let i = 0; i < terrain.nodes.length; ++i)
            if(terrain.nodes[i].contains(this.pos))
                return i;
        return -1;
    }

    update()
    {
        this.updateAnim();
        this.textBox.update();

        if(this.path.length) {
            this.setAnim(textures.ant.walking);
            const vel = terrain.nodes[this.path[0]].pos.copy().sub(this.pos).normalize().mult(2);
            this.angle = 0.9 * this.angle + 0.1 * (vel.angle() + Math.PI / 2); // to interpolate

            console.log(this.angle);

            this.pos.add(vel);

            if(terrain.nodes[this.path[0]].contains(this.pos, adapt(10))) {
                this.currNode = this.path[0];
                this.path.shift();
            }
        } else {
            this.setAnim(textures.ant.idle);
            this.setTargetNode(Math.random() * terrain.nodes.length | 0);
        }
    }

    activate()
    {
        if(!this.activated) {
            this.textBox.visible = true;
            this.textBox.reset();
        }
        this.activated = true;
    }

    deactivate()
    {
        if(this.activated) {
            this.textBox.visible = false;
        }
        this.activated = false;
    }

    renderCustom()
    {
        ctx.save();
        ctx.translate(...this.pos);
        ctx.translate(0, -this.dims.y / 2)
        this.textBox.render();
        ctx.restore();
    }
}