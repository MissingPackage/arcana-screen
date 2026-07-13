import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const budgets = {
  '.js': 500 * 1024,
  '.css': 100 * 1024,
};

const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
};

await walk(dist);
const failures = [];
for (const path of files) {
  const extension = Object.keys(budgets).find((candidate) => path.endsWith(candidate));
  if (!extension) continue;
  const size = (await stat(path)).size;
  const budget = budgets[extension];
  const label = relative(dist, path);
  console.log(`${label}: ${(size / 1024).toFixed(1)} KiB / ${(budget / 1024).toFixed(0)} KiB`);
  if (size > budget) failures.push(`${label} exceeds its ${extension} budget`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
