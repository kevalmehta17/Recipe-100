import Recipe from "../model/recipe.model.js";

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
        const recipes = await  Recipe.find(filter).populate("createdBy", "username bio").sort({ createdAt: -1 });

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

        const recipe = await Recipe.findById(id).populate("createdBy", "username bio");

        if (!recipe) {
            return res.status(404).json({ message: "No Recipe found on this ID" });
        }
        return res.status(200).json({ recipe });
        
    } catch (error) {
        console.error("Error in getRecipeById:- ", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}