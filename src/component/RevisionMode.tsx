import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Flashcard } from '../types';

interface Props {
  cards: Flashcard[];
  onExit: () => void;
}

export default function RevisionMode({ cards, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- RIGHT TAP LOGIC (Forward) ---
  const handleRightTap = () => {
    if (!isFlipped) {
      setIsFlipped(true); // Flip to Answer
    } else {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false); // Next Question
      } else {
        onExit(); // Finished
      }
    }
  };

  // --- LEFT TAP LOGIC (Backward) ---
  const handleLeftTap = () => {
    if (isFlipped) {
      setIsFlipped(false); // Back to Question
    } else {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setIsFlipped(true); // Previous card's Answer
      }
    }
  };

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="fixed inset-0 bg-slate-900 text-white flex flex-col z-50 animate-fade-in">
      
      {/* HEADER */}
      <div className="p-4 flex justify-between items-center bg-slate-800 z-50">
        <span className="text-slate-400 font-bold bg-slate-900 px-4 py-1.5 rounded-full">
          {currentIndex + 1} / {cards.length}
        </span>
        <button onClick={onExit} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* TAP ZONE AREA */}
      <div className="flex-1 relative flex items-center justify-center p-6 select-none">
        
        {/* Invisible Interaction Zones */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-20 cursor-pointer" onClick={handleLeftTap} />
        <div className="absolute top-0 right-0 w-1/2 h-full z-20 cursor-pointer" onClick={handleRightTap} />

        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-10">
          <div 
            className="h-full bg-medical-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + (isFlipped ? 1 : 0.5)) / cards.length) * 100}%` }}
          />
        </div>

        {/* CARD CONTENT */}
        <div className="z-10 w-full max-w-2xl bg-white text-slate-800 rounded-[2.5rem] p-10 shadow-2xl min-h-87.5 flex flex-col items-center justify-center text-center">
          {currentCard.image && (
            <img src={currentCard.image} className="max-h-48 rounded-xl mb-6 object-contain border border-slate-100" alt="" />
          )}
          
          <div className="text-2xl md:text-3xl font-bold leading-snug mb-4">
            {isFlipped ? currentCard.answer : currentCard.question}
          </div>
          
          <div className={`mt-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${isFlipped ? 'bg-medical-50 text-medical-600' : 'bg-slate-100 text-slate-400'}`}>
            {isFlipped ? "Answer" : "Question"}
          </div>
        </div>

        {/* VISUAL CUES */}
        <div className="absolute left-4 opacity-10 pointer-events-none"><ChevronLeft size={48} /></div>
        <div className="absolute right-4 opacity-10 pointer-events-none"><ChevronRight size={48} /></div>
      </div>
    </div>
  );
}