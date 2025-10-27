import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  createRecipe, 
  deleteRecipe, 
  getAllRecipe, 
  getLikedRecipes, 
  getMyRecipe, 
  getRecipeById, 
  getSavedRecipe, 
  likeRecipe, 
  savedRecipe, 
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
router.get("/user/me/likes", protectRoute, getLikedRecipes);
router.get("/user/me/saved", protectRoute, getSavedRecipe);

// ---- ACTION ROUTES (like/save) ---- //
router.post("/:id/like", protectRoute, likeRecipe);
router.post("/:id/save", protectRoute, savedRecipe);

router.get("/:id", getRecipeById);

export default router;
