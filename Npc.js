class Npc extends Ant
{
    constructor(pos)
    {
        super(pos);
        this.textBox = new TextBox("Hello, dear survivor. How are you?", 200);
    }

    update()
    {
        this.textBox.update();
    }

    setText(text)
    {

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