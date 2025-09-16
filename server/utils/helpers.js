const formatBalance = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount);
};

const generateSessionId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeInput = (input) => {
  return input.trim().replace(/[<>&"']/g, '');
};

module.exports = {
  formatBalance,
  generateSessionId,
  validateEmail,
  sanitizeInput
};