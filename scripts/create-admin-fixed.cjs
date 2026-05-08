const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { join } = require("path");

console.log("🛡️  Crear Administrador - Red de Egresados\n");

// Detectar base de datos según el entorno
const dbName = process.env.NODE_ENV === "production" ? "prod.db" : "dev.db";
const dbPath = join(__dirname, "..", dbName);
console.log(`📂 Usando base de datos: ${dbName}`);

const sqlite = new Database(dbPath);

// Datos del admin
const username = "dinfo";
const email = "dinfo@mes.gob.cu";
const password = "Alexa.55260611";

// Verificar si el username o email ya existen
const existingUser = sqlite
  .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
  .get(username, email);

if (existingUser) {
  console.log("⚠️  El username o email ya están registrados");
  console.log("   Actualizando contraseña...");
  
  const passwordHash = bcrypt.hashSync(password, 10);
  sqlite
    .prepare("UPDATE users SET password_hash = ?, status = 'approved' WHERE username = ? OR email = ?")
    .run(passwordHash, username, email);
  
  console.log("✅ Contraseña y estado (approved) actualizados exitosamente!");
} else {
  // Hashear contraseña
  const passwordHash = bcrypt.hashSync(password, 10);

  // Crear usuario admin
  try {
    const result = sqlite
      .prepare(
        `INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at) 
         VALUES (?, ?, ?, 'admin', 'approved', strftime('%s', 'now'), strftime('%s', 'now'))`
      )
      .run(username, email, passwordHash);

    console.log("✅ Administrador creado exitosamente!");
    console.log(`   ID: ${result.lastInsertRowid}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Rol: admin`);
  } catch (error) {
    console.log("❌ Error al crear el administrador:", error.message);
  }
}

// Verificar creación
const admin = sqlite
  .prepare("SELECT id, username, email, role FROM users WHERE username = ?")
  .get(username);

if (admin) {
  console.log("\n📍 Ahora puedes iniciar sesión en /login con tus credenciales:");
  console.log(`   Username: ${username}`);
  console.log(`   Contraseña: ${password}`);
  console.log("\n   Después de login, verás la opción '🛡️ Panel Admin' en tu menú");
}

sqlite.close();
