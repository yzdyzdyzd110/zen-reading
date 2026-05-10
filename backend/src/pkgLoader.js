/**
 * PKG Loader — CommonJS module (used by both server.js and TS routes via import).
 * Reads manifest.json, loads/enables PKG files, auto-renumbers IDs, saves manifest.
 */
const fs = require('fs');
const path = require('path');

const PKG_FORMAT = 'zenreading-pkg';
const MANIFEST_FORMAT = 'zenreading-manifest';
const CURRENT_VERSION = 1;

// ── Manifest ──────────────────────────────────────────────

function loadManifest(baseDir) {
  const p = path.join(baseDir, 'manifest.json');
  if (!fs.existsSync(p)) {
    throw new Error(`manifest.json not found at ${p}`);
  }
  const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
  if (raw.format !== MANIFEST_FORMAT) {
    throw new Error(`Invalid manifest format: ${raw.format}`);
  }
  return raw;
}

function saveManifest(baseDir, manifest) {
  const p = path.join(baseDir, 'manifest.json');
  fs.writeFileSync(p, JSON.stringify(manifest, null, 2), 'utf-8');
}

// ── PKG loading ───────────────────────────────────────────

function loadPkg(pkgPath) {
  const raw = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (raw.format !== PKG_FORMAT || raw.version !== CURRENT_VERSION) {
    throw new Error(`Invalid PKG: ${pkgPath} (format=${raw.format}, version=${raw.version})`);
  }
  return raw;
}

/**
 * Load all PKGs from manifest, merge articles & vocabSets, auto-renumber IDs.
 * Returns { articles: [], vocabSets: [], articleSets: [], vocabSetsMeta: [] }
 */
function loadAllEnabled(baseDir) {
  const manifest = loadManifest(baseDir);
  const allArticles = [];
  const allVocabSets = [];
  const articleSets = [];
  const vocabSetsMeta = [];

  let nextArticleId = 1;
  let nextVocabSetId = 1;
  let nextListId = 1;

  for (const entry of manifest.pkgs) {
    const pkgPath = path.resolve(baseDir, entry.path);
    if (!fs.existsSync(pkgPath)) {
      console.warn(`[pkgLoader] PKG not found, skipping: ${pkgPath}`);
      continue;
    }

    let pkg;
    try {
      pkg = loadPkg(pkgPath);
    } catch (e) {
      console.warn(`[pkgLoader] Failed to load PKG ${pkgPath}: ${e.message}`);
      continue;
    }

    const pkgMeta = pkg.meta || {};
    const articleCount = (pkg.articles || []).length;
    const vocabSetCount = (pkg.vocabularySets || []).length;

    // Update cached meta in manifest
    entry.meta = entry.meta || {};
    entry.meta.articleCount = articleCount;
    entry.meta.vocabSetCount = vocabSetCount;
    entry.meta.name = pkgMeta.name || entry.id;
    if (pkgMeta.gradient) {
      entry.meta.gradient = pkgMeta.gradient;
    }

    // Register one article-set entry per language present in this PKG
    if (articleCount > 0) {
      const langCounts = {};
      for (const a of (pkg.articles || [])) {
        const l = a.language || '';
        langCounts[l] = (langCounts[l] || 0) + 1;
      }
      const langSets = pkgMeta.sets || {};
      for (const [lang, count] of Object.entries(langCounts)) {
        const langMeta = langSets[lang] || {};
        articleSets.push({
          id: entry.id,
          title: langMeta.name || pkgMeta.name || entry.id,
          description: langMeta.description || pkgMeta.description || '',
          language: lang,
          gradient: pkgMeta.gradient || entry.meta.gradient || '',
          articleCount: count,
        });
      }
    }

    // Register as a vocab set if this PKG has vocabulary
    if (vocabSetCount > 0) {
      vocabSetsMeta.push({
        id: entry.id,
        title: pkgMeta.name || entry.id,
        description: pkgMeta.description || '',
        language: (pkg.vocabularySets || [])[0]?.language || '',
        gradient: pkgMeta.gradient || entry.meta.gradient || '',
        vocabSetCount,
      });
    }

    // Stamp articles with setId, auto-assign default score, then renumber & merge
    for (const article of (pkg.articles || [])) {
      article.setId = entry.id;
      if (article.questions) {
        for (const q of article.questions) {
          if (q.score == null) q.score = 1;
        }
      }
      article.id = nextArticleId++;
      allArticles.push(article);
    }

    // Stamp vocabSets with setId, renumber & merge
    for (const vs of (pkg.vocabularySets || [])) {
      vs.setId = entry.id;
      vs.id = nextVocabSetId++;
      if (vs.lists) {
        for (const list of vs.lists) {
          list.id = nextListId++;
        }
      }
      allVocabSets.push(vs);
    }
  }

  // Save updated manifest (cached meta may have changed)
  try {
    saveManifest(baseDir, manifest);
  } catch (_) {
    // non-fatal: manifest update can fail silently
  }

  return { articles: allArticles, vocabSets: allVocabSets, articleSets, vocabSetsMeta };
}

module.exports = { loadManifest, saveManifest, loadPkg, loadAllEnabled };
