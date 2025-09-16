class AuthManager {
    constructor() {
        this.initEventListeners();
        this.checkAuthStatus();
    }

    initEventListeners() {
        // Переключение между вкладками авторизации
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchAuthTab(tabName);
            });
        });

        // Форма входа
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Форма регистрации
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Кнопка выхода
        document.getElementById('logout-button').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    async checkAuthStatus() {
        try {
            Utils.showLoading();
            const response = await Utils.makeRequest('/api/auth/status');
            
            if (response.authenticated) {
                await this.handleSuccessfulAuth(response.user);
            } else {
                this.showAuthForms();
            }
        } catch (error) {
            console.error('Auth status check failed:', error);
            this.showAuthForms();
        } finally {
            Utils.hideLoading();
        }
    }

    async handleLogin() {
        const form = document.getElementById('login-form');
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            form.classList.add('loading');
            const response = await Utils.makeRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            Utils.showNotification('Вход выполнен успешно!', 'success');
            await this.handleSuccessfulAuth(response.user);
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            form.classList.remove('loading');
        }
    }

    async handleRegister() {
        const form = document.getElementById('register-form');
        const username = document.getElementById('register-username').value;
        const gameNickname = document.getElementById('register-gameNickname').value;
        const server = document.getElementById('register-server').value;
        const bankAccount = document.getElementById('register-bankAccount').value;
        const password = document.getElementById('register-password').value;

        try {
            form.classList.add('loading');
            const response = await Utils.makeRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    gameNickname,
                    server,
                    bankAccount,
                    password
                })
            });

            Utils.showNotification('Регистрация выполнена успешно!', 'success');
            await this.handleSuccessfulAuth(response.user);
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            form.classList.remove('loading');
        }
    }

    async handleLogout() {
        try {
            Utils.showLoading();
            await Utils.makeRequest('/api/auth/logout', {
                method: 'POST'
            });

            currentUser = null;
            this.showAuthForms();
            Utils.showNotification('Выход выполнен успешно', 'info');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    async handleSuccessfulAuth(userData) {
        currentUser = userData;
        
        // Обновить интерфейс
        document.getElementById('user-balance').textContent = Utils.formatNumber(userData.balance);
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('auth-content').style.display = 'none';
        document.getElementById('game-content').style.display = 'block';
        document.getElementById('nav-tabs').style.display = 'flex';

        // Загрузить начальные данные
        await Promise.all([
            loadCases(),
            loadWheel(),
            loadInventory()
        ]);
    }

    showAuthForms() {
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('auth-content').style.display = 'block';
        document.getElementById('game-content').style.display = 'none';
        document.getElementById('nav-tabs').style.display = 'none';
    }

    switchAuthTab(tabName) {
        // Убрать активный класс у всех вкладок
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Скрыть все формы
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // Активировать выбранную вкладку
        document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-form`).classList.add('active');
    }
}

// Инициализация менеджера авторизации
let authManager;

document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});