const STORAGE_KEY = "studynest.tasks.v1";

const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const subjectSelect = document.querySelector("#subject-select");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const filterButtons = document.querySelectorAll(".filter-button");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });

  taskList.replaceChildren();
  emptyState.hidden = visibleTasks.length > 0;

  visibleTasks.forEach((task) => {
    const row = document.createElement("li");
    row.className = `task-item${task.done ? " is-done" : ""}`;

    const check = document.createElement("button");
    check.className = "check-button";
    check.type = "button";
    check.setAttribute("aria-label", task.done ? "Mark task as not done" : "Mark task as done");
    check.innerHTML = task.done ? "<span>✓</span>" : "";
    check.addEventListener("click", () => toggleTask(task.id));

    const copy = document.createElement("div");
    copy.className = "task-copy";
    const name = document.createElement("div");
    name.className = "task-name";
    name.textContent = task.name;
    const subject = document.createElement("div");
    subject.className = "task-subject";
    subject.textContent = task.subject;
    copy.append(name, subject);

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.setAttribute("aria-label", `Delete ${task.name}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => deleteTask(task.id));

    row.append(check, copy, remove);
    taskList.append(row);
  });

  const doneCount = tasks.filter((task) => task.done).length;
  const totalCount = tasks.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  document.querySelector("#total-count").textContent = totalCount;
  document.querySelector("#done-count").textContent = doneCount;
  document.querySelector("#progress-text").textContent = `${percent}%`;
  document.querySelector("#progress-bar").style.width = `${percent}%`;
  document.querySelector("#progress-caption").textContent = totalCount
    ? `${doneCount} of ${totalCount} tasks complete`
    : "Add a task to get started";
  document.querySelector("#task-count-label").textContent = `${totalCount} ${totalCount === 1 ? "task" : "tasks"}`;
}

function addTask(name, subject) {
  tasks.unshift({ id: crypto.randomUUID(), name, subject, done: false });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = taskInput.value.trim();
  if (!name) return;
  addTask(name, subjectSelect.value);
  form.reset();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderTasks();
  });
});

document.querySelector("#clear-done").addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
});

const today = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });
document.querySelector("#today-date").textContent = today.format(new Date());
document.querySelector("#footer-year").textContent = new Date().getFullYear();
renderTasks();
