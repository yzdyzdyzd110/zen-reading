export interface ArticleSummary {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  language: string;
  type?: string;
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

export interface ArticleSetSummary {
  id: number;
  title: string;
  description: string;
  language: string;
  gradient: string;
  articleCount: number;
}

export interface VocabWord {
  id: number;
  word: string;
  reading: string;
  meaning: string;
}

export interface VocabSetSummary {
  id: number;
  title: string;
  description: string;
  language: string;
  gradient: string;
  listCount: number;
  totalWords: number;
}

export interface VocabSet extends VocabSetSummary {
  lists: { id: number; title: string; wordCount: number }[];
}

export interface VocabList {
  id: number;
  title: string;
  setId: number;
  setTitle: string;
  language: string;
  gradient: string;
  wordCount: number;
  words: VocabWord[];
}
