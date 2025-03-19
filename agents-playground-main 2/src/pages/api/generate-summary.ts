import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// It's recommended to store your API key in an environment variable.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { conversationHistory } = req.body;

    const prompt = `Generate a structured medical summary from this conversation:
    
${conversationHistory
  .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
  .join("\n")}

Format:
1. Patient Presentation: [main complaint]
2. Reported Symptoms: [list with durations]
3. Visual Observations: [from images/video]
4. Urgency Assessment: [based on symptoms]
5. Recommended Actions: [next steps]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a medical assistant generating professional summaries",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Log the full response to inspect its structure.
    console.log("OpenAI completion response:", JSON.stringify(completion, null, 2));

    // Access the summary from the response directly.
    const summary = completion.choices[0].message?.content;
    console.log("Extracted Summary:", summary);

    // If summary is undefined or empty, log a warning.
    if (!summary) {
      console.warn("No summary generated from the completion response.");
    }

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Summary generation error:", error);
    res.status(500).json({ message: "Summary generation failed" });
  }
}
