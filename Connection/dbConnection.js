const mongoose = require("mongoose");
require("dotenv").config("../.env");
const string = process.env.CONNECTION_STRING;

const connectDB = async () => {
 try {
  const connect = await mongoose.connect(string);
  console.log(
   `MongoDB connected\n`,
   connect.connection.host,
   `\n`,
   connect.connection.name
  );
 } catch (err) {
  console.error(err.message);
  process.exit(1);
 }
};

module.exports = connectDB;
