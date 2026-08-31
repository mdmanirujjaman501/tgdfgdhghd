import React, { useEffect, useState } from 'react';
import { taxonomyApi } from '../api/taxonomyApi';
import { Genre, Language, Country, Tag } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { Tag as TagIcon, Plus, Globe, Languages as LanguageIcon, Edit2, Trash2 } from 'lucide-react';

export const Genres: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'genres' | 'languages' | 'countries' | 'tags'>('genres');

  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'genres') {
        const res = await taxonomyApi.getGenres();
        if (res.success) setGenres(res.data);
      } else if (activeTab === 'languages') {
        const res = await taxonomyApi.getLanguages();
        if (res.success) setLanguages(res.data);
      } else if (activeTab === 'countries') {
        const res = await taxonomyApi.getCountries();
        if (res.success) setCountries(res.data);
      } else if (activeTab === 'tags') {
        const res = await taxonomyApi.getTags();
        if (res.success) setTags(res.data);
      }
    } catch (err) {
      showToast('Failed to load taxonomy data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleOpenAdd = () => {
    if (activeTab === 'genres') setFormData({ name: '', slug: '', description: '' });
    if (activeTab === 'languages') setFormData({ name: '', code: '' });
    if (activeTab === 'countries') setFormData({ name: '', code: '' });
    if (activeTab === 'tags') setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'genres') {
        const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await taxonomyApi.createGenre({ ...formData, slug });
        showToast('Genre added');
      } else if (activeTab === 'languages') {
        await taxonomyApi.createLanguage(formData);
        showToast('Language added');
      } else if (activeTab === 'countries') {
        await taxonomyApi.createCountry(formData);
        showToast('Country added');
      } else if (activeTab === 'tags') {
        await taxonomyApi.createTag(formData);
        showToast('Tag added');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Failed to save item', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-indigo-400" />
            <span>Taxonomies & Attributes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage genres, audio languages, origin countries, and search tags
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="capitalize">Add {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        {[
          { id: 'genres', label: 'Genres', icon: <TagIcon className="w-4 h-4" /> },
          { id: 'languages', label: 'Audio Languages', icon: <LanguageIcon className="w-4 h-4" /> },
          { id: 'countries', label: 'Countries', icon: <Globe className="w-4 h-4" /> },
          { id: 'tags', label: 'Search Tags', icon: <TagIcon className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-1 flex items-center gap-2 transition border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Name</th>
              {(activeTab === 'languages' || activeTab === 'countries') && <th className="py-3 px-4">Code</th>}
              {activeTab === 'genres' && <th className="py-3 px-4">Slug</th>}
              {activeTab === 'genres' && <th className="py-3 px-4">Description</th>}
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Loading taxonomy entries...
                </td>
              </tr>
            ) : activeTab === 'genres' ? (
              genres.map((g) => (
                <tr key={g.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-100">{g.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">/{g.slug}</td>
                  <td className="py-3 px-4 text-slate-400">{g.description || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-400">Active</td>
                </tr>
              ))
            ) : activeTab === 'languages' ? (
              languages.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-100">{l.name}</td>
                  <td className="py-3 px-4 font-mono text-indigo-400">{l.code}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-400">Active</td>
                </tr>
              ))
            ) : activeTab === 'countries' ? (
              countries.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-100">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-indigo-400">{c.code}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-400">Active</td>
                </tr>
              ))
            ) : (
              tags.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-100">#{t.name}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-400">Active</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${activeTab}`} maxWidth="sm">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
            />
          </div>

          {(activeTab === 'languages' || activeTab === 'countries') && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">ISO Code (e.g. hi, en, IN) *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
              />
            </div>
          )}

          {activeTab === 'genres' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/20"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
