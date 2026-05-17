import { formatDistanceToNow } from "date-fns";
import { Archive, ArchiveRestore, Trash2, Share2, Sparkles } from "lucide-react";
import { Note } from "../../types";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onShare: () => void;
}

export default function NoteCard({ note, isSelected, onSelect, onArchive, onDelete, onShare }: NoteCardProps) {
  const preview = note.content?.replace(/\n/g, " ").slice(0, 90) || "No content yet...";
  const timeAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
        isSelected
          ? "border-fuchsia-600 bg-fuchsia-950/30"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
      }`}
    >
      {/* AI badge */}
      {note.aiSummary && (
        <div className="absolute top-3 right-3">
          <Sparkles size={13} className="text-fuchsia-400" />
        </div>
      )}

      <h3 className="text-zinc-100 font-semibold text-sm mb-1 pr-5 truncate">{note.title}</h3>
      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-3">{preview}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-badge">
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-zinc-600">+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-zinc-600 text-xs">{timeAgo}</span>

        {/* Action buttons - show on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors"
            title="Share note"
          >
            <Share2 size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(); }}
            className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors"
            title={note.isArchived ? "Restore" : "Archive"}
          >
            {note.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-md hover:bg-red-950 text-zinc-500 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {note.isPublic && (
        <div className="mt-2 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-zinc-600">Public</span>
        </div>
      )}
    </div>
  );
}
