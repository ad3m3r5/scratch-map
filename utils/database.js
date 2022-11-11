import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbLocation = process.env.DBLOCATION || path.join(__dirname, '../data');

let db;

export const createConnection = async () => {
  if (!fs.existsSync(dbLocation)){
    fs.mkdirSync(dbLocation, { recursive: true });
  }

  const file = path.join(dbLocation, 'db.json');

  const adapter = new JSONFileSync(file);
  db = new LowSync(adapter);

  db.read();

  db.data ||= {
    scratched: { countries: [], states: [] },
    countries: JSON.parse(fs.readFileSync(path.join(__dirname, './countries.json'))),
    states: JSON.parse(fs.readFileSync(path.join(__dirname, './states.json')))
  };

  // update countries and states in DB if changed
  let countries = JSON.parse(fs.readFileSync(path.join(__dirname, './countries.json')))
  let states = JSON.parse(fs.readFileSync(path.join(__dirname, './states.json')))

  if (JSON.stringify(db.data.countries) != JSON.stringify(countries)) {
    db.data.countries = countries;
  }
  if (JSON.stringify(db.data.states) != JSON.stringify(states)) {
    db.data.states = states;
  }

  db.write();
};

export const getConnection = () => db;