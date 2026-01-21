let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function saveTasks(){ localStorage.setItem('tasks', JSON.stringify(tasks)); }

function showTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.style.display='none');
  document.getElementById(tab).style.display='block';
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab'+tab.charAt(0).toUpperCase()+tab.slice(1)+'Btn').classList.add('active');
  renderTasks();
}

function openAddTaskModal(){ 
  document.getElementById('taskTitle').value='';
  document.getElementById('taskPriority').value='3';
  document.getElementById('taskDate').value='';
  document.getElementById('taskWeekend').checked=false;
  document.getElementById('taskHasSubtasks').checked=false;
  document.getElementById('addTaskModal').style.display='flex';
}
function closeAddTaskModal(){ document.getElementById('addTaskModal').style.display='none'; }

function addTask(){
  const title=document.getElementById('taskTitle').value.trim();
  if(!title) return alert('Task title required');
  const priority=parseInt(document.getElementById('taskPriority').value);
  const dateVal=document.getElementById('taskDate').value;
  const weekend=document.getElementById('taskWeekend').checked;
  const hasSubtasks=document.getElementById('taskHasSubtasks').checked;

  const todayStr=new Date().toISOString().split('T')[0];
  let state=null;
  let date=dateVal || null;

  if(date===todayStr) state='today';
  else if(date) state='scheduled';
  else if(weekend) state='reschedule'; // weekend in Reschedule tab
  else state='reschedule';

  const newTask={
    id:Date.now().toString(),
    title, priority, state, date,
    hasSubtasks, subtasks:[],
    reminderEnabled:false, reminderTime:null,
    createdAt:Date.now(), updatedAt:Date.now()
  };

  tasks.push(newTask);
  saveTasks(); closeAddTaskModal(); renderTasks();
}

// ======= Render =======
function renderTasks(){
  const todayDiv=document.getElementById('today');
  const rescheduleDiv=document.getElementById('reschedule');
  const agendaDiv=document.getElementById('agenda');

  todayDiv.innerHTML=''; rescheduleDiv.innerHTML=''; agendaDiv.innerHTML='';

  const todayStr=new Date().toISOString().split('T')[0];

  // TASKS
  tasks.forEach(task=>{
    const taskEl=document.createElement('div'); taskEl.className='task';
    if(task.state==='done') taskEl.classList.add('done');
    taskEl.innerHTML=`<span class="title">${task.title}</span>
      <button onclick="toggleOptions('${task.id}')" style="position:absolute; top:5px; right:5px;">…</button>
      <div class="options-menu" id="menu-${task.id}">
        <button onclick="markDone('${task.id}')">✅ Done</button>
        <button onclick="rescheduleTask('${task.id}')">🔁 Reschedule</button>
        <button onclick="editTask('${task.id}')">✏️ Edit</button>
        <button onclick="deleteTask('${task.id}')">🗑 Delete</button>
      </div>`;

    // subtasks
    if(task.hasSubtasks && task.subtasks.length){
      const subDiv=document.createElement('div'); subDiv.className='subtasks';
      task.subtasks.forEach((st,idx)=>{
        const stEl=document.createElement('div'); stEl.className='subtask';
        stEl.innerHTML=`<input type="checkbox" ${st.completed?'checked':''} onchange="toggleSubtask('${task.id}',${idx})">${st.title}`;
        subDiv.appendChild(stEl);
      });
      taskEl.appendChild(subDiv);
    }

    if(task.state==='today') todayDiv.appendChild(taskEl);
    else if(task.state==='reschedule') rescheduleDiv.appendChild(taskEl);
    else if(task.state==='scheduled') agendaDiv.appendChild(taskEl);
  });

  renderAgenda();
}

// ====== Task Actions ======
function toggleOptions(id){
  const menu=document.getElementById('menu-'+id);
  menu.style.display=menu.style.display==='flex'?'none':'flex';
}
function markDone(id){ const t=tasks.find(x=>x.id===id); if(t){ t.state='done'; t.updatedAt=Date.now(); saveTasks(); renderTasks(); } }
function rescheduleTask(id){ const t=tasks.find(x=>x.id===id); if(!t) return;
  const newDate=prompt("Enter new date YYYY-MM-DD or leave blank for Reschedule/Weekend:");
  if(newDate){ t.date=newDate; const todayStr=new Date().toISOString().split('T')[0]; t.state=newDate===todayStr?'today':'scheduled'; } else { t.date=null; t.state='reschedule'; }
  t.updatedAt=Date.now(); saveTasks(); renderTasks();
}
function deleteTask(id){ if(confirm('Delete task?')){ tasks=tasks.filter(x=>x.id!==id); saveTasks(); renderTasks(); } }
function editTask(id){ const t=tasks.find(x=>x.id===id); if(!t) return;
  const newTitle=prompt('Edit title', t.title); if(newTitle) t.title=newTitle;
  t.updatedAt=Date.now(); saveTasks(); renderTasks();
}
function toggleSubtask(taskId,idx){ const t=tasks.find(x=>x.id===taskId); if(t){ t.subtasks[idx].completed=!t.subtasks[idx].completed; saveTasks(); renderTasks(); } }

// ====== Agenda Rendering ======
function renderAgenda(){
  const agendaDiv=document.getElementById('agenda');
  const days=[]; // next 14 days
  for(let i=0;i<14;i++){
    const d=new Date(); d.setDate(d.getDate()+i);
    days.push(d.toISOString().split('T')[0]);
  }

  days.forEach(day=>{
    const dayDiv=document.createElement('div'); dayDiv.className='agenda-day no-task';
    dayDiv.textContent=day.split('-')[2];
    const dayTasks=tasks.filter(t=>t.date===day);
    if(dayTasks.length){
      const maxPriority=Math.min(...dayTasks.map(t=>t.priority));
      if(maxPriority===1) dayDiv.className='agenda-day mustdo';
      else if(maxPriority===2) dayDiv.className='agenda-day important';
      else dayDiv.className='agenda-day normal';
    }
    dayDiv.onclick=()=>showTasksOfDay(day);
    agendaDiv.appendChild(dayDiv);
  });
}

function showTasksOfDay(day){
  alert('Tasks for '+day+':\n'+tasks.filter(t=>t.date===day).map(t=>t.title).join('\n'));
}

// ===== Initial Load ======
showTab('today');