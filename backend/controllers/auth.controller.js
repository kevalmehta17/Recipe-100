import generateToken from "../config/generateToken.js";
import User from "../model/user.model.js";

export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Provide valid email" });
        }
        
        //check if user already exist
        const existingUser = User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exist" });
        }
        // check the password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Provide the password length > 6" });
        }
        // if everything is correct then save to db and generate the token
        // save newUser to db
        const newUser = await User.create({
            username,
            email,
            password
        });
        // const newUser = new User({ username, email, password });
        // await newUser.save();

        //generate Token 
        const token = generateToken(newUser);
        const { password: pwd, ...userWithoutPassword } = newUser._doc;

        // return the response
        return res.status(201).json({
            success: true,
            message: {
                ...userWithoutPassword,
                token
            }
        })


        
    } catch (error) {
        console.error("Error during signup", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}