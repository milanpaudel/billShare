//Sigup handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const res = await fetch('/auth/signup', {
            method: 'POST',
            headers: { 'content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            alert('Signup successful');
            window.location.href = 'dashboard.html';
        } else {
            alert('Signup failed');
        }
    });
}

//Login handler
const loginForm = document.getElementById('login-form');
if ('login-form') {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            alert('Login successful');
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed')
        }
    })
}