let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let expandedTasks = new Set();

// Modal state
let modalTask = null;
let editingSubtaskIndex = null;

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const sortedTasks = [...tasks].sort((a,b)=>a.done - b.done);

  sortedTasks.forEach((task, idx) => {
    const taskEl = document.createElement("div");
    taskEl.className = "task" + (task.done ? " done" : "");

    const header = document.createElement("div");
    header.className = "task-header";

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.onchange = () => {
      task.done = checkbox.checked;
      save();
      render();
    };
    header.appendChild(checkbox);

    // Title
    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;
    header.appendChild(title);

    // Chevron
    let chevron, subtasksEl;
    if(task.subtasks.length>0){
      chevron = document.createElement("div");
      chevron.className = "chevron";
      chevron.textContent = "›";

      chevron.onclick = () => {
        if(expandedTasks.has(task.id)){
          expandedTasks.delete(task.id);
          subtasksEl.style.display="none";
          chevron.textContent="›";
        }else{
          expandedTasks.add(task.id);
          subtasksEl.style.display="block";
          chevron.textContent="⌄";
        }
      };

      header.appendChild(chevron);
    }

    // Menu
    const menuBtn = document.createElement("div");
    menuBtn.className="task-menu";
    menuBtn.textContent="⋯";
    menuBtn.onclick = () => openModal(task);
    header.appendChild(menuBtn);

    // Subtasks container
    subtasksEl = document.createElement("div");
    subtasksEl.className="subtasks";

    task.subtasks.forEach((sub, sidx)=>{
      const subEl = document.createElement("div");
      subEl.className="subtask";

      const subCheck = document.createElement("input");
      subCheck.type="checkbox";
      subCheck.checked=sub.done;
      subCheck.onchange = ()=>{
        sub.done=subCheck.checked;
        expandedTasks.add(task.id);
        task.done = task.subtasks.length>0 && task.subtasks.every(s=>s.done);
        save();
        render();
      };
      const subTitle = document.createElement("span");
      subTitle.textContent=sub.title;

      subEl.appendChild(subCheck);
      subEl.appendChild(subTitle);
      subtasksEl.appendChild(subEl);
    });

    if(expandedTasks.has(task.id)){
      subtasksEl.style.display="block";
      if(chevron) chevron.textContent="⌄";
    }

    taskEl.appendChild(header);
    if(task.subtasks.length>0) taskEl.appendChild(subtasksEl);
    list.appendChild(taskEl);
  });
}

// Modal functions
const modal=document.getElementById("modal");
const modalInput=document.getElementById("modalInput");
const subtaskContainer=document.getElementById("subtaskContainer");

function openModal(task){
  modalTask=task;
  modalInput.value=task.title;
  subtaskContainer.innerHTML="";

  task.subtasks.forEach((sub,idx)=>{
    const div=document.createElement("div");
    div.style.display="flex"; div.style.gap="6px"; div.style.marginBottom="6px";

    const input=document.createElement("input");
    input.type="text"; input.value=sub.title; input.style.flex="1";
    input.oninput=()=>{sub.title=input.value;};

    const del=document.createElement("button");
    del.textContent="×"; del.onclick=()=>{
      task.subtasks.splice(idx,1);
      render();
      openModal(task);
    };

    div.appendChild(input); div.appendChild(del);
    subtaskContainer.appendChild(div);
  });

  // Add subtask button
  const addSub=document.createElement("button");
  addSub.textContent="+ subtask"; addSub.style.marginTop="6px";
  addSub.onclick=()=>{
    task.subtasks.push({id:Date.now(),title:"",done:false});
    openModal(task);
  };
  subtaskContainer.appendChild(addSub);

  modal.classList.remove("hidden");
}

document.getElementById("modalSaveBtn").onclick=()=>{
  modalTask.title=modalInput.value;
  save();
  modal.classList.add("hidden");
  render();
};

document.getElementById("modalCancelBtn").onclick=()=>{
  modal.classList.add("hidden");
};

document.getElementById("addTaskBtn").onclick=()=>{
  const newTask={id:Date.now(),title:"",done:false,subtasks:[]};
  tasks.push(newTask);
  save();
  openModal(newTask);
};

render();