// Base64 encode helper
function encodeCredentials(username, password) {
    return btoa(`${username}:${password}`);
}

// Global auth header
let authHeader = null;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
const loginBtn = document.getElementById('loginBtn');

// Show login modal on first load
document.addEventListener('DOMContentLoaded', () => {
    loginModal.show();
});

// Handle login
loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    authHeader = 'Basic ' + encodeCredentials(username, password);
    loginModal.hide();
    loadTasks();
});

// Load all tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: { 'Authorization': authHeader }
        });

        if (!response.ok) throw new Error('Failed to load tasks');

        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error:', error);
        alert('Please login again');
        loginModal.show();
    }
}

// Render tasks to DOM
function renderTasks(tasks) {
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `list-group-item task-card ${task.completed ? 'completed' : ''} ${isUrgent(task.dueDate) ? 'urgent' : ''}`;
        taskElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${task.title}</h5>
                    <p class="mb-1">${task.description || ''}</p>
                    <small class="due-date">Due: ${formatDate(task.dueDate)}</small>
                </div>
                <div>
                    <button onclick="toggleTask(${task.id})" class="btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-success'} me-2">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-danger">Delete</button>
                </div>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

// Add new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newTask = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('dueDate').value,
        completed: false
    };

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) throw new Error('Failed to add task');

        document.getElementById('taskForm').reset();
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add task');
    }
});

// Toggle task completion
async function toggleTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}/toggle`, {
            method: 'PUT',
            headers: { 'Authorization': authHeader }
        });

        if (!response.ok) throw new Error('Failed to update task');
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': authHeader }
        });

        if (!response.ok) throw new Error('Failed to delete task');
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Helper: Format date
function formatDate(dateString) {
    if (!dateString) return 'No due date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper: Check if task is urgent (due in < 3 days)
function isUrgent(dateString) {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
}