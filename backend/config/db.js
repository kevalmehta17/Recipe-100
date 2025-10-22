import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();
// console.log("Mongo URL:-", process.env.MONGO_URL);

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected: ${connection.connection.host}`);

        
    } catch (error) {
        console.error("Error during connection with DB", error.message);
        // stop the node app bcz app cant run without the db
        process.exit(1);
    }
}

export default connectDB;