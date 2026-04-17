import express from "express";
import { invokeChat, getSessions, deleteSession, updateVote, getLeaderboard } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/leaderboard", getLeaderboard);

// Protected routes
router.use(authMiddleware);
router.post("/invoke", invokeChat);
router.get("/sessions", getSessions);
router.delete("/session/:id", deleteSession);
router.post("/vote", updateVote);

export default router;
