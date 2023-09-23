const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("db successfully connected");
  } catch (err) {
    console.log("db failed");
  }
};
dbConnect();
