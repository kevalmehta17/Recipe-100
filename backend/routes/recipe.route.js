import express from "expres";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

// public route
router.get("/", getAllRecipe);
router.get("/:id", getRecipeById);

// protected Route
router.post("/", protectRoute, createRecipe);
router.patch("/:id", protectRoute, updateRecipe);
router.delete("/:id", protectRoute, deleteRecipe);

// fetch the list 
router.get("/user/me", protectRoute, getMyRecipe);
router.get("/user/me/likes", protectRoute, getLikedRecipes); 
router.get("/user/me/saved", protectRoute, getSavedRecipes); 

// Like or save a specific recipe (action)
router.post("/:id/like", protectRoute, likeRecipe);
router.post("/:id/save", protectRoute, saveRecipe);




export default router;