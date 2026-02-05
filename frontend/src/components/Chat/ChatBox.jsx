import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import API from "../../services/api";
import LinkImg from "../../assets/icons/link.png"

const ENDPOINT = "http://localhost:5000";

export default function ChatBox({ chatId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(ENDPOINT);
    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    if (!chatId || !socketRef.current) return;
    const socket = socketRef.current;
    socket.emit("join_chat", chatId);

    const loadMessages = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/message/${chatId}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const handleReceiveMessage = (message) => {
      const msgChatId = message.chat || message.chatId;
      if (msgChatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.emit("leave_chat", chatId);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    if ((e.type === "click" || e.key === "Enter") && newMsg.trim()) {
      try {
        const msg = newMsg;
        setNewMsg("");
        const { data } = await API.post("/message", { chatId, content: msg });
        socketRef.current.emit("send_message", { chatId, message: data });
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Failed to send message", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
        <div className="animate-pulse font-medium">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((m, i) => {
          const msgSenderId = typeof m.sender === "object" ? (m.sender._id || m.sender.id) : m.sender;
          const currentUserId = user._id || user.id;
          const isMe = String(msgSenderId) === String(currentUserId);
          
          return (
            <div key={i} className={`flex w-full ${isMe ? "justify-end" : "justify-start items-end gap-3"}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200 overflow-hidden shadow-sm">
                  {m.sender?.avatar ? (
                     <img src={m.sender.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                     <span>{m.sender?.username?.[0]?.toUpperCase() || "?"}</span>
                  )}
                </div>
              )}
              
              <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 text-sm transition-all shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white border-t border-gray-200 flex items-center gap-2 md:gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <img src={LinkImg} alt="link" className="w-5 h-5 opacity-60" />
        </button>
        
        <div className="flex-1 relative">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
            className="w-full bg-gray-100 border-none text-gray-900 px-5 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
            placeholder="Type your message..."
          />
        </div>

        <button
          onClick={sendMessage}
          disabled={!newMsg.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}