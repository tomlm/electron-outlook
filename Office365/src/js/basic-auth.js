const { ipcRenderer } = require('electron');

const basicAuthForm = document.getElementById('basic-auth-form');

basicAuthForm.addEventListener('submit', event => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    ipcRenderer.send('form-submission', username, password);
});