import { copyFile, mkdir, readdir, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(projectRoot, 'dist');
const clientDir = join(distDir, 'client');
const serverDir = join(distDir, 'server');

await mkdir(clientDir, { recursive: true });

for (const entry of await readdir(distDir, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server' || entry.name === '.openai') continue;
  await rename(join(distDir, entry.name), join(clientDir, entry.name));
}

await mkdir(serverDir, { recursive: true });
await copyFile(
  join(projectRoot, 'worker', 'sites-worker.js'),
  join(serverDir, 'index.js'),
);

console.log('Sites build prepared.');
