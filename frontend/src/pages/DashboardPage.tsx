import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Sparkles, Tag, Activity, Archive, ArrowLeft, CheckSquare, TrendingUp,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";
import api from "../lib/api";
import { InsightData } from "../types";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/insights")
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxActivity = Math.max(...(data?.weeklyActivity.map((d) => d.count) || [1]), 1);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 px-8 py-5 flex items-center justify-between">
        <div>
          <Link to="/notes" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-2 transition-colors w-fit">
            <ArrowLeft size={14} />
            Back to Notes
          </Link>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Welcome back, {user?.name?.split(" ")[0]} 👋</p>
        </div>
        <div className="w-10 h-10 bg-fuchsia-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText size={20} className="text-fuchsia-400" />}
            label="Total Notes"
            value={String(data?.totalNotes || 0)}
            color="fuchsia"
          />
          <StatCard
            icon={<Archive size={20} className="text-zinc-400" />}
            label="Archived"
            value={String(data?.archivedCount || 0)}
            color="zinc"
          />
          <StatCard
            icon={<Sparkles size={20} className="text-yellow-400" />}
            label="AI Analyzed"
            value={String(data?.aiStats.notesWithAI || 0)}
            color="yellow"
          />
          <StatCard
            icon={<CheckSquare size={20} className="text-green-400" />}
            label="Action Items"
            value={String(data?.aiStats.totalActionItems || 0)}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly activity */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={16} className="text-fuchsia-400" />
              <h2 className="text-white font-semibold text-sm">Weekly Activity</h2>
            </div>
            <div className="flex items-end gap-2 h-28">
              {data?.weeklyActivity.map(({ date, count }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center h-20">
                    <div
                      className="w-full rounded-t-md bg-fuchsia-600 transition-all duration-500"
                      style={{ height: `${(count / maxActivity) * 100}%`, minHeight: count > 0 ? "6px" : "2px", opacity: count > 0 ? 1 : 0.2 }}
                    />
                  </div>
                  <span className="text-zinc-600 text-xs">
                    {format(new Date(date + "T00:00:00"), "EEE")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top tags */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <Tag size={16} className="text-fuchsia-400" />
              <h2 className="text-white font-semibold text-sm">Most Used Tags</h2>
            </div>
            {data?.topTags.length === 0 ? (
              <p className="text-zinc-600 text-sm">No tags yet. Add tags to your notes!</p>
            ) : (
              <div className="space-y-2.5">
                {data?.topTags.slice(0, 6).map(({ tag, count }) => (
                  <div key={tag} className="flex items-center gap-3">
                    <span className="text-fuchsia-300 text-xs font-medium w-20 truncate">#{tag}</span>
                    <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="bg-fuchsia-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(count / (data?.topTags[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-zinc-500 text-xs w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent notes */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-fuchsia-400" />
            <h2 className="text-white font-semibold text-sm">Recently Edited</h2>
          </div>
          {data?.recentNotes.length === 0 ? (
            <p className="text-zinc-600 text-sm">No notes yet.</p>
          ) : (
            <div className="space-y-2">
              {data?.recentNotes.map((note) => (
                <Link
                  to="/notes"
                  key={note._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={14} className="text-zinc-600 flex-shrink-0" />
                    <span className="text-zinc-300 text-sm truncate group-hover:text-white transition-colors">
                      {note.title || "Untitled"}
                    </span>
                    {note.tags && note.tags.length > 0 && (
                      <span className="tag-badge hidden sm:inline-flex">#{note.tags[0]}</span>
                    )}
                  </div>
                  <span className="text-zinc-600 text-xs flex-shrink-0 ml-4">
                    {note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : ""}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    fuchsia: "bg-fuchsia-950/50 border-fuchsia-900",
    zinc: "bg-zinc-800/50 border-zinc-700",
    yellow: "bg-yellow-950/50 border-yellow-900",
    green: "bg-green-950/50 border-green-900",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.zinc}`}>
      <div className="mb-3">{icon}</div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-zinc-500 text-xs">{label}</p>
    </div>
  );
}
