import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../../');
const DEFAULT_SOURCE_DIR = path.resolve(REPO_ROOT, 'ebooks/diario_del_guerrero');
const DEFAULT_OUTPUT = path.resolve(REPO_ROOT, 'apps/sport-planner/diario_del_guerrero.upsert.sql');

const MONTHS_ES = new Map([
  ['enero', 1],
  ['febrero', 2],
  ['marzo', 3],
  ['abril', 4],
  ['mayo', 5],
  ['junio', 6],
  ['julio', 7],
  ['agosto', 8],
  ['septiembre', 9],
  ['setiembre', 9],
  ['octubre', 10],
  ['noviembre', 11],
  ['diciembre', 12]
]);

function usage() {
  // eslint-disable-next-line no-console
  console.log(`
Generate an idempotent SQL upsert file for Diario del Guerrero readings.

Usage:
  node scripts/generate_diario_del_guerrero_sql.mjs \\
    --owner-id <uuid> \\
    --owner-email <email> \\
    --objective-id <string> \\
    --tag <string> \\
    [--source <path-to-ebooks/diario_del_guerrero>] \\
    [--output <path.sql>] \\
    [--output-dir <dir>] \\
    [--split-by month] \\
    [--doy <comma-separated numbers>] \\
    [--doy-range <start-end>] \\
    [--limit <n>]

Defaults:
  --source  ${DEFAULT_SOURCE_DIR}
  --output  ${DEFAULT_OUTPUT}

Example (POC 3 entries):
  node scripts/generate_diario_del_guerrero_sql.mjs \\
    --owner-id 6c3b5aa5-ee38-48ec-8c48-14e368a69f53 \\
    --owner-email maballesteros@gmail.com \\
    --objective-id obj-diario-del-guerrero \\
    --tag diario-del-guerrero \\
    --doy 30,31,32

Example (split by month):
  node scripts/generate_diario_del_guerrero_sql.mjs \\
    --owner-id 6c3b5aa5-ee38-48ec-8c48-14e368a69f53 \\
    --owner-email maballesteros@gmail.com \\
    --objective-id obj-diario-del-guerrero \\
    --tag diario-del-guerrero \\
    --split-by month \\
    --output-dir apps/sport-planner/diario_del_guerrero_sql
`.trim());
}

function parseArgs(argv) {
  const args = {
    ownerId: '',
    ownerEmail: '',
    objectiveId: '',
    tag: '',
    sourceDir: DEFAULT_SOURCE_DIR,
    output: DEFAULT_OUTPUT,
    outputDir: '',
    splitBy: '',
    doyList: undefined,
    doyRange: undefined,
    limit: undefined
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      return { ...args, help: true };
    }
    const next = argv[i + 1];
    if (arg === '--owner-id') {
      args.ownerId = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--owner-email') {
      args.ownerEmail = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--objective-id') {
      args.objectiveId = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--tag') {
      args.tag = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--source') {
      args.sourceDir = path.resolve(process.cwd(), String(next ?? ''));
      i += 1;
      continue;
    }
    if (arg === '--output') {
      args.output = path.resolve(process.cwd(), String(next ?? ''));
      i += 1;
      continue;
    }
    if (arg === '--output-dir') {
      args.outputDir = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--split-by') {
      args.splitBy = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--doy') {
      args.doyList = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--doy-range') {
      args.doyRange = String(next ?? '');
      i += 1;
      continue;
    }
    if (arg === '--limit') {
      args.limit = Number(next);
      i += 1;
      continue;
    }
    throw new Error(`Unknown arg: ${arg}`);
  }

  return args;
}

function dayOfYearNonLeap(month, day) {
  // Use a fixed non-leap year.
  const year = 2021;
  const start = Date.UTC(year, 0, 1);
  const date = Date.UTC(year, month - 1, day);
  const diffDays = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  return diffDays + 1;
}

function extractDayMonthFromFilename(filename) {
  const base = path.basename(filename).toLowerCase();
  const match = base.match(/^(\d{2})_([a-záéíóúñ]+)\.md$/i);
  if (!match) return null;
  const day = Number(match[1]);
  const monthName = match[2].normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const month = MONTHS_ES.get(monthName);
  if (!Number.isFinite(day) || !month) return null;
  return { day, month, monthName: match[2] };
}

function isIntroFile(filePath) {
  return path.basename(filePath).toLowerCase().startsWith('00_intro');
}

function firstHeading(markdown) {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

function buildDollarDelim(base) {
  const clean = base.replace(/[^a-z0-9_]/gi, '_');
  return `$${clean}$`;
}

function pickSafeDollarDelim(preferred, markdown) {
  if (!markdown.includes(preferred)) return preferred;
  for (let i = 0; i < 100; i += 1) {
    const candidate = `${preferred.slice(0, -1)}_${i}$`;
    if (!markdown.includes(candidate)) return candidate;
  }
  return '$dg$';
}

function buildWorkId(doy) {
  const suffix = String(doy).padStart(3, '0');
  return `dg-reading-doy-${suffix}`;
}

function buildWorkName(label, heading) {
  const trimmedHeading = (heading ?? '').replace(/^\d+\s*\w+\s*:\s*/i, '').trim();
  if (!heading) return `Diario del Guerrero · ${label}`;
  return `Diario del Guerrero · ${label} — ${trimmedHeading || heading}`;
}

function collectEntries(sourceDir) {
  const monthDirs = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(sourceDir, entry.name))
    .filter((dir) => path.basename(dir).toLowerCase().startsWith('mes_'))
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

  const files = [];
  for (const dir of monthDirs) {
    const monthFiles = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(dir, entry.name))
      .filter((file) => file.toLowerCase().endsWith('.md'))
      .filter((file) => !isIntroFile(file))
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    files.push(...monthFiles);
  }

  const entries = [];
  for (const file of files) {
    const meta = extractDayMonthFromFilename(file);
    if (!meta) continue;
    const doy = dayOfYearNonLeap(meta.month, meta.day);
    const markdown = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const heading = firstHeading(markdown);
    const monthAbbrev = meta.monthName.slice(0, 3);
    const label = `${meta.day} ${monthAbbrev[0]?.toUpperCase() ?? ''}${monthAbbrev.slice(1)}`;
    entries.push({
      file,
      day: meta.day,
      month: meta.month,
      doy,
      id: buildWorkId(doy),
      name: buildWorkName(label, heading),
      markdown
    });
  }

  return entries.sort((a, b) => a.doy - b.doy);
}

function sqlStringLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function parseDoySelection({ doyList, doyRange }) {
  const selected = new Set();

  if (typeof doyList === 'string' && doyList.trim().length > 0) {
    doyList
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const num = Number(part);
        if (Number.isFinite(num)) selected.add(Math.trunc(num));
      });
  }

  if (typeof doyRange === 'string' && doyRange.trim().length > 0) {
    const m = doyRange.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const start = Math.trunc(Number(m[1]));
      const end = Math.trunc(Number(m[2]));
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      for (let n = lo; n <= hi; n += 1) selected.add(n);
    }
  }

  return selected.size > 0 ? selected : null;
}

function monthFilename(monthNumber) {
  const suffix = String(monthNumber).padStart(2, '0');
  return `diario_del_guerrero.upsert.mes_${suffix}.sql`;
}

function groupByMonth(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const list = map.get(entry.month) ?? [];
    list.push(entry);
    map.set(entry.month, list);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, list]) => [month, list.sort((a, b) => a.doy - b.doy)]);
}

function generateSql(opts, preloadedEntries) {
  const nowIso = new Date().toISOString();
  const header = [
    '-- Generated by scripts/generate_diario_del_guerrero_sql.mjs',
    `-- Generated at: ${nowIso}`,
    '--',
    '-- This file is idempotent: INSERT ... ON CONFLICT DO UPDATE.',
    '-- Execute it in Supabase SQL editor or via psql.',
    ''
  ].join('\n');

  const entries = Array.isArray(preloadedEntries) ? preloadedEntries : collectEntries(opts.sourceDir);
  const selected = parseDoySelection({ doyList: opts.doyList, doyRange: opts.doyRange });
  const filtered = selected ? entries.filter((entry) => selected.has(entry.doy)) : entries;
  const limited =
    typeof opts.limit === 'number' && Number.isFinite(opts.limit)
      ? filtered.slice(0, Math.max(0, Math.trunc(opts.limit)))
      : filtered;

  const rows = limited.map((entry) => {
    const delimBase = buildDollarDelim(`dg_${entry.id}`);
    const delim = pickSafeDollarDelim(delimBase, entry.markdown);
    return [
      `  ('${entry.id}',`,
      `   ${sqlStringLiteral(opts.ownerId)},`,
      `   ${sqlStringLiteral(opts.ownerEmail)},`,
      "   'private',",
      `   ${sqlStringLiteral(entry.name)},`,
      '   null,',
      `   ${sqlStringLiteral(opts.objectiveId)},`,
      `   ${delim}${entry.markdown}${delim},`,
      '   5,',
      "   'reading',",
      `   jsonb_build_array(${sqlStringLiteral(opts.tag)}),`,
      "   'day_of_year',",
      `   ${entry.doy})`
    ].join('\n');
  });

  const sql = [
    header,
    'insert into public.works (',
    '  id,',
    '  owner_id,',
    '  owner_email,',
    '  visibility,',
    '  name,',
    '  subtitle,',
    '  objective_id,',
    '  description_markdown,',
    '  estimated_minutes,',
    '  node_type,',
    '  tags,',
    '  schedule_kind,',
    '  schedule_number',
    ') values',
    rows.join(',\n'),
    'on conflict (id) do update set',
    '  name = excluded.name,',
    '  subtitle = excluded.subtitle,',
    '  objective_id = excluded.objective_id,',
    '  description_markdown = excluded.description_markdown,',
    '  estimated_minutes = excluded.estimated_minutes,',
    '  node_type = excluded.node_type,',
    '  tags = excluded.tags,',
    '  schedule_kind = excluded.schedule_kind,',
    '  schedule_number = excluded.schedule_number,',
    '  updated_at = now();',
    ''
  ].join('\n');

  return { sql, total: entries.length, matched: filtered.length, emitted: limited.length };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(String(error?.message ?? error));
    usage();
    process.exit(1);
  }

  if (args.help) {
    usage();
    return;
  }

  const ownerId = args.ownerId.trim();
  const ownerEmail = args.ownerEmail.trim();
  const objectiveId = args.objectiveId.trim();
  const tag = args.tag.trim().toLowerCase();

  if (!ownerId || !ownerEmail || !objectiveId || !tag) {
    // eslint-disable-next-line no-console
    console.error('Missing required flags: --owner-id, --owner-email, --objective-id, --tag');
    usage();
    process.exit(1);
  }

  if (!fs.existsSync(args.sourceDir)) {
    // eslint-disable-next-line no-console
    console.error(`Source dir not found: ${args.sourceDir}`);
    process.exit(1);
  }

  const selection = [];
  if (args.doyList) selection.push(`doy=${args.doyList}`);
  if (args.doyRange) selection.push(`doy-range=${args.doyRange}`);
  const selectionLabel = selection.length > 0 ? ` (${selection.join(', ')})` : '';

  const splitBy = (args.splitBy ?? '').trim().toLowerCase();
  const wantsSplit = splitBy.length > 0;

  if (wantsSplit && splitBy !== 'month') {
    // eslint-disable-next-line no-console
    console.error(`Unsupported --split-by value: ${args.splitBy}. Supported: month`);
    process.exit(1);
  }

  if (wantsSplit) {
    const outputDirRaw = (args.outputDir ?? '').trim();
    if (!outputDirRaw) {
      // eslint-disable-next-line no-console
      console.error('Missing required flag for split mode: --output-dir');
      process.exit(1);
    }

    const resolvedDir = path.resolve(process.cwd(), outputDirRaw);
    const allEntries = collectEntries(args.sourceDir);
    const selected = parseDoySelection({ doyList: args.doyList, doyRange: args.doyRange });
    const filtered = selected ? allEntries.filter((entry) => selected.has(entry.doy)) : allEntries;
    const limited =
      typeof args.limit === 'number' && Number.isFinite(args.limit)
        ? filtered.slice(0, Math.max(0, Math.trunc(args.limit)))
        : filtered;

    const byMonth = groupByMonth(limited);
    fs.mkdirSync(resolvedDir, { recursive: true });

    for (const [month, monthEntries] of byMonth) {
      const { sql } = generateSql(
        {
          ownerId,
          ownerEmail,
          objectiveId,
          tag,
          sourceDir: args.sourceDir,
          doyList: undefined,
          doyRange: undefined,
          limit: undefined
        },
        monthEntries
      );
      const outPath = path.join(resolvedDir, monthFilename(month));
      fs.writeFileSync(outPath, sql, 'utf8');
    }

    // eslint-disable-next-line no-console
    console.log(
      `Wrote ${limited.length} entries${selectionLabel} split into ${byMonth.length} files at: ${resolvedDir}`
    );
    return;
  }

  const { sql, emitted } = generateSql({
    ownerId,
    ownerEmail,
    objectiveId,
    tag,
    sourceDir: args.sourceDir,
    doyList: args.doyList,
    doyRange: args.doyRange,
    limit: args.limit
  });

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, sql, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Wrote ${emitted} entries${selectionLabel} to: ${args.output}`);
}

main();
