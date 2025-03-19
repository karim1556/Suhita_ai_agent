import { useCallback } from "react";

export const useLLM = () => {
  const generateSummary = useCallback(
    async (conversationHistory: Array<{ role: string; content: string }>) => {
      try {
        const response = await fetch("/api/generate-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversationHistory }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate summary");
        }

        const data = await response.json();
        return data.summary;
      } catch (error) {
        console.error("Summary generation error:", error);
        throw error;
      }
    },
    []
  );

  return { generateSummary };
};