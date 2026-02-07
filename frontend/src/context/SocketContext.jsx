import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useAuth();

    const ENDPOINT = "https://instatalk-tyq7.onrender.com";

    useEffect(() => {
        if (user) {
            const socketIo = io(ENDPOINT, {
                reconnection: true,
                timeout: 10000,
            });
            setSocket(socketIo);

            socketIo.on("connect", () => {
                console.log("Connected to socket:", socketIo.id);
            });

            socketIo.on("connect_error", (err) => {
                console.error("Socket Connection Error:", err.message);
            });

            socketIo.emit("setup", user);

            socketIo.on("online_users", (users) => {
                setOnlineUsers(users);
            });

            return () => {
                socketIo.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
