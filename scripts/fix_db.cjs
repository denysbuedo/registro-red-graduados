const Database = require("better-sqlite3");
const { join } = require("path");

const dbPath = join(__dirname, "..", "dev.db");
const sqlite = new Database(dbPath);

console.log(`Abriendo base de datos en: ${dbPath}`);

try {
  // Intentar añadir la columna 'ministry'
  sqlite.exec("ALTER TABLE users ADD COLUMN ministry TEXT;");
  console.log("✅ Columna 'ministry' añadida exitosamente.");
} catch (error) {
  if (error.message.includes("duplicate column name")) {
    console.log("⚠️  La columna 'ministry' ya existe.");
  } else {
    console.error("❌ Error al añadir columna 'ministry':", error.message);
  }
}

try {
  // Asegurarnos que institution_name también exista
  sqlite.exec("ALTER TABLE users ADD COLUMN institution_name TEXT;");
  console.log("✅ Columna 'institution_name' añadida exitosamente.");
} catch (error) {
  if (error.message.includes("duplicate column name")) {
    console.log("⚠️  La columna 'institution_name' ya existe.");
  } else {
    console.error("❌ Error al añadir columna 'institution_name':", error.message);
  }
}

const cols = sqlite.prepare("PRAGMA table_info(users)").all();
console.log("Columnas actuales en 'users':", cols.map(c => c.name).join(", "));

sqlite.close();
