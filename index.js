const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const Database = require("./config/Database");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const path = require("path");

const allowedOrigins = [
  "http://localhost:5173",
  "https://blogbysandesh.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
