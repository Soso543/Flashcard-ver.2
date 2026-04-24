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
        setIsFlipped(false); // Start flip back
        // Short delay to change text while the card is mid-air/hidden
        setTimeout(() => setCurrentIndex(prev => prev + 1), 150); 
      } else {
        onExit(); // Finished the deck
      }
    }
  };

  // --- LEFT TAP LOGIC (Backward) ---
  const handleLeftTap = () => {
    if (isFlipped) {
      setIsFlipped(false); // Flip back to Question
    } else {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setIsFlipped(true); // Go back, show previous Answer
      }
    }
  };

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="fixed inset-0 bg-slate-900 text-white flex flex-col z-50 animate-fade-in">
      
      {/* HEADER */}
      <div className="p-4 flex justify-between items-center bg-slate-800 z-50 shadow-md">
        <span className="text-slate-400 font-bold bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700">
          {currentIndex + 1} / {cards.length}
        </span>
        <button 
          onClick={onExit} 
          className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* INTERACTION AREA */}
      <div className="flex-1 relative flex items-center justify-center p-6 select-none overflow-hidden">
        
        {/* Invisible Tap Zones */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-30 cursor-pointer" onClick={handleLeftTap} />
        <div className="absolute top-0 right-0 w-1/2 h-full z-30 cursor-pointer" onClick={handleRightTap} />

        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800 z-10">
          <div 
            className="h-full bg-medical-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + (isFlipped ? 1 : 0.5)) / cards.length) * 100}%` }}
          />
        </div>

        {/* 3D CARD ANIMATION CONTAINER */}
        <div className="z-20 w-full max-w-2xl [perspective-1000px]">
          <div 
            className={`relative w-full transition-transform duration-500 ease-out transform-3d ${isFlipped ? 'transform-[rotateY(180deg)]' : ''}`}
          >
            <div className="grid grid-cols-1 grid-rows-1 w-full">
              
              {/* FRONT (Question) */}
              <div className="col-start-1 row-start-1 w-full backface-hidden bg-white text-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center justify-center text-center min-h-100">
                {currentCard.image && (
                  <img src={currentCard.image} className="max-h-48 rounded-xl mb-6 object-contain border border-slate-100" alt="" />
                )}
                <div className="text-2xl md:text-3xl font-bold leading-snug mb-4">
                  {currentCard.question}
                </div>
                <div className="mt-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-400">
                  Question
                </div>
              </div>

              {/* BACK (Answer) */}
              <div className="col-start-1 row-start-1 w-full backface-hidden transform-[rotateY(180deg)] bg-white text-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center justify-center text-center min-h-100">
                <div className="text-2xl md:text-3xl font-bold leading-snug mb-4">
                  {currentCard.answer}
                </div>
                <div className="mt-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-medical-50 text-medical-600">
                  Answer
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* BACKGROUND CUES */}
        <div className="absolute left-4 opacity-5 pointer-events-none z-10"><ChevronLeft size={64} /></div>
        <div className="absolute right-4 opacity-5 pointer-events-none z-10"><ChevronRight size={64} /></div>
      </div>
    </div>
  );
}