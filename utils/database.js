import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbLocation = process.env.DBLOCATION || path.join(__dirname, '../data');

let db;

export const validTypes = [
  'world', 'united-states-of-america', 'canada', 'australia', 'france',
  'mexico', 'japan', 'spain', 'united-kingdom', 'germany',
  'new-zealand', 'brazil', 'china', 'india'
];

export const createConnection = async () => {
  if (!fs.existsSync(dbLocation)){
    fs.mkdirSync(dbLocation, { recursive: true });
  }

  const file = path.join(dbLocation, 'db.json');
  console.log("dbLocation: " + file)

  const adapter = new JSONFileSync(file);
  db = new LowSync(adapter);

  db.read();

  db.data ||= {
    version: "1.2",
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
  // add version for <none> or v1
  if (!db.data.hasOwnProperty('version')) {
    db.data.version = '1.0';
  } else {
    console.log('Current DB version: ' + db.data.version)
  }

  // update 1.0 to 1.2
  /*
    CHANGES:
      * RENAME: 'countries' -> 'world'
      * RENAME: 'states' -> 'united-states-of-america'
  */
  if (db.data.version == '1.0') {
    // RENAME: countries
    if (db.data.scratched.hasOwnProperty('countries')) {
      db.data.scratched.world = db.data.scratched.countries;
      delete db.data.scratched.countries;
    }
    if (db.data.hasOwnProperty('countries')) {
      db.data.world = db.data.countries;
      delete db.data.countries;
    }
    // RENAME: states
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