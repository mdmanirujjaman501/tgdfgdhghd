import React, { useState, useEffect } from 'react';
import { Search, X, Tv, Film, User, Clapperboard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ serials: any[]; episodes: any[]; actors: any[]; users: any[] }>({
    serials: [],
    episodes: [],
    actors: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // open modal handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ serials: [], episodes: [], actors: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/platform/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const totalResults = results.serials.length + results.episodes.length + results.actors.length + results.users.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Search TV serials, episodes, actors, users... (Esc to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-100 text-sm focus:outline-none placeholder:text-slate-500"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">Searching content catalog...</div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching serials, episodes, actors, or users found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-xs text-slate-500">
              Type keywords to perform global search across Serials, Seasons, Episodes, Actors & Users.
            </div>
          )}

          {/* Serials */}
          {results.serials.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
                <Tv className="w-3.5 h-3.5" /> TV Serials ({results.serials.length})
              </h4>
              <div className="space-y-1">
                {results.serials.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect('/serials')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left bg-slate-800/40 hover:bg-indigo-600/15 hover:border-indigo-500/30 border border-transparent transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded bg-slate-800 overflow-hidden shrink-0">
                        {s.poster ? (
                          <img src={s.poster} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Tv className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{s.title}</div>
                        <div className="text-[10px] text-slate-400">Slug: /{s.slug}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {results.episodes.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                <Film className="w-3.5 h-3.5" /> Episodes ({results.episodes.length})
              </h4>
              <div className="space-y-1">
                {results.episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => handleSelect('/episodes')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left bg-slate-800/40 hover:bg-emerald-600/15 hover:border-emerald-500/30 border border-transparent transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{ep.title}</div>
                      <div className="text-[10px] text-slate-400">Episode #{ep.episode_number}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actors */}
          {results.actors.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                <Clapperboard className="w-3.5 h-3.5" /> Cast & Actors ({results.actors.length})
              </h4>
              <div className="space-y-1">
                {results.actors.map((actor) => (
                  <button
                    key={actor.id}
                    onClick={() => handleSelect('/actors')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left bg-slate-800/40 hover:bg-amber-600/15 hover:border-amber-500/30 border border-transparent transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0">
                        {actor.avatar ? (
                          <img src={actor.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-200">{actor.name}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
