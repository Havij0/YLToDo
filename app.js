let data = JSON.parse(localStorage.getItem("todoData")) || {
  daily: [],
  weekly: [],
  shopping: []
};

function save() {
  localStorage.setItem("todoData", JSON.stringify(data));
}

function addTask() {
  const title = taskTitle.value.trim();
  if (!title) return;

  const task = {
    title,
    date: taskDate.value,
    priority: taskPriority.value,
    done: false
  };

  data[taskList.value].push(task);
  save();
  taskTitle.value = "";
  render();
}

function toggleDone(list, index) {
  data[list][index].done = !data[list][index].done;
  save();
  render();
}

function render() {
  lists.innerHTML = "";

  for (const list in data) {
    const div = document.createElement("div");
    div.className = "list";
    div.innerHTML = `<h2>${list.toUpperCase()}</h2>`;

    data[list].forEach((task, i) => {
      const taskDiv = document.createElement("div");
      taskDiv.className =
        "task " +
        (task.priority === "important" ? "important " : "") +
        (task.done ? "done" : "");

      taskDiv.innerHTML = `
        <span>${task.title} ${task.date ? "📅 " + task.date : ""}</span>
        <button onclick="toggleDone('${list}', ${i})">
          ${task.done ? "↩️" : "✅"}
        </button>
      `;

      div.appendChild(taskDiv);
    });

    lists.appendChild(div);
  }
}

render();