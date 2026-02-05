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

    const ENDPOINT = "http://localhost:5000";

    useEffect(() => {
        if (user) {
            const socketIo = io(ENDPOINT);
            setSocket(socketIo);

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
