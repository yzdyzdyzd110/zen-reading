declare module '../dataStore.js' {
  export function initData(baseDir: string): void;
  export function getArticles(): any[];
  export function getVocabSets(): any[];
  export function getArticleSets(): any[];
  export function getVocabSetsMeta(): any[];
  export function reloadData(baseDir: string): void;
}

declare module './dataStore' {
  export function initData(baseDir: string): void;
  export function getArticles(): any[];
  export function getVocabSets(): any[];
  export function getArticleSets(): any[];
  export function getVocabSetsMeta(): any[];
  export function reloadData(baseDir: string): void;
}
