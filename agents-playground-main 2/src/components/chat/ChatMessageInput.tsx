import { useWindowResize } from "@/hooks/useWindowResize";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLLM } from "@/hooks/useLLM";

type ChatMessageInputProps = {
  placeholder: string;
  accentColor: string;
  height: number;
  onSend?: (message: string) => void;
  conversationHistory: Array<{ role: string; content: string }>;
};

export const ChatMessageInput = ({
  placeholder,
  accentColor,
  height,
  onSend,
  conversationHistory,
}: ChatMessageInputProps) => {
  const [message, setMessage] = useState("");
  const [inputTextWidth, setInputTextWidth] = useState(0);
  const [inputWidth, setInputWidth] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputHasFocus, setInputHasFocus] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const hiddenInputRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowSize = useWindowResize();
  const { generateSummary } = useLLM();

  const handleSend = useCallback(() => {
    if (!onSend || message === "") {
      return;
    }
    onSend(message);
    setMessage("");
  }, [onSend, message]);

  const handleGenerateSummary = useCallback(async () => {
    if (conversationHistory.length === 0) return;
  
    setIsGeneratingSummary(true);
    try {
      // Generate summary using the LLM
      const summary = await generateSummary(conversationHistory);
  
      // Log summary to console
      console.log("Generated Summary:", summary);
  
      // Save summary to records API endpoint
      console.log("Sending summary to http://localhost:1000/records...");
      const response = await fetch("http://localhost:1000/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
          metadata: {
            timestamp: new Date().toISOString(),
            messageCount: conversationHistory.length,
          },
        }),
      });
  
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error from records endpoint:", errorText);
        throw new Error("Failed to save summary");
      }
  
      console.log("Summary saved successfully");
  
      // Set the generated summary and show modal
      setGeneratedSummary(summary);
      setShowSummaryModal(true);
    } catch (error) {
      console.error("Summary generation/saving failed:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [conversationHistory, generateSummary]);

  useEffect(() => {
    setIsTyping(true);
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    if (hiddenInputRef.current) {
      setInputTextWidth(hiddenInputRef.current.clientWidth);
    }
  }, [hiddenInputRef, message]);

  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.clientWidth);
    }
  }, [hiddenInputRef, message, windowSize.width]);

  return (
    <>
      <div
        className="flex flex-col gap-2 border-t border-gray-200 bg-white"
        style={{ height: height }}
      >
        <div className="flex flex-row pt-3 gap-2 items-center relative px-2">
          <div
            className={`w-2 h-4 bg-${inputHasFocus ? accentColor : "gray"}-${
              inputHasFocus ? 500 : 300
            } ${
              inputHasFocus ? `shadow-md shadow-${accentColor}-100` : ""
            } absolute left-3 ${
              !isTyping && inputHasFocus ? "cursor-animation" : ""
            }`}
            style={{
              transform:
                "translateX(" +
                (message.length > 0
                  ? Math.min(inputTextWidth, inputWidth - 20) - 4
                  : 0) +
                "px)",
            }}
          ></div>
          <input
            ref={inputRef}
            className={`w-full text-sm bg-transparent text-gray-800 p-2 pr-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500 ${
              inputHasFocus ? "opacity-100" : "opacity-70"
            } placeholder-gray-400`}
            style={{
              paddingLeft: message.length > 0 ? "12px" : "28px",
              caretColor: accentColor,
            }}
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setInputHasFocus(true)}
            onBlur={() => setInputHasFocus(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />
          <span
            ref={hiddenInputRef}
            className="absolute top-0 left-0 text-sm pl-3 text-transparent pointer-events-none opacity-0"
          >
            {message.replaceAll(" ", "\u00a0")}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary || conversationHistory.length === 0}
              className={`text-sm font-medium text-${accentColor}-600 hover:bg-${accentColor}-50 px-3 py-1.5 rounded-md transition-colors ${
                conversationHistory.length > 0
                  ? "opacity-100"
                  : "opacity-50 pointer-events-none"
              }`}
            >
              {isGeneratingSummary ? "Generating..." : "Summary"}
            </button>
            <button
              disabled={message.length === 0 || !onSend}
              onClick={handleSend}
              className={`text-sm font-medium text-${accentColor}-600 hover:bg-${accentColor}-50 px-3 py-1.5 rounded-md transition-colors ${
                message.length > 0 ? "opacity-100" : "opacity-50 pointer-events-none"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Modal Popup for Generated Summary */}
      {showSummaryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Generated Summary</h2>
            <textarea
              readOnly
              value={generatedSummary}
              className="w-full h-40 p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className={`px-4 py-2 text-white bg-${accentColor}-600 rounded hover:bg-${accentColor}-700`}
                onClick={() => {
                  navigator.clipboard.writeText(generatedSummary);
                }}
              >
                Copy
              </button>
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setShowSummaryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
