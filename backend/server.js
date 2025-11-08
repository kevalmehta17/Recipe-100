import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import recipeRoutes from "./routes/recipe.route.js";
import profileRoutes from "./routes/profile.route.js";
import commentRoutes from "./routes/comment.route.js";
import likeRoutes from "./routes/like.route.js";
import saveRoutes from "./routes/save.route.js";


dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();

// cors
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// middleware
app.use(express.json());

// routes

app.use("/api/auth", authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);  
app.use("/api/saves", saveRoutes);  


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
    connectDB();
})