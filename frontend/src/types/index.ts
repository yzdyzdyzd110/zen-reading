export interface ArticleSummary {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  language: string;
  image: string;
  gradient: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: number;
}

export interface Article extends ArticleSummary {
  content: string;
  questions: Question[];
}

export interface VocabWord {
  id: number;
  word: string;
  reading: string;
  meaning: string;
}

export interface VocabListSummary {
  id: number;
  title: string;
  description: string;
  language: string;
  gradient: string;
  wordCount?: number;
}

export interface VocabList extends VocabListSummary {
  words: VocabWord[];
}
