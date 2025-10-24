import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title required"],
        maxLength: [100, "Recipe title cannot exceed 100 characters"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description required"],
        trim: true,
        maxLength: [1000, "Recipe description cannot exceed 1000 characters"]
    },
    ingredients: {
        type: [String],
        required: [true, "Ingredients required"]
    },
    instructions: {
        type: [String],
        required: [true, "Instructions are required"]
    },
    type: {
        type: String,
        enum: ["Veg", "Non-Veg"],
        required: [true, "Type required"]
    },
    mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Brunch"],
        required: [true, "Meal-Type is required"]
    },
    imageUrl: {
        type: String,
        required: [true, "Recipe image required"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
