"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MessageSchema = new mongoose_1.Schema({
    chatRoomId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ChatRoom",
        required: true,
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        refPath: "senderType", // Dynamic ref based on senderType
    },
    senderType: {
        type: String,
        required: true,
        enum: ["Admin", "TheaterOwner"], // Restrict to User or Hotel
    },
    content: {
        type: String,
        required: false, // Optional, because fileUrl or fileName might be present
    },
    fileUrl: {
        type: String,
        required: false, // Optional
    },
    fileName: {
        type: String,
        required: false, // Optional
    },
    read: {
        type: Boolean,
        default: false, // Default value set to false
    },
}, { timestamps: true });
exports.Message = (0, mongoose_1.model)("Message", MessageSchema);
