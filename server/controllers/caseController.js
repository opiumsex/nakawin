const Case = require('../models/Case');
const User = require('../models/User');
const Item = require('../models/Item');
const { calculatePrize } = require('../utils/probability');
const { logCaseOpen } = require('../utils/logger');

const getCases = async (req, res) => {
  try {
    const cases = await Case.find({ isActive: true })
      .populate({
        path: 'items.itemId',
        match: { isActive: true }
      })
      .select('name image price totalOpened');

    // Фильтруем случаи, где есть активные предметы
    const validCases = cases.filter(caseItem => 
      caseItem.items.some(item => item.itemId !== null)
    );

    res.json(validCases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const openCase = async (req, res) => {
  try {
    const { caseId } = req.body;
    const userId = req.session.userId;

    const user = await User.findById(userId);
    const caseToOpen = await Case.findById(caseId).populate({
      path: 'items.itemId',
      match: { isActive: true }
    });

    if (!user || !caseToOpen) {
      return res.status(404).json({ message: 'Пользователь или кейс не найден' });
    }

    // Проверяем, есть ли активные предметы в кейсе
    const activeItems = caseToOpen.items.filter(item => item.itemId !== null);
    if (activeItems.length === 0) {
      return res.status(400).json({ message: 'В кейсе нет доступных предметов' });
    }

    if (user.balance < caseToOpen.price) {
      return res.status(400).json({ message: 'Недостаточно средств' });
    }

    // Выбор приза на основе шансов
    const wonItemId = calculatePrize(activeItems);
    const wonItem = await Item.findById(wonItemId);

    if (!wonItem) {
      return res.status(500).json({ message: 'Ошибка при выборе приза' });
    }

    // Обновление баланса и инвентаря
    user.balance -= caseToOpen.price;
    user.totalSpent += caseToOpen.price;
    user.totalWon += wonItem.price;
    
    user.inventory.push({
      itemId: wonItem._id,
      itemName: wonItem.name,
      itemImage: wonItem.image,
      itemPrice: wonItem.price,
      obtainedFrom: 'case'
    });

    // Обновление статистики кейса
    caseToOpen.totalOpened += 1;
    
    await Promise.all([user.save(), caseToOpen.save()]);

    // Логирование
    logCaseOpen(userId, caseId, wonItem._id, user.username);

    res.json({
      success: true,
      item: wonItem,
      newBalance: user.balance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCase = async (req, res) => {
  try {
    const { name, image, price, items } = req.body;
    
    // Проверяем, что все предметы существуют
    for (const item of items) {
      const itemExists = await Item.findById(item.itemId);
      if (!itemExists) {
        return res.status(400).json({ message: `Предмет с ID ${item.itemId} не найден` });
      }
    }

    const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
    if (totalChance <= 0) {
      return res.status(400).json({ message: 'Общая вероятность должна быть больше 0' });
    }

    const newCase = new Case({
      name,
      image,
      price,
      items
    });

    await newCase.save();
    res.status(201).json({ message: 'Кейс успешно добавлен', case: newCase });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const updates = req.body;

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      updates,
      { new: true, runValidators: true }
    ).populate('items.itemId');

    if (!updatedCase) {
      return res.status(404).json({ message: 'Кейс не найден' });
    }

    res.json({ message: 'Кейс обновлен', case: updatedCase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCases,
  openCase,
  addCase,
  updateCase
};