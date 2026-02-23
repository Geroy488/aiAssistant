module.exports = {
    classifyPriority
};

async function classifyPriority(description) {

    const prompt = `
    Classify this task as Low, Medium, or High priority:
    "${description}"
    `;

    // Example mock AI response (for testing)
    const fakeResponse = "High";

    return {
        priority: fakeResponse,
        deadline: null,
        raw: fakeResponse
    };
}