const Database = require("better-sqlite3");
const { join } = require("path");
const { readFileSync, readdirSync } = require("fs");

// Cargar variables de entorno si existe .env
try {
  const envPath = join(__dirname, "..", ".env");
  const envConfig = readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) process.env[key.trim()] = value.trim();
  });
} catch (e) {}

// Configuración de base de datos
const dbPath = join(__dirname, "..", process.env.NODE_ENV === "production" ? "prod.db" : "dev.db");
console.log(`🚀 Iniciando base de datos en: ${dbPath}`);

const sqlite = new Database(dbPath);

// Activar WAL para mejor rendimiento
sqlite.pragma("journal_mode = WAL");

const migrationsDir = join(__dirname, "..", "src", "db", "migrations");

try {
  // Leer todos los archivos .sql y ordenarlos
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  console.log(`Encontradas ${files.length} migraciones.`);

  for (const file of files) {
    const content = readFileSync(join(migrationsDir, file), "utf-8");
    console.log(`Applying: ${file}...`);
    
    // Dividir por comandos para manejar errores individuales
    const commands = content.split(";").filter(cmd => cmd.trim() !== "");
    for (const cmd of commands) {
      try {
        sqlite.exec(cmd);
      } catch (err) {
        // Ignorar errores de "ya existe" (tablas o columnas)
        if (!err.message.includes("already exists") && !err.message.includes("duplicate column name")) {
          console.warn(`   ⚠️  Aviso en comando: ${err.message}`);
        }
      }
    }
  }
  console.log("✅ Proceso de migración completado.");
} catch (error) {
  console.error("❌ Error crítico en migraciones:", error);
}

// Verificar tablas creadas
try {
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Tablas actuales:", tables.map(t => t.name).join(", "));
} catch (e) {}

sqlite.close();
