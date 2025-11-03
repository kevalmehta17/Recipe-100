import User from "../model/user.model.js";
import Recipe from "../model/recipe.model.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) {
            return res.status(401).json({ message: "UnAuthorized" });
        }
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get recipes count uploaded by this user
        const recipesCount = await Recipe.countDocuments({ createdBy: userId });

        return res.status(200).json({ 
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePic: user.profilePic,
                recipesCount: recipesCount,
                likedRecipesCount: user.likedRecipes.length,
                savedRecipesCount: user.savedRecipes.length,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Error during getMyProfile", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user;
        const { username, bio, profilePic } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prepare update data
        const updateData = {};

        // Update username (with validation)
        if (username !== undefined) {
            if (username.trim().length < 3) {
                return res.status(400).json({ message: "Username must be at least 3 characters long" });
            }
            if (username.trim().length > 30) {
                return res.status(400).json({ message: "Username cannot exceed 30 characters" });
            }
            
            // Check if username is already taken by another user
            const trimmedUsername = username.trim();
            if (trimmedUsername !== user.username) {
                const existingUser = await User.findOne({ username: trimmedUsername });
                if (existingUser) {
                    return res.status(400).json({ message: "Username is already taken" });
                }
            }
            
            updateData.username = trimmedUsername;
        }

        // Update bio (with validation)
        if (bio !== undefined) {
            if (bio.length > 150) {
                return res.status(400).json({ message: "Bio cannot exceed 150 characters" });
            }
            updateData.bio = bio;
        }

        // Update profile picture (upload to Cloudinary)
        if (profilePic) {
            // Check if it's a base64 image
            if (profilePic.startsWith("data:image/")) {
                try {
                    // Delete old profile pic from Cloudinary if it exists and is not the default
                    if (user.profilePic && 
                        !user.profilePic.includes("/uploads/default-avatar.png") &&
                        user.profilePic.includes("cloudinary.com")) {
                        try {
                            // Extract public_id from Cloudinary URL
                            // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[format]
                            const urlParts = user.profilePic.split("/");
                            const uploadIndex = urlParts.indexOf("upload");
                            if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
                                // Get everything after 'upload/v[version]/' and remove the file extension
                                const pathAfterUpload = urlParts.slice(uploadIndex + 2).join("/");
                                const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf("."));
                                await cloudinary.uploader.destroy(publicId);
                            }
                        } catch (deleteError) {
                            console.error("Error deleting old profile pic:", deleteError.message);
                            // Continue with upload even if deletion fails
                        }
                    }

                    // Upload new image
                    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                        folder: "Recipe-100/profiles",
                        transformation: [
                            { width: 400, height: 400, crop: "fill" },
                            { quality: "auto" }
                        ]
                    });
                    updateData.profilePic = uploadResponse.secure_url;
                } catch (error) {
                    console.error("Error uploading profile pic to Cloudinary:", error.message);
                    return res.status(500).json({ message: "Profile picture upload failed" });
                }
            } else {
                // If it's already a URL, use it
                updateData.profilePic = profilePic;
            }
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                profilePic: updatedUser.profilePic,
                createdAt: updatedUser.createdAt
            }
        });

    } catch (error) {
        console.error("Error during updateMyProfile:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Get public profile of any user (when someone visits another user's profile)
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Get user (without password, email, and private data)
        const user = await User.findById(userId).select("-password -email -likedRecipes -savedRecipes");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get recipes count uploaded by this user
        const recipesCount = await Recipe.countDocuments({ createdBy: userId });

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                bio: user.bio,
                profilePic: user.profilePic,
                recipesCount: recipesCount,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Error during getUserProfile:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// Get recipes uploaded by a specific user (public - anyone can see)
export const getUserRecipes = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get all recipes by this user
        const recipes = await Recipe.find({ createdBy: userId })
            .populate("createdBy", "username bio profilePic")
            .sort({ createdAt: -1 });

        if (recipes.length === 0) {
            return res.status(404).json({ message: "No recipes found for this user" });
        }

        return res.status(200).json({
            success: true,
            count: recipes.length,
            recipes: recipes
        });
    } catch (error) {
        console.error("Error during getUserRecipes:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
