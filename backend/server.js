import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

// middleware
app.use(express.json());

// routes

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
    connectDB();
})