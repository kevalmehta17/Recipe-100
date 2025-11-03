import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { toggleLike, getMyLikedRecipe, getLikedRecipes } from "../controllers/like.controller.js";

const router = express.Router();

// All routes are protected (user must be logged in)
router.use(protectRoute);

// Toggle like/unlike (Instagram style)
router.post("/:recipeId", toggleLike);

// Get current user's liked recipes (private)
router.get("/my-likes", getMyLikedRecipe);

// Get list of users who liked a recipe (public - but needs auth)
router.get("/recipe/:recipeId", getLikedRecipes);

export default router;