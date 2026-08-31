import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { episodeApi } from '../api/episodeApi';
import { serialApi } from '../api/serialApi';
import { seasonApi } from '../api/seasonApi';
import { uploadApi } from '../api/uploadApi';
import { Episode, Serial, Season } from '../types';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';
import {
  PlayCircle,
  Plus,
  Search,
  Video,
  Edit2,
  Trash2,
  Upload,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Film,
  Tv,
} from 'lucide-react';

export const Episodes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonIdParam = searchParams.get('season_id');
  const serialIdParam = searchParams.get('serial_id');

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [serials, setSerials] = useState<Serial[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSerialId, setSelectedSerialId] = useState(serialIdParam || '');
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasonIdParam || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Partial<Episode> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const { showToast } = useToast();

  const loadFilterOptions = async () => {
    try {
      const [serialsRes, seasonsRes] = await Promise.all([
        serialApi.getAll({ limit: 100 }),
        seasonApi.getAll(),
      ]);
      if (serialsRes.success) setSerials(serialsRes.data);
      if (seasonsRes.success) setSeasons(seasonsRes.data);
    } catch (err) {}
  };

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10, search };
      if (selectedSerialId) params.serial_id = selectedSerialId;
      if (selectedSeasonId) params.season_id = selectedSeasonId;

      const res = await episodeApi.getAll(params);
      if (res.success) {
        setEpisodes(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.total_pages);
          setTotalItems(res.pagination.total);
        }
      }
    } catch (err) {
      showToast('Failed to load episodes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadEpisodes();
  }, [page, search, selectedSerialId, selectedSeasonId]);

  const handleSerialChange = (id: string) => {
    setSelectedSerialId(id);
    setSelectedSeasonId('');
    setSearchParams(id ? { serial_id: id } : {});
  };

  const handleSeasonChange = (id: string) => {
    setSelectedSeasonId(id);
    const newParams: any = {};
    if (selectedSerialId) newParams.serial_id = selectedSerialId;
    if (id) newParams.season_id = id;
    setSearchParams(newParams);
  };

  const handleOpenCreateModal = () => {
    const parentSerial = serials[0];
    const serialSeasons = seasons.filter((s) => s.serial_id === parentSerial?.id);
    const parentSeason = serialSeasons[0] || seasons[0];

    setEditingEpisode({
      serial_id: selectedSerialId ? Number(selectedSerialId) : parentSerial?.id || 1,
      season_id: selectedSeasonId ? Number(selectedSeasonId) : parentSeason?.id || 1,
      episode_number: episodes.length + 1,
      title: `Episode ${episodes.length + 1}`,
      slug: `episode-${episodes.length + 1}`,
      description: '',
      thumbnail: '',
      video_url: '',
      duration: '22m',
      release_date: new Date().toISOString().split('T')[0],
      status: 'published',
      featured: 0,
      views: 0,
      downloads: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ep: Episode) => {
    setEditingEpisode(ep);
    setIsModalOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const res = await uploadApi.uploadFile(file);
      if (res.success && editingEpisode) {
        setEditingEpisode({ ...editingEpisode, thumbnail: res.data.url });
        showToast('Thumbnail uploaded');
      }
    } catch (err) {
      showToast('Failed to upload thumbnail', 'error');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpisode || !editingEpisode.title || !editingEpisode.season_id) return;

    if (!editingEpisode.slug) {
      editingEpisode.slug = editingEpisode.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    try {
      if (editingEpisode.id) {
        const res = await episodeApi.update(editingEpisode.id, editingEpisode);
        if (res.success) {
          showToast('Episode updated successfully');
          setIsModalOpen(false);
          loadEpisodes();
        }
      } else {
        const res = await episodeApi.create(editingEpisode);
        if (res.success) {
          showToast('Episode created successfully');
          setIsModalOpen(false);
          loadEpisodes();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving episode', 'error');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await episodeApi.toggleAttribute(id, 'status');
      if (res.success) {
        showToast('Status toggled');
        loadEpisodes();
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await episodeApi.delete(deletingId);
      if (res.success) {
        showToast('Episode deleted');
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        loadEpisodes();
      }
    } catch (err) {
      showToast('Failed to delete episode', 'error');
    }
  };

  const filteredSeasonsForForm = seasons.filter(
    (s) => !editingEpisode?.serial_id || s.serial_id === editingEpisode.serial_id
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-emerald-400" />
            <span>Episode Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage episode listings, streaming video URLs, duration, and media mirrors
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Episode</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search episode title..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedSerialId}
          onChange={(e) => handleSerialChange(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Serials</option>
          {serials.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>

        <select
          value={selectedSeasonId}
          onChange={(e) => handleSeasonChange(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Seasons</option>
          {seasons
            .filter((s) => !selectedSerialId || s.serial_id === Number(selectedSerialId))
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.serial_title ? `${s.serial_title} - ${s.title}` : s.title}
              </option>
            ))}
        </select>
      </div>

      {/* Episodes Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Episode</th>
                <th className="py-3 px-4">Serial & Season</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Media Sources</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading episodes...
                  </td>
                </tr>
              ) : episodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No episodes found.
                  </td>
                </tr>
              ) : (
                episodes.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {ep.thumbnail ? (
                          <img
                            src={ep.thumbnail}
                            alt={ep.title}
                            className="w-14 h-10 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                        ) : (
                          <div className="w-14 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                            <PlayCircle className="w-5 h-5 text-slate-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <span className="text-emerald-400 font-mono text-[10px]">E{ep.episode_number}</span>
                            <span>{ep.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">/{ep.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{ep.serial_title}</div>
                      <div className="text-[10px] text-slate-400">Season {ep.season_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {ep.duration || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/media-sources?episode_id=${ep.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{ep.media_sources_count || 0} Sources</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {ep.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(ep.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
                          ep.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {ep.status === 'published' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{ep.status}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(ep)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Episode"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(ep.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                          title="Delete Episode"
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Add / Edit Episode Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEpisode?.id ? 'Edit Episode' : 'Create Episode'}
        maxWidth="xl"
      >
        {editingEpisode && (
          <form onSubmit={handleSaveEpisode} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Serial *</label>
                <select
                  value={editingEpisode.serial_id || serials[0]?.id || 1}
                  onChange={(e) => {
                    const sId = Number(e.target.value);
                    const matchingSeasons = seasons.filter((s) => s.serial_id === sId);
                    setEditingEpisode({
                      ...editingEpisode,
                      serial_id: sId,
                      season_id: matchingSeasons[0]?.id || seasons[0]?.id || 1,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                >
                  {serials.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Season *</label>
                <select
                  value={editingEpisode.season_id || seasons[0]?.id || 1}
                  onChange={(e) => setEditingEpisode({ ...editingEpisode, season_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                >
                  {filteredSeasonsForForm.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Episode # *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingEpisode.episode_number || 1}
                  onChange={(e) =>
                    setEditingEpisode({
                      ...editingEpisode,
                      episode_number: Number(e.target.value),
                      title: `Episode ${e.target.value}`,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingEpisode.title || ''}
                  onChange={(e) =>
                    setEditingEpisode({
                      ...editingEpisode,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Primary Video Stream URL (HLS / MP4 / Embed)</label>
              <input
                type="text"
                value={editingEpisode.video_url || ''}
                onChange={(e) => setEditingEpisode({ ...editingEpisode, video_url: e.target.value })}
                placeholder="https://example.com/stream.m3u8"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Thumbnail Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingEpisode.thumbnail || ''}
                  onChange={(e) => setEditingEpisode({ ...editingEpisode, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingThumb ? 'Uploading...' : 'Upload'}</span>
                  <input type="file" onChange={handleThumbnailUpload} accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Duration (e.g. 22m, 45m)</label>
                <input
                  type="text"
                  value={editingEpisode.duration || '22m'}
                  onChange={(e) => setEditingEpisode({ ...editingEpisode, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Air Date</label>
                <input
                  type="date"
                  value={editingEpisode.release_date || ''}
                  onChange={(e) => setEditingEpisode({ ...editingEpisode, release_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description / Summary</label>
              <textarea
                rows={3}
                value={editingEpisode.description || ''}
                onChange={(e) => setEditingEpisode({ ...editingEpisode, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                placeholder="Episode recap / story summary..."
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
                Save Episode
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Episode Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Episode"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Are you sure you want to delete this episode and its media stream servers?
          </p>
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
