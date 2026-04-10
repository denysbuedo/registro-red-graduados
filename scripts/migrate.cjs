const Database = require("better-sqlite3");
const { readFileSync } = require("fs");
const { join } = require("path");

const sqlite = new Database(join(__dirname, "..", "dev.db"));

const migrationContent = readFileSync(
  join(__dirname, "..", "src", "db", "migrations", "0011_add_event_notification_log.sql"),
  "utf-8"
);

console.log("Ejecutando migración 0011_add_event_notification_log.sql...");
sqlite.exec(migrationContent);

console.log("✅ Migración ejecutada correctamente!");

const tables = sqlite
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all();
console.log("Tablas:", tables.map(t => t.name).join(", "));

sqlite.close();
