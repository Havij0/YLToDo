let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let expandedTasks = new Set();
let editingTask = null;

const modal = document.getElementById("modal");
const titleInput = document.getElementById("taskTitleInput");
const subtaskEditor = document.getElementById("subtaskEditor");

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const sorted = [...tasks].sort((a,b) => a.done - b.done);

  sorted.forEach(task => {
    const el = document.createElement("div");
    el.className = "task" + (task.done ? " done" : "");

    const header = document.createElement("div");
    header.className = "task-header";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = task.done;
    cb.onchange = () => {
      task.done = cb.checked;
      if (task.done) expandedTasks.delete(task.id);
      save();
      render();
    };

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    header.appendChild(cb);
    header.appendChild(title);

    let subtasksEl;

    if (task.subtasks.length) {
      const chev = document.createElement("div");
      chev.className = "chevron";
      chev.textContent = expandedTasks.has(task.id) ? "⌄" : "›";
      chev.onclick = () => {
        expandedTasks.has(task.id)
          ? expandedTasks.delete(task.id)
          : expandedTasks.add(task.id);
        render();
      };
      header.appendChild(chev);
    }

    const menu = document.createElement("div");
    menu.className = "menu";
    menu.textContent = "⋯";
    menu.onclick = () => openModal(task);
    header.appendChild(menu);

    el.appendChild(header);

    subtasksEl = document.createElement("div");
    subtasksEl.className = "subtasks";

    task.subtasks.forEach(sub => {
      const s = document.createElement("div");
      s.className = "subtask";

      const scb = document.createElement("input");
      scb.type = "checkbox";
      scb.checked = sub.done;
      scb.onchange = () => {
        sub.done = scb.checked;
        if (task.subtasks.every(st => st.done)) {
          task.done = true;
          expandedTasks.delete(task.id);
        } else {
          expandedTasks.add(task.id);
        }
        save();
        render();
      };

      const st = document.createElement("span");
      st.textContent = sub.title;

      s.appendChild(scb);
      s.appendChild(st);
      subtasksEl.appendChild(s);
    });

    if (expandedTasks.has(task.id)) subtasksEl.style.display = "block";

    if (task.subtasks.length) el.appendChild(subtasksEl);
    list.appendChild(el);
  });
}

function openModal(task) {
  editingTask = task;
  titleInput.value = task.title;
  subtaskEditor.innerHTML = "";

  task.subtasks.forEach((s, i) => {
    const row = document.createElement("div");
    const input = document.createElement("input");
    input.value = s.title;
    input.oninput = () => s.title = input.value;

    const del = document.createElement("button");
    del.textContent = "×";
    del.onclick = () => {
      task.subtasks.splice(i,1);
      openModal(task);
    };

    row.appendChild(input);
    row.appendChild(del);
    subtaskEditor.appendChild(row);
  });

  modal.classList.remove("hidden");
}

document.getElementById("addSubtaskBtn").onclick = () => {
  editingTask.subtasks.push({ id: Date.now(), title: "", done: false });
  openModal(editingTask);
};

document.getElementById("saveTaskBtn").onclick = () => {
  editingTask.title = titleInput.value;
  save();
  modal.classList.add("hidden");
  render();
};

document.getElementById("cancelTaskBtn").onclick = () => {
  modal.classList.add("hidden");
};

document.getElementById("addTaskBtn").onclick = () => {
  const t = { id: Date.now(), title: "", done: false, subtasks: [] };
  tasks.push(t);
  openModal(t);
};

render();