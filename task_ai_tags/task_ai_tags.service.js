require('dotenv').config(); // ← add this as the FIRST line
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function classifyPriority(description) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a strict classifier. Respond with ONLY a JSON object, nothing else.

            Example response:
            {"priority": "High", "deadline": "2026-03-01"}

            If no deadline is mentioned, use null for deadline.
            Priority must be exactly one of: Low, Medium, High

            Task: "${description}"
                    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log("Gemini raw response:", text);

        // Remove markdown code blocks if Gemini wraps it in ```json ... ```
        const cleaned = text.replace(/```json|```/g, "").trim();

        const parsed = JSON.parse(cleaned);  // ← parse the JSON Gemini returns

        return {
            priority: extractPriority(parsed.priority),
            deadline: parsed.deadline ?? null,  // ← now actually extracted
            raw: text
        };

    } catch (error) {
        console.error("Gemini Error:", error);

        return {
            priority: "Medium",
            deadline: null,
            raw: "Fallback"
        };
    }
}

function extractPriority(text) {
    const cleaned = text.toLowerCase();

    if (cleaned === "high") return "High";
    if (cleaned === "medium") return "Medium";
    if (cleaned === "low") return "Low";

    // fallback if Gemini misbehaves
    if (cleaned.includes("high")) return "High";
    if (cleaned.includes("low")) return "Low";

    return "low"; 
}

module.exports = {
    classifyPriority
};