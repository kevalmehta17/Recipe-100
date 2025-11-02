import Recipe from "../model/recipe.model.js";
import Comment from "../model/comments.model.js";
import mongoose from "mongoose";

export const addComment = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { text } = req.body;
        
        if (!text.trim() || !text) {
            return res.status(400).json({ message: "text required" });
        }

        const recipe = await Recipe.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ message: "No recipe found" });
        }
        // create comment
        const comment = await Comment.create({
            user: req.user,
            recipe: recipeId,
            text:text.trim()
        })
        // increment the comment count
        await Recipe.findByIdAndUpdate(recipeId, { $inc: { commentsCount: 1 } });

        await comment.populate('user', 'username bio');

        return res.status(201).json({
            message: "Comment added successfully",
            comment
        })
        
    } catch (error) {
        console.error("Error during add-comment", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Provide the valid mongoDB id" });
        }
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "No comment found on this id" });
        }

        // Check authorization - only comment owner can delete
        if (comment.user.toString() !== req.user) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        // delete the comment from the db
        await Comment.findByIdAndDelete(commentId);
        // decrement the comment count
        await Recipe.findByIdAndUpdate(comment.recipe, { $inc: { commentsCount: -1 } });

        return res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error("Error during deleting comment:-", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getCommentsByRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: "Provide the valid mongoId" });
        }
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "No recipe found on this id" });
        }
        
        // Get all comments for this recipe with user details
        const comments = await Comment.find({ recipe: recipeId })
            .populate('user', 'username bio')
            .sort({ createdAt: -1 });  // Newest first

        return res.status(200).json({
            success: true,
            commentsCount: recipe.commentsCount,
            comments
        });
    } catch (error) {
        console.error("Error during getCommentsByRecipe", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}