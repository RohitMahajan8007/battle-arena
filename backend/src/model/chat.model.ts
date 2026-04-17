import mongoose, { model, Schema } from "mongoose";

const messageSchema = new Schema({
    problem: String,
    solution_1: String,
    solution_2: String,
    model_a: String,
    model_b: String,
    judge: {
        solution_1_score: Number,
        solution_2_score: Number,
        solution_1_reasoning: String,
        solution_2_reasoning: String,
        judge_model: String,
    },
    preference: { type: String, default: null },
    file: {
        name: String,
        fileType: String,
    }
}, { timestamps: true });

const chatSessionSchema = new Schema({
    title: { type: String, default: "New Chat" },
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    messages: [messageSchema]
}, { timestamps: true });

export const ChatSession = model("ChatSession", chatSessionSchema);
