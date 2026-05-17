import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const noteSchema = new mongoose.Schema(
  {
    note_id: {
      type: String,
      default: () => `NOTE_${uuidv4().slice(0, 8).toUpperCase()}`,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Untitled Note",
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      default: null,
      sparse: true,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    aiActionItems: {
      type: [String],
      default: [],
    },
    aiSuggestedTitle: {
      type: String,
      default: null,
    },
    aiGeneratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Text index for full-text search
noteSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("Note", noteSchema);
