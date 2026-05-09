
// Enhanced Dashboard Main JavaScript
const radioViewOptions = document.querySelectorAll(
  "input[name='view-option']"
);
const listView = document.getElementById("list-view");
const boardView = document.getElementById("board-view");
const addTaskCTA = document.getElementById("add-task-cta");
const setTaskOverlay = document.getElementById("set-task-overlay");
const viewTaskOverlay = document.getElementById("view-task-overlay");
const closeButtons = document.querySelectorAll(".close-button");
const statusSelect = document.getElementById("status-select");
const statusDropdown = document.getElementById("status-dropdown");
const deleteTaskCTA = document.getElementById("delete-task-cta");
const editTaskCTA = document.getElementById("edit-task-cta");
const notification = document.getElementById("notification");

let activeOverlay = null;
let currentEditingTask = null;

function getCurrentUser() {
  return JSON.parse(
    sessionStorage.getItem("taskforge_current_user") || "null"
  );
}

function getUserTasks() {
  const user = getCurrentUser();
  if (!user) return [];
  return JSON.parse(
    sessionStorage.getItem(`taskforge_tasks_${user.id}`) || "[]"
  );
}

function saveUserTasks(tasks) {
  const user = getCurrentUser();
  if (!user) return;
  sessionStorage.setItem(
    `taskforge_tasks_${user.id}`,
    JSON.stringify(tasks)
  );
}

function showNotification(message, bgColor = "green-background") {
  notification.innerHTML = `
        <iconify-icon icon="mdi:check-circle-outline" style="color: black" width="24" height="24"></iconify-icon>
        <p>${message}</p>
      `;
  notification.className = `notification ${bgColor}`;
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 3000);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderTasks() {
  const tasks = getUserTasks();

  document
    .querySelectorAll(".tasks-list")
    .forEach((list) => (list.innerHTML = ""));

  const tasksByStatus = {
    "to-do": tasks.filter((t) => t.status === "to-do"),
    doing: tasks.filter((t) => t.status === "doing"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const tasksByCategory = {
    college: tasks.filter((t) => t.category === "college"),
    "extra-activity": tasks.filter(
      (t) => t.category === "extra-activity"
    ),
  };

  renderListView(tasksByStatus);
  renderBoardView(tasksByCategory);
}

function renderListView(tasksByStatus) {
  const containers = [
    {
      status: "to-do",
      el: document.querySelector(
        "#list-view .list-container.pink .tasks-list"
      ),
    },
    {
      status: "doing",
      el: document.querySelector(
        "#list-view .list-container.blue .tasks-list"
      ),
    },
    {
      status: "done",
      el: document.querySelector(
        "#list-view .list-container.green .tasks-list"
      ),
    },
  ];

  containers.forEach(({ status, el }) => {
    if (!el) return;
    tasksByStatus[status].forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item fade-in";
      li.innerHTML = `
            <button class="task-button" data-task-id="${task.id}">
              <p class="task-name">${task.name}</p>
              <p class="task-due-date">${formatDate(task.dueDate)}</p>
              <iconify-icon icon="material-symbols:arrow-back-ios-rounded" width="18" height="18" class="arrow-icon"></iconify-icon>
            </button>
          `;
      el.appendChild(li);
    });
  });

  attachTaskClickListeners();
}

function renderBoardView(tasksByCategory) {
  const containers = [
    {
      cat: "college",
      el: document.querySelector(
        "#board-view > div:nth-child(1) .tasks-list"
      ),
    },
    {
      cat: "extra-activity",
      el: document.querySelector(
        "#board-view > div:nth-child(2) .tasks-list"
      ),
    },
  ];

  containers.forEach(({ cat, el }) => {
    if (!el) return;
    tasksByCategory[cat].forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item fade-in";
      const shadow =
        task.status === "doing"
          ? "blue"
          : task.status === "done"
            ? "green"
            : "pink";
      li.style.boxShadow = `6px 6px 0px var(--${shadow})`;
      li.innerHTML = `
            <button class="task-button" data-task-id="${task.id}">
              <div>
                <p class="task-name">${task.name}</p>
                <p class="task-due-date">${formatDate(task.dueDate)}</p>
              </div>
              <iconify-icon icon="material-symbols:arrow-back-ios-rounded" width="18" height="18" class="arrow-icon"></iconify-icon>
            </button>
          `;
      el.appendChild(li);
    });
  });

  attachTaskClickListeners();
}

function attachTaskClickListeners() {
  document.querySelectorAll(".task-button").forEach((btn) => {
    btn.addEventListener("click", function () {
      openTaskDetails(parseInt(this.getAttribute("data-task-id")));
    });
  });
}

function openTaskDetails(taskId) {
  const task = getUserTasks().find((t) => t.id === taskId);
  if (!task) return;

  currentEditingTask = task;
  document.querySelector(
    "#view-task-overlay .task-name-value"
  ).textContent = task.name;
  document.querySelector(
    "#view-task-overlay .task-description-value"
  ).textContent = task.description;
  document.querySelector(
    "#view-task-overlay .task-date-value"
  ).textContent = formatDate(task.dueDate);
  document.querySelector(
    "#view-task-overlay .task-category-value"
  ).textContent =
    task.category === "college" ? "College" : "Student Extra Activity";

  const statusText =
    task.status === "to-do"
      ? "To Do"
      : task.status === "doing"
        ? "Doing"
        : "Done";
  const statusColor =
    task.status === "to-do"
      ? "pink"
      : task.status === "doing"
        ? "blue"
        : "green";
  document.querySelector("#view-task-overlay .status-value").innerHTML = `
        <span class="circle ${statusColor}-background"></span><span>${statusText}</span>
      `;

  viewTaskOverlay.classList.remove("hide");
  activeOverlay = viewTaskOverlay;
  document.body.classList.add("overflow-hidden");
}

radioViewOptions.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    listView.classList.toggle("hide", e.target.value !== "list");
    boardView.classList.toggle("hide", e.target.value !== "board");
  });
});

addTaskCTA.addEventListener("click", () => {
  document.getElementById("overlay-title").textContent = "Add task";
  document.getElementById("task-form").reset();
  document.querySelector("#status-select .status-text").textContent =
    "To Do";
  currentEditingTask = null;
  setTaskOverlay.classList.remove("hide");
  activeOverlay = setTaskOverlay;
  document.body.classList.add("overflow-hidden");
});

closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (activeOverlay) {
      activeOverlay.classList.add("hide");
      activeOverlay = null;
      document.body.classList.remove("overflow-hidden");
    }
  });
});

statusSelect.addEventListener("click", () =>
  statusDropdown.classList.toggle("hide")
);

document
  .querySelectorAll('#status-dropdown input[name="status"]')
  .forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const labels = { "to-do": "To Do", doing: "Doing", done: "Done" };
      document.querySelector("#status-select .status-text").textContent =
        labels[e.target.value];
      const colors = { "to-do": "pink", doing: "blue", done: "green" };
      document.querySelector(
        "#status-select .circle"
      ).className = `circle ${colors[e.target.value]}-background`;
      statusDropdown.classList.add("hide");
    });
  });

editTaskCTA.addEventListener("click", () => {
  if (!currentEditingTask) return;
  document.getElementById("name").value = currentEditingTask.name;
  document.getElementById("description").value =
    currentEditingTask.description;
  document.getElementById("date").value = currentEditingTask.dueDate;
  document.getElementById("category").value = currentEditingTask.category;
  document.querySelector(
    `#status-dropdown input[value="${currentEditingTask.status}"]`
  ).checked = true;

  const labels = { "to-do": "To Do", doing: "Doing", done: "Done" };
  const colors = { "to-do": "pink", doing: "blue", done: "green" };
  document.querySelector("#status-select .status-text").textContent =
    labels[currentEditingTask.status];
  document.querySelector("#status-select .circle").className = `circle ${colors[currentEditingTask.status]
    }-background`;

  document.getElementById("overlay-title").textContent = "Edit task";
  viewTaskOverlay.classList.add("hide");
  setTaskOverlay.classList.remove("hide");
  activeOverlay = setTaskOverlay;
});

deleteTaskCTA.addEventListener("click", () => {
  if (
    !currentEditingTask ||
    !confirm("Are you sure you want to delete this task?")
  )
    return;
  const tasks = getUserTasks().filter(
    (t) => t.id !== currentEditingTask.id
  );
  saveUserTasks(tasks);
  viewTaskOverlay.classList.add("hide");
  activeOverlay = null;
  document.body.classList.remove("overflow-hidden");
  showNotification("The task was deleted", "green-background");
  renderTasks();
});

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const status = document.querySelector(
    '#status-dropdown input[name="status"]:checked'
  ).value;

  if (!name || !description || !date || !category) {
    alert("Please fill in all fields");
    return;
  }

  const tasks = getUserTasks();
  if (currentEditingTask) {
    const idx = tasks.findIndex((t) => t.id === currentEditingTask.id);
    if (idx !== -1) {
      tasks[idx] = {
        ...tasks[idx],
        name,
        description,
        dueDate: date,
        category,
        status,
        updatedAt: new Date().toISOString(),
      };
      showNotification("Task updated successfully!", "blue-background");
    }
  } else {
    tasks.push({
      id: Date.now(),
      name,
      description,
      dueDate: date,
      category,
      status,
      createdAt: new Date().toISOString(),
      userId: getCurrentUser().id,
    });
    showNotification("Task added successfully!", "blue-background");
  }

  saveUserTasks(tasks);
  renderTasks();
  setTaskOverlay.classList.add("hide");
  activeOverlay = null;
  document.body.classList.remove("overflow-hidden");
  currentEditingTask = null;
});

window.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const titleEl = document.querySelector(".header .title");
  if (titleEl && user.name) {
    const firstName = user.name.split(" ")[0];
    titleEl.innerHTML = `Welcome, ${firstName}! <span>Task</span><span style="color: var(--pink)">Forge</span>`;
  }
  renderTasks();
});

document.querySelector(".sign-out-cta").addEventListener("click", (e) => {
  e.preventDefault();
  if (confirm("Are you sure you want to sign out?")) {
    sessionStorage.removeItem("taskforge_current_user");
    window.location.href = "login.html";
  }
});
