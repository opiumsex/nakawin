class CasesManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Обработчик для кнопок открытия кейсов будет добавлен динамически
    }

    async loadCases() {
        try {
            Utils.showLoading();
            cases = await Utils.makeRequest('/api/cases');
            this.displayCases();
        } catch (error) {
            console.error('Failed to load cases:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    displayCases() {
        const casesGrid = document.getElementById('cases-grid');
        
        if (cases.length === 0) {
            casesGrid.innerHTML = `
                <div class="empty-cases">
                    <div class="empty-icon">🎁</div>
                    <p>Кейсы временно недоступны</p>
                </div>
            `;
            return;
        }

        casesGrid.innerHTML = cases.map(caseItem => `
            <div class="case-item" data-case-id="${caseItem._id}">
                <img src="${caseItem.image}" alt="${caseItem.name}" class="case-image">
                <h3 class="case-name">${caseItem.name}</h3>
                <p class="case-price">${Utils.formatNumber(caseItem.price)} монет</p>
                <p class="case-items-count">Открыто: ${Utils.formatNumber(caseItem.totalOpened || 0)} раз</p>
                <button class="neon-button case-open-button" onclick="openCase('${caseItem._id}')">
                    Открыть за ${Utils.formatNumber(caseItem.price)} ₪
                </button>
            </div>
        `).join('');

        // Добавляем стили для пустых кейсов
        if (!document.querySelector('.empty-cases-style')) {
            const style = document.createElement('style');
            style.className = 'empty-cases-style';
            style.textContent = `
                .empty-cases {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                }
                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async openCase(caseId) {
        if (!currentUser) {
            Utils.showNotification('Требуется авторизация', 'error');
            return;
        }

        const caseItem = cases.find(c => c._id === caseId);
        if (!caseItem) {
            Utils.showNotification('Кейс не найден', 'error');
            return;
        }

        if (currentUser.balance < caseItem.price) {
            Utils.showNotification('Недостаточно средств', 'error');
            return;
        }

        try {
            Utils.showLoading();
            const response = await Utils.makeRequest('/api/cases/open', {
                method: 'POST',
                body: JSON.stringify({ caseId })
            });

            if (response.success) {
                this.showCaseOpeningAnimation(caseItem, response.item);
            }
        } catch (error) {
            console.error('Failed to open case:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    showCaseOpeningAnimation(caseItem, wonItem) {
        // Создаем overlay для анимации
        const overlay = document.createElement('div');
        overlay.className = 'case-opening-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 4000;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;

        // Анимация кейса
        overlay.innerHTML = `
            <div class="case-opening-animation">
                <img src="${caseItem.image}" alt="${caseItem.name}" class="case-animation-image">
                <div class="case-shine"></div>
            </div>
            <div class="prize-reveal">
                <h3>Поздравляем!</h3>
                <img src="${wonItem.image}" alt="${wonItem.name}" class="prize-image-large">
                <h4>${wonItem.name}</h4>
                <p>Стоимость: ${Utils.formatNumber(wonItem.price)} монет</p>
            </div>
            <div class="animation-actions">
                <button class="neon-button" onclick="closeCaseAnimation()">Забрать приз</button>
            </div>
        `;

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .case-opening-animation {
                position: relative;
                animation: caseBounce 1s ease-in-out infinite;
            }
            
            .case-animation-image {
                width: 200px;
                height: 200px;
                filter: drop-shadow(0 0 20px var(--neon-purple));
            }
            
            .case-shine {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shine 2s ease-in-out infinite;
            }
            
            .prize-reveal {
                text-align: center;
                margin: 30px 0;
                animation: fadeIn 1s ease;
            }
            
            .prize-image-large {
                width: 120px;
                height: 120px;
                object-fit: contain;
                filter: drop-shadow(0 0 15px var(--neon-green));
                margin: 15px 0;
            }
            
            @keyframes caseBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
            
            @keyframes shine {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        // Автоматическое закрытие через 7 секунд
        setTimeout(() => {
            if (overlay.parentElement) {
                closeCaseAnimation();
            }
        }, 7000);
    }
}

function closeCaseAnimation() {
    const overlay = document.querySelector('.case-opening-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Показываем модальное окно приза
    showPrizeModal(window.currentPrize);
}

function showPrizeModal(item) {
    document.getElementById('prize-image').src = item.image;
    document.getElementById('prize-name').textContent = item.name;
    document.getElementById('prize-value').textContent = `Стоимость: ${Utils.formatNumber(item.price)} монет`;
    
    // Устанавливаем обработчики
    document.getElementById('sell-prize').onclick = () => sellPrize(item._id);
    document.getElementById('keep-prize').onclick = () => keepPrize(item._id);
    
    showModal('prize-modal');
}

async function sellPrize(itemId) {
    try {
        Utils.showLoading();
        const response = await Utils.makeRequest('/api/inventory/sell', {
            method: 'POST',
            body: JSON.stringify({ itemId })
        });

        if (response.success) {
            updateBalance(response.newBalance);
            Utils.showNotification('Предмет успешно продан!', 'success');
            closeModal('prize-modal');
            await loadInventory();
        }
    } catch (error) {
        console.error('Failed to sell item:', error);
    } finally {
        Utils.hideLoading();
    }
}

async function keepPrize(itemId) {
    try {
        Utils.showLoading();
        const response = await Utils.makeRequest('/api/inventory/keep', {
            method: 'POST',
            body: JSON.stringify({ itemId })
        });

        if (response.success) {
            Utils.showNotification('Предмет добавлен в инвентарь!', 'success');
            closeModal('prize-modal');
            await loadInventory();
        }
    } catch (error) {
        console.error('Failed to keep item:', error);
    } finally {
        Utils.hideLoading();
    }
}

// Глобальные функции для использования в HTML
function openCase(caseId) {
    casesManager.openCase(caseId);
}

// Инициализация менеджера кейсов
let casesManager;

document.addEventListener('DOMContentLoaded', () => {
    casesManager = new CasesManager();
});