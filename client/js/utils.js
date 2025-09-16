class Utils {
    static formatNumber(number) {
        return new Intl.NumberFormat('ru-RU').format(number);
    }

    static showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    static hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Стили для уведомлений
        if (!document.querySelector('.notification-style')) {
            const style = document.createElement('style');
            style.className = 'notification-style';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: bold;
                    z-index: 5000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                .notification-info { background: linear-gradient(45deg, #00f3ff, #007bff); }
                .notification-success { background: linear-gradient(45deg, #39ff14, #00b300); }
                .notification-error { background: linear-gradient(45deg, #ff4757, #ff0000); }
                .notification-warning { background: linear-gradient(45deg, #ffa500, #ff8c00); }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 10px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    static async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'include',
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка сервера');
            }

            return data;
        } catch (error) {
            console.error('Request error:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static getRarityColor(rarity) {
        const colors = {
            common: '#FFFFFF',
            uncommon: '#1EFF00',
            rare: '#0070FF',
            epic: '#A335EE',
            legendary: '#FF8000'
        };
        return colors[rarity] || '#FFFFFF';
    }
}

// Глобальные переменные
let currentUser = null;
let cases = [];
let wheel = null;
let userInventory = [];

// Вспомогательные функции
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function switchTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Убрать активный класс у всех кнопок
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Показать выбранную вкладку
    document.getElementById(`${tabName}-tab`).style.display = 'block';

    // Добавить активный класс к выбранной кнопке
    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');

    // Загрузить данные для вкладки
    if (tabName === 'inventory') {
        loadInventory();
    } else if (tabName === 'wheel') {
        loadWheel();
    }
}

function updateBalance(newBalance) {
    if (currentUser) {
        currentUser.balance = newBalance;
        document.getElementById('user-balance').textContent = Utils.formatNumber(newBalance);
    }
}