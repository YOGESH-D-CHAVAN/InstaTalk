import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ChatBox from "../components/Chat/ChatBox";
import ProfileModal from "../components/ProfileModal";
import CallInterface from "../components/Chat/CallInterface";
import { Phone, Video, MoreVertical, UserPlus, Check, X, MessageSquare, Users } from "lucide-react";
import connectionService from "../services/connectionService";

import useWebRTC from "../hooks/useWebRTC";

export default function Home() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chats, setChats] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "requests"

  /* Restore full destructuring */
  const {
    localStream,
    remoteStream,
    callStatus,
    callType,
    startCall: webRTCStartCall,
    answerCall,
    endCall,
    rejectCall,
    localVideoRef,
    remoteVideoRef,
    remoteUser: webRTCRemoteUser,
    incomingCallData,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo
  } = useWebRTC(user);

  useEffect(() => {
    fetchChats();
    fetchPendingRequests();
  }, [user]);

  useEffect(() => {
    if (searchTerm) fetchUsers();
  }, [searchTerm]);

  useEffect(() => {
    if (!socket) return;

    socket.on("connection_request_received", () => {
      fetchPendingRequests();
    });

    socket.on("connection_request_accepted", () => {
      fetchChats();
      fetchPendingRequests();
      if (searchTerm) fetchUsers();
    });

    return () => {
      socket.off("connection_request_received");
      socket.off("connection_request_accepted");
    };
  }, [socket, searchTerm]);

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

  const fetchPendingRequests = async () => {
    try {
      const data = await connectionService.getPendingRequests();
      setPendingRequests(data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const sendConnectionRequest = async (userId) => {
    try {
      await connectionService.sendRequest(userId);
      socket.emit("send_connection_request", { to: userId });
      fetchUsers(); // Refresh status in search
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send request");
    }
  };

  const acceptConnectionRequest = async (requestId, senderId) => {
    try {
      await connectionService.acceptRequest(requestId);
      socket.emit("accept_connection_request", { to: senderId });
      fetchPendingRequests();
      fetchChats();
      if (searchTerm) fetchUsers();
    } catch (error) {
      alert("Failed to accept request");
    }
  };

  const rejectConnectionRequest = async (requestId) => {
    try {
      await connectionService.rejectRequest(requestId);
      fetchPendingRequests();
      if (searchTerm) fetchUsers();
    } catch (error) {
      alert("Failed to reject request");
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

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear this chat? This will delete all messages.")) {
      try {
        await API.delete(`/message/clear/${selectedChat._id}`);
        // Emit socket event for real-time update
        socket.emit("clear_chat", selectedChat._id);
        // Force ChatBox to refresh by updating selectedChat with a timestamp
        setSelectedChat({ ...selectedChat, lastCleared: Date.now() }); 
        setShowMenu(false);

      } catch (error) {
        console.error("Error clearing chat:", error);
      }
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm("Are you sure you want to delete this chat entire chat?")) {
      try {
        await API.delete(`/chat/${selectedChat._id}`);
        setSelectedChat(null);
        fetchChats();
        setShowMenu(false);
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  const openChat = (chat) => setSelectedChat(chat);

  const startCall = (type) => {
    const currentUserId = user?._id || user?.id;
    const otherUser = selectedChat?.participants.find(p => String(p._id) !== String(currentUserId));
    if (otherUser) {
      webRTCStartCall(otherUser, type);
    }
  };

  // Determine remote user for display
  let displayRemoteUser = webRTCRemoteUser;
  if (!displayRemoteUser && incomingCallData?.from) {
    // Try to find in chats or users
    const fromId = incomingCallData.from;
    const foundInChats = chats.find(c => c.participants.some(p => p._id === fromId));
    if (foundInChats) {
      displayRemoteUser = foundInChats.participants.find(p => p._id === fromId);
    } else {
      // As a fallback, we display "Unknown User" or try to find in 'users' state if loaded
      displayRemoteUser = { username: "Incoming Call...", _id: fromId };
    }
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden font-sans">
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}

      {callStatus && (
        <CallInterface
          callType={callType}
          callStatus={callStatus}
          remoteUser={displayRemoteUser || { username: "User" }}
          onEnd={endCall}
          onAccept={answerCall}
          onReject={rejectCall}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
        />
      )}


      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 max-w-sm border-r border-gray-100 flex-col bg-white shadow-sm`}>


        <div className="p-4 md:p-6 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowProfile(true)}>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-200 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-800 leading-tight">{user?.username}</h1>
              <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowProfile(true)}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-wider"
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider px-2"
            >
              Logout
            </button>
          </div>
        </div>


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

        <div className="flex-1 overflow-y-auto space-y-1 p-3">
          {searchTerm ? (
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Search Results</p>
              {users.map((u) => {
                const isOnline = onlineUsers.some(id => String(id) === String(u._id));
                return (
                  <div
                    key={u._id}
                    className="p-3 flex items-center justify-between gap-3 rounded-2xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                          {u.username[0].toUpperCase()}
                        </div>
                        {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm text-gray-800 truncate">{u.username}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {u.connectionStatus === "accepted" ? (
                        <button
                          onClick={() => createChat(u._id)}
                          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                          title="Message"
                        >
                          <MessageSquare size={18} />
                        </button>
                      ) : u.connectionStatus === "pending_sent" ? (
                        <span className="text-xs font-medium text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                          Pending
                        </span>
                      ) : u.connectionStatus === "pending_received" ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => acceptConnectionRequest(u.requestId, u._id)}
                            className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                            title="Accept"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => rejectConnectionRequest(u.requestId)}
                            className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendConnectionRequest(u._id)}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                        >
                          <UserPlus size={16} />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {users.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Tabs for Sidebar */}
              <div className="flex p-1 bg-gray-50 rounded-xl mb-4 mx-1">
                <button
                  onClick={() => setActiveTab("chats")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "chats" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MessageSquare size={14} />
                  Chats
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all relative ${
                    activeTab === "requests" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Users size={14} />
                  Requests
                  {pendingRequests.length > 0 && (
                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>

              {activeTab === "chats" ? (
                chats.length > 0 ? (
                  chats.map((chat) => {
                    const currentUserId = user?._id || user?.id;
                    const otherUser = chat.participants.find(p => String(p._id) !== String(currentUserId)) || chat.participants[0];
                    const isSelected = selectedChat?._id === chat._id;
                    const isOnline = onlineUsers.some(id => String(id) === String(otherUser?._id));

                    return (
                      <div
                        key={chat._id}
                        onClick={() => openChat(chat)}
                        className={`p-3 flex items-center gap-3 cursor-pointer rounded-2xl transition-all border ${isSelected
                          ? "bg-blue-50 border-blue-100 shadow-sm"
                          : "hover:bg-gray-50 border-transparent"
                          }`}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-blue-600 border border-gray-100 shadow-sm overflow-hidden">
                            {otherUser?.avatar ? (
                              <img src={otherUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{otherUser?.username?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                              {otherUser?.username}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{isOnline ? 'Online' : 'Click to message'}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
                    <Users className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No active chats</p>
                    <p className="text-xs mt-1">Search for users and connect to start chatting.</p>
                  </div>
                )
              ) : (
                <div className="space-y-1">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="p-3 flex items-center justify-between gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm">
                            {req.sender.avatar ? (
                              <img src={req.sender.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              req.sender.username[0].toUpperCase()
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-sm text-gray-800 truncate">{req.sender.username}</p>
                            <p className="text-[10px] text-gray-400">wants to connect</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => acceptConnectionRequest(req._id, req.sender._id)}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => rejectConnectionRequest(req._id)}
                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
                      <UserPlus className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No pending requests</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area: Hidden on mobile unless chat is selected */}
      <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 relative`}>
        {selectedChat ? (
          (() => {
            const currentUserId = user?._id || user?.id;
            const otherUser = selectedChat.participants.find(p => String(p._id) !== String(currentUserId)) || selectedChat.participants[0];
            const isOnline = onlineUsers.some(id => String(id) === String(otherUser?._id));

            return (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>

                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 border border-blue-200 overflow-hidden">
                        {otherUser?.avatar ? (
                          <img src={otherUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{otherUser?.username?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                    </div>

                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-900 leading-tight text-sm md:text-base">{otherUser?.username}</h3>
                      <p className="text-xs text-gray-500 font-medium">{isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startCall("audio")}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Voice Call"
                    >
                      <Phone size={20} />
                    </button>
                    <button
                      onClick={() => startCall("video")}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Video Call"
                    >
                      <Video size={20} />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className={`p-2 rounded-full transition-colors ${showMenu ? "bg-gray-100 text-gray-800" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {showMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={handleClearChat}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                              Clear Chat
                            </button>
                            <button
                              onClick={handleDeleteChat}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              Delete Chat
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  <ChatBox 
                    chatId={selectedChat._id} 
                    user={user} 
                    key={`${selectedChat._id}-${selectedChat.lastCleared || 0}`} 
                  />
                </div>

              </>
            );
          })()
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