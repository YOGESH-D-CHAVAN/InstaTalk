import axios from "axios";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const enhanceMessage = async (text) => {
  if (!text.trim()) return text;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant", // Replacement for decommissioned llama3-8b-8192
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that enhances chat messages. Fix grammar, spelling, and improve clarity while keeping the original intent and tone. Return ONLY the enhanced text, no explanations or quotes."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Enhancement failed:", error);
    throw new Error(error.response?.data?.error?.message || "Failed to enhance message");
  }
};

export default { enhanceMessage };
