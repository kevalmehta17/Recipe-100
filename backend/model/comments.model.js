import mongoose, { Types } from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        required: true
    },
    text: {
        type: String,
        required: [true, "Comment text is required"],
        maxLength: [500, "Comment cannot exceed 500 characters"],
        minLength: [1, "Comment cannot be empty"],
        trim: true
    }
}, { timestamps: true });

// Index for faster queries
commentSchema.index({ recipe: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;