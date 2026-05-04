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
    return savedFolders ? JSON.parse(savedFolders) : ['Uncategorized'];
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
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    // This runs once the file is fully loaded
    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        
        // 1. Convert the text back into a JavaScript object
        const parsedData = JSON.parse(fileContent);

        // 2. Verify it has the exact structure we exported
        if (parsedData && Array.isArray(parsedData.folders) && Array.isArray(parsedData.cards)) {
          
          // Optional: Add a confirmation so you don't accidentally overwrite current work
          if (window.confirm("Importing will replace your current flashcards. Continue?")) {
            setFolders(parsedData.folders);
            setCards(parsedData.cards);
            alert("Backup imported successfully!");
          }
          
        } else {
          // It's a JSON file, but not OUR JSON file
          alert("Invalid format: The file is missing folders or cards data.");
        }
      } catch (error) {
        // It's not a valid JSON file at all
        console.error("Import error:", error);
        alert("Invalid JSON file format. Please check your file.");
      }
    };

    // 3. Actually read the file
    reader.readAsText(file);
    
    // 4. Reset the input field so you can upload the same file twice if needed
    e.target.value = '';
  };

  const handleAddFolder = (newFolderName: string) => {
    if (!folders.includes(newFolderName)) {
      setFolders(prev => [...prev, newFolderName]);
    }
  };

  const handleDeleteFolder = (folderName: string) => {
    const confirmMessage = `Are you sure you want to delete the folder "${folderName}"? This will delete all cards inside it.`;

    if (window.confirm(confirmMessage)) {
      // Remove the folder name from the list
      setFolders(prev => prev.filter(f => f !== folderName));
      // Remove all cards that belong to that specific folder
      setCards(prev => prev.filter(c => c.folder === folderName ? false : true));
    }
  };

  // --- NEW EXPORT & REVISION MEMORY FUNCTIONS ---
  const handleExport = () => {
    const dataStr = JSON.stringify({ folders, cards }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'medical-flashcards-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleMarkRevised = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isRevised: true } : c));
  };

  const handleResetFolderRevision = () => {
    setCards(prev => prev.map(c => c.folder === currentFolder ? { ...c, isRevised: false } : c));
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

            <div className="flex items-center gap-2 md:gap-4">
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold py-2 px-4 rounded-xl transition-all active:scale-95">
              <Upload size={18} />
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
{/* ✅ EXPORT BUTTON ADDED HERE */}
          <button 
            onClick={handleExport}
            className="bg-medical-500 hover:bg-medical-600 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-sm transition-all active:scale-95 shrink-0">
            Export Backup
          </button>
          </div>
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
            onDeleteFolder={handleDeleteFolder}
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
    onMarkRevised={handleMarkRevised}           // ✅ Added
    onResetRevision={handleResetFolderRevision} // ✅ Added
  />
)}
        
      </main>
    </div>
  );
}