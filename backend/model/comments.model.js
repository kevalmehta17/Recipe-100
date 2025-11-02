import mongoose, { Types } from "mongoose";

const commentSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        maxLength: [200, "Comment cannot exceed 200 characters"],
        minLength:[1, "comment cannot be less than 1 character"]
    }
})

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;