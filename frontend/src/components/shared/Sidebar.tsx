import { Link, useLocation } from "react-router-dom";
import { Sparkles, FileText, BarChart2, Archive, LogOut, Plus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  onNewNote: () => void;
  showArchived: boolean;
  onToggleArchived: () => void;
}

export default function Sidebar({ onNewNote, showArchived, onToggleArchived }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-fuchsia-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Peblo Notes</p>
            <p className="text-zinc-500 text-xs mt-0.5">AI Workspace</p>
          </div>
        </div>
      </div>

      {/* New Note button */}
      <div className="p-3">
        <button onClick={onNewNote} className="btn-primary w-full justify-center text-sm py-2.5">
          <Plus size={16} />
          New Note
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <Link
          to="/notes"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive("/notes") && !showArchived
              ? "bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          }`}
          onClick={() => showArchived && onToggleArchived()}
        >
          <FileText size={16} />
          My Notes
        </Link>

        <button
          onClick={onToggleArchived}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            showArchived
              ? "bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          }`}
        >
          <Archive size={16} />
          Archived
        </button>

        <Link
          to="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive("/dashboard")
              ? "bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          }`}
        >
          <BarChart2 size={16} />
          Dashboard
        </Link>
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-fuchsia-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-200 text-sm font-medium truncate">{user?.name}</p>
            <p className="text-zinc-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn-ghost w-full justify-start text-sm text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
