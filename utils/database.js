import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbLocation = process.env.DBLOCATION || path.join(__dirname, '../data');

let db;

export const createConnection = async () => {
  if (!fs.existsSync(dbLocation)){
    fs.mkdirSync(dbLocation, { recursive: true });
  }

  const file = path.join(dbLocation, 'db.json');

  const adapter = new JSONFile(file);
  db = new Low(adapter);

  await db.read();

  db.data ||= {
    scratched: { countries: [], states: [] },
    countries: JSON.parse(fs.readFileSync(path.join(__dirname, './countries.json'))),
    states: JSON.parse(fs.readFileSync(path.join(__dirname, './states.json')))
  };

  await db.write();
};

export const getConnection = () => db;