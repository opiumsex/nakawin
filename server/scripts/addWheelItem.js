const mongoose = require('mongoose');
const Wheel = require('../models/Wheel');
const Item = require('../models/Item');
require('dotenv').config();

const addWheelItem = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const items = await Item.find({ isActive: true, type: { $in: ['wheel', 'both'] } });
    
    if (items.length === 0) {
      console.log('Нет предметов для колеса. Сначала создайте предметы с типом "wheel" или "both".');
      process.exit(1);
    }

    console.log('Доступные предметы для колеса:');
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.price} монет)`);
    });

    // Получаем активное колесо или создаем новое
    let wheel = await Wheel.findOne({ isActive: true });
    
    if (!wheel) {
      wheel = new Wheel({
        name: "Новое колесо",
        items: [],
        isActive: true
      });
    }

    // Добавляем демо-предметы
    wheel.items.push(
      { itemId: items[0]._id, chance: 10 },
      { itemId: items[1]._id, chance: 20 },
      { itemId: items[2]._id, chance: 30 },
      { itemId: items[3]._id, chance: 40 }
    );

    await wheel.save();
    console.log('Предметы успешно добавлены в колесо!');
    process.exit(0);

  } catch (error) {
    console.error('Ошибка при добавлении предметов в колесо:', error);
    process.exit(1);
  }
};

addWheelItem();