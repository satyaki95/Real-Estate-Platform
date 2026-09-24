/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import { chatMessagesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import Navbar from "../../components/common/Navbar";
import { HiOutlineChatAlt2, HiOutlineTrash } from "react-icons/hi";

const ChatMessages = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const { socket, activeChat, setActiveChat, joinChat, sendMessage } =
    useChat();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef();

  // to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // to fetch the conversation (btw buyer and seller)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedConversations = res.data;
        setConversations(fetchedConversations);

        if (location.state?.chat) {
          const existingChat = fetchedConversations.find(
            (c) => c._id === location.state.chat._id,
          );

          if (existingChat) {
            setActiveChat(existingChat);
          } else {
            setActiveChat(location.state.chat);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user, location.state]);

  // to fetch messages
  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/chat/${activeChat._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMessages(res.data.messages || []);
          joinChat(activeChat._id);
          scrollToBottom();
        } catch (err) {
          console.error("Error fetching messages: ", err);
        }
      };
      fetchMessages();
    }
  }, [activeChat]);

  // updating the chat when new message is received
  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (data) => {
        if (activeChat && data.chatId === activeChat._id) {
          setMessages((prev) => [...prev, data]);
        }
      });
    }
    return () => socket?.off("receiveMessage");
  }, [socket, activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChat) {
      const timer = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timer);
    }
  }, [activeChat]);

  // to send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeChat) return;

    const textToSend = newMessage;
    setNewMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/chat/send`,
        {
          chatId: activeChat._id,
          text: textToSend,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.newMessage) {
        sendMessage(
          activeChat._id,
          textToSend,
          res.data.newMessage._id,
          res.data.newMessage.createdAt,
        );
      }
      scrollToBottom();
    } catch (err) {
      console.error("Error sending messages: ", err);
    }
  };

  // to delete a chat
  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure want to delete this conversation?"))
      return;

    try {
      await axios.delete(`${API_URL}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c._id !== chatId));

      if (activeChat?._id === chatId) setActiveChat(null);
    } catch (err) {
      console.error("Error deleting chat: ", err);
    }
  };

  // to delete a massage from chat
  const handleDeleteMessage = async (chatId, messageId) => {
    if (!window.confirm("Delete this message")) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/chat/${chatId}/message/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(res.data.chat.messages);
    } catch (err) {
      console.error("Error deleting message: ", err);
    }
  };

  // to get the partner
  const getChatPartner = (chat) => {
    return user._id === chat.buyer._id ? chat.seller : chat.buyer;
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div
      className={`${s.chatContainer} ${user?.role === "seller" ? s.chatContainerSeller : s.chatContainerNonSeller}`}
    >
      {user?.role !== "seller" && <Navbar />}

      <div className={s.chatWrapper}>
        <div className={`${s.sidebar} ${activeChat ? s.sidebarHidden : ""}`}>
          <div className={s.sidebarHeader}>
            <h2 className={s.sidebarTitle}>Message</h2>
          </div>

          <div className={s.sidebarContent}>
            {conversations.length === 0 ? (
              <div className={s.emptyConversations}>
                <HiOutlineChatAlt2 className={s.emptyIcon} />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat._id}
                  className={`${s.conversationItem} ${activeChat?._id === chat._id ? s.conversationItemActive : ""}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className={s.avatar}>
                    {getChatPartner(chat)?.profilePic ? (
                      <img
                        src={getChatPartner(chat).profilePic}
                        className={s.avatarImg}
                        alt=""
                      />
                    ) : (
                      getChatPartner(chat)?.name?.charAt(0)
                    )}
                  </div>

                  <div className={s.conversationInfo}>
                    <div className={s.conversationName}>
                      {getChatPartner(chat)?.name}
                    </div>
                    <div className={s.conversationPreview}>
                      {chat.messages.at(-1)?.text || "Started a conversation"}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    className={s.deleteChatButton}
                    title="Delete Conversation"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
