import "dotenv/config";
import { Server } from "socket.io";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://instatalk-tyq7.onrender.com",
  "https://instachat-ygh.netlify.app",
  "https://instatalk.netlify.app",
];

if (process.env.FRONTEND_URL) {
  // Support comma-separated URLs in env var
  const envOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...envOrigins);
}

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

const onlineUsers = new Map(); 

io.on("connection", (socket) => {
  // console.log("🟢 User connected:", socket.id);

  socket.on("setup", (userData) => {
    if (userData?._id) {
      const userId = String(userData._id);
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`User connected and joined room: ${userId} (type: ${typeof userId})`);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    // console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  socket.on("send_message", ({ chatId, message }) => {
    socket.to(chatId).emit("receive_message", message);
  });

  socket.on("typing", ({ chatId, userId }) => {
    // console.log(`User ${userId} typing in ${chatId}`);
    socket.to(chatId).emit("typing", { chatId, userId });
  });

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("stop_typing", { chatId, userId });
  });

  // WebRTC Signaling
  socket.on("call_user", ({ userToCall, signalData, from, name, avatar, callType }) => {
    console.log("Call initiated:", { from, to: userToCall, name, callType });
    io.to(userToCall).emit("call_user", { signal: signalData, from, name, avatar, callType });
  });

  socket.on("answer_call", ({ to, signal }) => {
    console.log("Call answered, sending signal to:", to);
    io.to(to).emit("call_accepted", signal);
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", candidate);
  });

  socket.on("end_call", ({ to }) => {
    io.to(to).emit("call_ended"); 
  });

  // End of WebRTC Signaling

  socket.on("disconnect", () => {
    // console.log("🔴 User disconnected:", socket.id);
    // Find key (userId) by value (socket.id)
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
  console.log(`🔧 CORS Allowed Origins:`, allowedOrigins);
});
