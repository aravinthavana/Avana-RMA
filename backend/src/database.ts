import sqlite3 from 'sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const sqlite = sqlite3.verbose();

// Determine database path: Use env var or default to 'database.db' in backend root
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../database.db');

console.log(`Using database file: ${dbPath}`);

const db = new sqlite.Database(dbPath, (err) => {
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
  db.run(`CREATE TABLE IF NOT EXISTS rma_devices (id INTEGER PRIMARY KEY AUTOINCREMENT, rmaId TEXT NOT NULL, articleNumber TEXT, serialNumber TEXT, quantity INTEGER, FOREIGN KEY (rmaId) REFERENCES rmas(id), UNIQUE(serialNumber, rmaId))`);
  db.run(`CREATE TABLE IF NOT EXISTS service_cycles (id INTEGER PRIMARY KEY AUTOINCREMENT, rmaId TEXT NOT NULL, deviceSerialNumber TEXT NOT NULL, status TEXT, creationDate TEXT, statusDate TEXT, issueDescription TEXT, accessoriesIncluded TEXT, FOREIGN KEY (rmaId) REFERENCES rmas(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS service_history (id INTEGER PRIMARY KEY AUTOINCREMENT, serviceCycleId INTEGER NOT NULL, status TEXT, date TEXT, notes TEXT, FOREIGN KEY (serviceCycleId) REFERENCES service_cycles(id))`);

  // Create indexes for performance optimization
  db.run(`CREATE INDEX IF NOT EXISTS idx_rmas_customerId ON rmas(customerId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rmas_creationDate ON rmas(creationDate)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rma_devices_rmaId ON rma_devices(rmaId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_rma_devices_serialNumber ON rma_devices(serialNumber)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_service_cycles_rmaId ON service_cycles(rmaId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_service_cycles_deviceSerialNumber ON service_cycles(deviceSerialNumber)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_service_history_serviceCycleId ON service_history(serviceCycleId)`);

  console.log('Database tables and indexes checked/created.');
});

export default db;
