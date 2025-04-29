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
    console.log(data);
    // decode token to get user role
    const decoded = JSON.parse(atob(token.split('.')[1]));
    role = decoded.role;

    if (Array.isArray(data.tasks)) {
      displayTasks(data.tasks); // Ensure you're sending an array
    } else {
      console.error("Tasks not an array:", data);
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

// Display tasks on the page
function displayTasks(tasks) {
  taskContainer.innerHTML = '';
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card mb-4" style="background:#A1C398">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <p class="card-text">${task.description}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
          <button class="btn btn-warning btn-sm" onclick="openEditModal('${task._id}', '${task.title}', '${task.description}', '${task.priority}', '${task.status}', '${task.dueDate}')">Edit</button>
          ${role === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteTask('${task._id}')">Delete</button>` : ''}
        </div>
      </div>
    `;
    taskContainer.appendChild(card);
  });
}

// Pagination buttons
prevPageBtn.addEventListener('click', () => {
  if (page > 1) {
    page--;
    fetchTasks();
  }
});

nextPageBtn.addEventListener('click', () => {
  page++;
  fetchTasks();
});

// Create New Task
createTaskBtn.addEventListener('click', () => {
  const createModal = new bootstrap.Modal(document.getElementById('createTaskModal'));
  createModal.show();
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

// Create Task
document.getElementById('createTaskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('newTaskTitle').value;
  const description = document.getElementById('newTaskDescription').value;
  const priority = document.getElementById('newTaskPriority').value;
  const status = document.getElementById('newTaskStatus').value;
  const dueDate = document.getElementById('newTaskDueDate').value;

  try {
    await fetch('https://task-management-kvon.onrender.com/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, priority, status, dueDate })
    });

    const createModal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
    createModal.hide();
    fetchTasks();
  } catch (error) {
    console.error('Error creating task:', error);
  }
});
