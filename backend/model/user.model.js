import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
     username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        maxLength: [30, "Username cannot exceed 30 characters"],
        minLength: [3, "Username must be at least 3 characters long"]
        
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email address"],
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        required: [true, "password required"],
        minLength: [6, "Password must be at least 6 character"]
    },
    bio: {
        type: String,
        default: "Hey there! I love sharing recipes!🍳",
        maxLength: [150, "Bio cannot exceed 150 characters"]
    },
    savedRecipes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        }
    ],
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// hashing the password
userSchema.pre('save', async function (next) {
    //if password is not updating then move to next
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
        
    } catch (error) {
        console.error("Error during the hashing the password", error.message);
        next(error);
    }
})

// password matching
userSchema.methods.matchPassword = async function (enteredPassword){
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error("Error during the matching password:-", error.message);
        throw error;
    }
}

const User = mongoose.model("User", userSchema);

export default User;