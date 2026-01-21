let tasks = JSON.parse(localStorage.getItem("tasks")) || [
  {
    id: 1,
    title: "Go shopping",
    done: false,
    subtasks: []
  }
];

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  // ✅ FIX: open tasks first, completed at bottom
  const sortedTasks = [...tasks].sort((a, b) => a.done - b.done);

  sortedTasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task" + (task.done ? " done" : "");

    const header = document.createElement("div");
    header.className = "task-header";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.onchange = () => {
      task.done = checkbox.checked;
      save();
      render();
    };

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    header.appendChild(checkbox);
    header.appendChild(title);

    let subtasksEl;

    if (task.subtasks.length) {
      const chevron = document.createElement("div");
      chevron.textContent = "›";
      chevron.className = "chevron";

      chevron.onclick = () => {
        const visible = subtasksEl.style.display === "block";
        subtasksEl.style.display = visible ? "none" : "block";
        chevron.textContent = visible ? "›" : "⌄";
      };

      header.appendChild(chevron);
    }

    // ➕ Add subtask (minimal)
    const addSub = document.createElement("button");
    addSub.textContent = "+ subtask";
    addSub.style.marginLeft = "8px";
    addSub.onclick = () => {
      const text = prompt("Subtask");
      if (!text) return;

      task.subtasks.push({
        id: Date.now(),
        title: text,
        done: false
      });

      save();
      render();
    };

    header.appendChild(addSub);

    subtasksEl = document.createElement("div");
    subtasksEl.className = "subtasks";

    task.subtasks.forEach(sub => {
      const subEl = document.createElement("div");
      subEl.className = "subtask";

      const subCheck = document.createElement("input");
      subCheck.type = "checkbox";
      subCheck.checked = sub.done;

      subCheck.onchange = () => {
        sub.done = subCheck.checked;

        // ✅ auto-complete main task
        task.done = task.subtasks.length > 0 &&
                    task.subtasks.every(s => s.done);

        save();
        render();
      };

      const subTitle = document.createElement("span");
      subTitle.textContent = sub.title;

      subEl.appendChild(subCheck);
      subEl.appendChild(subTitle);
      subtasksEl.appendChild(subEl);
    });

    taskEl.appendChild(header);
    if (task.subtasks.length) taskEl.appendChild(subtasksEl);

    list.appendChild(taskEl);
  });
}

document.getElementById("addTaskBtn").onclick = () => {
  const title = prompt("Task title");
  if (!title) return;

  tasks.push({
    id: Date.now(),
    title,
    done: false,
    subtasks: []
  });

  save();
  render();
};

render();