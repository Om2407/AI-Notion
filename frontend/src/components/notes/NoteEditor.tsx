import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Share2, Archive, ArchiveRestore, Trash2, X, Copy, CheckCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { Note, AIInsights } from "../../types";

interface NoteEditorProps {
  note: Note;
  onUpdate: (updated: Note) => void;
  onDelete: () => void;
}

export default function NoteEditor({ note, onUpdate, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [category, setCategory] = useState(note.category);
  const [tagInput, setTagInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(
    note.aiSummary
      ? {
          summary: note.aiSummary,
          action_items: note.aiActionItems,
          suggested_title: note.aiSuggestedTitle || note.title,
          generated_at: note.aiGeneratedAt || "",
        }
      : null
  );
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(
    note.isPublic && note.shareId ? `${window.location.origin}/shared/${note.shareId}` : null
  );
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setCategory(note.category);
    setAiInsights(
      note.aiSummary
        ? {
            summary: note.aiSummary,
            action_items: note.aiActionItems,
            suggested_title: note.aiSuggestedTitle || note.title,
            generated_at: note.aiGeneratedAt || "",
          }
        : null
    );
    setShareUrl(note.isPublic && note.shareId ? `${window.location.origin}/shared/${note.shareId}` : null);
    return () => { isMounted.current = false; };
  }, [note._id]);

  // Auto-save with debounce
  const autoSave = useCallback(
    (newTitle: string, newContent: string, newTags: string[], newCategory: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const { data } = await api.patch(`/notes/${note._id}`, {
            title: newTitle,
            content: newContent,
            tags: newTags,
            category: newCategory,
          });
          if (isMounted.current) onUpdate(data.note);
        } catch {
          // Silent fail on auto-save
        }
      }, 1000);
    },
    [note._id, onUpdate]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    autoSave(val, content, tags, category);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    autoSave(title, val, tags, category);
  };

  const addTag = () => {
    const cleaned = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (cleaned && !tags.includes(cleaned)) {
      const newTags = [...tags, cleaned];
      setTags(newTags);
      setTagInput("");
      autoSave(title, content, newTags, category);
    } else {
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    autoSave(title, content, newTags, category);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    autoSave(title, content, tags, val);
  };

  const handleArchive = async () => {
    try {
      const { data } = await api.patch(`/notes/${note._id}`, { isArchived: !note.isArchived });
      onUpdate(data.note);
      toast.success(note.isArchived ? "Note restored" : "Note archived");
    } catch {
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await api.delete(`/notes/${note._id}`);
      onDelete();
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleGenerateAI = async () => {
    if (content.trim().length < 20) {
      toast.error("Write more content first — at least a few sentences");
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await api.post(`/notes/${note._id}/generate-summary`);
      setAiInsights(data);
      onUpdate({ ...note, aiSummary: data.summary, aiActionItems: data.action_items, aiSuggestedTitle: data.suggested_title });
      toast.success("AI insights generated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      if (note.isPublic && note.shareId) {
        // Revoke share
        await api.delete(`/notes/${note._id}/share`);
        setShareUrl(null);
        onUpdate({ ...note, isPublic: false, shareId: null });
        toast.success("Share link revoked");
      } else {
        const { data } = await api.post(`/notes/${note._id}/share`);
        const url = `${window.location.origin}/shared/${data.shareId}`;
        setShareUrl(url);
        onUpdate({ ...note, isPublic: true, shareId: data.shareId });
        toast.success("Share link generated!");
      }
    } catch {
      toast.error("Failed to update share settings");
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const applyAiTitle = () => {
    if (aiInsights?.suggested_title) {
      setTitle(aiInsights.suggested_title);
      autoSave(aiInsights.suggested_title, content, tags, category);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-800 flex-shrink-0">
        <button
          onClick={handleGenerateAI}
          disabled={aiLoading}
          className="btn-primary text-sm py-1.5"
        >
          {aiLoading ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {aiLoading ? "Analyzing..." : "AI Insights"}
        </button>

        <button
          onClick={handleShare}
          disabled={shareLoading}
          className={`btn-secondary text-sm py-1.5 ${note.isPublic ? "border border-green-700 text-green-400" : ""}`}
        >
          <Share2 size={14} />
          {note.isPublic ? "Unshare" : "Share"}
        </button>

        <button onClick={handleArchive} className="btn-ghost text-sm py-1.5">
          {note.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          {note.isArchived ? "Restore" : "Archive"}
        </button>

        <div className="flex-1" />

        <button onClick={handleDelete} className="btn-ghost text-sm py-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/30">
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main editor area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none placeholder-zinc-600 mb-4"
            placeholder="Note title..."
          />

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">Category:</span>
              <input
                type="text"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-md outline-none focus:border-fuchsia-500 w-28"
                placeholder="General"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {tags.map((tag) => (
              <span key={tag} className="tag-badge group/tag">
                #{tag}
                <button onClick={() => removeTag(tag)} className="ml-0.5 opacity-0 group-hover/tag:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="text-xs bg-transparent border border-zinc-700 text-zinc-400 px-2 py-1 rounded-md outline-none focus:border-fuchsia-500 w-24"
                placeholder="Add tag..."
              />
              <button onClick={addTag} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Share URL */}
          {shareUrl && (
            <div className="mb-5 flex items-center gap-2 bg-green-950/30 border border-green-800 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-green-300 text-xs flex-1 truncate font-mono">{shareUrl}</span>
              <button onClick={copyShareUrl} className="text-green-400 hover:text-green-200 flex-shrink-0">
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Content textarea */}
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full bg-transparent text-zinc-300 text-sm leading-relaxed outline-none resize-none placeholder-zinc-600 min-h-[400px]"
            placeholder="Start writing your note here... 

Use AI Insights to automatically generate a summary, extract action items, and suggest a better title."
          />
        </div>

        {/* AI Insights panel */}
        {aiInsights && (
          <div className="w-72 border-l border-zinc-800 overflow-y-auto bg-zinc-950 flex-shrink-0">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={15} className="text-fuchsia-400" />
                <span className="text-fuchsia-300 font-semibold text-sm">AI Insights</span>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Summary</p>
                <p className="text-zinc-300 text-xs leading-relaxed">{aiInsights.summary}</p>
              </div>

              {/* Action items */}
              {aiInsights.action_items.length > 0 && (
                <div className="mb-4">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Action Items</p>
                  <ul className="space-y-1.5">
                    {aiInsights.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 flex-shrink-0" />
                        <span className="text-zinc-300 text-xs leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested title */}
              {aiInsights.suggested_title && aiInsights.suggested_title !== title && (
                <div className="mb-4">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Suggested Title</p>
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2.5">
                    <p className="text-zinc-200 text-xs mb-2">{aiInsights.suggested_title}</p>
                    <button
                      onClick={applyAiTitle}
                      className="text-fuchsia-400 text-xs hover:text-fuchsia-300 font-medium"
                    >
                      Apply this title →
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors pt-2"
              >
                Regenerate insights
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
