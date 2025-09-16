const Wheel = require('../models/Wheel');
const User = require('../models/User');
const Item = require('../models/Item');
const { calculateWheelPrize } = require('../utils/probability');
const { logWheelSpin } = require('../utils/logger');

const getWheel = async (req, res) => {
  try {
    const wheel = await Wheel.findOne({ isActive: true })
      .populate({
        path: 'items.itemId',
        match: { isActive: true }
      });

    if (!wheel) {
      return res.status(404).json({ message: 'Активное колесо не найдено' });
    }

    // Фильтруем активные предметы
    const activeItems = wheel.items.filter(item => item.itemId !== null);
    if (activeItems.length === 0) {
      return res.status(400).json({ message: 'В колесе нет доступных предметов' });
    }

    res.json({
      id: wheel._id,
      name: wheel.name,
      items: activeItems.map(item => ({
        id: item.itemId._id,
        name: item.itemId.name,
        image: item.itemId.image,
        price: item.itemId.price,
        chance: item.chance
      })),
      totalSpins: wheel.totalSpins
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const spinWheel = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);
    const wheel = await Wheel.findOne({ isActive: true })
      .populate({
        path: 'items.itemId',
        match: { isActive: true }
      });

    if (!user || !wheel) {
      return res.status(404).json({ message: 'Пользователь или колесо не найдено' });
    }

    const activeItems = wheel.items.filter(item => item.itemId !== null);
    if (activeItems.length === 0) {
      return res.status(400).json({ message: 'В колесе нет доступных предметов' });
    }

    // Выбор приза
    const prizeResult = calculateWheelPrize(activeItems);
    const wonItem = await Item.findById(prizeResult.item);

    if (!wonItem) {
      return res.status(500).json({ message: 'Ошибка при выборе приза' });
    }

    // Добавление приза в инвентарь
    user.inventory.push({
      itemId: wonItem._id,
      itemName: wonItem.name,
      itemImage: wonItem.image,
      itemPrice: wonItem.price,
      obtainedFrom: 'wheel'
    });

    user.totalWon += wonItem.price;

    // Обновление статистики колеса
    wheel.totalSpins += 1;

    await Promise.all([user.save(), wheel.save()]);

    // Логирование
    logWheelSpin(userId, wheel._id, wonItem._id, user.username);

    res.json({
      success: true,
      item: wonItem,
      spinAngle: prizeResult.angle,
      totalSpins: wheel.totalSpins
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addWheel = async (req, res) => {
  try {
    const { name, items } = req.body;
    
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

    // Деактивируем другие колеса
    await Wheel.updateMany({}, { isActive: false });

    const newWheel = new Wheel({
      name,
      items,
      isActive: true
    });

    await newWheel.save();
    res.status(201).json({ message: 'Колесо успешно добавлено', wheel: newWheel });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWheel,
  spinWheel,
  addWheel
};