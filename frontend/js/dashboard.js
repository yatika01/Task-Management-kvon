const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Logout Button
const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', () => {
  // Remove token from localStorage
  localStorage.removeItem('authToken');
  
  // Redirect to login page
  window.location.href = 'index.html'; // Adjust to your login page
});


const taskContainer = document.getElementById('taskContainer');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const createTaskBtn = document.getElementById('createTaskBtn');

let page = 1;
const limit = 5;
let role = '';
const token = localStorage.getItem('token');
if (!token) {
  console.error('No token found. User must login first.');
}
// Fetch tasks from API
async function fetchTasks() {
  try {
    const res = await fetch(`https://task-management-kvon.onrender.com/api/tasks?page=${page}&limit=${limit}`, {
      method:'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    // console.log(data);

    // decode token to get user role
    const decoded = JSON.parse(atob(token.split('.')[1]));
    role = decoded.role;

      displayTasks(data); 
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

function displayTasks(tasks) {
  const container = document.getElementById('taskContainer');
  container.innerHTML = '';

  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <p class="card-text">${task.description}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
          ${role === 'admin' || task.creatorId === currentUserId ? `
            <button class="btn btn-warning btn-sm" onclick="openEditModal('${task._id}', '${task.title}', '${task.description}', '${task.priority}', '${task.status}', '${task.dueDate}')">Edit</button>
          ` : ''}
          </div>
      </div>
    `;
    container.appendChild(card);
  });
}

const createModal = new bootstrap.Modal(document.getElementById('createTaskModal'));
createTaskBtn.addEventListener('click', () => {
  createModal.show();
});
const createTaskForm = document.getElementById('createTaskForm');

createTaskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newTask = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    priority: document.getElementById('priority').value,
    status: document.getElementById('status').value,
    dueDate: document.getElementById('dueDate').value,
  };

  try {
    const res = await fetch('https://task-management-kvon.onrender.com/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newTask)
    });

    const data = await res.json();
    if (res.ok) {
      createModal.hide();
      createTaskForm.reset();
      fetchTasks(); // reload task list
    } else {
      alert(data.message || 'Failed to create task');
    }
  } catch (err) {
    console.error('Error creating task:', err);
  }
});

// Open Edit Task Modal
function openEditModal(taskId, title, description, priority, status, dueDate) {
  document.getElementById('editTaskId').value = taskId;
  document.getElementById('editTaskTitle').value = title;
  document.getElementById('editTaskDescription').value = description;
  document.getElementById('editTaskPriority').value = priority;
  document.getElementById('editTaskStatus').value = status;
  document.getElementById('editTaskDueDate').value = dueDate.split('T')[0];

  const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
  editModal.show();
}

// Edit Task
document.getElementById('editTaskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const taskId = document.getElementById('editTaskId').value;
  const title = document.getElementById('editTaskTitle').value;
  const description = document.getElementById('editTaskDescription').value;
  const priority = document.getElementById('editTaskPriority').value;
  const status = document.getElementById('editTaskStatus').value;
  const dueDate = document.getElementById('editTaskDueDate').value;

  try {
    await fetch(`https://task-management-kvon.onrender.com/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, priority, status, dueDate })
    });

    const editModal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
    editModal.hide();
    fetchTasks();
  } catch (error) {
    console.error('Error updating task:', error);
  }
});
fetchTasks();