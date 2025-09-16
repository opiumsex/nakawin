const logDeposit = (userId, amount, username) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DEPOSIT: User ${username} (ID: ${userId}) deposited ${amount} coins`);
};

const logWithdrawal = (userId, itemName, username, gameNickname, server, bankAccount) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] WITHDRAWAL: User ${username} (Game: ${gameNickname}, Server: ${server}, Bank: ${bankAccount}) requested withdrawal of: ${itemName}`);
};

const logCaseOpen = (userId, caseId, itemId, username) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CASE_OPEN: User ${username} opened case ${caseId} and won item ${itemId}`);
};

const logWheelSpin = (userId, wheelId, itemId, username) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] WHEEL_SPIN: User ${username} spun wheel ${wheelId} and won item ${itemId}`);
};

module.exports = {
  logDeposit,
  logWithdrawal,
  logCaseOpen,
  logWheelSpin
};