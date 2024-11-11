import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
global.__rootDir = path.join(__dirname, '..');
const localDataDir = path.join(__rootDir, '/data');

global.ADDRESS = process.env.ADDRESS || '0.0.0.0';
global.PORT = process.env.PORT || 3000;
global.DATA_DIR = process.env.DATA_DIR || localDataDir;
global.LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

if (global.LOG_LEVEL == 'DEBUG') {
  console.debug('globals.js:');

  console.debug("  __dirname:", __dirname);
  console.debug("  global.__rootDir:", global.__rootDir);
  console.debug("  localDataDir:", localDataDir);

  console.debug("  global.ADDRESS:", global.ADDRESS);
  console.debug("  global.PORT:", global.PORT);
  console.debug("  global.DATA_DIR:", global.DATA_DIR);
  console.debug("  global.LOG_LEVEL:", global.LOG_LEVEL);

  console.debug("\n");
}
