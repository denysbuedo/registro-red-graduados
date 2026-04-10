const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { join } = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  console.log("🛡️  Crear Administrador - Red de Egresados\n");

  const sqlite = new Database(join(__dirname, "..", "dev.db"));

  // Verificar si ya hay admins
  const existingAdmins = sqlite
    .prepare("SELECT id, username, email FROM users WHERE role = 'admin'")
    .all();

  if (existingAdmins.length > 0) {
    console.log("⚠️  Ya existen administradores en la base de datos:");
    existingAdmins.forEach((admin) => {
      console.log(`   - ${admin.username} (${admin.email})`);
    });
    console.log();
  }

  // Pedir datos del admin
  const username = await question("Username: ");
  const email = await question("Email: ");
  const password = await question("Contraseña: ");

  if (!username || !email || !password) {
    console.log("\n❌ Todos los campos son requeridos");
    rl.close();
    return;
  }

  if (password.length < 6) {
    console.log("\n❌ La contraseña debe tener al menos 6 caracteres");
    rl.close();
    return;
  }

  // Verificar si el username o email ya existen
  const existingUser = sqlite
    .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .get(username, email);

  if (existingUser) {
    console.log("\n❌ El username o email ya están registrados");
    rl.close();
    return;
  }

  // Hashear contraseña
  const passwordHash = bcrypt.hashSync(password, 10);

  // Crear usuario admin
  try {
    const result = sqlite
      .prepare(
        `INSERT INTO users (username, email, password_hash, role, created_at, updated_at) 
         VALUES (?, ?, ?, 'admin', strftime('%s', 'now'), strftime('%s', 'now'))`
      )
      .run(username, email, passwordHash);

    console.log("\n✅ Administrador creado exitosamente!");
    console.log(`   ID: ${result.lastInsertRowid}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log("\n📍 Ahora puedes iniciar sesión en /login con tus credenciales");
    console.log("   Después de login, verás la opción '🛡️ Panel Admin' en tu menú");
  } catch (error) {
    console.log("\n❌ Error al crear el administrador:", error.message);
  }

  sqlite.close();
  rl.close();
}

createAdmin();
