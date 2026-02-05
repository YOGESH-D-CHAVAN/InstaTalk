import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/Chat/ChatBox";

export default function Home() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetchChats();
  }, [user]);

  useEffect(() => {
    if (searchTerm) fetchUsers();
  }, [searchTerm]);

  const fetchChats = async () => {
    try {
      const { data } = await API.get("/chat");
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get(`/user?search=${searchTerm}`);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const createChat = async (userId) => {
    try {
      const { data } = await API.post("/chat", { userId });
      setSelectedChat(data);
      setSearchTerm(""); // Clear search after selection
      fetchChats();
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };
  
  const openChat = (chat) => setSelectedChat(chat);

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden font-sans">
      
      {/* Sidebar: Responsive width (Full on mobile if no chat selected, 1/3 on desktop) */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 max-w-sm border-r border-gray-100 flex-col bg-white shadow-sm`}>
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-200">
                {user?.username?.[0]?.toUpperCase()}
             </div>
             <div>
                <h1 className="text-lg font-bold tracking-tight text-gray-800 leading-tight">{user?.username}</h1>
                <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                </span>
             </div>
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
          >
            Logout
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4">
           <div className="relative">
             <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full bg-gray-100 border-none text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto space-y-1 p-3">
          {searchTerm ? (
            users.map((u) => (
              <div
                key={u._id}
                onClick={() => createChat(u._id)}
                className="p-3 flex items-center gap-3 cursor-pointer rounded-2xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-800">{u.username}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
            ))
          ) : (
            chats.map((chat) => {
               const otherUser = chat.participants.find(p => p._id !== user._id) || chat.participants[0];
               const isSelected = selectedChat?._id === chat._id;
               
               return (
                <div
                  key={chat._id}
                  onClick={() => openChat(chat)}
                  className={`p-3 flex items-center gap-3 cursor-pointer rounded-2xl transition-all border ${
                    isSelected 
                      ? "bg-blue-50 border-blue-100 shadow-sm" 
                      : "hover:bg-gray-50 border-transparent"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-blue-600 border border-gray-100 shadow-sm overflow-hidden">
                     {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                     ) : (
                        <span>{otherUser?.username?.[0]?.toUpperCase()}</span>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {otherUser?.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">Click to message</p>
                  </div>
                </div>
               );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area: Hidden on mobile unless chat is selected */}
      <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 relative`}>
        {selectedChat ? (
          <>
            {/* Back button for mobile */}
            <button 
              onClick={() => setSelectedChat(null)}
              className="md:hidden absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md"
            >
              ←
            </button>
            <ChatBox chatId={selectedChat._id} user={user} key={selectedChat._id} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 px-6 text-center">
             <div className="w-20 h-20 bg-white shadow-xl shadow-gray-200/50 rounded-3xl flex items-center justify-center mb-6 rotate-12">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
             </div>
             <h2 className="text-xl font-bold text-gray-800 mb-2">Your Conversations</h2>
             <p className="text-sm max-w-xs">Select a contact from the left to start a new chat or continue a discussion.</p>
          </div>
        )}
      </div>
    </div>
  );
}