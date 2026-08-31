import React, { useEffect, useState } from 'react';
import { actorApi } from '../api/actorApi';
import { uploadApi } from '../api/uploadApi';
import { Actor } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { Clapperboard, Plus, Search, Edit2, Trash2, Upload, User } from 'lucide-react';

export const Actors: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<Partial<Actor> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { showToast } = useToast();

  const loadActors = async () => {
    setLoading(true);
    try {
      const res = await actorApi.getAll({ search });
      if (res.success) setActors(res.data);
    } catch (err) {
      showToast('Failed to load actors directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActors();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingActor({ name: '', slug: '', biography: '', avatar: '', nationality: 'Indian' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (actor: Actor) => {
    setEditingActor(actor);
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await uploadApi.uploadFile(file);
      if (res.success && editingActor) {
        setEditingActor({ ...editingActor, avatar: res.data.url });
        showToast('Actor avatar uploaded');
      }
    } catch (err) {
      showToast('Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActor || !editingActor.name) return;

    if (!editingActor.slug) {
      editingActor.slug = editingActor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    try {
      if (editingActor.id) {
        const res = await actorApi.update(editingActor.id, editingActor);
        if (res.success) {
          showToast('Actor profile updated');
          setIsModalOpen(false);
          loadActors();
        }
      } else {
        const res = await actorApi.create(editingActor);
        if (res.success) {
          showToast('Actor profile created');
          setIsModalOpen(false);
          loadActors();
        }
      }
    } catch (err) {
      showToast('Error saving actor profile', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await actorApi.delete(deletingId);
      if (res.success) {
        showToast('Actor removed');
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        loadActors();
      }
    } catch (err) {
      showToast('Failed to delete actor', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-indigo-400" />
            <span>Actors & Cast Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain celebrity profiles, avatars, biographies, and serial casting assignments
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Actor Profile</span>
        </button>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor name or bio..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">Loading actors...</div>
        ) : actors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-2xl">
            No actors found.
          </div>
        ) : (
          actors.map((actor) => (
            <div
              key={actor.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-4 hover:border-slate-700 transition"
            >
              {actor.avatar ? (
                <img
                  src={actor.avatar}
                  alt={actor.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-800"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-slate-500" />
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 truncate">{actor.name}</h3>
                  <div className="text-[10px] text-indigo-400 font-mono">/{actor.slug}</div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {actor.biography || 'No biography details recorded.'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-3">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {actor.serials_count || 0} serials
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(actor)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(actor.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActor?.id ? 'Edit Actor Profile' : 'Add Actor Profile'}
        maxWidth="lg"
      >
        {editingActor && (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingActor.name || ''}
                  onChange={(e) =>
                    setEditingActor({
                      ...editingActor,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                  placeholder="e.g. Rupali Ganguly"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Slug</label>
                <input
                  type="text"
                  value={editingActor.slug || ''}
                  onChange={(e) => setEditingActor({ ...editingActor, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Avatar Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingActor.avatar || ''}
                  onChange={(e) => setEditingActor({ ...editingActor, avatar: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
                <label className="cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Upload'}</span>
                  <input type="file" onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Birth Date</label>
                <input
                  type="date"
                  value={editingActor.birth_date || ''}
                  onChange={(e) => setEditingActor({ ...editingActor, birth_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nationality</label>
                <input
                  type="text"
                  value={editingActor.nationality || 'Indian'}
                  onChange={(e) => setEditingActor({ ...editingActor, nationality: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Biography / Career Summary</label>
              <textarea
                rows={4}
                value={editingActor.biography || ''}
                onChange={(e) => setEditingActor({ ...editingActor, biography: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
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
                Save Actor
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Actor Profile"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">Are you sure you want to delete this actor profile?</p>
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
