import express from 'express';
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import chatRoutes from "./routes/chat.routes.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}))

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)

// Serve frontend build from backend's public folder
const publicDir = path.join(__dirname, "../public")
app.use(express.static(publicDir))

// Fallback: send index.html for all non-API routes (React Router SPA support)
// Express v5 uses /{*splat} instead of *
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"))
})

export default app;