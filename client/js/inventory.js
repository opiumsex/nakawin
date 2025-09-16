class InventoryManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Обработчики будут добавлены динамически после загрузки инвентаря
    }

    async loadInventory() {
        try {
            Utils.showLoading();
            const response = await Utils.makeRequest('/api/inventory/stats');
            userInventory = response.inventory || [];
            this.displayInventory(response);
        } catch (error) {
            console.error('Failed to load inventory:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    displayInventory(stats) {
        const inventoryGrid = document.getElementById('inventory-grid');
        const totalItems = document.getElementById('total-items');
        const totalValue = document.getElementById('total-value');

        // Обновляем статистику
        totalItems.textContent = Utils.formatNumber(stats.activeItems || 0);
        totalValue.textContent = Utils.formatNumber(stats.totalValue || 0);

        if (!userInventory || userInventory.length === 0) {
            inventoryGrid.innerHTML = `
                <div class="empty-inventory">
                    <div class="empty-inventory-icon">🎒</div>
                    <p class="empty-inventory-text">Инвентарь пуст</p>
                    <p class="empty-inventory-subtext">Откройте кейсы или покрутите колесо, чтобы получить призы!</p>
                </div>
            `;
            return;
        }

        inventoryGrid.innerHTML = userInventory.map(item => `
            <div class="inventory-item item-rarity-${item.itemId?.rarity || 'common'}">
                <img src="${item.itemId?.image || item.itemImage}" alt="${item.itemId?.name || item.itemName}" class="item-image">
                <h4 class="item-name">${item.itemId?.name || item.itemName}</h4>
                <p class="item-price">${Utils.formatNumber(item.itemId?.price || item.itemPrice)} монет</p>
                <p class="item-obtained">Получен: ${Utils.formatDate(item.obtainedAt)}</p>
                <div class="item-actions">
                    <button class="item-action-button sell-item-button" onclick="sellInventoryItem('${item._id}')">
                        Продать
                    </button>
                    <button class="item-action-button withdraw-item-button" onclick="withdrawItem('${item._id}')">
                        Вывести
                    </button>
                </div>
            </div>
        `).join('');
    }

    async sellInventoryItem(itemId) {
        if (!confirm('Вы уверены, что хотите продать этот предмет?')) return;

        try {
            Utils.showLoading();
            const response = await Utils.makeRequest('/api/inventory/sell', {
                method: 'POST',
                body: JSON.stringify({ itemId })
            });

            if (response.success) {
                updateBalance(response.newBalance);
                Utils.showNotification('Предмет успешно продан!', 'success');
                await this.loadInventory();
            }
        } catch (error) {
            console.error('Failed to sell item:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    async withdrawItem(itemId) {
        const item = userInventory.find(i => i._id === itemId);
        if (!item) return;

        if (!confirm(`Вы уверены, что хотите вывести предмет "${item.itemId?.name || item.itemName}"?`)) return;

        try {
            Utils.showLoading();
            const response = await Utils.makeRequest('/api/inventory/withdraw', {
                method: 'POST',
                body: JSON.stringify({ itemId })
            });

            if (response.success) {
                Utils.showNotification('Запрос на вывод отправлен администратору!', 'success');
                await this.loadInventory();
                
                // В консоли будет запись о выводе (для администратора)
                console.log(`Пользователь ${currentUser.username} запросил вывод предмета: ${item.itemId?.name || item.itemName}`);
            }
        } catch (error) {
            console.error('Failed to withdraw item:', error);
        } finally {
            Utils.hideLoading();
        }
    }
}

// Глобальные функции для использования в HTML
function sellInventoryItem(itemId) {
    inventoryManager.sellInventoryItem(itemId);
}

function withdrawItem(itemId) {
    inventoryManager.withdrawItem(itemId);
}

// Инициализация менеджера инвентаря
let inventoryManager;

document.addEventListener('DOMContentLoaded', () => {
    inventoryManager = new InventoryManager();
});