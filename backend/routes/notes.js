import express from "express";
import { v4 as uuidv4 } from "uuid";
import Note from "../models/Note.js";
import protect from "../middleware/auth.js";
import { generateNoteInsights } from "../controllers/gemini.js";

const router = express.Router();

// All note routes are protected
router.use(protect);

// GET /notes - fetch all notes with search + filter
router.get("/", async (req, res) => {
  try {
    const { search, tag, category, archived, sort } = req.query;

    const query = { user: req.user._id };

    // Archive filter - default show active notes
    query.isArchived = archived === "true" ? true : false;

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Keyword search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const sortOption = sort === "oldest" ? { updatedAt: 1 } : { updatedAt: -1 };

    const notes = await Note.find(query).sort(sortOption);
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes", error: err.message });
  }
});

// GET /notes/:id - single note
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch note", error: err.message });
  }
});

// POST /notes - create note
router.post("/", async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    const note = await Note.create({
      user: req.user._id,
      title: title || "Untitled Note",
      content: content || "",
      tags: tags || [],
      category: category || "General",
    });

    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ message: "Failed to create note", error: err.message });
  }
});

// PATCH /notes/:id - update note
router.patch("/:id", async (req, res) => {
  try {
    const { title, content, tags, category, isArchived } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content, tags, category, isArchived },
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ message: "Failed to update note", error: err.message });
  }
});

// DELETE /notes/:id
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete note", error: err.message });
  }
});

// POST /notes/:id/generate-summary - AI summary
router.post("/:id/generate-summary", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (!note.content || note.content.trim().length < 20) {
      return res.status(400).json({ message: "Note content is too short for AI analysis" });
    }

    const insights = await generateNoteInsights(note.title, note.content);

    note.aiSummary = insights.summary;
    note.aiActionItems = insights.action_items;
    note.aiSuggestedTitle = insights.suggested_title;
    note.aiGeneratedAt = new Date();
    await note.save();

    res.json({
      summary: note.aiSummary,
      action_items: note.aiActionItems,
      suggested_title: note.aiSuggestedTitle,
      generated_at: note.aiGeneratedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /notes/:id/share - generate public share link
router.post("/:id/share", async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (!note.shareId) {
      note.shareId = uuidv4();
    }
    note.isPublic = true;
    await note.save();

    res.json({ shareId: note.shareId, shareUrl: `/shared/${note.shareId}` });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate share link", error: err.message });
  }
});

// DELETE /notes/:id/share - revoke public access
router.delete("/:id/share", async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isPublic: false, shareId: null },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Share link revoked" });
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke share link", error: err.message });
  }
});

export default router;
