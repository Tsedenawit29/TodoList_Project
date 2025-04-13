// DOM Elements
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const dueDateInput = document.getElementById('dueDate');
const prioritySelect = document.getElementById('priority');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');
const currentTimeElement = document.getElementById('current-time');
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// App State
let tasks = [];
let authHeader = null;
let currentFilter = 'all';

// Initialize
function init() {
    setupEventListeners();
    updateClock();
    setInterval(updateClock, 1000);
    showLoginModal();
}

// Event Listeners
function setupEventListeners() {
    // Task Form
    taskForm.addEventListener('submit', handleAddTask);

    // Filter Buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => handleFilterChange(button.dataset.filter));
    });

    // Login
    loginBtn.addEventListener('click', handleLogin);
}

// Time Functions
function updateClock() {
    const now = new Date();
    currentTimeElement.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Authentication
function showLoginModal() {
    loginModal.style.display = 'flex';
}

function hideLoginModal() {
    loginModal.style.display = 'none';
}

function handleLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username && password) {
        authHeader = 'Basic ' + btoa(`${username}:${password}`);
        hideLoginModal();
        loadTasks();
    }
}

// Task CRUD Operations
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: { 'Authorization': authHeader }
        });

        if (!response.ok) throw new Error('Failed to load tasks');

        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showLoginModal();
    }
}

async function handleAddTask(e) {
    e.preventDefault();

    const newTask = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        deadline: dueDateInput.value,
        priority: prioritySelect.value,
        completed: false
    };

    if (!newTask.title) return;

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            taskForm.reset();
            loadTasks();
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

async function toggleTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}/toggle`, {
            method: 'PUT',
            headers: { 'Authorization': authHeader }
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': authHeader }
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Filtering
function handleFilterChange(filter) {
    currentFilter = filter;

    // Update active button
    filterButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.filter === filter);
    });

    renderTasks();
}

function filterTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Rendering
function renderTasks() {
    const filteredTasks = filterTasks();
    const groupedTasks = groupTasksByDate(filteredTasks);

    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No tasks found</p>
            </div>
        `;
        return;
    }

    for (const [date, dateTasks] of Object.entries(groupedTasks)) {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'task-group';

        dateGroup.innerHTML = `
            <h3 class="task-date">
                <i class="fas fa-calendar-day"></i>
                ${formatDate(date)}
            </h3>
            <ul class="task-list">
                ${dateTasks.map(task => createTaskElement(task)).join('')}
            </ul>
        `;

        taskList.appendChild(dateGroup);
    }
}

function groupTasksByDate(tasks) {
    return tasks.reduce((groups, task) => {
        const date = task.deadline || 'No Date';
        if (!groups[date]) groups[date] = [];
        groups[date].push(task);
        return groups;
    }, {});
}

function createTaskElement(task) {
    return `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox">
                <input
                    type="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
            </div>
            <div class="task-content">
                <h3>${task.title}</h3>
                ${task.description ? `<p>${task.description}</p>` : ''}
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority || 'medium'}">
                        ${task.priority || 'medium'}
                    </span>
                    ${task.deadline ? `
                        <span class="task-due-date">
                            <i class="fas fa-clock"></i>
                            ${formatDate(task.deadline)}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button onclick="deleteTask(${task.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `;
}

function formatDate(dateString) {
    if (!dateString || dateString === 'No Date') return 'No Due Date';
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize the app
init();