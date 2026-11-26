'use strict';
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const { SCHEMA, SCHEMA_V2, SCHEMA_V3, COLUMNS } = require('./schema');

function open(file) {
  const target = file || path.join(__dirname, '..', '..', 'data', 'academy.db');
  if (target !== ':memory:') fs.mkdirSync(path.dirname(target), { recursive: true });
  const db = new DatabaseSync(target);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  db.exec(SCHEMA); db.exec(SCHEMA_V2); db.exec(SCHEMA_V3);
  for (const [t, c, def] of COLUMNS) if (!db.prepare(`PRAGMA table_info(${t})`).all().some((x) => x.name === c)) db.exec(`ALTER TABLE ${t} ADD COLUMN ${c} ${def}`);
  return db;
}
module.exports = { open };
