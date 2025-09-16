class PaymentManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('deposit-button').addEventListener('click', () => {
            this.showDepositModal();
        });

        document.getElementById('confirm-payment').addEventListener('click', () => {
            this.confirmPayment();
        });
    }

    showDepositModal() {
        if (!currentUser) {
            Utils.showNotification('Требуется авторизация', 'error');
            return;
        }

        showModal('deposit-modal');
    }

    async confirmPayment() {
        try {
            Utils.showLoading();
            const response = await Utils.makeRequest('/api/payment/confirm', {
                method: 'POST'
            });

            if (response.success) {
                updateBalance(response.newBalance);
                closeModal('deposit-modal');
                Utils.showNotification(`Баланс пополнен на ${Utils.formatNumber(response.depositAmount)} монет!`, 'success');
                
                // Логирование в консоль
                console.log(`Пользователь ${currentUser.username} подтвердил оплату. Пополнение: ${response.depositAmount} монет`);
            }
        } catch (error) {
            console.error('Failed to confirm payment:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    async getPaymentHistory() {
        try {
            const history = await Utils.makeRequest('/api/payment/history');
            this.displayPaymentHistory(history);
        } catch (error) {
            console.error('Failed to get payment history:', error);
        }
    }

    displayPaymentHistory(history) {
        // Реализация отображения истории платежей
        console.log('Payment history:', history);
    }
}

// Инициализация менеджера платежей
let paymentManager;

document.addEventListener('DOMContentLoaded', () => {
    paymentManager = new PaymentManager();
});