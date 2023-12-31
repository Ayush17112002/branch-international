const User = require("../models/user.model");

const login = async (req, res) => {
  try {
    const { userName, type } = req.body;
    console.log(userName, type);
    let user = await User.findOne({ userName, type });
    if (user) {
      return res.status(200).json({
        data: {
          userName: user?.userName,
          id: user?.id,
          type: user?.type,
        },
      });
    } else if (!user) {
      user = new User({ userName, type, connection: [] });
      if (!user) {
        throw new Error("INTERNAL SERVER ERROR");
      }
      await user.save();
      return res
        .status(200)
        .json({
          data: { userName: user?.userName, id: user?.id, type: user?.type },
        });
    }
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

module.exports = { login };
