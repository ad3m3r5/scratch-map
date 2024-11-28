import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
global.__rootDir = path.join(__dirname, '..');
const localDataDir = path.join(__rootDir, '/data');

global.ADDRESS = process.env.ADDRESS || '0.0.0.0';
global.PORT = process.env.PORT || 3000;
global.DATA_DIR = process.env.DATA_DIR || process.env.DBLOCATION || localDataDir;

// colors
global.COLOR_UNSCRATCHED = process.env.COLOR_UNSCRATCHED || '#cca11f';
global.COLOR_UNSCRATCHED_HOVER = process.env.COLOR_UNSCRATCHED_HOVER || '#8f8f8f';
global.COLOR_SCRATCHED = process.env.COLOR_SCRATCHED || '#c2c2c2';
global.COLOR_TEXT = process.env.COLOR_TEXT || '#ffffff';
global.COLOR_OUTLINES = process.env.COLOR_OUTLINES || '#ffffff';

// allow LOG_LEVEL to be any case
if ('LOG_LEVEL' in process.env) {
  // verbosity numbers based on syslog - https://en.wikipedia.org/wiki/Syslog
  let logLevel = process.env.LOG_LEVEL.trim().toUpperCase();
  if (logLevel === 'INFO' || logLevel === '6') {
    global.LOG_LEVEL = 'INFO';
  } else if (logLevel === 'DEBUG' || logLevel === '7') {
    global.LOG_LEVEL = 'DEBUG';
  }else {
    console.error(`Invalid LOG_LEVEL provided [${process.env.LOG_LEVEL}], defaulting to INFO`);
    global.LOG_LEVEL = 'INFO';
  }
} else {
  global.LOG_LEVEL = 'INFO';
}

// allow ENABLE_SHARE to be any case or 1/0
if ('ENABLE_SHARE' in process.env) {
  let enableShare = process.env.ENABLE_SHARE.trim().toLowerCase();
  if (enableShare === 'true' || enableShare === '1') {
    global.ENABLE_SHARE = true;
  } else if (enableShare === 'false' || enableShare === '0') {
    global.ENABLE_SHARE = false;
  } else {
    console.error(`Invalid ENABLE_SHARE provided [${process.env.ENABLE_SHARE}], defaulting to false`);
    global.ENABLE_SHARE = false;
  }
} else {
  global.ENABLE_SHARE = false;
}

// debug output
if (global.LOG_LEVEL == 'DEBUG') {
  console.debug('globals.js:');

  console.debug("  __dirname:", __dirname);
  console.debug("  global.__rootDir:", global.__rootDir);
  console.debug("  localDataDir:", localDataDir, "\n");

  console.debug("  global.ADDRESS:", global.ADDRESS);
  console.debug("  global.PORT:", global.PORT);
  console.debug("  global.DATA_DIR:", global.DATA_DIR);
  console.debug("  global.LOG_LEVEL:", global.LOG_LEVEL);
  console.debug("  global.ENABLE_SHARE:", global.ENABLE_SHARE, "\n");

  console.debug("  global.COLOR_UNSCRATCHED:", global.COLOR_UNSCRATCHED);
  console.debug("  global.COLOR_UNSCRATCHED_HOVER:", global.COLOR_UNSCRATCHED_HOVER);
  console.debug("  global.COLOR_SCRATCHED:", global.COLOR_SCRATCHED);
  console.debug("  global.COLOR_TEXT:", global.COLOR_TEXT);
  console.debug("  global.COLOR_OUTLINES:", global.COLOR_OUTLINES);

  console.debug("\n");
}
