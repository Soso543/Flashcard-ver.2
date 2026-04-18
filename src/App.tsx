import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Home from './component/Home';
import FolderView from './component/FolderView';
import RevisionMode from './component/RevisionMode';
import type { Flashcard } from './types';

export default function App() {
  // --- 1. LOAD DATA ON STARTUP ---
  // We use a "Lazy Initializer" function to check the browser's locker immediately.
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const savedCards = localStorage.getItem('med_cards');
    return savedCards ? JSON.parse(savedCards) : [];
  });

  const [folders, setFolders] = useState<string[]>(() => {
    const savedFolders = localStorage.getItem('med_folders');
    // Default to 'General' if nothing is saved
    return savedFolders ? JSON.parse(savedFolders) : ['URI II'];
  });

  const [view, setView] = useState<'home' | 'folder' | 'revise'>('home');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // --- 2. SAVE DATA AUTOMATICALLY ---
  // This "Watcher" runs every time the 'cards' or 'folders' array changes.
  useEffect(() => {
    localStorage.setItem('med_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('med_folders', JSON.stringify(folders));
  }, [folders]);
  
  // --- FOLDER & IMPORT LOGIC ---
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCards: Flashcard[] = JSON.parse(e.target?.result as string);
        setCards(prev => [...prev, ...importedCards]);

        // Automatically extract new folders from the imported cards
        const importedFolderNames = Array.from(new Set(importedCards.map(c => c.folder)));
        setFolders(prev => [...new Set([...prev, ...importedFolderNames])]);
      } catch {
        alert("Invalid JSON file format. Please check your file.");
      }
    };
    reader.readAsText(file);
    
    // Reset the input so you can import the same file again if needed
    event.target.value = '';
  };

  const handleAddFolder = (newFolderName: string) => {
    if (!folders.includes(newFolderName)) {
      setFolders(prev => [...prev, newFolderName]);
    }
  };

  const handleSelectFolder = (folderName: string) => {
    setCurrentFolder(folderName);
    setView('folder');
  };

  // --- FLASHCARD CRUD LOGIC (Create, Read, Update, Delete) ---
  const handleAddCard = (newCard: Flashcard) => {
    setCards(prev => [...prev, newCard]);
  };

  const handleEditCard = (updatedCard: Flashcard) => {
    setCards(prev => prev.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ));
  };

  const handleDeleteCard = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this medical flashcard?")) {
      setCards(prev => prev.filter(card => card.id !== id));
    }
  };

  return (
    <div className="min-h-screen text-slate-800">
      
      {/* Global Header (Hidden during distraction-free revision mode) */}
      {view !== 'revise' && (
        <header className="bg-white border-b border-medical-100 p-4 sticky top-0 z-50 shadow-sm transition-all">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            
            {/* Logo & Branding */}
            <div 
              className="flex items-center gap-3 text-medical-800 font-bold text-2xl cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setView('home')}
            >
              <div className="w-10 h-10 bg-linear-to-br from-medical-500 to-medical-600 rounded-xl flex items-center justify-center text-white shadow-md">
                M
              </div>
              MedFlash
            </div>
            
            {/* Import Button */}
            <label className="flex items-center gap-2 bg-medical-50 text-medical-700 px-5 py-2.5 rounded-xl font-bold hover:bg-medical-100 hover:shadow-sm cursor-pointer transition-all border border-medical-200">
              <Upload size={18} />
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            
          </div>
        </header>
      )}

      {/* Main Content Area Routing */}
      <main className={view === 'revise' ? '' : 'py-8'}>
        
        {view === 'home' && (
          <Home 
            folders={folders} 
            cards={cards} 
            onSelectFolder={handleSelectFolder} 
            onAddFolder={handleAddFolder} 
          />
        )}

        {view === 'folder' && currentFolder && (
          <FolderView 
            folder={currentFolder} 
            cards={cards.filter(c => c.folder === currentFolder)} 
            onBack={() => setView('home')}
            onRevise={() => setView('revise')}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onEditCard={handleEditCard}
          />
        )}

        {view === 'revise' && currentFolder && (
          <RevisionMode 
            cards={cards.filter(c => c.folder === currentFolder)} 
            onExit={() => setView('folder')}
          />
        )}
        
      </main>
    </div>
  );
}