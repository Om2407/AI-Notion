import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, FileText } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import { Note } from "../types";
import Sidebar from "../components/shared/Sidebar";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchNotes = useCallback(async () => {
    try {
      const params: Record<string, string> = { archived: String(showArchived) };
      if (search) params.search = search;
      if (filterTag) params.tag = filterTag;

      const { data } = await api.get("/notes", { params });
      setNotes(data.notes);

      // Collect all unique tags
      const tags = new Set<string>();
      data.notes.forEach((n: Note) => n.tags.forEach((t) => tags.add(t)));
      setAllTags(Array.from(tags));
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [search, filterTag, showArchived]);

  useEffect(() => {
    const delay = setTimeout(fetchNotes, 300);
    return () => clearTimeout(delay);
  }, [fetchNotes]);

  const createNote = async () => {
    try {
      const { data } = await api.post("/notes", { title: "Untitled Note", content: "" });
      setNotes((prev) => [data.note, ...prev]);
      setSelectedNote(data.note);
    } catch {
      toast.error("Failed to create note");
    }
  };

  const handleUpdate = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    if (selectedNote?._id === updated._id) setSelectedNote(updated);
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    setNotes((prev) => prev.filter((n) => n._id !== selectedNote._id));
    setSelectedNote(null);
  };

  const handleArchive = async (note: Note) => {
    try {
      const { data } = await api.patch(`/notes/${note._id}`, { isArchived: !note.isArchived });
      // Remove from current list since it moved buckets
      setNotes((prev) => prev.filter((n) => n._id !== note._id));
      if (selectedNote?._id === note._id) setSelectedNote(null);
      toast.success(note.isArchived ? "Note restored" : "Note archived");
    } catch {
      toast.error("Failed to archive note");
    }
  };

  const handleDeleteFromCard = async (note: Note) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${note._id}`);
      setNotes((prev) => prev.filter((n) => n._id !== note._id));
      if (selectedNote?._id === note._id) setSelectedNote(null);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleShareFromCard = async (note: Note) => {
    try {
      if (note.isPublic && note.shareId) {
        await api.delete(`/notes/${note._id}/share`);
        handleUpdate({ ...note, isPublic: false, shareId: null });
        toast.success("Share link revoked");
      } else {
        const { data } = await api.post(`/notes/${note._id}/share`);
        handleUpdate({ ...note, isPublic: true, shareId: data.shareId });
        const url = `${window.location.origin}/shared/${data.shareId}`;
        navigator.clipboard.writeText(url).catch(() => {});
        toast.success("Share link copied!");
      }
    } catch {
      toast.error("Failed to update share");
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar
        onNewNote={createNote}
        showArchived={showArchived}
        onToggleArchived={() => { setShowArchived((v) => !v); setSelectedNote(null); }}
      />

      {/* Notes list */}
      <div className="w-72 border-r border-zinc-800 flex flex-col h-full flex-shrink-0">
        {/* Search + filter */}
        <div className="p-3 border-b border-zinc-800 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm placeholder-zinc-500 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-fuchsia-500"
              placeholder="Search notes..."
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <SlidersHorizontal size={12} className="text-zinc-500 flex-shrink-0" />
              <button
                onClick={() => setFilterTag("")}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${!filterTag ? "bg-fuchsia-600 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${filterTag === tag ? "bg-fuchsia-600 text-white" : "text-zinc-600 hover:text-zinc-300"}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <FileText size={32} className="text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm">
                {showArchived ? "No archived notes" : search || filterTag ? "No notes match" : "No notes yet"}
              </p>
              {!showArchived && !search && !filterTag && (
                <button onClick={createNote} className="text-fuchsia-400 text-sm mt-2 hover:text-fuchsia-300">
                  Create your first note →
                </button>
              )}
            </div>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                isSelected={selectedNote?._id === note._id}
                onSelect={() => setSelectedNote(note)}
                onArchive={() => handleArchive(note)}
                onDelete={() => handleDeleteFromCard(note)}
                onShare={() => handleShareFromCard(note)}
              />
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs">{notes.length} {showArchived ? "archived" : "notes"}</p>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote._id}
            note={selectedNote}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={32} className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 font-medium mb-1">Select a note to edit</p>
            <p className="text-zinc-600 text-sm">Or create a new one from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}
