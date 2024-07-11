const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_CONNECTION)
  .then(() => {
    console.log("Database connected succesfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });

module.exports = mongoose.connection;
