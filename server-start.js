// Cross-platform server start wrapper
// Usage: `npm run start` or `node server-start.js -p 3000`
const { spawn } = require('child_process');

function getPortFromArgs() {
  const argv = process.argv.slice(2);
  const pIndex = argv.indexOf('-p');
  if (pIndex !== -1 && argv[pIndex + 1]) return argv[pIndex + 1];
  // also accept --port
  const pLongIndex = argv.indexOf('--port');
  if (pLongIndex !== -1 && argv[pLongIndex + 1]) return argv[pLongIndex + 1];
  return null;
}

const portArg = getPortFromArgs();
const port = portArg || process.env.PORT || '3000';

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(cmd, ['next', 'start', '-p', port], { stdio: 'inherit', shell: false });

child.on('close', (code) => process.exit(code));
child.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});
