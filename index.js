const express = require("express");
const connectDB = require("./Connection/dbConnection");
const userRoutes = require("./Routes/userRoutes");
const cors = require("cors");
const PORT = process.env.PORT || 5003;

connectDB();

const app = express();
app.use(express.json());

const corsOptions = {
 origin: ["http://localhost:3000", "https://quizmo-1sty.vercel.app"],
 methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
 allowedHeaders: ["Content-Type", "Authorization"],
 credentials: true,
};
app.use(cors(corsOptions));

app.use(
 "/api/users",
 (req, res, next) => {
  next();
 },
 userRoutes
);

app.listen(PORT, () => {});
