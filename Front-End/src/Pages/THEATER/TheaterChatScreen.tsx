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
import io, { Socket } from "socket.io-client";
import { format } from "date-fns";
import TheaterOwnerLayout from "../../Components/TheaterComponents/TheaterLayout";
import {
  FaArrowLeft,
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
import { Admin, ChatRoom, Message, MessageData } from "../../Types/ChatTypes";

const socket: Socket = io("http://localhost:5000");

const defaultProfileImage =
  "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

const IMAGES_DIR_PATH = "http://localhost:5000/";

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
    socket.on("message", (message) => {
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
  });

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
      socket.emit("messageUnRead", { roomId: selectedChatRoom?._id });
      socket.emit("stopTypingTheaterOwner", { roomId: selectedChatRoom?._id });
    }
  };

  const handleChatRoomSelect = async (adminId: string) => {
    let chatRoom = chatRooms.find(
      (room: { adminId: { _id: string } }) => room.adminId._id === adminId
    );
    if (!chatRoom) {
      chatRoom = await createChatRoom({ adminId }).unwrap();
      refetchChatRooms();
    }
    setSelectedChatRoom(chatRoom);
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
      <div className="container">
        {!selectedAdmin && (
          <div className="admin-selection">
            <h2 className="admin-selection-title">Select an Admin</h2>
            <div className="admin-list">
              {admins.map((admin: Admin) => (
                <div
                  key={admin._id}
                  onClick={() => {
                    setSelectedAdmin(admin);
                    handleChatRoomSelect(admin._id);
                  }}
                  className="admin-card"
                >
                  <img
                    src={admin.profileImage || defaultProfileImage}
                    alt={admin.name}
                    className="admin-image"
                  />
                  <h4 className="admin-name">{admin.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedAdmin && (
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
              <button
                onClick={() => setSelectedAdmin(null)}
                className="back-button"
              >
                <FaArrowLeft className="back-icon" />
                Back
              </button>
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
                          // If the file is an image, display the image
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
                          // If the file is a document, display its icon, name, and a download button
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
                      // Regular text message
                      <span className="message-content">{msg?.content}</span>
                    )}

                    <small className="message-time">
                      {format(new Date(msg.createdAt), "hh:mm a")}
                    </small>
                    {msg.senderType === "TheaterOwner" && (
                      <div className="message-status">
                        {msg.read ? (
                          <FaCheckDouble className="status-read" />
                        ) : (
                          <FaCheck className="status-unread" />
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

                {/* Image Modal */}
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
        )}
      </div>
    </TheaterOwnerLayout>
  );
};

export default ChatScreen;
