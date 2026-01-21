let tasks = JSON.parse(localStorage.getItem("tasks")) || [
  {
    id: 1,
    title: "Go shopping",
    done: false,
    subtasks: []
  }
];

// 🔒 UI STATE (important fix)
let expandedTasks = new Set();

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  // Open tasks first, completed at bottom
  const sortedTasks = [...tasks].sort((a, b) => a.done - b.done);

  sortedTasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task" + (task.done ? " done" : "");

    const header = document.createElement("div");
    header.className = "task-header";

    // Main checkbox
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

    // Chevron
    let chevron;
    let subtasksEl;

    if (task.subtasks.length) {
      chevron = document.createElement("div");
      chevron.className = "chevron";
      chevron.textContent = "›";

      chevron.onclick = () => {
        if (expandedTasks.has(task.id)) {
          expandedTasks.delete(task.id);
          subtasksEl.style.display = "none";
          chevron.textContent = "›";
        } else {
          expandedTasks.add(task.id);
          subtasksEl.style.display = "block";
          chevron.textContent = "⌄";
        }
      };

      header.appendChild(chevron);
    }

    // ➕ Add subtask (temporary UX)
    const addSub = document.createElement("button");
    addSub.textContent = "+ subtask";
    addSub.onclick = () => {
      const text = prompt("Subtask");
      if (!text) return;

      task.subtasks.push({
        id: Date.now(),
        title: text,
        done: false
      });

      expandedTasks.add(task.id); // keep open
      save();
      render();
    };

    header.appendChild(addSub);

    // Subtasks container
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

        // 🔒 keep expanded while interacting
        expandedTasks.add(task.id);

        // auto-complete main task
        task.done =
          task.subtasks.length > 0 &&
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

    // Restore expanded state
    if (expandedTasks.has(task.id)) {
      subtasksEl.style.display = "block";
      if (chevron) chevron.textContent = "⌄";
    }

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