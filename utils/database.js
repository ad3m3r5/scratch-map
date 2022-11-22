import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbLocation = process.env.DBLOCATION || path.join(__dirname, '../data');

let db;

export const validTypes = [
  'countries', 'states', 'canada', 'australia', 'france',
  'mexico', 'japan', 'spain', 'united-kingdom', 'germany',
  'new-zealand', 'brazil', 'china', 'india'
];

export const createConnection = async () => {
  if (!fs.existsSync(dbLocation)){
    fs.mkdirSync(dbLocation, { recursive: true });
  }

  const file = path.join(dbLocation, 'db.json');

  const adapter = new JSONFileSync(file);
  db = new LowSync(adapter);

  db.read();

  db.data ||= {
    version: "1.0",
    scratched: { }
  };

  // check data schema version
  checkDBVersion();

  // update map arrays for new/changed maps
  updateDBMaps();

  db.write();
};

export const getConnection = () => db;


function checkDBVersion() {
  if (!db.data.hasOwnProperty('version')) {
    db.data.version = "1.0";
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
    let importedType = JSON.parse(fs.readFileSync(path.join(__dirname, `./${type}.json`)));
    if (JSON.stringify(db.data[type]) != JSON.stringify(importedType)) {
      db.data[type] = importedType;
    }
  });
}