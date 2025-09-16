const calculatePrize = (items) => {
  const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
  const random = Math.random() * totalChance;
  
  let current = 0;
  for (const item of items) {
    current += item.chance;
    if (random <= current) {
      return item.itemId;
    }
  }
  
  return items[items.length - 1].itemId;
};

const calculateWheelPrize = (wheelItems) => {
  const totalChance = wheelItems.reduce((sum, item) => sum + item.chance, 0);
  const random = Math.random() * totalChance;
  
  let current = 0;
  for (const item of wheelItems) {
    current += item.chance;
    if (random <= current) {
      return {
        item: item.itemId,
        angle: (current / totalChance) * 360 - 90 // Начальный угол для анимации
      };
    }
  }
  
  return {
    item: wheelItems[wheelItems.length - 1].itemId,
    angle: 270
  };
};

const getRarityColor = (rarity) => {
  const colors = {
    common: '#FFFFFF',
    uncommon: '#1EFF00',
    rare: '#0070FF',
    epic: '#A335EE',
    legendary: '#FF8000'
  };
  return colors[rarity] || '#FFFFFF';
};

module.exports = {
  calculatePrize,
  calculateWheelPrize,
  getRarityColor
};