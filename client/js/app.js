// Главный файл приложения
class NakawinApp {
    constructor() {
        this.init();
    }

    async init() {
        this.initGlobalEventListeners();
        await this.loadInitialData();
    }

    initGlobalEventListeners() {
        // Обработчики навигации
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                switchTab(tabName);
            });
        });

        // Закрытие модальных окон по клику на backdrop
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop')) {
                    closeModal(modal.id);
                }
            });
        });

        // Закрытие модальных окон по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'block') {
                        closeModal(modal.id);
                    }
                });
            }
        });
    }

    async loadInitialData() {
        if (currentUser) {
            await Promise.all([
                loadCases(),
                loadWheel(),
                loadInventory()
            ]);
        }
    }
}

// Глобальные функции загрузки данных
async function loadCases() {
    if (casesManager) {
        await casesManager.loadCases();
    }
}

async function loadWheel() {
    if (wheelManager) {
        await wheelManager.loadWheel();
    }
}

async function loadInventory() {
    if (inventoryManager) {
        await inventoryManager.loadInventory();
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new NakawinApp();
});

// Service Worker для оффлайн-работы (опционально)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}