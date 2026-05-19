import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP_FILES = new Set([
  path.join(ROOT, 'app/_layout.tsx'),
  path.join(ROOT, 'components/app/Text.tsx'),
  path.join(ROOT, 'components/app/TextInput.tsx'),
  path.join(ROOT, 'lib/resolve-poppins-style.ts'),
  path.join(ROOT, 'lib/typography.ts'),
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }

      walk(fullPath, files);
      continue;
    }

    if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function patchFile(filePath) {
  if (SKIP_FILES.has(filePath)) {
    return false;
  }

  let source = fs.readFileSync(filePath, 'utf8');

  if (!source.includes("from 'react-native'") && !source.includes('from "react-native"')) {
    return false;
  }

  const importMatch = source.match(
    /import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]react-native['"];?/
  );

  if (!importMatch) {
    return false;
  }

  const isTypeOnly = Boolean(importMatch[1]);
  const specifiers = importMatch[2]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const usesText = specifiers.some((part) => part === 'Text' || part.endsWith(' Text'));
  const usesTextInput = specifiers.some(
    (part) => part === 'TextInput' || part.endsWith(' TextInput')
  );

  if (!usesText && !usesTextInput) {
    return false;
  }

  const remaining = specifiers.filter((part) => {
    const name = part.split(/\s+as\s+/)[0].trim();
    return name !== 'Text' && name !== 'TextInput';
  });

  let nextSource = source;

  if (remaining.length === 0) {
    nextSource = nextSource.replace(importMatch[0], '');
  } else if (isTypeOnly) {
    nextSource = nextSource.replace(importMatch[0], `import type { ${remaining.join(', ')} } from 'react-native';`);
  } else {
    const typeSpecs = remaining.filter((part) => part.startsWith('type '));
    const valueSpecs = remaining.filter((part) => !part.startsWith('type '));

    const lines = [];

    if (valueSpecs.length > 0) {
      lines.push(`import { ${valueSpecs.join(', ')} } from 'react-native';`);
    }

    if (typeSpecs.length > 0) {
      lines.push(`import type { ${typeSpecs.map((part) => part.replace(/^type\s+/, '')).join(', ')} } from 'react-native';`);
    }

    nextSource = nextSource.replace(importMatch[0], lines.join('\n'));
  }

  const extraImports = [];

  if (usesText) {
    extraImports.push("import { Text } from 'components/app/Text';");
  }

  if (usesTextInput) {
    extraImports.push("import { TextInput } from 'components/app/TextInput';");
  }

  const firstImportIndex = nextSource.search(/^import\s+/m);

  if (firstImportIndex === -1) {
    nextSource = `${extraImports.join('\n')}\n${nextSource}`;
  } else {
    nextSource = `${nextSource.slice(0, firstImportIndex)}${extraImports.join('\n')}\n${nextSource.slice(firstImportIndex)}`;
  }

  nextSource = nextSource.replace(/\n{3,}/g, '\n\n');

  if (nextSource !== source) {
    fs.writeFileSync(filePath, nextSource);
    return true;
  }

  return false;
}

const files = walk(path.join(ROOT, 'app')).concat(walk(path.join(ROOT, 'components')));
let patched = 0;

for (const file of files) {
  if (patchFile(file)) {
    patched += 1;
    console.log(`patched: ${path.relative(ROOT, file)}`);
  }
}

console.log(`\nDone. Patched ${patched} files.`);
