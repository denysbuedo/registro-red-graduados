import Database from "better-sqlite3";
import { readFileSync } from "fs";

// Crear archivo SQLite
const sqlite = new Database("dev.db");

// Leer y ejecutar migración
const migrationContent = readFileSync("./src/db/migrations/0000_useful_preak.sql", "utf-8");

console.log("Ejecutando migración...");
sqlite.exec(migrationContent);

console.log("✅ Base de datos inicializada correctamente!");

// Verificar tablas
const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tablas creadas:", tables);

sqlite.close();
