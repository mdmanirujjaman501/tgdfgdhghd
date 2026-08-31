import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mediaApi } from '../api/mediaApi';
import { episodeApi } from '../api/episodeApi';
import { MediaSource, Episode } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import {
  Video,
  Plus,
  Server,
  Download,
  Play,
  Edit2,
  Trash2,
  ExternalLink,
  Shield,
  CheckCircle,
} from 'lucide-react';

export const MediaManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const episodeIdParam = searchParams.get('episode_id');

  const [sources, setSources] = useState<MediaSource[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(episodeIdParam || '');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Partial<MediaSource> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { showToast } = useToast();

  const loadEpisodes = async () => {
    try {
      const res = await episodeApi.getAll({ limit: 100 });
      if (res.success) setEpisodes(res.data);
    } catch (err) {}
  };

  const loadSources = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedEpisodeId) params.episode_id = selectedEpisodeId;

      const res = await mediaApi.getAll(params);
      if (res.success) setSources(res.data);
    } catch (err) {
      showToast('Failed to load media sources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpisodes();
  }, []);

  useEffect(() => {
    loadSources();
  }, [selectedEpisodeId]);

  const handleEpisodeChange = (id: string) => {
    setSelectedEpisodeId(id);
    if (id) {
      setSearchParams({ episode_id: id });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSource({
      episode_id: selectedEpisodeId ? Number(selectedEpisodeId) : episodes[0]?.id || 1,
      type: 'stream',
      quality: '1080p',
      label: 'Fast Stream Server 1',
      server: 'FastCloud HD',
      url: 'https://cdn.example.com/stream/ep1.m3u8',
      file_size: '350MB',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (src: MediaSource) => {
    setEditingSource(src);
    setIsModalOpen(true);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource || !editingSource.url || !editingSource.episode_id) return;

    try {
      if (editingSource.id) {
        const res = await mediaApi.update(editingSource.id, editingSource);
        if (res.success) {
          showToast('Media source updated');
          setIsModalOpen(false);
          loadSources();
        }
      } else {
        const res = await mediaApi.create(editingSource);
        if (res.success) {
          showToast('Media source added');
          setIsModalOpen(false);
          loadSources();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving media source', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await mediaApi.delete(deletingId);
      if (res.success) {
        showToast('Media source deleted');
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        loadSources();
      }
    } catch (err) {
      showToast('Failed to delete media source', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400" />
            <span>Media Sources & Video Mirrors</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure streaming server links, download links, video resolutions, and fallback mirrors
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Link</span>
        </button>
      </div>

      {/* Episode Filter */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <Server className="w-4 h-4 text-indigo-400 shrink-0" />
        <label className="text-xs font-medium text-slate-300">Filter by Episode:</label>
        <select
          value={selectedEpisodeId}
          onChange={(e) => handleEpisodeChange(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none flex-1 max-w-sm"
        >
          <option value="">All Episodes</option>
          {episodes.map((ep) => (
            <option key={ep.id} value={ep.id}>
              {ep.serial_title ? `${ep.serial_title} - E${ep.episode_number}: ${ep.title}` : ep.title}
            </option>
          ))}
        </select>
      </div>

      {/* Media Sources Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Server & Label</th>
                <th className="py-3 px-4">Episode</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Quality & Size</th>
                <th className="py-3 px-4">Stream URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading media sources...
                  </td>
                </tr>
              ) : sources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No media sources found.
                  </td>
                </tr>
              ) : (
                sources.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{src.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{src.server}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{src.episode_title}</div>
                      <div className="text-[10px] text-slate-400">{src.serial_title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          src.type === 'stream'
                            ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20'
                            : src.type === 'download'
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                        }`}
                      >
                        {src.type === 'stream' && <Play className="w-3 h-3" />}
                        {src.type === 'download' && <Download className="w-3 h-3" />}
                        <span className="capitalize">{src.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-cyan-400 font-semibold">{src.quality}</span>
                      <span className="text-slate-500 ml-1">({src.file_size || 'N/A'})</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-400 font-mono text-[11px] flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{src.url}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(src)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Source"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(src.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                          title="Delete Source"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Media Source Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSource?.id ? 'Edit Media Source' : 'Add Media Source'}
        maxWidth="lg"
      >
        {editingSource && (
          <form onSubmit={handleSaveSource} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Episode *</label>
              <select
                value={editingSource.episode_id || episodes[0]?.id || 1}
                onChange={(e) => setEditingSource({ ...editingSource, episode_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              >
                {episodes.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.serial_title ? `${ep.serial_title} - E${ep.episode_number}: ${ep.title}` : ep.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Source Type</label>
                <select
                  value={editingSource.type || 'stream'}
                  onChange={(e) => setEditingSource({ ...editingSource, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                >
                  <option value="stream">Direct Stream (m3u8/mp4)</option>
                  <option value="download">Download Link</option>
                  <option value="mirror">Mirror / Embed Iframe</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Video Quality Tag</label>
                <select
                  value={editingSource.quality || '1080p'}
                  onChange={(e) => setEditingSource({ ...editingSource, quality: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                >
                  <option value="4K UHD">4K UHD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="480p">480p SD</option>
                  <option value="360p">360p Mobile</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Server Name *</label>
                <input
                  type="text"
                  required
                  value={editingSource.server || ''}
                  onChange={(e) => setEditingSource({ ...editingSource, server: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                  placeholder="e.g. FastCloud 1"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  value={editingSource.label || ''}
                  onChange={(e) => setEditingSource({ ...editingSource, label: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                  placeholder="e.g. Server 1 (Fast HD)"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Stream / File URL *</label>
              <input
                type="text"
                required
                value={editingSource.url || ''}
                onChange={(e) => setEditingSource({ ...editingSource, url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">File Size (Optional)</label>
              <input
                type="text"
                value={editingSource.file_size || ''}
                onChange={(e) => setEditingSource({ ...editingSource, file_size: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                placeholder="e.g. 450MB"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/20"
              >
                Save Media Source
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Media Source"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">Are you sure you want to remove this stream mirror?</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
