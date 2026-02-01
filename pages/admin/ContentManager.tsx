import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { Content } from '../../types';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

export const ContentManager: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Content>();

  const fetchContent = async () => {
    const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setContents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Content)));
  };

  useEffect(() => { fetchContent(); }, []);

  const onSubmit = async (data: Content) => {
    try {
      // Process genres string to array if needed (simplified for this demo)
      const formattedData = {
        ...data,
        // Convert comma-separated string to array if user typed it manually
        genres: typeof data.genres === 'string' ? (data.genres as string).split(',').map((g: string) => g.trim()) : data.genres,
        cast: typeof data.cast === 'string' ? (data.cast as string).split(',').map((c: string) => c.trim()) : data.cast || [],
        tags: typeof data.tags === 'string' ? (data.tags as string).split(',').map((t: string) => t.trim()) : data.tags || [],
        vote_average: Number(data.vote_average)
      };

      if (editingId) {
        await updateDoc(doc(db, 'content', editingId), formattedData);
      } else {
        await addDoc(collection(db, 'content'), {
          ...formattedData,
          createdAt: new Date().toISOString()
        });
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
      fetchContent();
    } catch (e) {
      alert("Error saving content: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await deleteDoc(doc(db, 'content', id));
      fetchContent();
    }
  };

  const startEdit = (content: Content) => {
    setEditingId(content.id);
    setValue('title', content.title);
    setValue('overview', content.overview);
    setValue('poster_path', content.poster_path);
    setValue('backdrop_path', content.backdrop_path);
    setValue('youtubeId', content.youtubeId);
    setValue('type', content.type);
    setValue('genres', content.genres);
    setValue('cast', content.cast);
    setValue('tags', content.tags);
    setValue('vote_average', content.vote_average);
    setValue('release_date', content.release_date);
    setIsEditing(true);
  };

  return (
    <AdminLayout title="Content Management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-400">Manage Movies & TV Shows</h2>
        <button
          onClick={() => { reset(); setEditingId(null); setIsEditing(true); }}
          className="bg-[#e50914] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700 transition"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Content' : 'Add Content'}</h3>
              <button onClick={() => setIsEditing(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input {...register('title', { required: true })} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="Stranger Things" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select {...register('type')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 outline-none">
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Overview</label>
                <textarea {...register('overview')} rows={4} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="Movie description..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                  <input {...register('poster_path')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Backdrop URL</label>
                  <input {...register('backdrop_path')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">YouTube ID</label>
                  <input {...register('youtubeId')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="dQw4w9WgXcQ" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rating (0-10)</label>
                  <input type="number" step="0.1" {...register('vote_average')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Release Year</label>
                  <input {...register('release_date')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="2023" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Genres (comma separated)</label>
                <input {...register('genres')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="Action, Sci-Fi" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Cast (comma separated)</label>
                <input {...register('cast')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="Tom Cruise, Emily Blunt" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
                <input {...register('tags')} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 focus:border-white outline-none" placeholder="Exciting, Thrilling" />
              </div>

              <button type="submit" className="w-full bg-[#e50914] py-3 rounded font-bold hover:bg-red-700 transition mt-4">Save Content</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#1f1f1f] rounded-lg border border-gray-800 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-[#141414] text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {contents.map(c => (
              <tr key={c.id} className="hover:bg-[#2a2a2a]">
                <td className="p-4 font-medium flex items-center gap-3">
                  <img src={c.poster_path} className="w-8 h-12 object-cover rounded bg-gray-700" alt="" />
                  {c.title}
                </td>
                <td className="p-4 text-gray-400 capitalize">{c.type}</td>
                <td className="p-4 text-green-500">{c.vote_average}</td>
                <td className="p-4 text-right">
                  <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-white mr-3"><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contents.length === 0 && <div className="p-8 text-center text-gray-500">No content found. Please add some movies.</div>}
      </div>
    </AdminLayout>
  );
};