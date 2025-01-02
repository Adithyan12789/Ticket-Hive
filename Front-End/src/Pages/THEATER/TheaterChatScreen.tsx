import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetAdminsQuery,
  useGetChatRoomsQuery,
  useCreateChatRoomMutation,
  useMarkMessagesAsReadTheaterOwnerMutation,
} from "../../Slices/TheaterApiSlice";
import io from "socket.io-client";
import { format } from "date-fns";
import TheaterOwnerLayout from "../../Components/TheaterComponents/TheaterLayout";
import {
  FaCheck,
  FaCheckDouble,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
  FaDownload,
  FaFile,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
} from "react-icons/fa";
import "./TheaterChatScreen.css";
import { Admin, Message, MessageData } from "../../Types/ChatTypes";
import { backendUrl } from "../../url";

const socket = io("https://api.tickethive.fun");

const defaultProfileImage =
  "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

const IMAGES_DIR_PATH = backendUrl;

interface ChatRoom {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  unreadMessagesCount: number;
}

const ChatScreen: React.FC = () => {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null
  );
  const [isImageModalOpen, setImageModalOpen] = React.useState(false);
  const [modalImage, setModalImage] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setSelectedFileName] = useState("");
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { data: admins = [] } = useGetAdminsQuery({});
  const [createChatRoom] = useCreateChatRoomMutation();
  const {
    data: chatRooms = [],
    refetch: refetchChatRooms,
    error: chatRoomsError,
  } = useGetChatRoomsQuery({});
  const {
    data: messages = [],
    refetch: refetchMessages,
    error: messagesError,
  } = useGetMessagesQuery(selectedChatRoom?._id ?? "", {
    skip: !selectedChatRoom || !selectedChatRoom._id,
  });
  const [sendMessage] = useSendMessageMutation();
  const [markMessagesAsRead] = useMarkMessagesAsReadTheaterOwnerMutation();

  useEffect(() => {
    document.title = "Messages - Ticket Hive";
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit("joinRoom", { roomId: selectedChatRoom._id });
      markMessagesAsRead(selectedChatRoom._id);
      socket.emit("messageRead", { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
        markMessagesAsRead(selectedChatRoom._id).then(() => {
          socket.emit("messageRead", { roomId: selectedChatRoom._id });
        });
      } else {
        // Update unread count for other chat rooms
        refetchChatRooms();
      }
    };

    const handleUnreadMessage = (data: { roomId: string, count: number }) => {
      setSelectedChatRoom((prevRoom) => {
        if (prevRoom && prevRoom._id === data.roomId) {
          return { ...prevRoom, unreadMessagesCount: data.count };
        }
        return prevRoom;
      });
      refetchChatRooms();
    };

    socket.on("message", handleNewMessage);
    socket.on("unreadMessage", handleUnreadMessage);

    return () => {
      socket.off("message", handleNewMessage);
      socket.off("unreadMessage", handleUnreadMessage);
    };
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead, refetchChatRooms]);

  useEffect(() => {
    const handleMessageRead = async (data: { roomId: string }) => {
      if (data.roomId === selectedChatRoom?._id) {
        await refetchMessages();
      }
    };

    socket.on("messageRead", handleMessageRead);
    return () => {
      socket.off("messageRead");
    };
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    socket.on("messageUnReadAdmin", () => {
      refetchChatRooms();
    });
    return () => {
      socket.off("messageUnReadAdmin");
    };
  }, [refetchChatRooms]);

  useEffect(() => {
    refetchChatRooms();
  }, [refetchChatRooms]);

  useEffect(() => {
    socket.on("typingAdmin", () => {
      setIsTyping(true);
    });
    socket.on("stopTypingAdmin", () => {
      setIsTyping(false);
    });
    return () => {
      socket.off("typingAdmin");
      socket.off("stopTypingAdmin");
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

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedFile) {
      let chatRoomId = selectedChatRoom?._id;

      // If no chat room is selected, create a new one
      if (!chatRoomId) {
        if (!selectedAdmin) {
          console.error("No admin selected");
          return;
        }
        const newChatRoom = await createChatRoom({
          adminId: selectedAdmin._id,
        }).unwrap();
        chatRoomId = newChatRoom._id;
        setSelectedChatRoom(newChatRoom);
        refetchChatRooms();
      }

      // Ensure chatRoomId is not undefined
      if (!chatRoomId) {
        console.error("Failed to create or retrieve chat room");
        return;
      }

      const messageData: MessageData = {
        chatRoomId: chatRoomId,
        content: newMessage,
        senderType: "TheaterOwner",
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
      socket.emit("messageUnRead", { roomId: chatRoomId });
      socket.emit("stopTypingTheaterOwner", { roomId: chatRoomId });
    }
  };

  const handleAdminSelect = async (admin: Admin) => {
    setSelectedAdmin(admin);
    const chatRoom = chatRooms.find(
      (room: ChatRoom) => room.adminId._id === admin._id
    );
    if (chatRoom) {
      setSelectedChatRoom(chatRoom);
      if (chatRoom.unreadMessagesCount > 0) {
        markMessagesAsRead(chatRoom._id);
        socket.emit("messageRead", { roomId: chatRoom._id });
      }
    } else {
      setSelectedChatRoom(null);
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
    <TheaterOwnerLayout theaterOwnerName={""}>
      <div className="chat-container">
        <div className="chat-sidebar">
          <h2 className="user-sidebar-title">Admins</h2>
          {admins.map((admin: Admin) => {
            const chatRoom = chatRooms.find(
              (room: ChatRoom) => room.adminId._id === admin._id
            );
            return (
              <div
                key={admin._id}
                onClick={() => handleAdminSelect(admin)}
                className={`admin-item ${
                  selectedAdmin?._id === admin._id ? "active" : ""
                }`}
              >
                <img
                  src={admin.profileImage || defaultProfileImage}
                  alt={admin.name}
                  className="admin-image"
                />
                <div className="admin-info">
                  <span className="chat-name">{admin.name}</span>
                  <span className="chat-preview">
                    {chatRoom
                      ? chatRoom.unreadMessagesCount > 0
                        ? `${chatRoom.unreadMessagesCount} unread messages`
                        : "No new messages"
                      : "Start a new conversation"}
                  </span>
                </div>
                {chatRoom?.unreadMessagesCount > 0 && (
                  <div className="admin-unread-indicator">
                    <span className="admin-unread-count">
                      {chatRoom.unreadMessagesCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="chat-main">
          {selectedAdmin ? (
            <div className="chat-room">
              <div className="chat-header">
                <div className="chat-header-info">
                  <img
                    src={selectedAdmin.profileImage || defaultProfileImage}
                    alt={selectedAdmin.name}
                    className="chat-header-image"
                  />
                  <h4 className="chat-header-name">{selectedAdmin.name}</h4>
                </div>
              </div>
              <div className="chat-messages">
                {messages.map((msg: Message) => (
                  <div
                    key={msg._id}
                    className={`message-container ${
                      msg.senderType === "Admin" ? "admin" : "owner"
                    }`}
                  >
                    <div className="message">
                      {msg?.fileUrl ? (
                        <div className="file-message">
                          {msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={`${IMAGES_DIR_PATH}${msg?.fileUrl}`}
                              alt="file preview"
                              className="file-preview"
                              onClick={() =>
                                handleImageClick(
                                  `${IMAGES_DIR_PATH}${msg?.fileUrl}`
                                )
                              }
                            />
                          ) : (
                            <div className="document-preview">
                              {getFileIcon(msg.fileUrl)}
                              <span className="file-name">
                                {msg.content || msg.fileUrl.split("/").pop()}
                              </span>
                              <a
                                href={`${IMAGES_DIR_PATH}${msg.fileUrl}`}
                                download
                                className="file-download-btn"
                                title="Download"
                              >
                                <FaDownload />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="message-content">{msg?.content}</span>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        <small className="message-time">
                          {format(new Date(msg.createdAt), "hh:mm a")}
                        </small>
                        {msg.senderType === "TheaterOwner" && (
                          <div className="message-status">
                            {msg.read ? (
                              <FaCheckDouble className="status-read" />
                            ) : (
                              <FaCheck className="status-read" />
                            )}
                          </div>
                        )}
                      </div>
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
                  {isImageModalOpen && modalImage && (
                    <div
                      className="image-modal-overlay"
                      onClick={closeImageModal}
                    >
                      <div
                        className="image-modal-content"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="image-modal-close-btn"
                          onClick={closeImageModal}
                          title="Close"
                        >
                          &times;
                        </button>
                        <img
                          src={modalImage}
                          alt="Large Preview"
                          className="large-image"
                        />
                        <a
                          href={modalImage}
                          download
                          className="image-download-btn"
                          title="Download Image"
                        >
                          <FaDownload />
                        </a>
                      </div>
                    </div>
                  )}
                  <button onClick={toggleEmojiPicker} className="emoji-button">
                    <FaSmile />
                  </button>
                  {showEmojiPicker && (
                    <div className="emoji-picker">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                  <label htmlFor="image-upload" className="image-upload-label">
                    <FaPaperclip />
                  </label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleImageUpload}
                    className="image-upload-input"
                  />
                </div>
                <button onClick={handleSendMessage} className="send-button">
                  <FaPaperPlane className="send-icon" />
                </button>
              </div>
            </div>
          ) : (
            <div className="no-chat-selected">
              <p>Select an admin from the sidebar to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </TheaterOwnerLayout>
  );
};

export default ChatScreen;

