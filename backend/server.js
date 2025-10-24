import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import recipeRoutes from "./routes/recipe.route.js";


dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

// middleware
app.use(express.json());

// routes

app.use("/api/auth", authRoutes);
app.use('/api/recipes', recipeRoutes);


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
    connectDB();
})