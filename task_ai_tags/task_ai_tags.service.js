async function classifyPriority(description) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
    You are a strict classifier.

    Respond with ONLY one word:
    Low
    Medium
    High

    No explanation.
    No punctuation.
    No extra text.

    Task:
    "${description}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log("Gemini raw response:", text);

        return {
            priority: extractPriority(text),
            deadline: null,
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