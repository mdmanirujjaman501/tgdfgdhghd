import React, { useEffect, useState } from 'react';
import { serialApi } from '../api/serialApi';
import { taxonomyApi } from '../api/taxonomyApi';
import { uploadApi } from '../api/uploadApi';
import { Serial, Category } from '../types';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { useToast } from '../components/common/Toast';
import {
  Tv,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Star,
  Eye,
  Download,
  Film,
  Upload,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Serials: React.FC = () => {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSerial, setEditingSerial] = useState<Partial<Serial> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { showToast } = useToast();

  const loadSerials = async () => {
    setLoading(true);
    try {
      const res = await serialApi.getAll({
        page,
        limit: 10,
        search,
        category_id: selectedCategory,
        status: selectedStatus,
      });
      if (res.success) {
        setSerials(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.total_pages);
          setTotalItems(res.pagination.total);
        }
      }
    } catch (err) {
      showToast('Failed to load serials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSerials();
  }, [page, search, selectedCategory, selectedStatus]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await taxonomyApi.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {}
    };
    loadCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSerial({
      title: '',
      slug: '',
      category_id: categories[0]?.id || 1,
      description: '',
      short_description: '',
      poster: '',
      banner: '',
      trailer_url: '',
      release_date: new Date().toISOString().split('T')[0],
      language: 'Hindi',
      country: 'India',
      status: 'published',
      rating: 8.5,
      featured: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (serial: Serial) => {
    setEditingSerial(serial);
    setIsModalOpen(true);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);
    try {
      const res = await uploadApi.uploadFile(file);
      if (res.success && editingSerial) {
        setEditingSerial({ ...editingSerial, poster: res.data.url });
        showToast('Poster uploaded successfully');
      }
    } catch (err) {
      showToast('Failed to upload poster', 'error');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const res = await uploadApi.uploadFile(file);
      if (res.success && editingSerial) {
        setEditingSerial({ ...editingSerial, banner: res.data.url });
        showToast('Banner uploaded successfully');
      }
    } catch (err) {
      showToast('Failed to upload banner', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSerial || !editingSerial.title) return;

    // auto generate slug if empty
    if (!editingSerial.slug) {
      editingSerial.slug = editingSerial.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    try {
      if (editingSerial.id) {
        const res = await serialApi.update(editingSerial.id, editingSerial);
        if (res.success) {
          showToast('Serial updated successfully');
          setIsModalOpen(false);
          loadSerials();
        }
      } else {
        const res = await serialApi.create(editingSerial);
        if (res.success) {
          showToast('Serial created successfully');
          setIsModalOpen(false);
          loadSerials();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving serial', 'error');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await serialApi.toggleAttribute(id, 'status');
      if (res.success) {
        showToast('Status toggled successfully');
        loadSerials();
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const res = await serialApi.toggleAttribute(id, 'featured');
      if (res.success) {
        showToast('Featured flag updated');
        loadSerials();
      }
    } catch (err) {
      showToast('Failed to toggle featured', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await serialApi.delete(deletingId);
      if (res.success) {
        showToast('Serial deleted successfully');
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        loadSerials();
      }
    } catch (err) {
      showToast('Failed to delete serial', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Tv className="w-5 h-5 text-indigo-400" />
            <span>TV Serial Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage TV serials, titles, posters, ratings, and publish status
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Serial</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search serials by title or description..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Serial</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Seasons / Episodes</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading TV serials...
                  </td>
                </tr>
              ) : serials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No TV serials found matching your filters.
                  </td>
                </tr>
              ) : (
                serials.map((serial) => (
                  <tr key={serial.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {serial.poster ? (
                          <img
                            src={serial.poster}
                            alt={serial.title}
                            className="w-10 h-14 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                            <Tv className="w-5 h-5 text-slate-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-100">{serial.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">/{serial.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {serial.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/seasons?serial_id=${serial.id}`}
                          className="inline-flex items-center gap-1 text-indigo-400 hover:underline font-medium"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>{serial.total_seasons || 0} Seasons</span>
                        </Link>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{serial.total_episodes || 0} Ep</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-400">
                      ⭐ {serial.rating}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(serial.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
                          serial.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {serial.status === 'published' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{serial.status}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(serial.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          serial.featured
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(serial)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                          title="Edit Serial"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(serial.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                          title="Delete Serial"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSerial?.id ? 'Edit TV Serial' : 'Create TV Serial'}
        maxWidth="2xl"
      >
        {editingSerial && (
          <form onSubmit={handleSaveSerial} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Serial Title *</label>
                <input
                  type="text"
                  required
                  value={editingSerial.title || ''}
                  onChange={(e) =>
                    setEditingSerial({
                      ...editingSerial,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Anupamaa"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={editingSerial.slug || ''}
                  onChange={(e) => setEditingSerial({ ...editingSerial, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. anupamaa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={editingSerial.category_id || categories[0]?.id || 1}
                  onChange={(e) => setEditingSerial({ ...editingSerial, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Status</label>
                <select
                  value={editingSerial.status || 'published'}
                  onChange={(e) => setEditingSerial({ ...editingSerial, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Rating (1-10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editingSerial.rating || 8.5}
                  onChange={(e) => setEditingSerial({ ...editingSerial, rating: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Poster URL & Upload */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">Poster Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingSerial.poster || ''}
                  onChange={(e) => setEditingSerial({ ...editingSerial, poster: e.target.value })}
                  placeholder="https://... or upload poster below"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPoster ? 'Uploading...' : 'Upload File'}</span>
                  <input type="file" onChange={handlePosterUpload} accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            {/* Banner URL & Upload */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">Banner Header Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingSerial.banner || ''}
                  onChange={(e) => setEditingSerial({ ...editingSerial, banner: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBanner ? 'Uploading...' : 'Upload File'}</span>
                  <input type="file" onChange={handleBannerUpload} accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Trailer URL (YouTube/MP4)</label>
                <input
                  type="text"
                  value={editingSerial.trailer_url || ''}
                  onChange={(e) => setEditingSerial({ ...editingSerial, trailer_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Language</label>
                <input
                  type="text"
                  value={editingSerial.language || 'Hindi'}
                  onChange={(e) => setEditingSerial({ ...editingSerial, language: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Release Date</label>
                <input
                  type="date"
                  value={editingSerial.release_date || ''}
                  onChange={(e) => setEditingSerial({ ...editingSerial, release_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Synopsis / Story Description</label>
              <textarea
                rows={4}
                value={editingSerial.description || ''}
                onChange={(e) => setEditingSerial({ ...editingSerial, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                placeholder="Detailed plot synopsis and serial background..."
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
                Save Serial
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Are you sure you want to delete this TV serial? All linked seasons, episodes, and media sources will be permanently removed!
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
