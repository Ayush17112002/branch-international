const User = require("../models/user.model");

const login = async (req, res) => {
  try {
    const { userName } = req.body;
    console.log(userName);
    const user = await User.findOne({ userName });
    if (user) {
      return res.status(200).json({
        data: {
          userName: user?.userName,
          id: user?.id,
          type: user?.type,
        },
      });
    } else {
      throw new Error("User not found");
    }
  } catch (err) {
    return res.status(404).json({
      error: err,
    });
  }
};
module.exports = { login };
