import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryItem, ResourceCategory } from '../../types';
import { Save, Layers, Edit } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, updateCategory } = useApp();

  const [editingId, setEditingId] = useState<ResourceCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCategory(editingId, { name, description });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white">Categories Management</h3>
          <p className="text-xs text-slate-400">Customize category titles and descriptions</p>
        </div>
      </div>

      {editingId && (
        <form onSubmit={handleSave} className="p-4 rounded-2xl bg-slate-900 border border-[#5DE2E7]/40 space-y-3">
          <h4 className="font-bold text-white">Edit Category: {editingId}</h4>
          <div>
            <label className="block text-slate-300 font-bold mb-1">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#5DE2E7] text-slate-950 font-bold"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map(cat => (
          <div key={cat.id} className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">{cat.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{cat.description}</div>
              <div className="text-[10px] text-[#5DE2E7] font-mono mt-1">ID: {cat.id}</div>
            </div>
            <button
              onClick={() => startEdit(cat)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
