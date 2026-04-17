import express from 'express';
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import chatRoutes from "./routes/chat.routes.js"

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}))

app.use("/api/auth", authRoutes)
app.use("/api/chat", chatRoutes)

export default app;