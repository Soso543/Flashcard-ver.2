import { useState, useCallback } from 'react'; // Removed useMemo
import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { Flashcard } from '../types';

interface Props {
  cards: Flashcard[];
  onExit: () => void;
}

export default function RevisionMode({ cards, onExit }: Props) {
  // ✅ FIX: Use "Lazy Initial State". 
  // By passing a function to useState, React runs this impure function 
  // exactly ONCE when the component mounts. No re-render loops, no purity errors.
  const [queue] = useState(() => {
    return [...cards].sort(() => Math.random() - 0.5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = useCallback(() => {
    if (currentIndex === queue.length - 1) {
      setIsFinished(true);
      return;
    }
    
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  }, [currentIndex, queue.length]);

  // ... the rest of the component remains exactly the same ...

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-50">
        <div className="bg-white p-12 rounded-3xl text-center shadow-card max-w-md w-full animate-fade-in">
          <CheckCircle2 className="w-20 h-20 text-medical-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Session Complete!</h2>
          <p className="text-slate-500 mb-8">You reviewed {queue.length} cards.</p>
          <button onClick={onExit} className="w-full bg-medical-600 text-white py-3 rounded-xl font-bold hover:bg-medical-700 transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = queue[currentIndex];

  return (
    <div className="min-h-screen bg-slate-900/5 flex flex-col items-center justify-center p-4 animate-fade-in">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <button onClick={onExit} className="flex items-center gap-2 text-slate-500 hover:text-medical-700 bg-white px-4 py-2 rounded-lg shadow-sm font-medium">
          <ArrowLeft size={20} /> Exit Session
        </button>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-medical-600">
          {currentIndex + 1} / {queue.length}
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div className="perspective-1000 w-full max-w-2xl h-100 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRONT */}
<div className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-medical-100 shadow-card flex flex-col items-center justify-center p-8 text-center overflow-hidden">
  <span className="absolute top-6 text-xs font-bold tracking-widest text-medical-500 uppercase">
    Question
  </span>
  
  <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
    {/* ✅ Show image only if the URL exists and isn't an empty string */}
    {currentCard?.image && currentCard.image.trim() !== "" && (
      <div className="w-full max-h-45 flex justify-center mb-2">
        <img 
          src={currentCard.image} 
          alt="Medical Diagram" 
          className="rounded-lg object-contain max-h-full border border-slate-100 shadow-sm"
        />
      </div>
    )}
    
    <h2 className={`font-semibold text-slate-800 leading-snug ${
      currentCard?.image ? 'text-xl' : 'text-3xl'
    }`}>
      {currentCard?.question}
    </h2>
  </div>
</div>

          {/* BACK */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-medical-700 rounded-3xl shadow-card flex items-center justify-center p-12 text-center text-white">
             <span className="absolute top-8 text-xs font-bold tracking-widest text-medical-200 uppercase">Answer</span>
             <h2 className="text-2xl font-medium leading-relaxed">{currentCard?.answer}</h2>
          </div>
          
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 flex gap-4">
        <button 
          onClick={() => setIsFlipped(!isFlipped)} 
          className="bg-white text-medical-600 border border-medical-200 px-8 py-3 rounded-xl font-bold hover:bg-medical-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <RefreshCw size={20} /> {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button 
          onClick={handleNext}
          className="bg-medical-600 text-white px-12 py-3 rounded-xl font-bold hover:bg-medical-700 transition-colors shadow-sm"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}