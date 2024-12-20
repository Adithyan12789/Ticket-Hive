import React, { useState, useEffect, useRef } from "react";
import {
  useGetAdminMessagesQuery,
  useSendAdminMessageMutation,
  useGetAdminChatRoomsQuery,
  useMarkAdminMessagesAsReadMutation,
} from "../../Slices/AdminApiSlice";
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import { format } from "date-fns";
import AdminLayout from "../../Components/AdminComponents/AdminLayout";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import {
  FaCheck,
  FaCheckDouble,
  FaDownload,
  FaFile,
  FaFileAlt,
  FaFileExcel,
  FaFilePdf,
  FaFileWord,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
} from "react-icons/fa";
import { Message, MessageData } from "../../Types/ChatTypes";
import "./AdminChatScreen.css";

const socket = io("http://localhost:5000");

const defaultProfileImage =
  "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

const IMAGES_DIR_PATH = "http://localhost:5000/";

export interface ChatRoom {
  _id: string;
  theaterOwnerId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  unreadMessagesCount: number;
}

interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  selectedChatRoom: ChatRoom | null;
  onChatRoomSelect: (chatRoom: ChatRoom) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chatRooms, selectedChatRoom, onChatRoomSelect }) => {
  return (
    <div className="admin-chat-sidebar">
      <h2 className="admin-sidebar-title">Theater Owners</h2>
      <ul className="admin-chat-list">
        {chatRooms.map((room) => (
          <li
            key={room._id}
            className={`admin-chat-item ${selectedChatRoom?._id === room._id ? 'active' : ''}`}
            onClick={() => onChatRoomSelect(room)}
          >
            <div className="admin-chat-item-content">
              <img
                src={room.theaterOwnerId.profileImage || defaultProfileImage}
                alt={room.theaterOwnerId.name}
                className="admin-chat-avatar"
              />
              <div className="admin-chat-info">
                <span className="admin-chat-name">{room.theaterOwnerId.name}</span>
                <span className="admin-chat-preview">
                  {room.unreadMessagesCount > 0
                    ? `${room.unreadMessagesCount} unread message${room.unreadMessagesCount > 1 ? 's' : ''}`
                    : 'No unread messages'}
                </span>
              </div>
            </div>
            {room.unreadMessagesCount > 0 && (
              <div className="admin-unread-indicator">
                <span className="admin-unread-count">{room.unreadMessagesCount}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};


const ChatScreen: React.FC = () => {
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setSelectedFileName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const adminId = adminInfo?._id;
  const {
    data: chatRooms = [],
    refetch: refetchAdminChatRooms,
    error: chatRoomsError,
  } = useGetAdminChatRoomsQuery(adminId);
  const {
    data: messages = [],
    refetch: refetchMessages,
    error: messagesError,
  } = useGetAdminMessagesQuery(selectedChatRoom?._id ?? "", {
    skip: !selectedChatRoom || !selectedChatRoom._id,
  });
  const [sendMessage] = useSendAdminMessageMutation();
  const [markMessagesAsRead] = useMarkAdminMessagesAsReadMutation();

  useEffect(() => {
    document.title = "Messages - Ticket Hive Admin";
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit("joinRoom", { roomId: selectedChatRoom._id });
      markMessagesAsRead(selectedChatRoom._id);
      socket.emit("messageRead", { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    socket.on("message", (message: Message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
      }
    });
    return () => {
      socket.off("message");
    };
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    const handleMessageRead = async (data: { roomId: string }) => {
      if (data.roomId === selectedChatRoom?._id) {
        await refetchAdminChatRooms();
      }
    };

    socket.on("messageRead", handleMessageRead);
    return () => {
      socket.off("messageRead");
    };
  }, [selectedChatRoom, refetchAdminChatRooms]);

  useEffect(() => {
    socket.on("messageUnReadTheaterOwner", () => {
      refetchAdminChatRooms();
    });
    return () => {
      socket.off("messageUnReadTheaterOwner");
    };
  }, [refetchAdminChatRooms]);

  useEffect(() => {
    refetchAdminChatRooms();
  }, [refetchAdminChatRooms]);

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
    if (chatRoomsError) {
      console.error("Failed to fetch chat rooms:", chatRoomsError);
    }
    if (messagesError) {
      console.error("Failed to fetch messages:", messagesError);
    }
  }, [chatRoomsError, messagesError]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
        markMessagesAsRead(selectedChatRoom?._id).then(() => {
          socket.emit("messageRead", { roomId: selectedChatRoom?._id });
        });
      }
    };

    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

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
      socket.emit("messageUnReadAdmin", { roomId: selectedChatRoom?._id });
      socket.emit("stopTypingAdmin", { roomId: selectedChatRoom?._id });
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

  const handleImageClick = (imageUrl: string) => {
    setModalImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setModalImage(null);
  };

  const renderFilePreview = () => {
    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      if (fileType === "image") {
        const imageUrl = URL.createObjectURL(selectedFile);
        return (
          <div className="modern-file-preview">
            <img
              src={imageUrl}
              alt="Selected Preview"
              className="modern-preview-image"
            />
          </div>
        );
      } else {
        return (
          <div className="modern-file-preview">
            <div className="modern-document-preview">
              {getFileIcon(selectedFile.name)}
              <span className="modern-file-name">{selectedFile.name}</span>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const getFileIcon = (fileUrl: string) => {
    if (fileUrl.endsWith(".pdf")) return <FaFilePdf />;
    if (fileUrl.endsWith(".doc") || fileUrl.endsWith(".docx"))
      return <FaFileWord />;
    if (fileUrl.endsWith(".xls") || fileUrl.endsWith(".xlsx"))
      return <FaFileExcel />;
    if (fileUrl.endsWith(".txt")) return <FaFileAlt />;
    return <FaFile />;
  };

  return (
    <AdminLayout adminName={""}>
      <div className="admin-chat-container">
        <ChatSidebar
          chatRooms={chatRooms}
          selectedChatRoom={selectedChatRoom}
          onChatRoomSelect={setSelectedChatRoom}
        />
        <div className="admin-chat-main">
          {!selectedChatRoom ? (
            <div className="select-chat-prompt">
              <h2>Select a theater owner to start messaging</h2>
            </div>
          ) : (
            <div className="admin-chat-room">
              <div className="admin-chat-header">
                <div className="admin-chat-header-info">
                  <img
                    src={selectedChatRoom.theaterOwnerId.profileImage || defaultProfileImage}
                    alt={selectedChatRoom.theaterOwnerId.name}
                    className="admin-chat-header-image"
                  />
                  <h4 className="admin-chat-header-name">{selectedChatRoom.theaterOwnerId.name}</h4>
                </div>
              </div>
              <div className="admin-chat-messages">
                {messages.map((msg: Message) => (
                  <div
                    key={msg._id}
                    className={`admin-message-container ${
                      msg.senderType === "TheaterOwner" ? "owner" : "admin"
                    }`}
                  >
                    <div className="admin-message">
                      {msg?.fileUrl ? (
                        <div className="admin-file-message">
                          {msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={`${IMAGES_DIR_PATH}${msg?.fileUrl}`}
                              alt="file preview"
                              className="admin-file-preview"
                              onClick={() =>
                                handleImageClick(
                                  `${IMAGES_DIR_PATH}${msg?.fileUrl}`
                                )
                              }
                            />
                          ) : (
                            <div className="admin-document-preview">
                              {getFileIcon(msg.fileUrl)}
                              <span className="admin-file-name">
                                {msg.content || msg.fileUrl.split("/").pop()}
                              </span>
                              <a
                                href={`${IMAGES_DIR_PATH}${msg.fileUrl}`}
                                download
                                className="admin-file-download-btn"
                                title="Download"
                              >
                                <FaDownload />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="admin-message-content">{msg?.content}</span>
                      )}

                      <div style={{display: "flex",justifyContent: "space-between", gap: "10px", marginTop: "10px"}}>
                      <small className="admin-message-time">
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
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="admin-chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder="Type a message..."
                  className="admin-input-box"
                />
                <div className="admin-input-controls">
                  {renderFilePreview()}

                  {/* Image Modal */}
                  {isImageModalOpen && modalImage && (
                    <div
                      className="admin-image-modal-overlay"
                      onClick={closeImageModal}
                    >
                      <div
                        className="admin-image-modal-content"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="admin-image-modal-close-btn"
                          onClick={closeImageModal}
                          title="Close"
                        >
                          &times;
                        </button>
                        <img
                          src={modalImage}
                          alt="Large Preview"
                          className="admin-large-image"
                        />
                        <a
                          href={modalImage}
                          download
                          className="admin-image-download-btn"
                          title="Download Image"
                        >
                          <FaDownload />
                        </a>
                      </div>
                    </div>
                  )}

                  <button onClick={toggleEmojiPicker} className="admin-emoji-button">
                    <FaSmile />
                  </button>
                  {showEmojiPicker && (
                    <div className="admin-emoji-picker">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                  <label htmlFor="image-upload" className="admin-image-upload-label">
                    <FaPaperclip />
                  </label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleImageUpload}
                    className="admin-image-upload-input"
                  />
                </div>
                <button onClick={handleSendMessage} className="admin-send-button">
                  <FaPaperPlane className="admin-send-icon" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatScreen;

