import jwt from "jsonwebtoken";


export const protectRoute = async (req, res, next) => {
    try {
        // Authorization : Bearer <token>
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // extract the token (at index 1)
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message : "Unauthorized"
            })
        }

        // attach the user id (mongo id) 
        req.user = decoded.id;
        next();
        
    } catch (error) {
        console.error("Error in ProtectRoute", error.message);
        return res.status(401).json({
            message : "Unauthorized"
        })
    }
}