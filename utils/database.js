import fs from 'fs';
import path from "path";
import { JSONFileSyncPreset } from 'lowdb/node'

let db;
let dbFile;

const defaultData = {
  version: "1.3",
  scratched: { }
};

export const validTypes = [
  'world', 'united-states-of-america', 'canada', 'australia', 'france',
  'mexico', 'japan', 'spain', 'united-kingdom', 'germany',
  'new-zealand', 'brazil', 'china', 'india'
];

export const createConnection = async () => {
  // create DATA_DIR if it does not exist
  if (!fs.existsSync(global.DATA_DIR)) {
    if (global.LOG_LEVEL == 'DEBUG') console.debug(`Creating ${global.DATA_DIR}`);
    fs.mkdirSync(global.DATA_DIR, { recursive: true });
  }

  dbFile = path.join(global.DATA_DIR, '/db.json');

  db = JSONFileSyncPreset(dbFile, defaultData);

  db.read();

  // check data schema version
  checkDBVersion();

  // update map arrays for new/changed maps
  updateDBMaps();

  db.write();
};

export const getConnection = () => db;

function checkDBVersion() {
  // add version for <none> or v1
  if (!db.data.hasOwnProperty('version')) {
    if (global.LOG_LEVEL == 'DEBUG') console.debug(`Migrating to DB Version 1.0\n`);

    let dbBackupFile = path.join(global.DATA_DIR, '/db.v1.backup');
    fs.copyFileSync(dbFile, dbBackupFile);

    db.data.version = '1.0';
  } else {
    if (global.LOG_LEVEL == 'DEBUG') console.debug(`Current DB version: ${db.data.version}\n`);
  }

  // migrate to db version 1.2
  if (db.data.version == '1.0') {
    if (global.LOG_LEVEL == 'DEBUG') console.debug(`Migrating to DB Version 1.2\n`);

    let dbBackupFile = path.join(global.DATA_DIR, '/db.v1.0.backup');
    fs.copyFileSync(dbFile, dbBackupFile);

    // rename: countries
    if (db.data.scratched.hasOwnProperty('countries')) {
      db.data.scratched.world = db.data.scratched.countries;
      delete db.data.scratched.countries;
    }
    if (db.data.hasOwnProperty('countries')) {
      db.data.world = db.data.countries;
      delete db.data.countries;
    }
    // rename: states
    if (db.data.scratched.hasOwnProperty('states')) {
      db.data.scratched['united-states-of-america'] = db.data.scratched.states;
      delete db.data.scratched.states;
    }
    if (db.data.hasOwnProperty('states')) {
      db.data['united-states-of-america'] = db.data.states;
      delete db.data.states;
    }

    // bump version
    db.data.version = '1.2';
  }

  // migrate to db version 1.3
  if (db.data.version == '1.2') {
    if (global.LOG_LEVEL == 'DEBUG') console.debug(`Migrating to DB Version 1.3\n`);

    let dbBackupFile = path.join(global.DATA_DIR, '/db.v1.2.backup');
    fs.copyFileSync(dbFile, dbBackupFile);

    // move individual visit to array
    Object.keys(db.data.scratched).forEach(key => {
      if (db.data.scratched[key].length > 0) {
        db.data.scratched[key].forEach((visit, index) => {
          if (visit.hasOwnProperty('year') || visit.hasOwnProperty('url')) {
            let newVisit = { date: convertYear(visit.year), url: visit.url };
            db.data.scratched[key][index].visits = [ newVisit ];
            delete db.data.scratched[key][index].year;
            delete db.data.scratched[key][index].url;
          }
        });
      }
    });

    // bump version
    db.data.version = '1.3';
  }
}

function updateDBMaps() {
  // update types in DB if changed
  validTypes.forEach(type => {
    // add array to scratched for each validType
    if (!db.data.scratched.hasOwnProperty(type)) {
      db.data.scratched[type] = [];
    }

    // import json for each validType
    let importedType = JSON.parse(fs.readFileSync(path.join(global.__rootDir, `/utils/codes/${type}.json`)));
    if (JSON.stringify(db.data[type]) != JSON.stringify(importedType)) {
      db.data[type] = importedType;
    }
  });
}

function convertYear(year) {
  if (year.length == 0) {
    return ``;
  }
  if (year.length == 2) {
    return `01-01-20${year}`;
  } else {
    return `01-01-${year}`;
  }
}
