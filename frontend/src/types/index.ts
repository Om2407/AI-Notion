export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Note {
  _id: string;
  note_id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  isArchived: boolean;
  isPublic: boolean;
  shareId: string | null;
  aiSummary: string | null;
  aiActionItems: string[];
  aiSuggestedTitle: string | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIInsights {
  summary: string;
  action_items: string[];
  suggested_title: string;
  generated_at: string;
}

export interface InsightData {
  totalNotes: number;
  archivedCount: number;
  recentNotes: Partial<Note>[];
  topTags: { tag: string; count: number }[];
  aiStats: {
    notesWithAI: number;
    totalActionItems: number;
  };
  weeklyActivity: { date: string; count: number }[];
}
