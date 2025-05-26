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

function toggleEditForm(expenseId) {
    const form = document.getElementById('edit-form-' + expenseId);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
function deleteGroup(groupId) {
    if (confirm("Are you sure you want to delete this group?")) {
        fetch(`/group/${groupId}/delete`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/dashboard'; // Go back to dashboard
                } else {
                    alert('Error deleting group');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting group');
            });
    }
}
function editGroup(groupId) {
    // Redirect to the Edit Group page
    window.location.href = `/group/${groupId}/edit`;
}

function deleteExpense(groupId, expenseId) {
    if (confirm("Delete this expense?")) {
        fetch(`/group/${groupId}/expenses/${expenseId}/delete`, {
            method: "DELETE"
        })
            .then(async response => {
                if (response.ok) {
                    //remove expense from page directly
                    document.getElementById(`expense-${expenseId}`).remove();
                    window.location.reload();
                }
                else {
                    const errData = await response.json();
                    alert('Error deleting expense: ' + (errData || 'Unknown Error'));
                }
            })
            .catch(err => {
                console.error(err);
                alert('Error deleting expense');
            })
    }
}