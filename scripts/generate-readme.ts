/**
 * generate-readme.ts
 *
 * Generates a README.md for a language package from a template.
 *
 * Usage:
 *   pnpm generate:readme --lang ja
 *   pnpm generate:readme --lang ko
 *   pnpm generate:readme --lang ka
 *   pnpm generate:readme --lang th
 *   pnpm generate:readme --lang all
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEMPLATE_PATH = join(ROOT, 'templates', 'language-readme.md');

const LANG_META: Record<string, { language: string; description: string }> = {
  ja: {
    language: 'Japanese',
    description:
      'Japanese SYLLST content — Hiragana, Katakana, Essentials, Numbers, Food, Travel, and Dialogue syllabi',
  },
  ko: {
    language: 'Korean',
    description:
      'Korean SYLLST content — Hangul alphabet, numbers, and essentials syllabi',
  },
  ka: {
    language: 'Georgian',
    description:
      'Georgian SYLLST content — Georgian alphabet (Mkhedruli script), numbers, essentials, grammar, dialogue, and reading syllabi',
  },
  th: {
    language: 'Thai',
    description:
      'Thai SYLLST content — all Thai language syllabi in one package',
  },
};

function countLessons(syllabusDir: string): number {
  try {
    const lessonsDir = join(syllabusDir, 'lessons');
    return readdirSync(lessonsDir).filter((f) => f.endsWith('.mdx')).length;
  } catch (_) {
    return 0;
  }
}

function scanSyllabi(srcDir: string): Array<{ module: string; count: number }> {
  try {
    return readdirSync(srcDir)
      .filter((name) => {
        try {
          return (
            readdirSync(join(srcDir, name)).includes('lessons') &&
            readdirSync(join(srcDir, name, 'lessons')).some((f) =>
              f.endsWith('.mdx'),
            )
          );
        } catch (_) {
          return false;
        }
      })
      .map((module) => ({
        module,
        count: countLessons(join(srcDir, module)),
      }));
  } catch (_) {
    return [];
  }
}

function buildExportsTable(
  lang: string,
  syllabi: Array<{ module: string; count: number }>,
): string {
  return syllabi
    .map(
      ({ module, count }) =>
        `| \`./${module}\` | ${toTitleCase(module)} | ${count} |`,
    )
    .join('\n');
}

function toTitleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function generateReadme(lang: string): void {
  const meta = LANG_META[lang];
  if (!meta) {
    console.error(`Unknown language: ${lang}. Valid: ${Object.keys(LANG_META).join(', ')}`);
    process.exit(1);
  }

  const pkgPath = join(ROOT, 'packages', `syllst-${lang}`, 'package.json');
  const srcDir = join(ROOT, 'packages', `syllst-${lang}`, 'src', 'syllabi');

  let pkgJson: { version: string; description: string };
  try {
    pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    console.error(`Could not read package.json at ${pkgPath}`);
    process.exit(1);
  }

  const syllabi = scanSyllabi(srcDir);

  const template = readFileSync(TEMPLATE_PATH, 'utf-8');

  const today = new Date().toISOString().split('T')[0];

  const readme = template
    .replace(/\{\{LANG\}\}/g, lang)
    .replace(/\{\{LANGUAGE\}\}/g, meta.language)
    .replace(/\{\{DESCRIPTION\}\}/g, meta.description)
    .replace(/\{\{VERSION\}\}/g, pkgJson.version)
    .replace(/\{\{DATE\}\}/g, today)
    .replace('{{EXPORTS_TABLE}}', buildExportsTable(lang, syllabi));

  const outPath = join(ROOT, 'packages', `syllst-${lang}`, 'README.md');
  writeFileSync(outPath, readme, 'utf-8');

  console.log(`✓ README.md written for @syllst/${lang} (${syllabi.length} syllabi, ${syllabi.reduce((a, s) => a + s.count, 0)} lessons total)`);
}

// Main
const args = process.argv.slice(2);
const lang = args[0];

if (!lang) {
  console.error('Usage: tsx scripts/generate-readme.ts {lang}   e.g.: tsx scripts/generate-readme.ts all');
  process.exit(1);
}

if (lang === 'all') {
  Object.keys(LANG_META).forEach((l) => generateReadme(l));
} else {
  generateReadme(lang);
}