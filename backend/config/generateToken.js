import jwt from "jsonwebtoken";

function generateToken(user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    return token;
}

export default generateToken;