// src/main/resources/static/js/app.js
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: {
                'Authorization': 'Basic ' + btoa('user:password')
            }
        });
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('task-container');
    container.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || ''}</p>
            <p class="deadline">Deadline: ${task.deadline}</p>
            <div class="actions">
                <button class="toggle" onclick="toggleTask(${task.id})">
                    ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        container.appendChild(taskElement);
    });
}

async function addTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const deadline = document.getElementById('deadline').value;

    if (!title || !deadline) {
        alert('Title and deadline are required!');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa('user:password')
            },
            body: JSON.stringify({
                title,
                description,
                deadline,
                completed: false
            })
        });

        if (response.ok) {
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            document.getElementById('deadline').value = '';
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
            headers: {
                'Authorization': 'Basic ' + btoa('user:password')
            }
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

async function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Basic ' + btoa('user:password')
                }
            });

            if (response.ok) {
                loadTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
}