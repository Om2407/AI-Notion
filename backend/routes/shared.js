import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

// GET /shared/:shareId - public note view (no auth required)
router.get("/:shareId", async (req, res) => {
  try {
    const note = await Note.findOne({
      shareId: req.params.shareId,
      isPublic: true,
    }).populate("user", "name");

    if (!note) {
      return res.status(404).json({ message: "Note not found or no longer shared" });
    }

    // Return limited public data only
    res.json({
      note: {
        title: note.title,
        content: note.content,
        tags: note.tags,
        category: note.category,
        aiSummary: note.aiSummary,
        aiActionItems: note.aiActionItems,
        updatedAt: note.updatedAt,
        author: note.user?.name || "Anonymous",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shared note", error: err.message });
  }
});

export default router;
