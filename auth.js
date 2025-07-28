document.addEventListener('DOMContentLoaded', () => {
    // --- View and Form Elements ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // --- Message Elements ---
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // --- Toggle Buttons ---
    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');

    // --- API URLs ---
    const REGISTER_URL = 'https://lgu-building-permit.onrender.com/api/auth/register';
    const LOGIN_URL = 'https://lgu-building-permit.onrender.com/api/auth/login';

    // --- Event Listeners to Toggle Views ---
    showRegisterBtn.addEventListener('click', () => {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    // --- Login Form Submission ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const loginData = Object.fromEntries(formData.entries());
        loginMessage.textContent = '';

        try {
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            // UPDATED: Store the received JWT token in localStorage
            localStorage.setItem('authToken', result.token);
            window.location.href = 'dashboard.html';
        } catch (error) {
            loginMessage.textContent = `Error: ${error.message}`;
        }
    });

    // --- Register Form Submission ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(registerForm);
        const registerData = Object.fromEntries(formData.entries());
        registerMessage.textContent = '';
        registerMessage.className = 'text-sm';

        try {
            const response = await fetch(REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            registerMessage.textContent = `${result.message} Please sign in.`;
            registerMessage.classList.add('text-green-600');
            registerForm.reset();
        } catch (error) {
            registerMessage.textContent = `Error: ${error.message}`;
            registerMessage.classList.add('text-red-600');
        }
    });
});
