import Recipe from "../model/recipe.model.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";

// Toggle save/unsave recipe (Instagram-style bookmark)
export const toggleSave = async (req, res) => {
    try {
        const { recipeId } = req.params;

        // Validate recipe ID
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: "Invalid recipe ID" });
        }

        // Check if recipe exists
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        // Get user
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Toggle save/unsave
        if (user.savedRecipes.includes(recipeId)) {
            // UNSAVE - Remove from user's savedRecipes
            user.savedRecipes.pull(recipeId);
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Recipe removed from saved",
                saved: false
            });
        } else {
            // SAVE - Add to user's savedRecipes
            user.savedRecipes.push(recipeId);
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Recipe saved successfully",
                saved: true
            });
        }
    } catch (error) {
        console.error("Error in toggleSave:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get current user's saved recipes (private - only for their own profile)
export const getMySavedRecipes = async (req, res) => {
    try {
        // First, get user to know total saved recipes
        const user = await User.findById(req.user);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.savedRecipes.length === 0) {
            return res.status(404).json({ message: "No saved recipes found" });
        }

        // Pagination Logic
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalSavedRecipes = user.savedRecipes.length;

        // Fetch paginated recipes directly from Recipe collection
        const recipes = await Recipe.find({ _id: { $in: user.savedRecipes } })
            .populate('createdBy', 'username bio profilePic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            count: totalSavedRecipes,
            recipes: recipes,
            pagination: {
                totalItems: totalSavedRecipes,
                currentPage: page,
                totalPages: Math.ceil(totalSavedRecipes / limit)
            }
        });
    } catch (error) {
        console.error("Error in getMySavedRecipes:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
