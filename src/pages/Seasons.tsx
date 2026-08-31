import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { seasonApi } from '../api/seasonApi';
import { serialApi } from '../api/serialApi';
import { uploadApi } from '../api/uploadApi';
import { Season, Serial } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import {
  Film,
  Plus,
  Tv,
  Edit2,
  Trash2,
  PlayCircle,
  Upload,
  Calendar,
} from 'lucide-react';

export const Seasons: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serialIdParam = searchParams.get('serial_id');

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [serials, setSerials] = useState<Serial[]>([]);
  const [selectedSerialId, setSelectedSerialId] = useState<string>(serialIdParam || '');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Partial<Season> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const { showToast } = useToast();

  const loadSerials = async () => {
    try {
      const res = await serialApi.getAll({ limit: 100 });
      if (res.success) setSerials(res.data);
    } catch (err) {}
  };

  const loadSeasons = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedSerialId) params.serial_id = selectedSerialId;

      const res = await seasonApi.getAll(params);
      if (res.success) setSeasons(res.data);
    } catch (err) {
      showToast('Failed to load seasons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSerials();
  }, []);

  useEffect(() => {
    loadSeasons();
  }, [selectedSerialId]);

  const handleSerialChange = (id: string) => {
    setSelectedSerialId(id);
    if (id) {
      setSearchParams({ serial_id: id });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenCreateModal = () => {
    const parentSerialId = selectedSerialId ? Number(selectedSerialId) : serials[0]?.id || 1;
    setEditingSeason({
      serial_id: parentSerialId,
      season_number: seasons.length + 1,
      title: `Season ${seasons.length + 1}`,
      description: '',
      poster: '',
      release_date: new Date().toISOString().split('T')[0],
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (season: Season) => {
    setEditingSeason(season);
    setIsModalOpen(true);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);
    try {
      const res = await uploadApi.uploadFile(file);
      if (res.success && editingSeason) {
        setEditingSeason({ ...editingSeason, poster: res.data.url });
        showToast('Season poster uploaded');
      }
    } catch (err) {
      showToast('Failed to upload poster', 'error');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSaveSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeason || !editingSeason.title || !editingSeason.serial_id) return;

    try {
      if (editingSeason.id) {
        const res = await seasonApi.update(editingSeason.id, editingSeason);
        if (res.success) {
          showToast('Season updated successfully');
          setIsModalOpen(false);
          loadSeasons();
        }
      } else {
        const res = await seasonApi.create(editingSeason);
        if (res.success) {
          showToast('Season created successfully');
          setIsModalOpen(false);
          loadSeasons();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving season', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await seasonApi.delete(deletingId);
      if (res.success) {
        showToast('Season deleted');
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        loadSeasons();
      }
    } catch (err) {
      showToast('Failed to delete season', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <span>Season Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize serial seasons, episode sequences, and cover art
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Season</span>
        </button>
      </div>

      {/* Serial Selector Filter */}
      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <Tv className="w-4 h-4 text-indigo-400 shrink-0" />
        <label className="text-xs font-medium text-slate-300">Filter by Serial:</label>
        <select
          value={selectedSerialId}
          onChange={(e) => handleSerialChange(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none flex-1 max-w-xs"
        >
          <option value="">All TV Serials</option>
          {serials.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Season Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading seasons...</div>
      ) : seasons.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-2xl">
          No seasons found. Select a serial or click "Add Season" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((season) => (
            <div
              key={season.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-4 hover:border-slate-700 transition"
            >
              {season.poster ? (
                <img
                  src={season.poster}
                  alt={season.title}
                  className="w-20 h-28 object-cover rounded-xl shrink-0 border border-slate-800"
                />
              ) : (
                <div className="w-20 h-28 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <Film className="w-6 h-6 text-slate-600" />
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold text-[10px]">
                      Season {season.season_number}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {season.release_date || 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1 truncate">{season.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{season.serial_title}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-2">
                  <Link
                    to={`/episodes?season_id=${season.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:underline"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{season.total_episodes || 0} Episodes</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(season)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                      title="Edit Season"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(season.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete Season"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Season Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSeason?.id ? 'Edit Season' : 'Create Season'}
        maxWidth="lg"
      >
        {editingSeason && (
          <form onSubmit={handleSaveSeason} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Serial *</label>
              <select
                value={editingSeason.serial_id || serials[0]?.id || 1}
                onChange={(e) => setEditingSeason({ ...editingSeason, serial_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              >
                {serials.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Season Number *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingSeason.season_number || 1}
                  onChange={(e) =>
                    setEditingSeason({
                      ...editingSeason,
                      season_number: Number(e.target.value),
                      title: `Season ${e.target.value}`,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingSeason.title || ''}
                  onChange={(e) => setEditingSeason({ ...editingSeason, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Season Poster Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingSeason.poster || ''}
                  onChange={(e) => setEditingSeason({ ...editingSeason, poster: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPoster ? 'Uploading...' : 'Upload'}</span>
                  <input type="file" onChange={handlePosterUpload} accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Release Date</label>
              <input
                type="date"
                value={editingSeason.release_date || ''}
                onChange={(e) => setEditingSeason({ ...editingSeason, release_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={editingSeason.description || ''}
                onChange={(e) => setEditingSeason({ ...editingSeason, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                placeholder="Season plot overview..."
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
                Save Season
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Season Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Season"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Deleting this season will also delete all episodes and streaming media sources attached to it.
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
