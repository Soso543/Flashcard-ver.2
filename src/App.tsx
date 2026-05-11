import React, { useState, useEffect } from 'react';
import {Plus, Play, Folder as FolderIcon, BookOpen, Download, Upload, Import, FolderUp, Trash2 } from 'lucide-react';
import type { Flashcard, ExportData } from './types';
import FolderView from './component/FolderView';
import RevisionMode from './component/RevisionMode';

export default function App() {
  // --- STATE ---
  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem('med-folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('med-cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'home' | 'folder' | 'revision'>('home');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  
  // Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportSelection, setExportSelection] = useState<string[]>([]);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('med-folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('med-cards', JSON.stringify(cards));
  }, [cards]);

  // --- CORE CARD LOGIC ---
  const handleMarkRevised = (id: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, isRevised: true } : c));
  };

  const handleResetRevision = () => {
    if (!currentFolder) return;
    if (window.confirm(`Reset progress for ${currentFolder}?`)) {
      setCards(prev => prev.map(c => c.folder === currentFolder ? { ...c, isRevised: false } : c));
    }
  };

  const handleAddFolder = () => {
  const baseName = window.prompt("Enter folder name:");
  if (!baseName || baseName.trim() === "") return;

  let name = baseName.trim();
  let counter = 1;

  // If "Cardiology" exists, it creates "Cardiology (1)", then "(2)", etc.
  while (folders.includes(name)) {
    name = `${baseName.trim()} (${counter})`;
    counter++;
  }

  setFolders([...folders, name]);
};

  const handleDeleteFolder = (folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${folderName}" and all its cards?`)) {
      setFolders(folders.filter(f => f !== folderName));
      setCards(cards.filter(c => c.folder !== folderName));
    }
  };

  // --- EXPORT LOGIC ---
  const handleExportClick = () => {
    if (cards.length === 0) return alert("No cards to export!");
    
    if (view === 'folder' && currentFolder) {
      executeExport([currentFolder]);
    } else {
      setExportSelection(folders);
      setShowExportModal(true);
    }
  };

  const executeExport = (selectedIds: string[]) => {
    const exportData: ExportData = {
      folders: folders.filter(f => selectedIds.includes(f)),
      cards: cards.filter(c => selectedIds.includes(c.folder))
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const defaultName = selectedIds.length === 1 ? `folder_${selectedIds[0]}_${dateStr}` : `backup_${dateStr}`;
    
    const customName = window.prompt("Name your export file:", defaultName);
    if (customName === null) return;

    const fileName = (customName.trim() || defaultName) + ".json";
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // --- IMPORT LOGIC ---
  const executeMerge = (data: ExportData) => {
    setFolders(prev => Array.from(new Set([...prev, ...data.folders])));
    setCards(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newCards = data.cards.filter(c => !existingIds.has(c.id));
      if (newCards.length > 0) alert(`Imported ${newCards.length} new cards!`);
      return [...prev, ...newCards];
    });
  };

  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        executeMerge(JSON.parse(ev.target?.result as string));
        setShowImportModal(false);
      } catch { alert("Invalid file format."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 1. Adds a brand new card to the list
  const handleAddCard = (newCard: Flashcard) => {
    setCards((prev) => [...prev, newCard]);
  };

  // 2. Finds a card by ID and removes it
  const handleDeleteCard = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // 3. Finds a card by ID and swaps it with the updated version
  const handleEditCard = (updatedCard: Flashcard) => {
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
    );
  };

  // Inside your App component
const [cloudFiles, setCloudFiles] = useState<{name: string, download_url: string}[]>([]);
const [isLoadingFiles, setIsLoadingFiles] = useState(false);

const fetchRepoFiles = async () => {
  setIsLoadingFiles(true);
  
  // Replace with your GitHub info
  const USER = "Soso543";
  const REPO = "Flashcard-ver.2";
  const FOLDER_PATH = "storage"; // The folder where your JSONs live

  try {
    const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${FOLDER_PATH}`);
    if (!res.ok) throw new Error("Could not reach GitHub");
    
    const data = await res.json();
    
    // We only want .json files
    const jsonFiles = data.filter((file: { name: string; download_url: string }) => file.name.endsWith('.json'));
    setCloudFiles(jsonFiles);
  } catch {
    alert("Failed to load deck list from GitHub.");
  } finally {
    setIsLoadingFiles(false);
  }
};
const handleImportFromUrl = async (url: string) => {
  try {
    const res = await fetch(url);
    const data = await res.json() as ExportData;
    
    // Using your existing logic to merge the new cards
    executeMerge(data);
    
    setShowImportModal(false);
    // Refresh the list for next time
    setCloudFiles([]); 
  } catch {
    alert("Error downloading this specific deck.");
  }
};

  // --- RENDER HELPERS ---
  if (view === 'revision' && currentFolder) {
    return (
      <RevisionMode 
        cards={cards.filter(c => c.folder === currentFolder)}
        onExit={() => setView('folder')}
        onMarkRevised={handleMarkRevised}
        onResetRevision={handleResetRevision}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via white to-orange-100 text-slate-900 font-sans">
      {/* HEADER */}
      <header className="bg-white/70 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
  <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
    <div 
      onClick={() => setView('home')} 
      className="flex items-center gap-2 cursor-pointer group"
    >
      <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
        <Play size={20} fill="currentColor"/>
      </div>
      <h1 className="text-2xl font-black text-slate-800 tracking-tight">
        Med<span className="text-blue-400">Flash</span>
      </h1>
    </div>
    
    <div className="flex items-center gap-3">
      <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">
        <Import size={18}/> <span className="hidden sm:inline">Import</span>
      </button>
      <button onClick={handleExportClick} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all shadow-md">
        <FolderUp size={18}/> <span className="hidden sm:inline">Export</span>
      </button>
    </div>
  </div>
</header>

      <main className="max-w-5xl mx-auto p-6">
  {view === 'home' ? (
    <>
      {/* --- PERSISTENT TOP BAR --- */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800">My Library</h2>
          <p className="text-slate-500 font-medium">{folders.length} Topics total</p>
        </div>
        
        {/* This button is now ALWAYS present if view === 'home' */}
        <button 
          onClick={handleAddFolder} 
          className="bg-blue-400 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95"
        >
          <Plus size={20} /> 
          <span className="hidden sm:inline">New Topic</span>
        </button>
      </div>

      {/* --- CONDITIONAL CONTENT --- */}
      {folders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-orange-200">
          <div className="w-20 h-20 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No folders yet</h3>
          <p className="text-slate-500 mt-2 mb-8">Start by creating your first medical topic.</p>
          <button 
            onClick={handleAddFolder} 
            className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
          >
            + Create Folder
          </button>
        </div>
      ) : (
        /* Folder Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map(folder => (
            <div 
              key={folder}
              onClick={() => { setCurrentFolder(folder); setView('folder'); }}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100 hover: transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full opacity-60 group-hover:bg-orange-50 group-hover:scale-150 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <FolderIcon size={32}/>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 truncate">{folder}</h3>
                <p className="text-slate-500 text-sm font-bold">
                  {cards.filter(c => c.folder === folder).length} CARDS
                </p>
              </div>

              <button 
                onClick={(e) => {handleDeleteFolder(folder, e)
                }}
                className="absolute bottom-6 right-6 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all z-30"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  ) : (
    <FolderView 
      folder={currentFolder!} 
      cards={cards.filter(c => c.folder === currentFolder)}
      onBack={() => setView('home')}
      onRevise={() => setView('revision')}
      onAddCard={handleAddCard}
      onDeleteCard={handleDeleteCard}
      onEditCard={handleEditCard}
    />
  )}
</main>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Export Folders</h3>
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {folders.map(f => (
                <label key={f} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={exportSelection.includes(f)}
                    onChange={() => setExportSelection(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                  />
                  <span className="font-medium">{f}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-2 font-bold text-slate-500">Cancel</button>
              <button onClick={() => executeExport(exportSelection)} className="flex-1 py-2 bg-medical-500 text-white rounded-xl font-bold">Download</button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-orange-100">
      <h3 className="text-2xl font-black text-slate-800 mb-6">Import Decks</h3>

      <div className="space-y-4">
        {/* --- OPTION 1: GITHUB CLOUD --- */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {cloudFiles.length === 0 && !isLoadingFiles ? (
          <button 
            onClick={fetchRepoFiles}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all"
          >
            🔍 Search Repository for Decks
          </button>
        ) : isLoadingFiles ? (
          <div className="text-center py-4 text-orange-500 animate-pulse font-bold">
            Connecting to GitHub...
          </div>
        ) : (
          cloudFiles.map((file) => (
            <button
              key={file.name}
              onClick={() => handleImportFromUrl(file.download_url)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg text-blue-500 group-hover:text-orange-500 transition-colors shadow-sm">
                  <BookOpen size={18} />
                </div>
                <span className="font-bold text-slate-700 capitalize">
                  {file.name.replace('.json', '')}
                </span>
              </div>
              <Download size={18} className="text-slate-300 group-hover:text-orange-500" />
            </button>
          ))
        )}
      </div>

        {/* --- OPTION 2: LOCAL FILE --- */}
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 text-center">Your Device</p>
          <label className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-100">
            <Upload size={18} /> 
            Upload Backup File
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleLocalImport} 
            />
          </label>
        </div>
      </div>

      <button 
        onClick={() => setShowImportModal(false)}
        className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600"
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  );
}