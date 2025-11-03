import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  createRecipe, 
  deleteRecipe, 
  getAllRecipe, 
  getMyRecipe, 
  getRecipeById, 
  updateRecipe 
} from "../controllers/recipe.controller.js";

const router = express.Router();

// ----- PUBLIC ROUTES ----- //
router.get("/", getAllRecipe);

// ----- PROTECTED ROUTES ------ //

// Create, update, delete
router.post("/", protectRoute, createRecipe);
router.patch("/:id", protectRoute, updateRecipe);
router.delete("/:id", protectRoute, deleteRecipe);

// ---- FETCH USER-SPECIFIC LISTS ---- //
// IMPORTANT: define these before "/:id" routes
router.get("/user/me", protectRoute, getMyRecipe);

router.get("/:id", getRecipeById);

export default router;
