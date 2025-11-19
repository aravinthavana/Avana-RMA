import sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();
const db = new sqlite.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  // Create tables if they don't exist
  db.run(`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, contactPerson TEXT, email TEXT, phone TEXT, address TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS rmas (id TEXT PRIMARY KEY, customerId TEXT NOT NULL, creationDate TEXT, lastUpdateDate TEXT, dateOfIncident TEXT, dateOfReport TEXT, attachment TEXT, FOREIGN KEY (customerId) REFERENCES customers(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS rma_devices (id INTEGER PRIMARY KEY AUTOINCREMENT, rmaId TEXT NOT NULL, model TEXT, partNumber TEXT, serialNumber TEXT, quantity INTEGER, FOREIGN KEY (rmaId) REFERENCES rmas(id), UNIQUE(serialNumber, rmaId))`);
  db.run(`CREATE TABLE IF NOT EXISTS service_cycles (id INTEGER PRIMARY KEY AUTOINCREMENT, rmaId TEXT NOT NULL, deviceSerialNumber TEXT NOT NULL, status TEXT, creationDate TEXT, statusDate TEXT, issueDescription TEXT, accessoriesIncluded TEXT, FOREIGN KEY (rmaId) REFERENCES rmas(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS service_history (id INTEGER PRIMARY KEY AUTOINCREMENT, serviceCycleId INTEGER NOT NULL, status TEXT, date TEXT, notes TEXT, FOREIGN KEY (serviceCycleId) REFERENCES service_cycles(id))`);
  console.log('Database tables checked/created.');
});

export default db;
