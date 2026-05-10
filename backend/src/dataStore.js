/**
 * Data Store — singleton that holds merged articles & vocab sets in memory.
 * CommonJS module used by server.js and TypeScript routes.
 */
const pkgLoader = require('./pkgLoader');

var _articles = [];
var _vocabSets = [];
var _articleSets = [];
var _vocabSetsMeta = [];
var _initialized = false;

module.exports = {
  initData(baseDir) {
    if (_initialized) return;
    const result = pkgLoader.loadAllEnabled(baseDir);
    _articles = result.articles;
    _vocabSets = result.vocabSets;
    _articleSets = result.articleSets;
    _vocabSetsMeta = result.vocabSetsMeta;
    _initialized = true;
  },

  getArticles() { return _articles; },
  getVocabSets() { return _vocabSets; },
  getArticleSets() { return _articleSets; },
  getVocabSetsMeta() { return _vocabSetsMeta; },

  reloadData(baseDir) {
    _initialized = false;
    _articles = [];
    _vocabSets = [];
    _articleSets = [];
    _vocabSetsMeta = [];
    this.initData(baseDir);
  }
};
