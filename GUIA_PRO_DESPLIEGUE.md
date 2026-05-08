# Guía de Despliegue Profesional (Ubuntu 24.10 + HAProxy)

Esta guía detalla los pasos para desplegar la **Red de Graduados Internacionales** en un entorno de producción utilizando HAProxy como terminador SSL y PM2 como gestor de procesos.

## 1. Requisitos Previos del Servidor

- Servidor con **Ubuntu 24.10**.
- Acceso SSH con privilegios de sudo.
- Nombre de dominio apuntando a la IP del servidor.
- Archivo de certificado SSL combinado (CRT + KEY) para HAProxy.

## 2. Preparación del Sistema

Actualizar el sistema e instalar las herramientas básicas:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential software-properties-common
```

### Instalar Node.js 22 (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### Instalar PM2
```bash
sudo npm install -g pm2
```

## 3. Despliegue de la Aplicación

### Clonar el repositorio
```bash
# Recomendado: crear un usuario específico para la aplicación
sudo useradd -m -s /bin/bash egresados
sudo su - egresados

git clone https://github.com/denysbuedo/registro-red-graduados.git app
cd app
```

### Instalar y Compilar
```bash
npm install --production
npm run build
```

### Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```bash
nano .env
```
Contenido recomendado:
```env
NODE_ENV=production
NEXTAUTH_SECRET=tu_secreto_aleatorio_de_32_caracteres
DATABASE_URL=file:./prod.db
```

### Inicializar Base de Datos
```bash
# Ejecutar migraciones
node scripts/migrate.cjs

# Activar modo WAL para optimizar SQLite en producción (CRÍTICO)
node -e "const db = require('better-sqlite3')('prod.db'); db.pragma('journal_mode = WAL'); db.close();"

# Crear administrador inicial (si no existe)
node scripts/create-admin-fixed.cjs
```

## 4. Configuración de HAProxy

Instalar HAProxy:
```bash
sudo apt install -y haproxy
```

Editar la configuración:
```bash
sudo nano /etc/haproxy/haproxy.cfg
```

Configuración básica para SSL y Next.js:
```haproxy
frontend https_front
    bind *:80
    bind *:443 ssl crt /etc/ssl/private/tu-dominio.pem
    http-request redirect scheme https if !{ ssl_fc }
    
    # Compresión para mejorar rendimiento
    compression algo gzip
    compression type text/html text/plain text/css text/javascript application/javascript
    
    default_backend nextjs_backend

backend nextjs_backend
    balance roundrobin
    option httpchk GET /api/auth/me
    server node1 127.0.0.1:3000 check
```

Reiniciar HAProxy:
```bash
sudo systemctl restart haproxy
```

## 5. Gestión con PM2

Iniciar la aplicación en modo cluster para aprovechar todos los núcleos del CPU:
```bash
pm2 start npm --name "red-egresados" -- start
pm2 save
pm2 startup
```

## 6. Comandos de Mantenimiento

- **Ver logs en tiempo real**: `pm2 logs red-egresados`
- **Reiniciar sin caída (Zero downtime)**: `pm2 reload red-egresados`
- **Actualizar versión**:
  ```bash
  git pull origin main
  npm install --production
  npm run build
  pm2 reload red-egresados
  ```

---
**Preparado por:** Antigravity AI
**Fecha:** Mayo 2026
**Repositorio:** [registro-red-graduados](https://github.com/denysbuedo/registro-red-graduados.git)
