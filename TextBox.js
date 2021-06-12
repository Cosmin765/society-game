class TextBox
{
    constructor(text = "", width = adapt(150))
    {
        this.text = text;
        this.currText = "";
        this.acc = 0;
        this.index = 0;
        this.fontSize = adapt(25);
        this.textHeight = adapt(30);
        
        this.size = new Vec2(width, 0);
        
    }

    update()
    {
        if(this.index < this.text.length)
        {
            this.acc++;
            if(this.acc % 4 === 0) {
                this.acc = 0;
                this.currText += this.text[this.index++];
                const lines = this.getLines(adapt(this.size.x));
                this.size.y = this.textHeight * lines.length + this.textHeight;
            }
        }
    }

    getLines(maxWidth) {
        ctx.font = `${this.fontSize}px Arial`;
        const words = this.currText.split(" ");
        const lines = [];
        let currentLine = words[0];
    
        for (let i = 1; i < words.length; ++i) {
            const word = words[i];
            const width = adapt(ctx.measureText(currentLine + " " + word).width);
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    renderPanel()
    {
        ctx.save();
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.translate(...this.size.copy().div(-2));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size.x, 0);
        ctx.lineTo(...this.size);
        ctx.lineTo(this.size.x / 2 + adapt(10), this.size.y);
        ctx.lineTo(this.size.x / 2, this.size.y + adapt(10));
        ctx.lineTo(this.size.x / 2 - adapt(10), this.size.y);
        ctx.lineTo(0, this.size.y);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    render()
    {
        ctx.save();
        ctx.translate(0, -this.size.y / 2);
        this.renderPanel();
        ctx.translate(0, -this.size.y / 2 + this.textHeight);
        
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.font = `${this.fontSize}px Arial`;
        const lines = this.getLines(adapt(this.size.x));
        for(let i = 0; i < lines.length; ++i)
        {
            ctx.fillText(lines[i], 0, i * this.textHeight);
        }
        ctx.restore();
    }
}