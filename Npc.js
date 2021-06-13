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
    }

    update()
    {
        this.textBox.update();
    }

    setText(text)
    {

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