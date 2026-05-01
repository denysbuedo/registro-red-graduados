const Database = require("better-sqlite3");
const { join } = require("path");
const { readFileSync } = require("fs");

const sqlite = new Database(join(__dirname, "..", "dev.db"));

const migrations = [
  "0015_add_pending_university.sql",
];

for (const migration of migrations) {
  try {
    const content = readFileSync(
      join(__dirname, "..", "src", "db", "migrations", migration),
      "utf-8"
    );
    console.log(`Ejecutando ${migration}...`);
    sqlite.exec(content);
    console.log("✅ OK");
  } catch (error) {
    if (error.message.includes("duplicate")) {
      console.log("⚠️  Ya existe (saltando)");
    } else {
      throw error;
    }
  }
}

const cols = sqlite.prepare("PRAGMA table_info(users)").all();
console.log("Columnas users:", cols.map(c => c.name).join(", "));
sqlite.close();
