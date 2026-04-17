import React, { useState } from 'react';
import { Landmark, PanelLeftClose, PanelLeftOpen, PlusCircle, ListOrdered, Search, X, Trophy, Star, Trash2 } from 'lucide-react';
import axios from 'axios';

// ── Leaderboard Modal ──────────────────────────────────────────────
const LeaderboardModal = ({ onClose }) => {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("/chat/leaderboard");
        if (response.data.success) {
          setLeaders(response.data.leaderboard);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1c1a19] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Trophy size={20} className="text-yellow-400" />
            <h2 className="text-lg font-semibold text-gray-100">Leaderboard</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-1">
          {leaders.map(({ model, wins, score }, index) => {
            const rank = index + 1;
            return (
              <div key={model} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${rank === 1 ? 'bg-yellow-400/5 border border-yellow-400/15' : 'hover:bg-white/5'} transition-colors`}>
                <span className={`w-6 text-center font-bold text-sm ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>{rank}</span>
                <span className="flex-1 text-gray-200 font-medium text-sm">{model}</span>
                <span className="text-gray-500 text-xs">{wins.toLocaleString()} wins</span>
                <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                  <Star size={13} fill="currentColor" />
                  {score}
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t border-white/5 text-center text-xs text-gray-600">Updated daily based on head-to-head arena results</div>
      </div>
    </div>
  );
};

// ── Search Modal ───────────────────────────────────────────────────
const SearchModal = ({ sessions, onSelectSession, onClose }) => {
  const [query, setQuery] = useState('');

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1c1a19] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm"
            placeholder="Search your chats..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 transition-colors"><X size={18} /></button>
        </div>
        <div className="max-h-72 overflow-y-auto no-scrollbar">
          {filtered.length > 0 ? (
            filtered.map(session => (
              <button
                key={session._id}
                onClick={() => { onSelectSession(session._id); onClose(); }}
                className="w-full text-left px-5 py-3 hover:bg-white/5 text-gray-300 text-sm transition-colors border-b border-white/5 last:border-0 truncate"
              >
                {session.title}
              </button>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-gray-500 text-sm italic">
              {query ? `No chats matching "${query}"` : 'No chat history yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────
const Sidebar = ({ user, onLogout, onNewChat, isOpen, onToggle, onClose, sessions, activeSessionId, onSelectSession, onDeleteSession, disabled }) => {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      {leaderboardOpen && <LeaderboardModal onClose={() => setLeaderboardOpen(false)} />}
      {searchOpen && (
        <SearchModal
          sessions={sessions}
          onSelectSession={onSelectSession}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Sidebar Container — on desktop: always rendered but can be translated out */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full bg-[#1c1a19] border-r border-white/5 flex flex-col justify-between shrink-0 transform transition-all duration-300 ease-in-out font-sans
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:z-auto
          ${isOpen ? 'md:translate-x-0 md:w-64' : 'md:translate-x-0 md:w-0 md:overflow-hidden md:border-0'}
          ${disabled ? 'opacity-40 grayscale-[0.5] grayscale' : ''}
        `}
      >
        <div className={`flex flex-col h-full overflow-y-auto no-scrollbar pt-6 px-4 pb-4 min-w-[256px] ${disabled ? 'pointer-events-none' : ''}`}>

          {/* Header Row */}
          <div className="flex items-center justify-between mb-8 pl-1">
            <div className="flex items-center gap-2 text-gray-200">
              <Landmark size={24} />
              <h1 className="text-xl font-serif tracking-tight font-semibold">Arena</h1>
            </div>
            {/* Desktop collapse */}
            <button onClick={onToggle} className="hidden md:flex text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white/5">
              <PanelLeftClose size={20} strokeWidth={1.5} />
            </button>
            {/* Mobile close */}
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Core Navigation */}
          <div className="space-y-1 mb-8">
            <button
              onClick={() => { onNewChat(); onClose(); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-200 hover:bg-[#302e2c] rounded-xl transition-colors text-sm font-medium"
            >
              <PlusCircle size={18} strokeWidth={1.5} />
              <span>New Chat</span>
            </button>

            <button
              onClick={() => setLeaderboardOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-300 hover:bg-[#302e2c] rounded-xl transition-colors text-sm font-medium"
            >
              <ListOrdered size={18} strokeWidth={1.5} />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-300 hover:bg-[#302e2c] rounded-xl transition-colors text-sm font-medium"
            >
              <Search size={18} strokeWidth={1.5} />
              <span>Search</span>
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-400 opacity-60 mb-2 px-3">Older</p>
            {sessions && sessions.length > 0 ? (
              sessions.map(session => (
                <div key={session._id} className={`flex items-center w-full rounded-xl transition-colors group ${
                    activeSessionId === session._id
                      ? 'bg-[#302e2c] text-gray-100 font-medium'
                      : 'text-gray-300 hover:bg-[#302e2c]/50'
                  }`}>
                  <button
                    onClick={() => { onSelectSession(session._id); onClose(); }}
                    className="flex items-center gap-2 flex-1 px-3 py-2.5 text-sm text-left truncate"
                  >
                    <span className="truncate opacity-80">{session.title}</span>
                  </button>
                  <button
                    onClick={(e) => {
                       e.stopPropagation();
                       onDeleteSession(session._id);
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity text-gray-500 mr-1 rounded-md"
                    title="Delete Chat"
                  >
                     <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm px-3 text-gray-500 italic opacity-50">No history yet.</p>
            )}
          </div>
        </div>

        {/* Profile Card */}
        {user && (
          <div className={`mt-auto border-t border-white/5 p-4 ${disabled ? 'pointer-events-none' : ''}`}>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 flex items-center justify-center text-black font-bold text-lg shadow-inner">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">{user.username}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded-xl text-xs font-semibold transition-all border border-white/5 hover:border-red-500/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-6 flex items-center justify-between text-[11px] text-gray-500 font-medium min-w-[256px]">
          <a href="#" className="hover:text-gray-300 transition-colors shrink-0">Terms</a>
          <a href="#" className="hover:text-gray-300 transition-colors shrink-0">Privacy</a>
          <a href="#" className="hover:text-gray-300 transition-colors shrink-0">Cookies</a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
