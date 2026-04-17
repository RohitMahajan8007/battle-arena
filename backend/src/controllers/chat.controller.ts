import { ChatSession } from "../model/chat.model.js";
import runGraph from "../ai/graph.ai.js";

// Using any for Request and Response to bypass ESM named export SyntaxErrors at runtime
export const invokeChat = async (req: any, res: any) => {
    try {
        const { input, sessionId, file } = req.body;
        const userId = (req as any).user.id;

        console.log("Chat Request Received:", { 
            userId, 
            sessionId, 
            hasInput: !!input, 
            hasFile: !!file 
        });

        let processedInput = input || "";
        let fileContent = "";

        if (file && file.base64) {
            const buffer = Buffer.from(file.base64.split(",")[1], 'base64');
            
            if (file.type === 'application/pdf') {
                try {
                    console.log("RAG: Parsing PDF...");
                    const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
                    const data = await pdf(buffer);
                    fileContent = data.text;
                    processedInput = `[File: ${file.name}]\n[Content]: ${fileContent}\n\n[User's Question]: ${processedInput}`;
                } catch (pdfError) {
                    console.error("PDF Parsing Error:", pdfError);
                    processedInput += `\n\n[Note: User uploaded a PDF "${file.name}" but it couldn't be parsed yet.]`;
                }
            } else if (file.type.startsWith('image/')) {
                try {
                    console.log("RAG: Processing Image via Gemini Vision...");
                    const { geminiModel } = await import("../ai/models.ai.js");
                    // Vision request to describe the image
                    const visionResponse = await geminiModel.invoke([
                        { type: "text", text: "Describe this image in extreme detail for another AI to understand. Include any text, objects, and colors." },
                        { type: "image_url", image_url: { url: file.base64 } }
                    ]);
                    const imageDescription = visionResponse.content;
                    processedInput = `[Image Analysis]: ${imageDescription}\n\n[User's Question]: ${processedInput}`;
                } catch (imgError) {
                    console.error("Image Analysis Error:", imgError);
                    processedInput += `\n\n[User uploaded an image: ${file.name}]`;
                }
            } else {
                fileContent = buffer.toString('utf-8');
                processedInput = `[File: ${file.name}]\n[Content]: ${fileContent}\n\n[User's Question]: ${processedInput}`;
            }
        }

        if (!processedInput.trim()) {
            return res.status(400).json({ success: false, message: "Input or file is required" });
        }

        console.log("Invoking Graph Engine...");
        const result = await runGraph(processedInput);
        console.log("Graph Engine Response Success");

        const messageData = {
            problem: input || (file ? `Uploaded ${file.name}` : ""),
            solution_1: result.solution_1 || "No solution provided.",
            solution_2: result.solution_2 || "No solution provided.",
            model_a: "Mistral", 
            model_b: "Cohere",
            judge: result.judge ? { ...result.judge, judge_model: "gemini-flash-latest" } : { 
                solution_1_score: 0, 
                solution_2_score: 0, 
                solution_1_reasoning: "No judgment available.", 
                solution_2_reasoning: "",
                judge_model: "gemini-flash-latest" 
            },
            file: file ? { name: file.name, fileType: file.type } : undefined
        };

        let session;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, user: userId });
        }

        if (session) {
            session.messages.push(messageData as any);
            await session.save();
            console.log("Session Updated:", session._id);
        } else {
            session = await ChatSession.create({
                title: (input || file?.name || "Chat").substring(0, 30),
                user: userId,
                messages: [messageData]
            });
            console.log("New Session Created:", session._id);
        }

        res.status(200).json({
            success: true,
            session,
            message: {
                ...messageData,
                _id: session.messages[session.messages.length - 1]._id
            }
        });
    } catch (error: any) {
        console.error("Invoke Error Detailed:", error);
        res.status(500).json({ success: false, message: error.message || "Internal AI Error" });
    }
};

export const getSessions = async (req: any, res: any) => {
    try {
        const userId = (req as any).user.id;
        const sessions = await ChatSession.find({ user: userId }).sort({ updatedAt: -1 });
        res.status(200).json({ success: true, sessions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSession = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const session = await ChatSession.findOneAndDelete({ _id: id, user: userId });
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });
        res.status(200).json({ success: true, message: "Session deleted" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateVote = async (req: any, res: any) => {
    try {
        const { sessionId, messageId, preference } = req.body;
        const userId = (req as any).user.id;

        console.log("Vote Update Request:", { sessionId, messageId, preference, userId });

        if (!sessionId || !messageId) {
            return res.status(400).json({ success: false, message: "Missing sessionId or messageId" });
        }

        const session = await ChatSession.findOne({ _id: sessionId, user: userId });
        if (!session) {
            console.error(`Vote Error: Session ${sessionId} not found for user ${userId}`);
            return res.status(404).json({ success: false, message: `Session ${sessionId} not found` });
        }

        const message = (session.messages as any).id(messageId);
        if (!message) {
            console.error(`Vote Error: Message ${messageId} not found in session ${sessionId}`);
            return res.status(404).json({ success: false, message: `Message ${messageId} not found` });
        }

        message.preference = preference;
        await session.save();
        console.log("Vote Success:", { sessionId, messageId, preference });
        res.status(200).json({ success: true, message: "Vote updated" });
    } catch (error: any) {
        console.error("Vote Controller Crash:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLeaderboard = async (req: any, res: any) => {
    try {
        const sessions = await ChatSession.find();
        const modelStats: Record<string, { wins: number; total: number }> = {
            "Mistral": { wins: 0, total: 0 },
            "Cohere": { wins: 0, total: 0 }
        };
        sessions.forEach(session => {
            session.messages.forEach((msg: any) => {
                if (msg.preference) {
                    if (msg.preference === 'a') modelStats[msg.model_a].wins += 1;
                    else if (msg.preference === 'b') modelStats[msg.model_b].wins += 1;
                    else if (msg.preference === 'tie') { modelStats[msg.model_a].wins += 0.5; modelStats[msg.model_b].wins += 0.5; }
                    modelStats[msg.model_a].total += 1;
                    modelStats[msg.model_b].total += 1;
                }
            });
        });
        const leaderboard = Object.keys(modelStats).map(modelName => {
            const stats = modelStats[modelName];
            return { model: modelName, wins: Math.floor(stats.wins), score: stats.total > 0 ? parseFloat(((stats.wins / stats.total) * 10).toFixed(1)) : 0 };
        }).sort((a, b) => b.score - a.score);
        res.status(200).json({ success: true, leaderboard });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
