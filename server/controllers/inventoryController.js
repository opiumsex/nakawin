const User = require('../models/User');
const { logWithdrawal } = require('../utils/logger');

const getInventory = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .populate('inventory.itemId')
      .select('inventory');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Фильтруем только активные предметы
    const activeInventory = user.inventory.filter(item => 
      item.itemId && !item.isWithdrawn
    );

    res.json(activeInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sellItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const inventoryItem = user.inventory.id(itemId);
    if (!inventoryItem || inventoryItem.isWithdrawn) {
      return res.status(404).json({ message: 'Предмет не найден в инвентаре' });
    }

    // Добавляем стоимость предмета к балансу
    user.balance += inventoryItem.itemPrice;
    
    // Помечаем предмет как проданный
    inventoryItem.isWithdrawn = true;

    await user.save();

    res.json({
      success: true,
      newBalance: user.balance,
      message: 'Предмет успешно продан'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const withdrawItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const inventoryItem = user.inventory.id(itemId);
    if (!inventoryItem || inventoryItem.isWithdrawn) {
      return res.status(404).json({ message: 'Предмет не найден в инвентаре' });
    }

    // Логирование запроса на вывод
    logWithdrawal(
      user._id,
      inventoryItem.itemName,
      user.username,
      user.gameNickname,
      user.server,
      user.bankAccount
    );

    // Помечаем предмет как выведенный
    inventoryItem.isWithdrawn = true;

    await user.save();

    res.json({
      success: true,
      message: 'Запрос на вывод отправлен администратору'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInventoryStats = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const totalItems = user.inventory.length;
    const activeItems = user.inventory.filter(item => !item.isWithdrawn).length;
    const totalValue = user.inventory
      .filter(item => !item.isWithdrawn)
      .reduce((sum, item) => sum + (item.itemPrice || 0), 0);

    res.json({
      totalItems,
      activeItems,
      totalValue,
      inventory: user.inventory.filter(item => !item.isWithdrawn)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  sellItem,
  withdrawItem,
  getInventoryStats
};