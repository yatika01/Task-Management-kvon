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
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
