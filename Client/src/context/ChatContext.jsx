/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { io } from "socket.io-client";
import API_URL from "../config";

const ChatContext = createContext();

// Chat provider that keeps the active socket connection and message notification state shared app-wide.
export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    setActiveChat(null);
    setNotifications([]);
  }, [user]);

  useEffect(() => {
    if (user) {
      const newSocket = io(API_URL);

      setSocket(newSocket);

      newSocket.on("receiveMessage", (data) => {
        if (activeChatRef.current?._id !== data.chatId) {
          setNotifications((prev) => [...prev, data]);
        }
      });

      return () => newSocket.close();
    }
  }, [user]);

  // Join a specific chat room so the socket can receive updates for that conversation.
  const joinChat = (chatId) => {
    if (socket) {
      socket.emit("joinChat", chatId);
    }
  };

  // Send a message to a room and return the payload so the UI can update optimistically.
  const sendMessage = (
    chatId,
    text,
    messageId = null,
    createdAt = new Date(),
    image = null,
  ) => {
    if (socket && user) {
      const messageData = {
        chatId,
        sender: user._id,
        text,
        image,
        createdAt,
        _id: messageId,
      };

      socket.emit("sendMessage", messageData);

      return messageData;
    }
    return null;
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        activeChat,
        setActiveChat,
        joinChat,
        sendMessage,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
