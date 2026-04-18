import { useState } from 'react';
import { Folder, FolderPlus, X, Trash2, Check } from 'lucide-react';
import type { Flashcard } from '../types';

interface Props {
  folders: string[];
  cards: Flashcard[];
  onSelectFolder: (folder: string) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (name: string) => void;
}

export default function Home({ folders, cards, onSelectFolder, onAddFolder, onDeleteFolder }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const getCardCount = (folderName: string) => {
    return cards.filter(card => card.folder === folderName).length;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-medical-900 mb-2">Medical Dashboard</h1>
        <p className="text-slate-500">Select a topic to start your revision session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div
            key={folder}
            onClick={() => onSelectFolder(folder)}
            className="group relative bg-white border border-medical-100 rounded-2xl p-6 shadow-card hover:shadow-lg hover:border-medical-500 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <Folder className="absolute -right-4 -bottom-4 text-medical-50/50 w-24 h-24 rotate-12" />
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-medical-50 rounded-xl text-medical-600 group-hover:bg-medical-500 group-hover:text-white transition-colors">
                <Folder size={24} />
              </div>
              {/* ✅ Delete Folder Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents opening the folder
                    onDeleteFolder(folder);
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Folder"
                >
                  <Trash2 size={18} />
                </button>
              <h3 className="text-xl font-bold text-medical-900 truncate">{folder}</h3>
            </div>
            <div className="flex justify-between items-center relative z-10">
              <span className="text-sm font-medium text-slate-500">{getCardCount(folder)} Flashcards</span>
              <span className="text-xs font-bold text-medical-600 bg-medical-50 px-2 py-1 rounded uppercase tracking-wider group-hover:bg-medical-100">Open</span>
            </div>
          </div>
        ))}

        {isCreating ? (
          <div className="bg-white border-2 border-medical-500 rounded-2xl p-6 shadow-lg animate-fade-in">
            <form onSubmit={handleCreate}>
              <label className="block text-sm font-bold text-medical-700 mb-2 uppercase tracking-tight">Folder Name</label>
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Cardiology"
                className="w-full p-3 border border-medical-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none mb-4"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-medical-600 text-white py-2 rounded-lg font-bold hover:bg-medical-700 flex items-center justify-center gap-1">
                  <Check size={18} /> Create
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="border-2 border-dashed border-medical-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-medical-600 hover:border-medical-500 hover:bg-medical-50/50 transition-all group"
          >
            <div className="p-4 bg-medical-50 rounded-full group-hover:scale-110 transition-transform">
              <FolderPlus size={32} />
            </div>
            <span className="font-bold">Add New Subject</span>
          </button>
        )}
      </div>
    </div>
  );
}