class WheelManager {
    constructor() {
        this.isSpinning = false;
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('spin-button').addEventListener('click', () => {
            this.spinWheel();
        });
    }

    async loadWheel() {
        try {
            wheel = await Utils.makeRequest('/api/wheel');
            this.displayWheelInfo();
        } catch (error) {
            console.error('Failed to load wheel:', error);
        }
    }

    displayWheelInfo() {
        if (!wheel || !wheel.items) return;

        const wheelItemsContainer = document.getElementById('wheel-items');
        
        wheelItemsContainer.innerHTML = wheel.items.map(item => `
            <div class="wheel-item-info">
                <img src="${item.image}" alt="${item.name}" class="wheel-item-info-image">
                <div class="wheel-item-info-name">${item.name}</div>
                <div class="wheel-item-info-chance">Шанс: ${item.chance}%</div>
            </div>
        `).join('');

        this.createWheelVisual();
    }

    createWheelVisual() {
        const wheelElement = document.getElementById('fortune-wheel');
        if (!wheelElement || !wheel.items) return;

        // Очищаем предыдущие элементы
        wheelElement.querySelectorAll('.wheel-item').forEach(item => item.remove());

        const totalChance = wheel.items.reduce((sum, item) => sum + item.chance, 0);
        let currentAngle = 0;

        wheel.items.forEach((item, index) => {
            const itemAngle = (item.chance / totalChance) * 360;
            const itemElement = document.createElement('div');
            itemElement.className = 'wheel-item';
            itemElement.style.cssText = `
                transform: rotate(${currentAngle}deg);
                background: conic-gradient(
                    from ${currentAngle}deg to ${currentAngle + itemAngle}deg,
                    ${this.getWheelColor(index)} 0% ${itemAngle}deg,
                    transparent ${itemAngle}deg
                );
            `;

            const contentElement = document.createElement('div');
            contentElement.className = 'wheel-item-content';
            contentElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="wheel-item-image">
                <div class="wheel-item-name">${item.name}</div>
            `;

            itemElement.appendChild(contentElement);
            wheelElement.appendChild(itemElement);

            currentAngle += itemAngle;
        });
    }

    getWheelColor(index) {
        const colors = [
            'rgba(0, 243, 255, 0.8)',
            'rgba(255, 0, 255, 0.8)',
            'rgba(57, 255, 20, 0.8)',
            'rgba(191, 0, 255, 0.8)',
            'rgba(255, 255, 0, 0.8)',
            'rgba(255, 128, 0, 0.8)'
        ];
        return colors[index % colors.length];
    }

    async spinWheel() {
        if (this.isSpinning) return;
        if (!currentUser) {
            Utils.showNotification('Требуется авторизация', 'error');
            return;
        }

        this.isSpinning = true;
        document.getElementById('spin-button').disabled = true;

        try {
            Utils.showLoading();
            const response = await Utils.makeRequest('/api/wheel/spin', {
                method: 'POST'
            });

            if (response.success) {
                this.animateWheelSpin(response.spinAngle, response.item);
            }
        } catch (error) {
            console.error('Failed to spin wheel:', error);
            this.isSpinning = false;
            document.getElementById('spin-button').disabled = false;
        } finally {
            Utils.hideLoading();
        }
    }

    animateWheelSpin(finalAngle, wonItem) {
        const wheelElement = document.getElementById('fortune-wheel');
        const spinButton = document.getElementById('spin-button');
        
        // Сохраняем приз для использования после анимации
        window.currentPrize = wonItem;

        // Анимация вращения
        wheelElement.style.transition = 'transform 7s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
        wheelElement.style.transform = `rotate(${3600 + finalAngle}deg)`;

        // Добавляем эффекты
        wheelElement.style.boxShadow = '0 0 50px gold, inset 0 0 30px rgba(255, 215, 0, 0.5)';

        // После завершения анимации
        setTimeout(() => {
            this.isSpinning = false;
            spinButton.disabled = false;
            wheelElement.style.transition = '';
            wheelElement.style.boxShadow = '';
            
            // Показываем выигрыш
            this.showWheelPrize(wonItem);
        }, 7000);
    }

    showWheelPrize(item) {
        document.getElementById('prize-image').src = item.image;
        document.getElementById('prize-name').textContent = item.name;
        document.getElementById('prize-value').textContent = `Стоимость: ${Utils.formatNumber(item.price)} монет`;
        
        // Устанавливаем обработчики
        document.getElementById('sell-prize').onclick = () => sellPrize(item._id);
        document.getElementById('keep-prize').onclick = () => keepPrize(item._id);
        
        showModal('prize-modal');
    }
}

// Инициализация менеджера колеса
let wheelManager;

document.addEventListener('DOMContentLoaded', () => {
    wheelManager = new WheelManager();
});