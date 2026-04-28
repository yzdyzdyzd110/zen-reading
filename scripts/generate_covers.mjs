#!/usr/bin/env node
/** Generate cover images for ZenReading articles using 豆包 seedream model. */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'frontend', 'public', 'covers');
const API_KEY = 'bfbbb398-e666-4a93-8da5-95345a13f20f';
const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

const ARTICLES = [
  {
    id: 1,
    title: 'The Lost City of Atlantis',
    prompt:
      'Ancient underwater ruins of a lost civilization, sunken beneath the deep blue ocean, ' +
      'sunbeams piercing through turquoise water, mysterious stone pillars and arches, ' +
      'ethereal atmosphere, cinematic lighting, photorealistic, wide angle',
  },
  {
    id: 2,
    title: 'The Art of Deep Focus',
    prompt:
      'Zen meditation scene, smooth balancing stones on a misty lake shore at dawn, ' +
      'soft warm golden light, calm tranquil atmosphere, minimalist composition, ' +
      'shallow depth of field, photorealistic, peaceful aesthetic',
  },
  {
    id: 3,
    title: 'The Science of White Noise',
    prompt:
      'Abstract flowing sound wave visualization, gentle curves like audio frequencies, ' +
      'serene gradient from deep blue to soft purple, minimal clean design, ' +
      'smooth gradient background, calming ambient aesthetic, digital art',
  },
  {
    id: 4,
    title: 'The Pomodoro Technique',
    prompt:
      'Cozy study desk from above, a red tomato shaped mechanical kitchen timer as focal point, ' +
      'open notebook, steaming coffee cup, warm morning sunlight, ' +
      'minimalist workspace, hygge atmosphere, photorealistic, soft shadows',
  },
  {
    id: 5,
    title: 'Climate Change and Global Food Security',
    prompt:
      'Looking up through a dense lush green forest canopy towards bright sky, ' +
      'sunlight streaming through layers of leaves, sense of hope and renewal, ' +
      'majestic old growth trees, environmental conservation theme, ' +
      'photorealistic, inspiring nature photography',
  },
];

async function generateImage(prompt) {
  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-5-251128',
      prompt,
      sequential_image_generation: 'disabled',
      response_format: 'url',
      size: '2K',
      stream: false,
      watermark: true,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`  API error (${resp.status}): ${text.slice(0, 200)}`);
    return null;
  }

  const result = await resp.json();
  const data = result.data;
  if (!data || !data[0]?.url) {
    console.error(`  No image URL: ${JSON.stringify(result).slice(0, 200)}`);
    return null;
  }
  return data[0].url;
}

async function downloadImage(url, filepath) {
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`  Download failed (${resp.status})`);
    return false;
  }
  const buffer = Buffer.from(await resp.arrayBuffer());
  writeFileSync(filepath, buffer);
  console.log(`  Saved: ${filepath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return true;
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const results = {};

  for (const article of ARTICLES) {
    console.log(`\n[${article.id}/5] ${article.title}`);
    console.log(`  Prompt: ${article.prompt.slice(0, 80)}...`);

    const imageUrl = await generateImage(article.prompt);
    if (!imageUrl) {
      console.log('  FAILED: no image URL');
      continue;
    }

    const filename = `cover_${article.id}.png`;
    const filepath = join(OUTPUT_DIR, filename);
    if (await downloadImage(imageUrl, filepath)) {
      results[article.id] = `/covers/${filename}`;
    }

    // rate limit
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Done. Generated ${Object.keys(results).length}/5 images.`);
  console.log(`Images saved to: ${OUTPUT_DIR}`);
  console.log('\nCopy these into articles.json image fields:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
