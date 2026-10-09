const $ = el => document.querySelector(el);

const loginForm = $('#login-form');
const loginSpan = $('#login-form span');

const registerForm = $('#register-form');
const registerSpan = $('#register-form span');

const logoutButton = $('#close-session');

const showMessage = (span, text, color) => {
    span.innerText = text;
    span.style.color = color;
};

loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const username = $('#login-username').value;
    const password = $('#login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(res => {
            if (res.ok) {
                showMessage(loginSpan, 'Sesión iniciada ..Entrando..', 'green');
                setTimeout(() => {
                    window.location.href = '/protected';
                }, 2000);
            } else {
                showMessage(loginSpan, 'Error al iniciar sesión', 'red');
            }
        })
        .catch(() => {
            showMessage(loginSpan, 'No se pudo conectar con el servidor', 'red');
        });
});

registerForm?.addEventListener('submit', e => {
    e.preventDefault();
    const username = $('#register-username').value;
    const password = $('#register-password').value;
    const confirmPassword = $('#register-confirm-password').value;

    if (password !== confirmPassword) {
        showMessage(registerSpan, 'Las contraseñas no coinciden', 'red');
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(res => {
            if (res.ok) {
                showMessage(registerSpan, 'Usuario registrado. ..Entrando..', 'green');
                setTimeout(() => {
                    window.location.href = '/protected';
                }, 2000);
            } else {
                showMessage(registerSpan, 'Error al registrar usuario', 'red');
            }
        })
        .catch(() => {
            showMessage(registerSpan, 'No se pudo conectar con el servidor', 'red');
        });
});

logoutButton?.addEventListener('click', e => {
    e.preventDefault();
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(() => {
            window.location.href = '/';
        });
});