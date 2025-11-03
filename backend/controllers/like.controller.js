import Recipe from "../model/recipe.model.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";

export const toggleLike = async (req, res) => {
    try {
        const { recipeId } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: "Provide valid mongoDb Id" });
        }
        
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "No recipe found" });
        }

        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Production-grade: Update BOTH Recipe.likes AND User.likedRecipes
        if (recipe.likes.includes(req.user)) {
            // UNLIKE - Remove from both places
            recipe.likes.pull(req.user);
            recipe.likesCount -= 1;
            user.likedRecipes.pull(recipeId);
            
            await Promise.all([recipe.save(), user.save()]);
            
            return res.status(200).json({ 
                success: true,
                message: "Recipe unliked successfully",
                liked: false,
                likesCount: recipe.likesCount
            });
        } else {
            // LIKE - Add to both places
            recipe.likes.push(req.user);
            recipe.likesCount += 1;
            user.likedRecipes.push(recipeId);
            
            await Promise.all([recipe.save(), user.save()]);
            
            return res.status(200).json({ 
                success: true,
                message: "Recipe liked successfully",
                liked: true,
                likesCount: recipe.likesCount
            });
        }
    } catch (error) {
        console.error("Error during toggleLike", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMyLikedRecipe = async (req, res) => {
    try {
        const user = await User.findById(req.user)
            .populate({
                path: 'likedRecipes',
                populate: {
                    path: 'createdBy',
                    select: 'username bio'
                }
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.likedRecipes.length === 0) {
            return res.status(404).json({ message: "No liked recipes found" });
        }

        return res.status(200).json({
            success: true,
            count: user.likedRecipes.length,
            recipes: user.likedRecipes
        });
    } catch (error) {
        console.error("Error during fetching getMyLikedRecipe:-", error.message);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}
// Get list of users who liked a recipe (Instagram-style: when user clicks "127 likes")
export const getLikedRecipes = async (req, res) => {
    try {
        const { recipeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: "Provide the valid mongoDB Id" });
        }
        
        const recipe = await Recipe.findById(recipeId)
            .populate('likes', 'username bio');  
        
        
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
        
        // OR check if no likes:
        if (recipe.likes.length === 0) {
            return res.status(200).json({ 
                likesCount: 0, 
                likes: [] ,
                message: "No user liked this recipe yet"
            });
        }
        return res.status(200).json({
            success: true,
            likesCount: recipe.likesCount,
            likes: recipe.likes  // Array of user objects who liked
        });
    } catch (error) {
        console.error("Error during getLikedRecipes", error.message);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}