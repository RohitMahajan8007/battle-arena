import jwt from "jsonwebtoken";

// Using any for Express params to definitively resolve named export SyntaxErrors at runtime
export const authMiddleware = async (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

        if (!token) {
            console.error("Auth Error: No token provided");
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("Auth Error: JWT_SECRET not configured");
            return res.status(500).json({ success: false, message: "Internal Server Error: JWT configuration missing" });
        }

        const decoded = jwt.verify(token, secret) as any;
        (req as any).user = decoded;
        next();
    } catch (error: any) {
        console.error("Auth Error: Invalid token", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};
