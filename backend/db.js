import sqlite3 from 'sqlite3';

// Öffnet oder erstellt die SQLite-Datenbankdatei
const dbFile = './users.db';

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err.message);
    } else {
        console.log('Mit SQLite-Datenbank verbunden.');
    }
});

// Tabelle erstellen
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableQuery, (err) => {
    if (err) {
        console.error('Fehler beim Erstellen der Tabelle:', err.message);
    } else {
        console.log('Tabelle "users" ist bereit.');
    }
});

export default db;
