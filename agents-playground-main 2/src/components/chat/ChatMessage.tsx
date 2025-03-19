type ChatMessageProps = {
  message: string;
  accentColor: string;
  name: string;
  isSelf: boolean;
  hideName?: boolean;
};

export const ChatMessage = ({
  name,
  message,
  accentColor,
  isSelf,
  hideName,
}: ChatMessageProps) => {
  return (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} ${hideName ? "mb-1" : "mb-3"}`}>
      {!hideName && (
        <div
          className={`text-xs font-medium ${
            isSelf ? `text-${accentColor}-600` : "text-gray-600"
          } mb-1`}
        >
          {name}
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 ${
          isSelf 
            ? `bg-${accentColor}-100 text-gray-900`
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <p className="text-sm leading-snug">{message}</p>
      </div>
    </div>
  );
};