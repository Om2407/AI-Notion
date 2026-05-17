import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Sparkles, Tag, Calendar, ArrowLeft, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import api from "../lib/api";

interface SharedNote {
  title: string;
  content: string;
  tags: string[];
  category: string;
  aiSummary: string | null;
  aiActionItems: string[];
  updatedAt: string;
  author: string;
}

export default function SharedNotePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/shared/${shareId}`)
      .then((res) => setNote(res.data.note))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center p-4">
        <div>
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Note not found</h1>
          <p className="text-zinc-500 text-sm mb-6">This note may have been unshared or deleted.</p>
          <Link to="/login" className="btn-primary inline-flex">
            Go to Peblo Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-fuchsia-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">Peblo Notes</span>
        </div>
        <Link to="/login" className="text-fuchsia-400 text-sm hover:text-fuchsia-300 transition-colors">
          Create your workspace →
        </Link>
      </div>

      {/* Note content */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-zinc-500">
          <span>Shared by <span className="text-zinc-300">{note.author}</span></span>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            {format(new Date(note.updatedAt), "MMM d, yyyy")}
          </div>
          {note.category && (
            <>
              <span>·</span>
              <span className="text-zinc-400">{note.category}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-5 leading-tight">{note.title}</h1>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag) => (
              <span key={tag} className="tag-badge">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Summary (if available) */}
        {note.aiSummary && (
          <div className="bg-fuchsia-950/40 border border-fuchsia-800 rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-fuchsia-400" />
              <span className="text-fuchsia-300 font-semibold text-sm">AI Summary</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{note.aiSummary}</p>

            {note.aiActionItems.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare size={13} className="text-fuchsia-400" />
                  <span className="text-fuchsia-300 text-xs font-medium">Action Items</span>
                </div>
                <ul className="space-y-1.5">
                  {note.aiActionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-300 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
          {note.content || <span className="text-zinc-600 italic">No content</span>}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center border-t border-zinc-800 pt-8">
          <p className="text-zinc-600 text-sm mb-3">Want your own AI-powered notes workspace?</p>
          <Link to="/signup" className="btn-primary inline-flex">
            <Sparkles size={14} />
            Try Peblo Notes free
          </Link>
        </div>
      </div>
    </div>
  );
}
