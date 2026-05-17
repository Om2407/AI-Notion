import express from "express";
import Note from "../models/Note.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET /insights - productivity dashboard data
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;

    // All non-archived notes
    const allNotes = await Note.find({ user: userId, isArchived: false });

    // Total notes
    const totalNotes = allNotes.length;

    // Recently edited (last 5)
    const recentNotes = await Note.find({ user: userId, isArchived: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title updatedAt tags category");

    // Most used tags
    const tagCount = {};
    allNotes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    // AI usage stats
    const aiUsageCount = allNotes.filter((n) => n.aiGeneratedAt !== null).length;
    const totalActionItems = allNotes.reduce((sum, n) => sum + n.aiActionItems.length, 0);

    // Weekly activity (notes created/updated per day for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Note.find({
      user: userId,
      updatedAt: { $gte: sevenDaysAgo },
    }).select("updatedAt");

    const weeklyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      weeklyMap[key] = 0;
    }

    recentActivity.forEach((note) => {
      const key = note.updatedAt.toISOString().slice(0, 10);
      if (weeklyMap[key] !== undefined) {
        weeklyMap[key]++;
      }
    });

    const weeklyActivity = Object.entries(weeklyMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Archived notes count
    const archivedCount = await Note.countDocuments({ user: userId, isArchived: true });

    res.json({
      totalNotes,
      archivedCount,
      recentNotes,
      topTags,
      aiStats: {
        notesWithAI: aiUsageCount,
        totalActionItems,
      },
      weeklyActivity,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch insights", error: err.message });
  }
});

export default router;
