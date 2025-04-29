const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('auth-form');
const toggleText = document.getElementById('toggle-text');
const toggleLink = document.getElementById('toggle-link');
const usernameField = document.getElementById('username-field');
const submitBtn = document.getElementById('submit-btn');

let isLogin = true; 

toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  
  if (isLogin) {
    formTitle.innerText = "Login";
    submitBtn.innerText = "Login";
    toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign Up</a>`;
    usernameField.style.display = "none";
  } else {
    formTitle.innerText = "Sign Up";
    submitBtn.innerText = "Sign Up";
    toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Login</a>`;
    usernameField.style.display = "block";
  }
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username') ? document.getElementById('username').value : '';

  const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register'; // your backend routes
  const payload = isLogin ? { email, password } : { name : username, email, password };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      if(data.token){
        localStorage.setItem('token',data.token);
      }
      alert(data.message || "Success");
      window.location.href = "dashboard.html"; 
    } else {
      alert(data.error || "Something went wrong");
    }
  } catch (error) {
    console.error('Error:', error);
    alert("Network error!");
  }
});
