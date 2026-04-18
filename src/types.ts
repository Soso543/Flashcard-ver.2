export interface Flashcard {
  id: string | number;
  folder: string;
  question: string;
  answer: string;
  image?: string;
  selected?: boolean;
  // Prepared for spaced repetition extension
  nextReviewDate?: number; 
  interval?: number;
}

export type ViewState = 'home' | 'folder' | 'revise';