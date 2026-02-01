import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, orderBy, query } from 'firebase/firestore';
import { Section } from '../../types';
import { Trash2, Plus, Move } from 'lucide-react';

export const SectionManager: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('genre');
  const [newFilter, setNewFilter] = useState('');
  const [newScope, setNewScope] = useState<'home' | 'tv' | 'movie' | 'new'>('home');

  const fetchSections = async () => {
    const q = query(collection(db, 'sections'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    setSections(snap.docs.map(d => ({ id: d.id, ...d.data() } as Section)));
  };

  useEffect(() => { fetchSections(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'sections'), {
        title: newTitle,
        type: newType,
        genreFilter: newFilter,
        scope: newScope,
        order: sections.length + 1,
        enabled: true
    });
    setNewTitle('');
    setNewFilter('');
    fetchSections();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'sections', id));
    fetchSections();
  };

  return (
    <AdminLayout title="Homepage Layout">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
               <div className="bg-[#1f1f1f] rounded-lg border border-gray-800 p-6">
                  <h3 className="font-bold mb-4">Current Sections</h3>
                  <div className="space-y-3">
                      {sections.map((s, idx) => (
                          <div key={s.id} className="flex items-center justify-between bg-[#2a2a2a] p-4 rounded border border-gray-700">
                             <div className="flex items-center gap-4">
                                 <span className="text-gray-500 font-mono">#{idx + 1}</span>
                                 <div>
                                     <div className="font-bold">{s.title}</div>
                                     <div className="text-xs text-gray-400 capitalize">
                                       {s.type} {s.genreFilter && `(${s.genreFilter})`} • <span className="uppercase">{(s.scope || 'home').replace('new','New & Popular')}</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-2">
                                 <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><Trash2 size={16}/></button>
                             </div>
                          </div>
                      ))}
                      {sections.length === 0 && <p className="text-gray-500 text-center py-4">No sections configured.</p>}
                  </div>
               </div>
           </div>

           <div>
              <div className="bg-[#1f1f1f] rounded-lg border border-gray-800 p-6 sticky top-24">
                  <h3 className="font-bold mb-4">Add New Section</h3>
                  <form onSubmit={handleAdd} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Section Title</label>
                          <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 text-sm" placeholder="e.g. Action Movies" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Appears On</label>
                          <select value={newScope} onChange={e => setNewScope(e.target.value as any)} className="w-full bg-[#333] rounded p-2 text_white border border-gray-600 text-sm">
                              <option value="home">Home</option>
                              <option value="tv">TV Shows</option>
                              <option value="movie">Movies</option>
                              <option value="new">New &amp; Popular</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Type</label>
                          <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 text-sm">
                              <option value="trending">Trending Now (Auto)</option>
                              <option value="originals">Originals (Auto)</option>
                              <option value="genre">By Genre</option>
                          </select>
                      </div>
                      {newType === 'genre' && (
                          <div>
                              <label className="block text-xs text-gray-400 mb-1">Genre</label>
                              <input required value={newFilter} onChange={e => setNewFilter(e.target.value)} className="w-full bg-[#333] rounded p-2 text-white border border-gray-600 text-sm" placeholder="e.g. Action" />
                          </div>
                      )}
                      <button type="submit" className="w-full bg-[#e50914] py-2 rounded font-bold hover:bg-red-700 transition text-sm">Add Section</button>
                  </form>
              </div>
           </div>
       </div>
    </AdminLayout>
  );
};
