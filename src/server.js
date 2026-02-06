import { Server } from "socket.io";
import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:5173"] : ["http://localhost:5173", "https://instatalk-tyq7.onrender.com"],
    credentials: true,
  },
});

const onlineUsers = new Map(); 

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("setup", (userData) => {
    if (userData?._id) {
      socket.join(userData._id);
      onlineUsers.set(userData._id, socket.id);
      console.log(`User ${userData._id} connected`);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  socket.on("send_message", ({ chatId, message }) => {
    socket.to(chatId).emit("receive_message", message);
  });

  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing", { chatId, userId });
  });

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("stop_typing", { chatId, userId });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
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
});
