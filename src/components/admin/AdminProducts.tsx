import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Resource, ResourceCategory } from '../../types';
import { Plus, Edit, Trash2, Copy, Check, X, Smartphone, Layout, Bot, Sliders, Monitor, Image } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { resources, addResource, updateResource, deleteResource, cloneResource } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('apps');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [fileSize, setFileSize] = useState('10 MB');
  const [downloadUrl, setDownloadUrl] = useState('https://t.me/OnlineTaskLab');
  const [telegramUrl, setTelegramUrl] = useState('https://t.me/OnlineTaskLab');
  const [tagsInput, setTagsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  // Category specific fields
  const [apkVersion, setApkVersion] = useState('');
  const [requirements, setRequirements] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [promptText, setPromptText] = useState('');
  const [aiModel, setAiModel] = useState<any>('Midjourney V6');
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [presetFormat, setPresetFormat] = useState<any>('.DNG');
  const [softwareVersion, setSoftwareVersion] = useState('');

  const openNewForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory('apps');
    setShortDescription('');
    setFullDescription('');
    setThumbnail('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80');
    setVersion('v1.0');
    setFileSize('25 MB');
    setDownloadUrl('https://t.me/OnlineTaskLab');
    setTelegramUrl('https://t.me/OnlineTaskLab');
    setTagsInput('OTL, Resource');
    setIsFeatured(false);
    setIsTrending(false);
    setApkVersion('');
    setRequirements('Android 8.0+');
    setDemoUrl('');
    setPromptText('');
    setBeforeImage('');
    setAfterImage('');
    setSoftwareVersion('');
  };

  const openEditForm = (res: Resource) => {
    setIsEditing(true);
    setEditingId(res.id);
    setTitle(res.title);
    setSlug(res.slug);
    setCategory(res.category);
    setShortDescription(res.shortDescription);
    setFullDescription(res.fullDescription);
    setThumbnail(res.thumbnail);
    setVersion(res.version);
    setFileSize(res.fileSize);
    setDownloadUrl(res.downloadUrl);
    setTelegramUrl(res.telegramUrl);
    setTagsInput(res.tags ? res.tags.join(', ') : '');
    setIsFeatured(res.isFeatured);
    setIsTrending(res.isTrending);

    setApkVersion(res.apkVersion || '');
    setRequirements(res.requirements || '');
    setDemoUrl(res.demoUrl || '');
    setPromptText(res.promptText || '');
    setAiModel(res.aiModel || 'Midjourney V6');
    setBeforeImage(res.beforeImage || '');
    setAfterImage(res.afterImage || '');
    setPresetFormat(res.presetFormat || '.DNG');
    setSoftwareVersion(res.softwareVersion || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArr = tagsInput
      ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const formData = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      category,
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      thumbnail,
      version,
      fileSize,
      downloadUrl,
      telegramUrl,
      tags: tagsArr,
      isFeatured,
      isTrending,
      apkVersion,
      requirements,
      demoUrl,
      promptText,
      aiModel,
      beforeImage,
      afterImage,
      presetFormat,
      softwareVersion
    };

    if (editingId) {
      updateResource(editingId, formData);
    } else {
      addResource(formData as any);
    }

    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white">Resource Products Manager</h3>
          <p className="text-xs text-slate-400">Add, edit, delete, or clone resources across all categories</p>
        </div>
        <button
          onClick={openNewForm}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add New Resource
        </button>
      </div>

      {/* Edit / Add Modal Form */}
      {isEditing && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-[#5DE2E7]/40 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white">
              {editingId ? 'Edit Product Details' : 'Create New Digital Resource'}
            </h4>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ResourceCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
                >
                  <option value="apps">Mobile Apps (Mod APK)</option>
                  <option value="landing-pages">Landing Pages</option>
                  <option value="ai-prompts">AI Prompts</option>
                  <option value="lr-presets">Lightroom Presets</option>
                  <option value="pc-software">PC Software</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">File Size</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={e => setFileSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={e => setThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Short Description *</label>
              <textarea
                required
                rows={2}
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Description / Changelog</label>
              <textarea
                rows={3}
                value={fullDescription}
                onChange={e => setFullDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Telegram Download Link *</label>
                <input
                  type="text"
                  required
                  value={downloadUrl}
                  onChange={e => setDownloadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Telegram Post / Channel URL</label>
                <input
                  type="text"
                  value={telegramUrl}
                  onChange={e => setTelegramUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-[#5DE2E7]"
                />
              </div>
            </div>

            {/* Category Specific Input Fields */}
            {category === 'ai-prompts' && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <label className="block text-purple-300 font-bold">AI Master Prompt Text</label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Paste Midjourney or ChatGPT system prompt here..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none font-mono"
                />
              </div>
            )}

            {category === 'lr-presets' && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <label className="block text-amber-300 font-bold">Lightroom Before & After Image URLs</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={beforeImage}
                    onChange={e => setBeforeImage(e.target.value)}
                    placeholder="Before Image URL"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                  <input
                    type="text"
                    value={afterImage}
                    onChange={e => setAfterImage(e.target.value)}
                    placeholder="After Image URL"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded text-[#5DE2E7]"
                />
                <span>Toggle Featured Item</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={e => setIsTrending(e.target.checked)}
                  className="rounded text-[#5DE2E7]"
                />
                <span>Toggle Trending Item</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#5DE2E7] text-slate-950 font-extrabold shadow-lg"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl bg-slate-950/80 border border-white/10 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 border-b border-white/10 text-white uppercase text-[10px] font-extrabold tracking-wider">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Version / Size</th>
              <th className="p-3">Downloads</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {resources.map(res => (
              <tr key={res.id} className="hover:bg-white/5">
                <td className="p-3 flex items-center gap-3">
                  <img src={res.thumbnail} alt={res.title} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-white line-clamp-1">{res.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {res.id}</div>
                  </div>
                </td>
                <td className="p-3 capitalize font-semibold text-[#5DE2E7]">{res.category}</td>
                <td className="p-3">{res.version} ({res.fileSize})</td>
                <td className="p-3 font-mono text-cyan-300">{res.downloadsCount.toLocaleString()}</td>
                <td className="p-3">
                  {res.isFeatured && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] mr-1">Featured</span>}
                  {res.isTrending && <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px]">Trending</span>}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditForm(res)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => cloneResource(res.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300"
                      title="Clone"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteResource(res.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-red-900/50 text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
