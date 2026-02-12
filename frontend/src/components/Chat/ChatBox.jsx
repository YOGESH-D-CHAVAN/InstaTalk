import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import LinkImg from "../../assets/icons/link.png"
import { useSocket } from "../../context/SocketContext";
import { Image, FileText, X } from "lucide-react";

export default function ChatBox({ chatId, user }) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setUploadError("");
      const { data } = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      console.error("Upload failed", error);
      const errMsg = error.response?.data?.message || error.message || "Failed to upload file";
      setUploadError(errMsg);
      setTimeout(() => setUploadError(""), 5000);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset value so same file can be selected again if needed
    // e.target.value = ""; 
    // Wait, if I reset here, the onChange might trigger weirdly or I lose reference. 
    // Actually, it's better to reset after processing.

    const data = await uploadFile(file);
    if (data) {
      setAttachment({
        url: data.url,
        type: data.type,
        name: data.name,
      });
      setShowAttachMenu(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAttachmentOption = (type) => {
    if (!fileInputRef.current) return;
    
    if (type === "image") {
      fileInputRef.current.accept = "image/*,video/*";
    } else {
      fileInputRef.current.accept = "*";
    }
    
    fileInputRef.current.click();
    setShowAttachMenu(false);
  };


  useEffect(() => {
    if (!chatId || !socket) return;
    
    // socket.emit("join_chat", chatId); // Handled below

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

    const handleTyping = ({ chatId: roomChatId, userId }) => {
        if (roomChatId === chatId && String(userId) !== String(user._id)) {
            setIsTyping(true);
            setTypingUser(userId);
        }
    };

    const handleStopTyping = ({ chatId: roomChatId }) => {
        if (roomChatId === chatId) {
            setIsTyping(false);
            setTypingUser(null);
        }
    };

    const handleJoinChat = () => {
         // console.log("Joining chat room:", chatId);
         socket.emit("join_chat", chatId);
    };

 
    if (socket.connected) handleJoinChat();

    // Listeners
    socket.on("connect", handleJoinChat); // Re-join on reconnect
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("connect", handleJoinChat);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [chatId, socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]); // Scroll when typing starts too

  const sendMessage = async (e) => {
    if ((e.type === "click" || e.key === "Enter") && (newMsg.trim() || attachment)) {
      try {
        socket.emit("stop_typing", { chatId, userId: user._id });
        const msgContent = newMsg;
        const msgAttachment = attachment ? [attachment] : [];
        
        setNewMsg("");
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        const payload = { chatId, content: msgContent, attachments: msgAttachment };
        const { data } = await API.post("/message", payload);
        
        socket.emit("send_message", { chatId, message: data });
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Failed to send message", err);
      }
    }
  };

  const typingHandler = (e) => {
    setNewMsg(e.target.value);

    if (!socket) return;
    
    if (!isTyping) {
        socket.emit("typing", { chatId, userId: user._id });
    }


    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= 3000 && newMsg) { 
             socket.emit("stop_typing", { chatId, userId: user._id });
        }
    }, 3000);
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
                {m.attachments?.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {m.attachments.map((att, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden">
                         {att.type?.startsWith("image") ? (
                           <img src={att.url} alt="attachment" className="max-w-full max-h-60 object-cover" />
                         ) : att.type?.startsWith("video") ? (
                           <video src={att.url} controls className="max-w-full max-h-60" />
                         ) : (
                           <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-100 p-2 rounded text-blue-600 underline">
                             📎 {att.name || "Attachment"}
                           </a>
                         )}
                      </div>
                    ))}
                  </div>
                )}
                {m.content && <p>{m.content}</p>}
              </div>
            </div>
          );
        })}
        {isTyping && (
             <div className="flex w-full justify-start items-end gap-3">
                 <div className="w-8 h-8 flex items-center justify-center">
                    <div className="loading-dots flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                 </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 md:p-4 bg-white border-t border-gray-200 flex items-center gap-2 md:gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        </button>
        
        <div className="flex-1 relative flex flex-col">
          {uploadError && (
             <div className="absolute bottom-full left-0 mb-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200">
               {uploadError}
             </div>
          )}
          {attachment && (
            <div className="absolute bottom-full left-0 mb-2 bg-gray-100 p-2 rounded-lg flex items-center gap-2 shadow-md">
               <span className="text-xs text-gray-600 truncate max-w-[150px]">{attachment.name}</span>
               <button onClick={removeAttachment} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          )}
          <div className="relative">
   
             {showAttachMenu && (
                <div className="absolute bottom-16 left-0 bg-white shadow-xl rounded-xl p-4 flex flex-col gap-4 min-w-[180px] z-50 border border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-200">
                  <button 
                    onClick={() => handleAttachmentOption("image")}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors text-gray-700"
                  >
                    <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                      <Image size={20} />
                    </div>
                    <span className="font-medium text-sm">Photos & Videos</span>
                  </button>
                  <button 
                    onClick={() => handleAttachmentOption("file")}
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors text-gray-700"
                  >
                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                      <FileText size={20} />
                    </div>
                    <span className="font-medium text-sm">Document</span>
                  </button>
                </div>
             )}
             
        
             {showAttachMenu && (
               <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)}></div>
             )}

             <img 
               src={LinkImg} 
               alt="" 
               className={`absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5 transition-all ${showAttachMenu ? "opacity-100 rotate-45" : "opacity-60 hover:opacity-100"}`}
               onClick={() => setShowAttachMenu(!showAttachMenu)}
             />
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileSelect} 
               className="hidden" 
             />
             <input
               value={newMsg}
               onChange={typingHandler}
               onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
               className="w-full bg-gray-100 border-none text-gray-900 pl-10 pr-5 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
               placeholder={isUploading ? "Uploading..." : "Type your message..."}
               disabled={isUploading}
             />
          </div>
        </div>

        <button
          onClick={sendMessage}
          disabled={!newMsg.trim() && !attachment || isUploading}
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