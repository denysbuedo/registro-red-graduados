const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { join } = require("path");

const sqlite = new Database(join(__dirname, "..", "dev.db"));

const institutions = [
  { username: "uh", email: "admin@uhabana.edu.cu", institutionName: "Universidad de La Habana", password: "Uh2024!" },
  { username: "uci", email: "admin@uci.cu", institutionName: "Universidad de las Ciencias Informáticas", password: "Uci2024!" },
  { username: "cujae", email: "admin@cujae.edu.cu", institutionName: "Instituto Superior Politécnico José Antonio Echeverría (CUJAE)", password: "Cujae2024!" },
  { username: "ucm", email: "admin@ucm.edu.cu", institutionName: "Universidad de Ciencias Médicas de La Habana", password: "Ucm2024!" },
];

console.log("Creando usuarios institución...\n");

for (const inst of institutions) {
  const existing = sqlite.prepare("SELECT id FROM users WHERE username = ?").get(inst.username);

  if (existing) {
    console.log(`⚠️  ${inst.institutionName} ya existe`);
    continue;
  }

  const passwordHash = bcrypt.hashSync(inst.password, 10);
  const result = sqlite.prepare(
    "INSERT INTO users (username, email, password_hash, role, status, institution_name) VALUES (?, ?, ?, 'institution', 'approved', ?)"
  ).run(inst.username, inst.email, passwordHash, inst.institutionName);

  console.log(`✅ ${inst.institutionName}`);
  console.log(`   Username: ${inst.username}`);
  console.log(`   Contraseña: ${inst.password}`);
  console.log();
}

sqlite.close();
