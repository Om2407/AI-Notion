import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDCX-Ji4U0ATcFsTDEHiaQ9FJJh2Qs9SaU");

export const generateNoteInsights = async (title, content) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a smart note assistant. Analyze the following note and return a JSON object with exactly these fields:
- summary: A concise 2-3 sentence summary of the note content
- action_items: An array of actionable tasks mentioned or implied in the note (max 5 items)
- suggested_title: A clear, descriptive title for this note (if the current title is vague or "Untitled")

Note Title: ${title}
Note Content: ${content}

Respond ONLY with valid JSON. No markdown, no explanation, just JSON.

Example format:
{
  "summary": "This note covers...",
  "action_items": ["Task 1", "Task 2"],
  "suggested_title": "Better Title Here"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip any accidental markdown code fences
    const clean = text.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(clean);

    return {
      summary: parsed.summary || "",
      action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
      suggested_title: parsed.suggested_title || title,
    };
  } catch (err) {
    console.error("Gemini API error:", err.message);
    throw new Error("AI generation failed. Please try again later.");
  }
};
