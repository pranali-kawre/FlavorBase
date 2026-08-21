// ---------- Handle Register Form ----------
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // stop the browser's default page-reload behavior

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('register-error');

        errorEl.textContent = ''; // clear any previous error

        try {
            await registerUser(username, email, password);
            // Registration successful — send them to login
            window.location.href = 'login.html';
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });
}

// ---------- Handle Login Form ----------
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');

        errorEl.textContent = '';

        try {
            const data = await loginUser(email, password);
            setToken(data.token); // save the JWT
            window.location.href = 'index.html'; // send them home
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });
}

// ---------- Update Nav Based on Login State ----------
function updateNavForAuth() {
    const isLoggedIn = !!getToken();

    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'inline';
    if (registerLink) registerLink.style.display = isLoggedIn ? 'none' : 'inline';
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
}

// ---------- Handle Logout ----------
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        clearToken();
        window.location.href = 'login.html';
    });
}

// Run immediately when this script loads on any page
updateNavForAuth();