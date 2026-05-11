import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Play } from 'lucide-react';
import type { Flashcard } from '../types';

interface Props {
  cards: Flashcard[];
  onExit: () => void;
  onMarkRevised: (id: string) => void;
  onResetRevision: () => void;
}

export default function RevisionMode({ cards, onExit, onMarkRevised, onResetRevision }: Props) {
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const unrevisedCards = cards.filter(c => !c.isRevised);
  const revisedCards = cards.filter(c => c.isRevised);
  
  // Default strictly to "all-unrevised"
  const [reviseOption, setReviseOption] = useState<string>('all-unrevised');
  const [customNum, setCustomNum] = useState<number>(Math.min(10, cards.length));

  // --- SETUP LOGIC ---
  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. BULLETPROOF NUMBER CALCULATION
    let targetNum = 0;
    
    // Check for both old and new dropdown values just to be perfectly safe
    if (reviseOption === 'all-unrevised' || reviseOption === 'all') {
      targetNum = unrevisedCards.length;
    } else if (reviseOption === 'all-cards') {
      targetNum = cards.length;
    } else if (reviseOption === 'custom') {
      targetNum = customNum;
    } else {
      targetNum = parseInt(reviseOption, 10);
    }

    // 🛑 SAFETY NET: If targetNum somehow became NaN (Not a Number), force it to a valid number
    if (isNaN(targetNum) || targetNum <= 0) {
      targetNum = unrevisedCards.length > 0 ? unrevisedCards.length : cards.length;
    }

    const finalNum = Math.max(1, Math.min(targetNum, cards.length));

    // 2. Shuffle Helper
    const shuffleArray = (array: Flashcard[]) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    // 3. Shuffle & Build Deck
    const shuffledUnrevised = shuffleArray(unrevisedCards);
    const shuffledRevised = shuffleArray(revisedCards);

    const selectedUnrevised = shuffledUnrevised.slice(0, finalNum);
    const deficit = finalNum - selectedUnrevised.length;
    const selectedRevised = deficit > 0 ? shuffledRevised.slice(0, deficit) : [];

    // 4. Start Session
    setSessionCards([...selectedUnrevised, ...selectedRevised]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setHasStarted(true);
  };

  // --- REVISION TAP LOGIC ---
  const handleRightTap = () => {
    if (!isFlipped) {
      setIsFlipped(true); 
    } else {
      onMarkRevised(sessionCards[currentIndex].id);
      
      if (currentIndex < sessionCards.length - 1) {
        setIsFlipped(false); 
        setTimeout(() => setCurrentIndex(prev => prev + 1), 200); 
      } else {
        onExit(); 
      }
    }
  };

  const handleLeftTap = () => {
    if (isFlipped) {
      setIsFlipped(false); 
    } else {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setIsFlipped(true); 
      }
    }
  };

  if (cards.length === 0) return null;

  // ==========================================
  // SCREEN 1: THE SETUP MENU
  // ==========================================
  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white flex items-center justify-center z-50 p-6 animate-fade-in">
        <div className="bg-white text-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
          <button onClick={onExit} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold mb-2">Setup Revision</h2>
          
          {unrevisedCards.length > 0 ? (
            <>
              <p className="text-slate-500 mb-6">
                You have <strong>{unrevisedCards.length}</strong> new cards. 
                <br/><span className="text-sm">(We'll refill with older cards if you choose a larger number).</span>
              </p>
              
              <form onSubmit={handleStartSession} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">How many cards to study?</label>
                  
                  <select 
                    value={reviseOption}
                    onChange={(e) => setReviseOption(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-medical-500 font-bold text-lg mb-3 bg-white cursor-pointer"
                  >
                    <option value="all-unrevised">Unrevised ({unrevisedCards.length})</option>
                    <option value="all-cards">All ({cards.length})</option>
                    {[10, 20, 30, 40, 50].map(num => (
                      cards.length >= num && (
                        <option key={num} value={num.toString()}>{num} cards</option>
                      )
                    ))}
                    <option value="custom">Others...</option>
                  </select>

                  {reviseOption === 'custom' && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-bold text-slate-700 mb-2 text-medical-600">Enter custom amount (Max {cards.length}):</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={cards.length} 
                        value={customNum}
                        onChange={(e) => setCustomNum(Number(e.target.value))}
                        className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-medical-500 font-bold text-lg"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="mt-2 w-full bg-medical-500 hover:bg-medical-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Play size={20} /> Start Session
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="bg-green-100 text-green-600 p-4 rounded-full inline-block mb-4">
                <RotateCcw size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
              <p className="text-slate-500 mb-6">You have successfully reviewed every card in this folder.</p>
              <button 
                onClick={() => {
                  onResetRevision();
                  setReviseOption('all-unrevised');
                  setCustomNum(Math.min(10, cards.length));
                }} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Reset Progress & Study Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🛑 CRASH PREVENTION: If sessionCards is empty for any reason, don't try to render!
  if (sessionCards.length === 0) return null;
  
  const currentCard = sessionCards[currentIndex];
  if (!currentCard) return null;

  // ==========================================
  // SCREEN 2: THE ACTIVE REVISION FLASHCARDS
  // ==========================================
  return (
    <div className="fixed inset-0 bg-slate-900 text-white flex flex-col z-50 animate-fade-in">
      <div className="p-4 flex justify-between items-center bg-slate-800 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700">
            {currentIndex + 1} / {sessionCards.length}
          </span>
          {currentCard.isRevised && (
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">Review</span>
          )}
        </div>
        <button onClick={onExit} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6 select-none overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full z-50 cursor-pointer" onClick={handleLeftTap} />
        <div className="absolute top-0 right-0 w-1/2 h-full z-50 cursor-pointer" onClick={handleRightTap} />

        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800 z-10">
          <div 
            className="h-full bg-medical-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + (isFlipped ? 1 : 0.5)) / sessionCards.length) * 100}%` }}
          />
        </div>

        <div className="w-full max-w-2xl h-[450px]" style={{ perspective: '1200px' }}>
          <div className="relative w-full h-full transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            
            <div className="absolute inset-0 bg-white text-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}>
              {currentCard.image && <img src={currentCard.image} className="max-h-48 rounded-xl mb-6 object-contain border border-slate-100" alt="" />}
              <div className="text-2xl md:text-3xl font-bold leading-snug mb-4">{currentCard.question}</div>
              <div className="mt-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-400">Question</div>
            </div>

            <div className="absolute inset-0 bg-white text-slate-800 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="text-2xl md:text-3xl font-bold leading-snug mb-4">{currentCard.answer}</div>
              <div className="mt-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-medical-50 text-medical-600">Answer</div>
            </div>

          </div>
        </div>

        <div className="absolute left-4 opacity-5 pointer-events-none z-10"><ChevronLeft size={64} /></div>
        <div className="absolute right-4 opacity-5 pointer-events-none z-10"><ChevronRight size={64} /></div>
      </div>
    </div>
  );
}