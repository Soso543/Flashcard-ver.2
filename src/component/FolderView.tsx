import { useState } from 'react';
import { ArrowLeft, Play, Plus, X, Image as ImageIcon, Trash2, Edit3, Check } from 'lucide-react';
import type { Flashcard } from '../types';

interface Props {
  folder: string;
  cards: Flashcard[];
  onBack: () => void;
  onRevise: () => void;
  onAddCard: (card: Flashcard) => void;
  onDeleteCard: (id: string | number) => void;
  onEditCard: (card: Flashcard) => void;
}

export default function FolderView({ 
  folder, 
  cards, 
  onBack, 
  onRevise, 
  onAddCard, 
  onDeleteCard, 
  onEditCard 
}: Props) {
  // State for toggling the "New Card" form
  const [isAdding, setIsAdding] = useState(false);
  
  // State for tracking which card is currently being edited
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  // Shared Form States (used for both Adding and Editing)
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [image, setImage] = useState('');

  // --- ADD NEW CARD LOGIC ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const newCard: Flashcard = {
      id: Date.now().toString(), // Generates unique string ID
      folder: folder,
      question: question.trim(),
      answer: answer.trim(),
      image: image.trim() || undefined
    };

    onAddCard(newCard);
    
    // Reset form and close
    setQuestion('');
    setAnswer('');
    setImage('');
    setIsAdding(false);
  };

  // --- EDIT CARD LOGIC ---
  const startEdit = (card: Flashcard) => {
    // Populate the form state with the existing card's data
    setEditingId(card.id);
    setQuestion(card.question);
    setAnswer(card.answer);
    setImage(card.image || '');
    // Ensure the "Add New" form is closed if we start editing
    setIsAdding(false); 
  };

  const handleSaveEdit = (id: string | number) => {
    if (!question.trim() || !answer.trim()) return;

    onEditCard({ 
      id: String(id), 
      folder, 
      question: question.trim(), 
      answer: answer.trim(), 
      image: image.trim() || undefined 
    });
    
    // Clear editing state
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setImage('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setQuestion('');
    setAnswer('');
    setImage('');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      {/* Top Navigation */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-slate-500 hover:text-medical-600 transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-medical-100 shadow-sm transition-all">
        <div>
          <h2 className="text-3xl font-bold text-medical-900">{folder}</h2>
          <p className="text-slate-500 mt-1">{cards.length} cards in this subject</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (editingId) handleCancelEdit(); // Close edit mode if opening add mode
            }}
            className="bg-medical-50 text-medical-700 px-4 py-3 rounded-xl font-bold hover:bg-medical-100 transition-colors flex items-center gap-2"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />} New Card
          </button>
          <button 
            onClick={onRevise}
            disabled={cards.length === 0}
            className="bg-medical-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-medical-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            <Play size={20} fill="currentColor" /> Revise
          </button>
        </div>
      </div>

      {/* Add New Card Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border-2 border-medical-500 mb-8 shadow-lg animate-fade-in space-y-4">
          <div>
            <label className="block text-xs font-bold text-medical-700 uppercase mb-1">Question</label>
            <input 
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Most common cause of UTI?"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-medical-700 uppercase mb-1">Answer</label>
            <textarea 
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. E. coli"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none h-24 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-medical-700 uppercase mb-1">Image URL (Optional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/medical-diagram.jpg"
                className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500 outline-none transition-all"
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-medical-600 text-white py-3 rounded-xl font-bold hover:bg-medical-700 transition-all shadow-md">
            Save Flashcard
          </button>
        </form>
      )}

      {/* Flashcard List */}
      <div className="space-y-4">
        {cards.map(card => (
          <div key={card.id} className="bg-white p-6 rounded-xl border border-medical-100 shadow-sm transition-all hover:shadow-md">
            
            {editingId === card.id ? (
              /* --- INLINE EDIT MODE --- */
              <div className="space-y-3 animate-fade-in">
                <input 
                  className="w-full p-3 border rounded-lg border-medical-200 outline-none focus:ring-2 focus:ring-medical-500 font-semibold text-slate-800 transition-all"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Question"
                />
                <textarea 
                  className="w-full p-3 border rounded-lg border-medical-200 outline-none focus:ring-2 focus:ring-medical-500 text-slate-600 h-24 transition-all"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Answer"
                />
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    className="w-full p-3 pl-10 border rounded-lg border-medical-200 outline-none focus:ring-2 focus:ring-medical-500 transition-all"
                    placeholder="Image URL (Optional)"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={handleCancelEdit} 
                    className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleSaveEdit(card.id)} 
                    className="px-5 py-2.5 bg-medical-600 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-medical-700 transition-colors shadow-sm"
                  >
                    <Check size={18} /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* --- VIEW MODE --- */
              <div className="flex gap-5 group items-start">
                {card.image && card.image.trim() !== "" && (
                  <div className="shrink-0">
                    <img 
                      src={card.image} 
                      className="w-24 h-24 object-cover rounded-xl border border-slate-100 shadow-sm" 
                      alt="Medical reference" 
                      onError={(e) => {
                        // Hides broken images if the URL becomes invalid
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg text-slate-800 border-b border-slate-100 pb-2 mb-2 wrap-break-words">
                    <span className="text-medical-500 mr-2">Q:</span>{card.question}
                  </div>
                  <div className="text-slate-600 wrap-break-words leading-relaxed">
                    <span className="text-medical-500 font-medium mr-2">A:</span>{card.answer}
                  </div>
                </div>
                
                {/* Action Buttons (Visible on Hover) */}
                <div className="flex flex-col gap-2 shrink-0 border border-slate-50 pl-2">
                  <button 
                    onClick={() => startEdit(card)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Card"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => onDeleteCard(card.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Card"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}

        {cards.length === 0 && !isAdding && (
          <div className="text-center py-12 text-slate-400">
            <p>No cards in this folder yet.</p>
            <p className="text-sm mt-1">Click "New Card" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}