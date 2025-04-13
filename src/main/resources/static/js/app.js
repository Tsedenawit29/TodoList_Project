// DOM Elements
const newTaskInput = document.getElementById('newTask');
const addBtn = document.getElementById('addBtn');
const taskContainer = document.getElementById('taskContainer');
const greetingElement = document.getElementById('greeting');
const usernameElement = document.getElementById('username');
const timeElement = document.getElementById('time');

// Initialize
let tasks = [];
let authHeader = null;

// Set up greeting and time
function updateGreeting() {
    const now = new Date();
    const hours = now.getHours();

    let greeting;
    if (hours < 12) greeting = "Good Morning";
    else if (hours < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    greetingElement.textContent = `Hello, ${usernameElement.textContent} ${greeting}`;
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    });
    timeElement.textContent = timeString;
}

// Task management
function renderTasks() {
    taskContainer.innerHTML = '';

    // Group tasks by date
    const tasksByDate = {};
    tasks.forEach(task => {
        const dateStr = task.deadline || 'No Date';
        if (!tasksByDate[dateStr]) {
            tasksByDate[dateStr] = [];
        }
        tasksByDate[dateStr].push(task);
    });

    // Render each date group
    for (const [date, dateTasks] of Object.entries(tasksByDate)) {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'task-group';

        const dateHeader = document.createElement('h3');
        dateHeader.className = 'task-date';
        dateHeader.textContent = `Date: ${formatDate(date)}`;
        dateGroup.appendChild(dateHeader);

        const taskList = document.createElement('ul');
        taskList.className = 'task-list';

        dateTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <span class="task-text">${task.title}</span>
                <div class="task-actions">
                    <button onclick="toggleTask(${task.id})" class="toggle-btn">
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button onclick="deleteTask(${task.id})" class="delete-btn">Delete</button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });

        dateGroup.appendChild(taskList);
        taskContainer.appendChild(dateGroup);
    });
}

function formatDate(dateString) {
    if (!dateString || dateString === 'No Date') return 'No Date';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
}

// Event listeners
addBtn.addEventListener('click', addTask);
newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// API functions
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: { 'Authorization': authHeader }
        });
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function addTask() {
    const title = newTaskInput.value.trim();
    if (!title) return;

    const newTask = {
        title,
        deadline: new Date().toISOString().split('T')[0] // Today's date as default
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

        if (response.ok) {
            newTaskInput.value = '';
            loadTasks();
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

async function toggleTask(id) {
    try {
        await fetch(`/api/tasks/${id}/toggle`, {
            method: 'PUT',
            headers: { 'Authorization': authHeader }
        });
        loadTasks();
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        await fetch(`/api/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': authHeader }
        });
        loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Initialize
function init() {
    // Set username (you can make this dynamic)
    usernameElement.textContent = 'Habib';

    // Update greeting and time
    updateGreeting();
    updateTime();
    setInterval(updateTime, 1000);

    // Set up authentication (you'll need to implement your auth flow)
    authHeader = 'Basic dXNlcjpwYXNzd29yZA=='; // Replace with your auth logic

    // Load initial tasks
    loadTasks();
}

init();