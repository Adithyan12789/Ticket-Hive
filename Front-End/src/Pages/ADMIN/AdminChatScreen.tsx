import React, { useState, useEffect, useRef } from "react";
import {
  useGetAdminMessagesQuery,
  useSendAdminMessageMutation,
  useGetAdminChatRoomsQuery,
  useMarkAdminMessagesAsReadMutation,
} from "../../Slices/AdminApiSlice";
import "./AdminChatScreen.css";
import "@fortawesome/fontawesome-free/css/all.css";
import io, { Socket } from "socket.io-client";
import { format } from "date-fns";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import {
  FaArrowLeft,
  FaCheck,
  FaCheckDouble,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
} from "react-icons/fa";
import { ChatRoom, Message, MessageData } from "../../Types/ChatTypes";
import EmojiPicker from "emoji-picker-react";

const socket: Socket = io("http://localhost:5000");

const defaultProfileImage =
  "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

const IMAGES_DIR_PATH = "http://localhost:5000/";

const ChatScreen: React.FC = () => {
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setSelectedFileName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const adminId = adminInfo?._id;
  const { data: chatRooms = [], refetch: refetchAdminChatRooms } =
    useGetAdminChatRoomsQuery(adminId);
  const { data: messages = [], refetch: refetchMessages } =
    useGetAdminMessagesQuery(selectedChatRoom?._id ?? "", {
      skip: !selectedChatRoom || !selectedChatRoom._id,
    });
  const [sendMessage] = useSendAdminMessageMutation();
  const [markMessagesAsRead] = useMarkAdminMessagesAsReadMutation();

  useEffect(() => {
    document.title = "Messages";
    socket.on("message", (message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
        markMessagesAsRead(selectedChatRoom?._id);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    socket.on("typingTheaterOwner", () => {
      setIsTyping(true);
    });
    socket.on("stopTypingTheaterOwner", () => {
      setIsTyping(false);
    });
    return () => {
      socket.off("typingTheaterOwner");
      socket.off("stopTypingTheaterOwner");
    };
  }, []);

  useEffect(() => {
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit("joinRoom", { roomId: selectedChatRoom._id });

      markMessagesAsRead(selectedChatRoom._id);

      socket.emit("messageRead", { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    socket.on("messageRead", (data) => {
      if (data.roomId === selectedChatRoom?._id) {
        refetchAdminChatRooms();
      }
    });
    return () => {
      socket.off("messageRead");
    };
  }, [selectedChatRoom, refetchAdminChatRooms]);

  useEffect(() => {
    socket.on("messageUnRead", () => {
      refetchAdminChatRooms();
    });
    return () => {
      socket.off("messageUnRead");
    };
  }, [refetchAdminChatRooms]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedFile) {
      const messageData: MessageData = {
        chatRoomId: selectedChatRoom?._id || "",
        content: newMessage,
        senderType: "Admin",
      };
  
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        messageData.content = selectedFile.name;
        messageData.file = selectedFile;
      }
  
      await sendMessage(messageData);
      setNewMessage("");
      setSelectedFile(null);
      setSelectedFileName(""); 
      refetchMessages();
      socket.emit("message", messageData);
      socket.emit("messageUnRead", { roomId: selectedChatRoom?._id });
      socket.emit("stopTypingUser", { roomId: selectedChatRoom?._id });
    }
  };

  let typingTimeout: NodeJS.Timeout | undefined;

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingAdmin", { roomId: selectedChatRoom?._id });
    }
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTypingAdmin", { roomId: selectedChatRoom?._id });
    }, 3000);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const renderFilePreview = () => {
    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      if (fileType === "image") {
        return (
          <div className="file-preview">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Selected Preview"
              className="preview-image"
            />
          </div>
        );
      } else if (
        fileType === "application" &&
        selectedFile.type === "application/pdf"
      ) {
        return (
          <div className="file-preview">
            <img
              src="pdf-icon.png"
              alt="PDF Preview"
              className="preview-image"
            />
          </div>
        );
      } else {
        return (
          <div className="file-preview">
            <span className="preview-file-name">{selectedFile.name}</span>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <AdminLayout adminName={""}>
      <div className="chat-container">
        {!selectedChatRoom && (
          <div className="chat-room-selection">
            <h2>Select a Chat Room</h2>
            <div className="chat-room-list">
              {chatRooms.map((chatRoom: ChatRoom) => (
                <div
                  key={chatRoom._id}
                  onClick={() => setSelectedChatRoom(chatRoom)}
                  className="chat-room-item"
                >
                  <img
                    src={defaultProfileImage}
                    alt={chatRoom.theaterOwnerId.name}
                  />
                  <h4>{chatRoom.theaterOwnerId.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedChatRoom && (
          <div className="chat-room">
            <div className="chat-header">
              <div className="chat-header-info">
                <img
                  src={defaultProfileImage}
                  alt={selectedChatRoom.theaterOwnerId.name}
                  className="chat-header-image"
                />
                <h4 className="chat-header-name">
                  {selectedChatRoom.theaterOwnerId.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedChatRoom(null)}
                className="back-button"
              >
                <FaArrowLeft className="back-icon" />
                Back
              </button>
            </div>
            <div className="admin-chat-messages">
              {messages.map((msg: Message) => (
                <div
                  key={msg._id}
                  className={`admin-message-container ${
                    msg.senderType === "TheaterOwner" ? "owner" : "admin"
                  }`}
                >
                  <div className="message">
                    {msg?.fileUrl ? (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {/* Check if the file is a document or text file */}
                        {msg.fileUrl.endsWith(".pdf") ||
                        msg.fileUrl.endsWith(".doc") ||
                        msg.fileUrl.endsWith(".docx") ||
                        msg.fileUrl.endsWith(".xls") ||
                        msg.fileUrl.endsWith(".xlsx") ||
                        msg.fileUrl.endsWith(".txt") ? (
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <div>{msg.content}</div>
                            <a
                              href={`http://localhost:5000${
                                msg?.fileUrl?.startsWith("/")
                                  ? msg?.fileUrl
                                  : `/${msg?.fileUrl}`
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              style={{ marginTop: "5px" }}
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          // If it's an image, display the image
                          <img
                            src={`${IMAGES_DIR_PATH}${msg?.fileUrl}`}
                            alt="file preview"
                            style={{ maxWidth: "200px" }}
                          />
                        )}
                      </div>
                    ) : (
                      msg?.content
                    )}

                    <small className="message-time">
                      {format(new Date(msg.createdAt), "hh:mm a")}
                    </small>
                    {msg.senderType === "Admin" && (
                      <div className="admin-message-status">
                        {msg.read ? (
                          <FaCheckDouble className="admin-status-read" />
                        ) : (
                          <FaCheck className="admin-status-unread" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Type a message..."
                className="input-box"
              />
              <div className="input-controls">
                {renderFilePreview()}

                {/* Emoji Picker */}
                <button onClick={toggleEmojiPicker} className="emoji-button">
                  <FaSmile />
                </button>
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}

                {/* Image Upload */}
                <label htmlFor="image-upload" className="image-upload-label">
                  <FaPaperclip />
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-upload-input"
                />
              </div>
              <button onClick={handleSendMessage} className="send-button">
                <FaPaperPlane className="send-icon" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ChatScreen;
