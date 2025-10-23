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
        const existingUser = await User.findOne({ email });
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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }
        // find the user in DB
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User doesn't exist" });
        }
        // match the password
        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(403).json({ message: "Password Invalid" });
        }
        //A 401 error means "I don't know who you are," while a 403 error means "I know who you are, but you are not allowed".
        // If everything is ok then generate the token
        const token = generateToken(user);
        user.lastLogin = Date.now();
        await user.save();

        const { password : pwd, ...userWithoutPassword } = user._doc;

        return res.status(200).json({
            message: "Login Successfully",
            ...userWithoutPassword,
            token
        })
    } catch (error) {
        console.error("Error during Login:-", error.message);
        return res.status(500).json({ message: "Internal server Error" });
    }
}

export const logout = async (req, res) => {
    return res.status(200).json({
        success:true,
        message: "Logout successfully"
    })
}