const mongoose = require('mongoose');
const Case = require('../models/Case');
const Item = require('../models/Item');
require('dotenv').config();

const addCase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Получаем все активные предметы
    const items = await Item.find({ isActive: true });
    
    if (items.length === 0) {
      console.log('Нет активных предметов. Сначала создайте предметы.');
      process.exit(1);
    }

    console.log('Доступные предметы:');
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.price} монет)`);
    });

    // Здесь можно добавить интерактивное создание кейса
    // Для простоты создадим демо-кейс
    const demoCase = new Case({
      name: "Демо кейс",
      image: "/images/cases/demo_case.png",
      price: 150,
      items: [
        { itemId: items[0]._id, chance: 10 },
        { itemId: items[1]._id, chance: 20 },
        { itemId: items[2]._id, chance: 70 }
      ]
    });

    await demoCase.save();
    console.log('Демо кейс успешно создан!');
    process.exit(0);

  } catch (error) {
    console.error('Ошибка при создании кейса:', error);
    process.exit(1);
  }
};

addCase();