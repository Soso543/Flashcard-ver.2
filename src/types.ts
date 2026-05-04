// src/types.ts
export interface Flashcard {
  id: string;
  folder: string;
  question: string;
  answer: string;
  image?: string;
  isRevised?: boolean; // ✅ Add this line!
}

export type ViewState = 'home' | 'folder' | 'revise';