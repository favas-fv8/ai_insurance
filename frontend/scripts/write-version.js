const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runGit(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (err) {
    return '';
  }
}

function resolveVersion() {
  const described = runGit('describe --tags --abbrev=0');
  if (described) return described.replace(/^v/i, '');
  const latest = runGit('tag --sort=-v:refname');
  if (latest) return latest.split(/\r?\n/)[0].replace(/^v/i, '');
  return process.env.REACT_APP_VERSION || '1.0.0';
}

const version = resolveVersion();
const output = path.join(__dirname, '..', 'src', 'version.js');
fs.writeFileSync(
  output,
  `// Auto-generated from the latest git tag by scripts/write-version.js. Do not edit manually.\nconst appVersion = ${JSON.stringify(version)};\nexport default appVersion;\n`
);
console.log(`[write-version] App version: ${version}`);