const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Logout Button
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  // Redirect to login page
  window.location.href = 'index.html'; 
});

const taskContainer = document.getElementById('taskContainer');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const createTaskBtn = document.getElementById('createTaskBtn');

let page = 1;
const limit = 3;
let totalPages= 1;
let role = '';
let currentUserId = '';
const token = localStorage.getItem('token');
if (!token) {
  console.error('No token found. User must login first.');
}
// Fetch tasks from API
async function fetchTasks(filters={}) {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    const res = await fetch(`https://task-management-kvon.onrender.com/api/tasks?${params.toString()}`, {
      method:'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    console.log("Fetched data:", data);

    totalPages = data.totalPages;
      
    const decoded = JSON.parse(atob(token.split('.')[1]));
    role = decoded.role;
    currentUserId = decoded.userId;

    displayTasks(data.tasks);

    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page === totalPages;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

document.getElementById('apply-filters').addEventListener('click', () => {
  const status = document.getElementById('filter-status').value;
  const priority = document.getElementById('filter-priority').value;
  const dueDate = document.getElementById('filter-dueDate').value;

  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (dueDate) filters.dueDate = dueDate;

  page = 1; // Reset to first page when applying filters
  fetchTasks(filters);
});

document.getElementById('clear-filters').addEventListener('click', () => {
  document.getElementById('filter-status').value = '';
  document.getElementById('filter-priority').value = '';
  document.getElementById('filter-dueDate').value = '';

  page = 1;
  fetchTasks(); // Fetch without filters
});

function displayTasks(tasks) {
  const container = document.getElementById('taskContainer');
  container.innerHTML = '';
  const getPriorityColor = (priority) => {
    const p = priority.toLowerCase();
    if (p === 'high') return 'danger';
    if (p === 'medium') return 'warning';
    if (p === 'low') return 'success';
    return 'secondary';
  };
  
tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.innerHTML = `
      <div class="card h-100 shadow-sm rounded-3 border-light">
        <div class="card-body">
          <h5 class="card-title text-success" style="text-decoration-line:underline;">${task.title}</h5>
          <p class="card-text">${task.description}</p>
          <p><strong>Priority:</strong> <span class="badge bg-${getPriorityColor(task.priority)}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}</span></p>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
          ${role === 'admin' || task.creatorId === currentUserId ? `
            <button class="btn btn-primary btn-sm" onclick="openEditModal('${task._id}', '${task.title}', '${task.description}', '${task.priority}', '${task.status}', '${task.dueDate}')">Edit</button>
           ${role === 'admin' ? `
          <button class="btn btn-danger btn-sm ms-2" onclick="deleteTask('${task._id}')">Delete</button>
           ` : ''}
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
      fetchTasks(); 
      showNotification(); 
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
    showNotification(); 
  } catch (error) {
    console.error('Error updating task:', error);
  }
});

//delete task
async function deleteTask(taskId) {
  const confirmed = confirm("Are you sure you want to delete this task?");
  if (!confirmed) return;

  try {
    await fetch(`https://task-management-kvon.onrender.com/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    fetchTasks(); 
    showNotification(); 
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

document.getElementById('prevPage').addEventListener('click', () => {
  if (page > 1) {
    page--;
    fetchTasks();
  }
});
document.getElementById('nextPage').addEventListener('click', () => {
  if (page < totalPages) {
    page++;
    fetchTasks();
  }
});

fetchTasks();
function showNotification() {
  const notif = document.getElementById('notification');
  notif.style.display = 'block';
  setTimeout(() => {
    notif.style.display = 'none';
  }, 10000); 
}