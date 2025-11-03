import Recipe from "../model/recipe.model.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import User from "../model/user.model.js";

export const getAllRecipe = async (req, res) => {
    try {
        // extract the user requirement from the query params
        // GET /api/recipes?type=Veg&mealType=Dinner
        const { type, mealType } = req.query;
        // build the filter object that help to filter the recipes
        const filter = {};
        if (type) {
            filter.type = type;
        }
        if (mealType) {
            filter.mealType = mealType;
        }
        // fetch the recipes from db based on filter
        const recipes = await  Recipe.find(filter).populate("createdBy", "username bio profilePic").sort({ createdAt: -1 });

        if (recipes.length == 0) {
            return res.status(404).json({ message: "No Recipe found currently" });
        }
        // If everything is good then return the recipes that found
        return res.status(200).json({ recipes });

    } catch (error) {
        console.error("Error During getAllRecipe", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getRecipeById = async (req, res) => {
    try {
        // GET api/recipes/:id
        const { id } = req.params;

        // validate the mongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid recipe Id" });
        }

        const recipe = await Recipe.findById(id).populate("createdBy", "username bio profilePic");

        if (!recipe) {
            return res.status(404).json({ message: "No Recipe found on this ID" });
        }
        return res.status(200).json({ recipe });
        
    } catch (error) {
        console.error("Error in getRecipeById:- ", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const createRecipe = async (req, res) => {
    try {
        const { title, description, ingredients, instructions, type, mealType, imageUrl } = req.body;

        // validate missingFields
        const requiredFields = { title, description, ingredients, instructions, type, mealType, imageUrl };
        const missingFields = [];

        for (const fields in requiredFields) {
            if (!requiredFields[fields]) {
                missingFields.push(fields);
            }
        }
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing fields required ${missingFields.join(", ")}` });
        }

        //handle the image upload to cloudinary
        let finalImageUrl = imageUrl;
        if (imageUrl) {
            if (imageUrl.startsWith("data:image/")) {
                try {
                    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
                        folder: "Recipe-100"
                    });
                    finalImageUrl = uploadResponse.secure_url;
                } catch (error) {
                     console.error("Error uploading image to Cloudinary:-", error.message);
                    return res.status(500).json({message: "Image upload failed"});
                }
            }
        }
        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            instructions,
            type,
            mealType,
            imageUrl: finalImageUrl,
            createdBy: req.user
        });
        await newRecipe.save();

        return res.status(201).json({
            success: true,
            message: "Recipe created Successfully",
            recipe : newRecipe
        })
        
    } catch (error) {
        console.error("Error during createRecipe:-", error.message);
        return res.status(500).json({message :"Internal Server Error"});
    }
}

export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl, ...otherData } = req.body;

        // validate the recipe-id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Provide the valid id" });
        }

        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({ message: "No recipe found on this id" });
        }

        if (req.user !== recipe.createdBy.toString()) {
            return res.status(401).json({ success: false, message: "You are not authorize to change Recipe" });
        }

        let updatedData = { ...otherData };

        // handle the cloudinary updated image
          if (imageUrl) {
            if (imageUrl.startsWith("data:image/")) {
                try {
                    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
                        folder: "recipe-delights",
                    });
                    updatedData.imageUrl = uploadResponse.secure_url;
                } catch (error) {
                    console.error("Error uploading image to Cloudinary:", error.message);
                    return res.status(500).json({ message: "Image upload failed" });
                }
            } else {
                updatedData.imageUrl = imageUrl; // use existing URL
            }
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
        
        return res.status(200).json({ success: true, message: "Updated Recipe successfully", data: updatedRecipe });

    } catch (error) {
        console.error("Error during updateRecipe:-", error.message);
        return res.status(500).json({message :"Internal Server Error"});
    }
}

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;

        // validate the mongoDBId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Provide the valid id to delete" });
        }

        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({ message: "No Recipe found." });
        }
        // validate user authorization
        if (req.user !== recipe.createdBy.toString()) {
            return res.status(401).json({message: "You are no permission to delete the Recipe"});
        }

        // delete the image of that recipe from the cloudinary
        if (recipe.imageUrl) {
            try {
                const publicId = recipe.imageUrl.split("/").slice(-2).join("/").split(".")[0];
                await cloudinary.uploader.destroy(publicId);
                console.log("Public id to delete is:-", publicId);
            } catch (error) {
                console.error("Error during deleting image from cloudinary");
                return res.status(500).json({ message: "Internal server error" });
            }
        }
        // Delete the document from the mongoDB

        await Recipe.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Deleted successfully" });
       
    } catch (error) {
        console.error("Error during deleting Recipe", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
// for this controller user get his recipe that he/she uploaded on website
export const getMyRecipe = async(req, res)=> {
    try {
        const recipe = await Recipe.find({ createdBy: req.user }).populate( "createdBy","username bio profilePic");
        if (recipe.length === 0) {
            return res.status(404).json({ message: "No Recipe found for the current user" });
        }
        return res.status(200).json({ success: true, data: recipe });
    } catch (error) {
        console.error("Error in getMyRecipe:-", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }    
}

