import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryItem } from '../../types';
import { CategoryIcon, ICON_OPTIONS } from '../CategoryIcon';
import { Plus, Edit, Trash2, ExternalLink, Save, X, Sparkles, Layers, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCategories: React.FC = () => {
  const { categories, resources, addCategory, updateCategory, deleteCategory, showToast } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string; count: number } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Layers');
  const [banner, setBanner] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setIcon('Layers');
    setBanner('');
    setAutoSlug(true);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug && !editingId) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (cat: CategoryItem) => {
    resetForm();
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug || cat.id);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Layers');
    setBanner(cat.banner || '');
    setAutoSlug(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required');
      return;
    }

    const finalSlug = (slug.trim() || name.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!finalSlug) {
      showToast('A valid slug/ID is required');
      return;
    }

    if (editingId) {
      // Update existing category
      updateCategory(editingId, {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        icon,
        banner: banner.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
      });
      showToast(`Category "${name}" updated successfully!`);
    } else {
      // Check duplicate ID
      if (categories.some(c => c.id.toLowerCase() === finalSlug.toLowerCase())) {
        showToast('A category with this ID already exists. Please choose a different slug.');
        return;
      }

      const newCat: CategoryItem = {
        id: finalSlug,
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || `Explore the best curated ${name} resources on Online Task Lab.`,
        icon,
        banner: banner.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        itemCount: 0
      };

      addCategory(newCat);
      showToast(`Category "${name}" created! Available across site navigation & pages.`);
    }

    resetForm();
  };

  const promptDelete = (cat: CategoryItem) => {
    const resourceCount = resources.filter(r => r.category === cat.id).length;
    setCategoryToDelete({
      id: cat.id,
      name: cat.name,
      count: resourceCount
    });
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;
    deleteCategory(categoryToDelete.id);
    if (editingId === categoryToDelete.id) resetForm();
    showToast(`Category "${categoryToDelete.name}" deleted.`);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#5DE2E7]" />
            <span>Categories Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit and manage website categories. Any category added here is automatically generated across Header, Mobile Menu, Homepage Grid, Filters, and dedicated Category Pages.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#133E87] via-cyan-500 to-[#5DE2E7] hover:brightness-110 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(93,226,231,0.4)] transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Create New Category</span>
        </button>
      </div>

      {/* Create / Edit Form Modal */}
      {(isCreating || editingId) && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl bg-slate-900/90 border border-[#5DE2E7]/40 shadow-[0_0_25px_rgba(93,226,231,0.15)] space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5DE2E7]" />
              <span>{editingId ? `Edit Category: ${name || editingId}` : 'Create New Category'}</span>
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PC Software, UI/UX Kits, Video Templates"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#5DE2E7]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-bold">
                  Slug / Unique ID <span className="text-red-400">*</span>
                </label>
                {!editingId && (
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[10px] text-[#5DE2E7] hover:underline"
                  >
                    {autoSlug ? 'Manual ID' : 'Auto generate'}
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                disabled={!!editingId}
                placeholder="e.g. pc-software, ui-ux-kits"
                value={slug}
                onChange={e => {
                  setAutoSlug(false);
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-white font-mono text-xs focus:outline-none focus:border-[#5DE2E7] ${
                  editingId ? 'opacity-60 cursor-not-allowed border-white/5' : 'border-white/10'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Page URL will be: <span className="text-[#5DE2E7] font-mono">/category/{slug || 'your-id'}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Short description displayed on category cards and hero banners..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#5DE2E7]"
            />
          </div>

          {/* Icon Selector Grid */}
          <div>
            <label className="block text-slate-300 font-bold mb-2 flex items-center justify-between">
              <span>Choose Icon</span>
              <span className="text-[11px] text-[#5DE2E7] flex items-center gap-1.5">
                Current: <CategoryIcon name={icon} className="w-4 h-4 inline" /> {icon}
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-white/10">
              {ICON_OPTIONS.map(opt => {
                const IconComponent = opt.icon;
                const isSelected = icon === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setIcon(opt.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] transition-all gap-1 ${
                      isSelected
                        ? 'bg-[#5DE2E7]/20 border-[#5DE2E7] text-white shadow-[0_0_10px_rgba(93,226,231,0.3)]'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={opt.label}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#5DE2E7]' : 'text-slate-300'}`} />
                    <span className="truncate w-full text-center">{opt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#5DE2E7]" />
              <span>Category Banner Image URL (Optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={banner}
                onChange={e => setBanner(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#5DE2E7]"
              />
              <button
                type="button"
                onClick={() => setBanner('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold whitespace-nowrap"
              >
                Default Banner
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5DE2E7] hover:bg-[#4bcad0] text-slate-950 font-extrabold flex items-center gap-2 shadow-[0_0_15px_rgba(93,226,231,0.4)]"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Save Changes' : 'Publish Category'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Active Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const count = resources.filter(r => r.category === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-[#5DE2E7]/40 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top banner preview */}
              {cat.banner && (
                <div
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-cover bg-center pointer-events-none"
                  style={{ backgroundImage: `url(${cat.banner})` }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#133E87] to-slate-900 border border-[#5DE2E7]/30 flex items-center justify-center shadow-[0_0_10px_rgba(93,226,231,0.2)]">
                      <CategoryIcon name={cat.icon || cat.id} className="w-5 h-5 text-[#5DE2E7]" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-sm group-hover:text-[#5DE2E7] transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-[#5DE2E7] font-mono">
                        /category/{cat.id}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <Link
                  to={`/category/${cat.id}`}
                  target="_blank"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#5DE2E7] hover:underline"
                >
                  <span>View Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-[#5DE2E7] hover:text-slate-950 text-slate-300 transition"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => promptDelete(cat)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-App Delete Confirmation Modal (Works smoothly in all browsers & iframes) */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)] space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">Delete Category?</h4>
                <p className="text-xs text-slate-300">
                  Are you sure you want to delete <span className="text-[#5DE2E7] font-bold">"{categoryToDelete.name}"</span>?
                </p>
              </div>
            </div>

            {categoryToDelete.count > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> There are currently <strong>{categoryToDelete.count}</strong> resource product(s) assigned to this category.
                </span>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              This action will remove the category from the header navigation, mobile sidebar menu, homepage category grid, filters, and dynamic category pages.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
