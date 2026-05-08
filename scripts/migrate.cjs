const Database = require("better-sqlite3");
const { join } = require("path");
const { readFileSync } = require("fs");

// Detectar base de datos según el entorno
const dbName = process.env.NODE_ENV === "production" ? "prod.db" : "dev.db";
const dbPath = join(__dirname, "..", dbName);

console.log(`🚀 Iniciando migraciones en: ${dbName}`);
const sqlite = new Database(dbPath);

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
    
    // Ejecutar cada comando por separado para mejor manejo de errores de "columna duplicada"
    const commands = content.split(";").filter(cmd => cmd.trim() !== "");
    for (const cmd of commands) {
      try {
        sqlite.exec(cmd);
      } catch (err) {
        if (err.message.includes("duplicate column name")) {
          console.log(`   ⚠️  Columna ya existe (saltando comando)`);
        } else {
          throw err;
        }
      }
    }
    console.log("✅ OK");
  } catch (error) {
    console.error(`❌ Error en ${migration}:`, error.message);
  }
}

const cols = sqlite.prepare("PRAGMA table_info(users)").all();
console.log("Columnas actuales en users:", cols.map(c => c.name).join(", "));
sqlite.close();
