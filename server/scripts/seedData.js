const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Case = require('../models/Case');
const Item = require('../models/Item');
const Wheel = require('../models/Wheel');
const User = require('../models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Очистка старых данных...');
    await Case.deleteMany({});
    await Item.deleteMany({});
    await Wheel.deleteMany({});
    await User.deleteMany({});

    console.log('Создание призов...');
    const items = await Item.insertMany([
      {
        name: "Золотой меч",
        image: "/images/items/golden_sword.png",
        price: 1000,
        type: "case",
        rarity: "rare"
      },
      {
        name: "Серебряный щит",
        image: "/images/items/silver_shield.png",
        price: 500,
        type: "case",
        rarity: "uncommon"
      },
      {
        name: "Бронзовый шлем",
        image: "/images/items/bronze_helmet.png",
        price: 300,
        type: "case",
        rarity: "common"
      },
      {
        name: "Алмазный посох",
        image: "/images/items/diamond_staff.png",
        price: 1500,
        type: "wheel",
        rarity: "epic"
      },
      {
        name: "Рубиновый кинжал",
        image: "/images/items/ruby_dagger.png",
        price: 800,
        type: "wheel",
        rarity: "rare"
      },
      {
        name: "Легендарный плащ",
        image: "/images/items/legendary_cloak.png",
        price: 2000,
        type: "both",
        rarity: "legendary"
      }
    ]);

    console.log('Создание кейсов...');
    await Case.insertMany([
      {
        name: "Базовый кейс",
        image: "/images/cases/basic_case.png",
        price: 100,
        items: [
          { itemId: items[0]._id, chance: 5 },
          { itemId: items[1]._id, chance: 15 },
          { itemId: items[2]._id, chance: 80 }
        ]
      },
      {
        name: "Премиум кейс",
        image: "/images/cases/premium_case.png",
        price: 250,
        items: [
          { itemId: items[0]._id, chance: 20 },
          { itemId: items[1]._id, chance: 30 },
          { itemId: items[2]._id, chance: 50 }
        ]
      },
      {
        name: "Легендарный кейс",
        image: "/images/cases/legendary_case.png",
        price: 500,
        items: [
          { itemId: items[5]._id, chance: 2 },
          { itemId: items[0]._id, chance: 18 },
          { itemId: items[1]._id, chance: 30 },
          { itemId: items[2]._id, chance: 50 }
        ]
      }
    ]);

    console.log('Создание колеса фортуны...');
    await Wheel.insertMany([
      {
        name: "Колесо Удачи",
        items: [
          { itemId: items[3]._id, chance: 5 },
          { itemId: items[4]._id, chance: 15 },
          { itemId: items[5]._id, chance: 2 },
          { itemId: items[0]._id, chance: 20 },
          { itemId: items[1]._id, chance: 30 },
          { itemId: items[2]._id, chance: 28 }
        ],
        isActive: true
      }
    ]);

    console.log('Создание тестового пользователя...');
    const hashedPassword = await bcrypt.hash('test123', 12);
    await User.create({
      username: 'testuser',
      gameNickname: 'TestPlayer',
      server: 'Europe',
      bankAccount: '1234567890',
      password: hashedPassword,
      balance: 5000
    });

    console.log('Данные успешно добавлены!');
    console.log('Тестовый пользователь:');
    console.log('Username: testuser');
    console.log('Password: test123');
    
    process.exit(0);

  } catch (error) {
    console.error('Ошибка при добавлении данных:', error);
    process.exit(1);
  }
};

seedData();