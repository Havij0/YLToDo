// ======= LocalStorage =======
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// ======= Utility =======
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ======= Tabs =======
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
  renderTasks();
}

// ======= Add Task Modal =======
function openAddTaskModal() { document.getElementById('addTaskModal').style.display = 'flex'; }
function closeAddTaskModal() { document.getElementById('addTaskModal').style.display = 'none'; }

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if(!title) return alert('Task title required');
  const priority = parseInt(document.getElementById('taskPriority').value);
  const dateVal = document.getElementById('taskDate').value;
  const weekend = document.getElementById('taskWeekend').checked;
  const hasSubtasks = document.getElementById('taskHasSubtasks').checked;

  let state;
  let date = dateVal ? dateVal : null;

  const todayStr = new Date().toISOString().split('T')[0];

  if(date === todayStr) state = "today";
  else if(date) state = "scheduled";
  else if(weekend) state = "reschedule"; // weekend tasks stored in Reschedule tab
  else state = "reschedule";

  const newTask = {
    id: Date.now().toString(),
    title,
    priority,
    state,
    date,
    hasSubtasks,
    subtasks: [],
    reminderEnabled: false,
    reminderTime: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  tasks.push(newTask);
  saveTasks();
  closeAddTaskModal();
  renderTasks();
}

// ======= Render =======
function renderTasks() {
  const todayDiv = document.getElementById('today');
  const rescheduleDiv = document.getElementById('reschedule');
  const weekDiv = document.getElementById('week');

  todayDiv.innerHTML = '';
  rescheduleDiv.innerHTML = '';
  weekDiv.innerHTML = '';

  const todayStr = new Date().toISOString().split('T')[0];

  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = 'task';
    if(task.state === 'done') taskEl.classList.add('done');

    taskEl.innerHTML = `<span class="title">${task.title}</span> 
      <button class="action" onclick="markDone('${task.id}')">✅</button>
      <button class="action" onclick="rescheduleTask('${task.id}')">🔁</button>`;

    // Subtasks
    if(task.hasSubtasks && task.subtasks.length){
      const subDiv = document.createElement('div');
      subDiv.className = 'subtasks';
      task.subtasks.forEach((st, idx) => {
        const stEl = document.createElement('div');
        stEl.className = 'subtask';
        stEl.innerHTML = `<input type="checkbox" ${st.completed ? 'checked' : ''} onchange="toggleSubtask('${task.id}',${idx})">${st.title}`;
        subDiv.appendChild(stEl);
      });
      taskEl.appendChild(subDiv);
    }

    if(task.state === 'today') todayDiv.appendChild(taskEl);
    else if(task.state === 'reschedule') rescheduleDiv.appendChild(taskEl);
    else if(task.state === 'scheduled') weekDiv.appendChild(taskEl);
  });
}

// ======= Actions =======
function markDone(id) {
  const t = tasks.find(x => x.id === id);
  if(t) { t.state='done'; t.updatedAt=Date.now(); saveTasks(); renderTasks(); }
}

function rescheduleTask(id) {
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  const newDate = prompt("Enter new date (YYYY-MM-DD) or leave blank for Reschedule/Weekend:");
  if(newDate) { t.date=newDate; 
    const todayStr = new Date().toISOString().split('T')[0];
    t.state = newDate===todayStr?"today":"scheduled"; 
  } else { t.date=null; t.state='reschedule'; }
  t.updatedAt=Date.now(); saveTasks(); renderTasks();
}

function toggleSubtask(taskId, idx) {
  const t = tasks.find(x => x.id === taskId);
  if(t) {
    t.subtasks[idx].completed = !t.subtasks[idx].completed;
    saveTasks();
    renderTasks();
  }
}

// ======= Initial Load =======
showTab('today');
