import { StateGraph, StateSchema, START, END, type GraphNode, type CompiledStateGraph } from "@langchain/langgraph"
import z from "zod";
import { mistralAIModel, cohereModel, geminiModel } from "./models.ai.js";
import { createAgent, HumanMessage, providerStrategy } from "langchain";

const state = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge: z.object({
        solution_1_score: z.number().default(0),
        solution_2_score: z.number().default(0),
        solution_1_reasoning: z.string().default(""),
        solution_2_reasoning: z.string().default(""),
    })
})


const solutionNode: GraphNode<typeof state> = async (state) => {
    let sol1 = "Model A is currently unavailable or resting. Please try again in a moment.";
    let sol2 = "Model B is currently unavailable or resting. Please try again in a moment.";

    try {
        const mistralResponse = await mistralAIModel.invoke(state.problem);
        sol1 = String((mistralResponse as any).content || sol1);
    } catch (e: any) {
        console.error("Mistral Error:", e.message);
        sol1 = `[Model A Error]: ${e.message}. Please retry.`;
    }

    try {
        const cohereResponse = await cohereModel.invoke(state.problem);
        sol2 = String((cohereResponse as any).content || sol2);
    } catch (e: any) {
        console.error("Cohere Error:", e.message);
        sol2 = `[Model B Error]: ${e.message}. Please retry.`;
    }

    return {
        solution_1: sol1,
        solution_2: sol2,
    }
}

const judgeNode: GraphNode<typeof state> = async (state) => {
    try {
        const { problem, solution_1, solution_2 } = state

        const judge = createAgent({
            model: geminiModel,
            responseFormat: providerStrategy(z.object({
                solution_1_score: z.number().min(0).max(10),
                solution_2_score: z.number().min(0).max(10),
                solution_1_reasoning: z.string(),
                solution_2_reasoning: z.string(),
            })),
            systemPrompt: `You are a judge tasked with evaluating two solutions. Be constructive.`
        })

        const judgeResponse = await (judge as any).invoke({
            messages: [
                new HumanMessage(`Problem: ${problem}\nSolution 1: ${solution_1}\nSolution 2: ${solution_2}`)
            ]
        })

        const {
            solution_1_score,
            solution_2_score,
            solution_1_reasoning,
            solution_2_reasoning
        } = judgeResponse.structuredResponse

        return {
            judge: {
                solution_1_score,
                solution_2_score,
                solution_1_reasoning,
                solution_2_reasoning,
                judge_model: "gemini-flash-latest"
            }
        }
    } catch (error: any) {
        console.warn("Judge Overload/Error:", error.message);
        // Fallback if Gemini hits quota
        return {
            judge: {
                solution_1_score: 0,
                solution_2_score: 0,
                solution_1_reasoning: "The judge is currently reviewing other battles and is at capacity (Rate Limit). Please check back in a moment for evaluation.",
                solution_2_reasoning: "The judge is currently at capacity. Model A and B identities are still protected for voting.",
                judge_model: "Judge at Capacity"
            }
        }
    }
}

const graph = new StateGraph(state)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile()

export default async function (problem: string) { 

    const result = await graph.invoke({
        problem: problem
    })

    return result

}