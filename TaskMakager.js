class TaskManager
{
    constructor(tasks)
    {
        this.tasks = tasks;
        this.limit = 3;

        this.setHTML();
        setInterval(() => this.setHTML(), 1000);
    }

    setHTML()
    {
        const container = $(".task-list");
        container.innerHTML = "";
        const count = this.limit < this.tasks.length ? this.limit : this.tasks.length;
        for(let i = 0; i < count; ++i)
        {
            const task = this.tasks[i];
            const el = document.createElement("div");
            el.innerHTML = task.getText();
            el.addEventListener("click", () => {
                player.arrowData = {
                    visible: true,
                    getAngle: () => task.getTarget().copy().sub(player.pos).angle(),
                    taskIdx: i
                };
            });
            container.append(el);
            task.el = el;
        }
    }

    addTasks(tasks)
    {
        this.tasks = [ ...this.tasks, ...tasks ];
        this.setHTML();
    }

    update()
    {
        for(let i = 0; i < this.tasks.length; ++i) {
            const task = this.tasks[i];
            if(task.done()) {
                task.el.style.color = "green";
                task.done = () => true;

                if(player.arrowData.taskIdx === i) {
                    player.arrowData = {
                        visible: false,
                        getAngle: () => 0,
                        taskIdx: -1
                    };
                }
                this.tasks.splice(i--, 1);
            }
        }
    }
}