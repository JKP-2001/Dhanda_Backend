const { default: mongoose } = require("mongoose");

const DB_URI = process.env.DB_URI;
const connectMongoDb = async () => {
  try {
    const conn = await mongoose.connect(DB_URI);
    console.log("DB connected successfully");
  } catch (err) {
    console.log(err.toString());
  }
}
module.exports = {connectMongoDb}