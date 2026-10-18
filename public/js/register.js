const $ = el => document.querySelector(el);

const loginForm = $('#login-form');
const loginSpan = $('#login-form span');

const registerForm = $('#register-form');
const registerSpan = $('#register-form span');

const logoutButton = $('#close-session');

const showMessage = (span, text, classe) => {
    span.innerText = text;
    span.className = classe;
};

// Fa la petició de login. Es fa servir al login i després de registrar-se
const login = (username, password) => {
    return fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
};

loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const username = $('#login-username').value;
    const password = $('#login-password').value;

    login(username, password)
        .then(res => {
            if (res.ok) {
                showMessage(loginSpan, 'Sessió iniciada. Entrant...', 'ok');
                setTimeout(() => {
                    window.location.href = '/protected';
                }, 1000);
            } else {
                // El servidor ens diu quin és l'error
                res.text().then(text => showMessage(loginSpan, text, 'error'));
            }
        })
        .catch(() => {
            showMessage(loginSpan, 'No s\'ha pogut connectar amb el servidor', 'error');
        });
});

registerForm?.addEventListener('submit', e => {
    e.preventDefault();
    const username = $('#register-username').value;
    const password = $('#register-password').value;
    const confirmPassword = $('#register-confirm-password').value;

    if (password !== confirmPassword) {
        showMessage(registerSpan, 'Les contrasenyes no coincideixen', 'error');
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
                showMessage(registerSpan, 'Usuari registrat. Entrant...', 'ok');
                // El registre no crea la sessió, així que fem login amb les mateixes dades
                login(username, password).then(() => {
                    setTimeout(() => {
                        window.location.href = '/protected';
                    }, 1000);
                });
            } else {
                res.text().then(text => showMessage(registerSpan, text, 'error'));
            }
        })
        .catch(() => {
            showMessage(registerSpan, 'No s\'ha pogut connectar amb el servidor', 'error');
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
