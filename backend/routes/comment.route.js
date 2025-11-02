import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js";
import { addComment, deleteComment, getCommentsByRecipe } from "../controllers/comment.controller.js";

const router = express.Router();


router.post("/:recipeId", protectRoute, addComment);

router.delete("/:commentId", protectRoute, deleteComment);

router.get("/recipe/:recipeId", getCommentsByRecipe);


export default router;