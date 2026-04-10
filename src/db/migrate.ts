import { Database } from "bun:sqlite";

const sqlite = new Database("dev.db");
const migration = Bun.file("./src/db/migrations/0000_useful_preak.sql").text();

console.log("Running migrations...");
sqlite.exec(await migration);
console.log("✅ Migrations completed!");
sqlite.close();
