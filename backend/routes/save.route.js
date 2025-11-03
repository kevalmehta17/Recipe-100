import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { toggleSave, getMySavedRecipes } from "../controllers/save.controller.js";

const router = express.Router();

// All routes are protected (user must be logged in)
router.use(protectRoute);

// Toggle save/unsave (Instagram-style bookmark)
router.post("/:recipeId", toggleSave);

// Get current user's saved recipes (private)
router.get("/my-saves", getMySavedRecipes);

export default router;
