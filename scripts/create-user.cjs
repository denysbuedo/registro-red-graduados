const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { join } = require("path");

console.log(`👤 Script para Crear/Actualizar Usuario - Red de Egresados\n`);

const sqlite = new Database(join(__dirname, "..", "dev.db"));

// Leer argumentos de la línea de comandos
// node create-user.cjs <username> <email> <password> <role> [institutionName]
const args = process.argv.slice(2);

const username = args[0];
const email = args[1];
const password = args[2];
const role = args[3]; // 'admin', 'institution', 'editor', 'user'
const institutionName = args[4] || null;

// Validación básica de argumentos
if (!username || !email || !password || !role) {
  console.error("❌ Uso: bun run create-user <username> <email> <password> <role> [institutionName]");
  console.error("   Roles válidos: admin, institution, editor, user");
  console.error("   Ejemplo (Admin): bun run create-user adminUser admin@example.com pass123! admin");
  console.error("   Ejemplo (Universidad): bun run create-user uci uci@example.com pass456! institution 'Universidad de las Ciencias Informáticas'");
  sqlite.close();
  process.exit(1);
}

const validRoles = ["admin", "institution", "editor", "user"];
if (!validRoles.includes(role)) {
  console.error(`❌ Rol inválido: ${role}. Roles válidos: ${validRoles.join(", ")}`);
  sqlite.close();
  process.exit(1);
}

if (role === "institution" && !institutionName) {
    console.error("❌ Para el rol 'institution', institutionName es requerido.");
    console.error("   Ejemplo: bun run create-user uci uci@example.com pass456! institution 'Universidad de las Ciencias Informáticas'");
    sqlite.close();
    process.exit(1);
}

// Verificar si el username o email ya existen
const existingUser = sqlite
  .prepare("SELECT id, role FROM users WHERE username = ? OR email = ?")
  .get(username, email);

const passwordHash = bcrypt.hashSync(password, 10);

if (existingUser) {
  console.log("⚠️  El username o email ya existen. Actualizando datos...");
  let updateSql = `UPDATE users SET password_hash = ?, role = ?, updated_at = strftime('%s', 'now')`;
  const updateParams = [passwordHash, role];

  if (role === "institution") {
    updateSql += `, institution_name = ?`;
    updateParams.push(institutionName);
  } else {
    updateSql += `, institution_name = NULL`; // Limpiar si cambia de rol
  }
  updateParams.push(username, email);

  sqlite.prepare(`${updateSql} WHERE username = ? OR email = ?`).run(...updateParams);
  
  console.log("✅ Usuario actualizado exitosamente!");
} else {
  // Crear nuevo usuario
  try {
    let insertSql = `
      INSERT INTO users (username, email, password_hash, role, institution_name, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, 'approved', strftime('%s', 'now'), strftime('%s', 'now'))`;
    
    const insertParams = [username, email, passwordHash, role, institutionName];

    const result = sqlite.prepare(insertSql).run(...insertParams);

    console.log("✅ Usuario creado exitosamente!");
    console.log(`   ID: ${result.lastInsertRowid}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Rol: ${role}`);
    if (institutionName) {
        console.log(`   Institución: ${institutionName}`);
    }
  } catch (error) {
    console.error("❌ Error al crear el usuario:", error.message);
  }
}

// Verificar creación/actualización
const user = sqlite
  .prepare("SELECT id, username, email, role, institution_name FROM users WHERE username = ?")
  .get(username);

if (user) {
  console.log(`
📍 Datos del usuario:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Rol: ${user.role}`);
  if (user.institution_name) {
    console.log(`   Institución: ${user.institution_name}`);
  }
  console.log(`
Ahora puedes iniciar sesión con estas credenciales.`);
}

sqlite.close();
