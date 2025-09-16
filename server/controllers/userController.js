const User = require('../models/User');

const updateProfile = async (req, res) => {
  try {
    const { gameNickname, server, bankAccount } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (gameNickname) user.gameNickname = gameNickname;
    if (server) user.server = server;
    if (bankAccount) user.bankAccount = bankAccount;

    await user.save();

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: {
        gameNickname: user.gameNickname,
        server: user.server,
        bankAccount: user.bankAccount
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('username gameNickname totalWon totalSpent balance')
      .sort({ totalWon: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .select('username gameNickname server bankAccount balance totalSpent totalWon createdAt lastLogin');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfile,
  getLeaderboard,
  getUserStats
};