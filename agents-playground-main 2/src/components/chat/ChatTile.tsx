import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessage as ComponentsChatMessage } from "@livekit/components-react";
import { useEffect, useRef, useState, useCallback } from "react";

const inputHeight = 64;

export type ChatMessageType = {
  name: string;
  message: string;
  isSelf: boolean;
  timestamp: number;
};

type ChatTileProps = {
  messages: ChatMessageType[];
  accentColor: string;
  onSend?: (message: string) => Promise<ComponentsChatMessage>;
};

export const ChatTile = ({ messages, accentColor, onSend }: ChatTileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);

  // Update conversation history when messages change
  useEffect(() => {
    const newHistory = messages.map((msg) => ({
      role: msg.isSelf ? "user" : "assistant",
      content: msg.message,
    }));
    setConversationHistory(newHistory);
  }, [messages]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending messages
  const handleSend = useCallback(
    async (message: string) => {
      if (onSend) {
        await onSend(message);
      }
    },
    [onSend]
  );

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-xl shadow-sm border border-gray-100">
      <div
        ref={containerRef}
        className="overflow-y-auto flex flex-col gap-4 p-4"
        style={{
          height: `calc(100% - ${inputHeight}px)`,
        }}
      >
        {messages.map((message, index, allMsg) => {
          const hideName = index >= 1 && allMsg[index - 1].name === message.name;

          return (
            <ChatMessage
              key={index}
              hideName={hideName}
              name={message.name}
              message={message.message}
              isSelf={message.isSelf}
              accentColor={accentColor}
            />
          );
        })}
      </div>
      <div className="border-t border-gray-100">
        <ChatMessageInput
          height={inputHeight}
          placeholder="Type a message"
          accentColor={accentColor}
          onSend={handleSend}
          conversationHistory={conversationHistory} // Pass conversation history
        />
      </div>
    </div>
  );
};