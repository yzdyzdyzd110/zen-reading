export interface ArticleSummary {
  id: number;
  title: string;
  description: string;
  difficulty: number;
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
