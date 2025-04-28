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
    displayTasks(data);

    // decode token to get user role
    const decoded = JSON.parse(atob(token.split('.')[1]));
    role = decoded.role;
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
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <p class="card-text">${task.description}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>

          <button class="btn btn-warning btn-sm" onclick="editTask('${task._id}')">Edit</button>
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
  window.location.href = 'createTask.html'; // Navigate to Create Task Page
});

// Edit Task
function editTask(taskId) {
  window.location.href = `editTask.html?id=${taskId}`; // Navigate to Edit Task Page with id
}

// Delete Task (only admin)
async function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Task deleted successfully');
      fetchTasks(); // reload tasks
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }
}

// Load tasks when page loads
fetchTasks();

