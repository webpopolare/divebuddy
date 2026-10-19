import fs from 'node:fs/promises';
import path from 'node:path';

const MANIFEST_PATH = 'migration/manifest.json';
const SOURCE_DIR = 'migration/source';
const ARTICLES_DIR = 'src/content/articles';
const RESOURCES_DIR = 'src/content/resources';

function formatScalar(value) {
  if (typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return 'null';
  return JSON.stringify(String(value));
}

function stringifyYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  let out = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        out += `${pad}${key}: []\n`;
      } else {
        out += `${pad}${key}:\n`;
        for (const item of value) {
          out += `${pad}  - ${formatScalar(item)}\n`;
        }
      }
    } else if (value && typeof value === 'object') {
      out += `${pad}${key}:\n${stringifyYaml(value, indent + 1)}`;
    } else {
      out += `${pad}${key}: ${formatScalar(value)}\n`;
    }
  }

  return out;
}

function stripFrontmatter(markdown) {
  const match = /^---\s*\n[\s\S]*?\n---\s*\n?/.exec(markdown);
  return match ? markdown.slice(match[0].length).trim() : markdown.trim();
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readOptional(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

function buildArticleFrontmatter(raw) {
  const publishDate = raw.publishDate;

  return {
    title: raw.title,
    description: raw.description,
    slug: raw.slug,
    hub: raw.hub,
    clusters: raw.clusters ?? [],
    series: raw.series,
    audience: raw.audience ?? [],
    status: 'published',
    priority: raw.priority ?? 'P3',
    tone: 'ispirazionale',
    voice: 'femminile',
    language: 'it-IT',
    publishDate,
    updatedDate: raw.updatedDate ?? publishDate,
    author: 'DiveBuddy',
    ogImage: raw.ogImage ?? `/images/og/${raw.slug}.jpg`,
    cta: raw.cta ?? 'Raccontamelo nei commenti.',
    related: raw.related ?? [],
    tags: raw.tags ?? [],
    featured: raw.featured ?? raw.priority === 'P1',
    showToc: true,
    showKeyTakeaways: true,
    showNewsletter: true,
    showComments: true,
  };
}

function buildResourceFrontmatter(raw) {
  return {
    title: raw.title,
    description: raw.description,
    slug: raw.slug,
    type: raw.type ?? 'checklist',
    audience: raw.audience ?? [],
    publishDate: raw.publishDate,
    relatedArticles: raw.relatedArticles ?? [],
  };
}

async function main() {
  const manifestRaw = await fs.readFile(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  await fs.mkdir(RESOURCES_DIR, { recursive: true });
  await fs.mkdir(SOURCE_DIR, { recursive: true });

  let created = 0;
  let updated = 0;

  for (const item of manifest) {
    const isResource = item.collection === 'resources';
    const dir = isResource ? RESOURCES_DIR : ARTICLES_DIR;
    const filePath = path.join(dir, `${item.slug}.md`);
    const sourcePath = path.join(SOURCE_DIR, `${item.slug}.md`);

    const frontmatter = isResource
      ? buildResourceFrontmatter(item.frontmatter)
      : buildArticleFrontmatter(item.frontmatter);

    const sourceBody = await readOptional(sourcePath);
    const body = sourceBody
      ? stripFrontmatter(sourceBody)
      : `# ${frontmatter.title}\n\n<!--\n  Incolla qui il copy blog definitivo in italiano.\n  Oppure salva il testo in migration/source/${item.slug}.md e rilancia lo script.\n-->\n`;

    const exists = await fileExists(filePath);
    const content = `---\n${stringifyYaml(frontmatter)}---\n\n${body}\n`;

    await fs.writeFile(filePath, content, 'utf8');

    if (exists) updated++;
    else created++;

    console.log(`${exists ? 'Updated' : 'Created'}: ${filePath}`);
  }

  console.log('\nMigration complete.');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log('\nNext steps:');
  console.log('1. Optional: put existing article bodies in migration/source/<slug>.md');
  console.log('2. Re-run: node scripts/generate-content.mjs');
  console.log('3. Add OG images in public/images/og/');
  console.log('4. Run: npm run build');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});