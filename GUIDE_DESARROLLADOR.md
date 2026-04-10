# Guía del Desarrollador — Red de Egresados Internacionales

## Tabla de Contenidos

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Arquitectura de la Aplicación](#4-arquitectura-de-la-aplicación)
5. [Base de Datos](#5-base-de-datos)
6. [Autenticación y Sesiones](#6-autenticación-y-sesiones)
7. [Roles y Permisos](#7-roles-y-permisos)
8. [API Endpoints](#8-api-endpoints)
9. [Componentes Clave](#9-componentes-clave)
10. [Configuración del Entorno](#10-configuración-del-entorno)
11. [Migraciones de Base de Datos](#11-migraciones-de-base-de-datos)
12. [Flujos de Trabajo](#12-flujos-de-trabajo)
13. [Despliegue en Producción](#13-despliegue-en-producción)
14. [Solución de Problemas](#14-solución-de-problemas)

---

## 1. Descripción del Proyecto

La **Red de Egresados Internacionales de la Educación Superior Cubana** es una plataforma web tipo red social profesional diseñada para conectar a egresados extranjeros que se formaron en universidades cubanas.

### Funcionalidades principales:

- **Registro con aprobación** — Los usuarios se registran y quedan en estado `pending` hasta ser aprobados por un administrador o institución
- **Perfiles profesionales** — Cada egresado tiene un perfil con datos académicos y profesionales
- **Feed de actividad** — Los usuarios pueden publicar y comentar (limitado a 3 posts/día y 10 comentarios/día)
- **Conexiones** — Sistema de amistades tipo red social (enviar/aceptar/rechazar solicitudes)
- **Eventos** — Creación y gestión de eventos con RSVP
- **Comunidades** — Grupos temáticos por universidad, carrera, país o interés
- **Noticias** — Publicaciones administrativas con opción de fijar (1, 3 o 7 días)
- **Notificaciones** — Sistema de notificaciones para actividad relevante

### Filosofía de diseño:

- **Todo público** — No hay mensajería privada. El enfoque es la colaboración abierta
- **Transparencia** — Publicaciones y conexiones visibles para la red aprobada

---

## 2. Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.3 |
| **Lenguaje** | TypeScript | 5.9 |
| **UI** | React + Tailwind CSS 4 | React 19 |
| **Base de datos** | SQLite (better-sqlite3) | 12.8.0 |
| **ORM** | Drizzle ORM | 0.45.2 |
| **Auth** | Cookies HTTP-only + bcryptjs | bcryptjs 3.0.3 |
| **Runtime** | Node.js / Bun | Node 20+ |
| **Package manager** | Bun | 1.3.11 |

---

## 3. Estructura del Proyecto

```
red-egresados-internacionales/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes (REST)
│   │   │   ├── admin/                # Endpoints de administración
│   │   │   │   ├── approvals/        # Aprobación de registros
│   │   │   │   ├── posts/            # CRUD de noticias admin
│   │   │   │   └── users/            # Gestión de usuarios
│   │   │   ├── auth/                 # Login, registro, logout, me
│   │   │   ├── connections/          # Solicitudes de conexión
│   │   │   ├── events/               # Eventos y notificaciones
│   │   │   ├── graduates/            # CRUD de egresados
│   │   │   ├── groups/               # Grupos/comunidades
│   │   │   ├── notifications/        # Notificaciones del usuario
│   │   │   └── posts/                # Posts de usuarios y reacciones
│   │   ├── admin/                    # Panel de administración
│   │   │   ├── approvals/            # Vista de aprobaciones
│   │   │   ├── events/               # Gestión de eventos
│   │   │   ├── posts/                # Gestión de noticias
│   │   │   └── users/                # Gestión de usuarios
│   │   ├── comunidades/              # Vista de grupos
│   │   ├── conexiones/               # Gestión de solicitudes
│   │   ├── directorio/               # Directorio de egresados
│   │   ├── egresados/                # Perfiles individuales
│   │   ├── estatutos/                # Estatutos de la red
│   │   ├── eventos/                  # Vista de eventos
│   │   ├── login/                    # Inicio de sesión
│   │   ├── noticias/                 # Página de todas las noticias
│   │   ├── register/                 # Registro de cuenta
│   │   ├── terminos/                 # Términos y condiciones
│   │   ├── layout.tsx                # Layout raíz (server component)
│   │   └── page.tsx                  # Home (púbico vs logueado)
│   ├── components/                   # Componentes React reutilizables
│   │   ├── AdminPostCard.tsx         # Tarjeta de noticia del admin
│   │   ├── AutoRefresh.tsx           # Refresco automático (60s)
│   │   ├── ConnectButton.tsx         # Botón de conectar
│   │   ├── CreatePost.tsx            # Formulario crear post
│   │   ├── GraduateCard.tsx          # Tarjeta de egresado
│   │   ├── LoginForm.tsx             # Formulario de login (client)
│   │   ├── Navbar.tsx                # Barra de navegación principal
│   │   ├── PostComments.tsx          # Sección de comentarios
│   │   └── UserPostCard.tsx          # Tarjeta de post de usuario
│   ├── db/
│   │   ├── migrations/               # Archivos SQL de migración
│   │   ├── index.ts                  # Configuración de la DB
│   │   └── schema.ts                 # Definición de tablas Drizzle
│   └── lib/
│       ├── auth.ts                   # Hash y verificación de contraseñas
│       ├── event-notifications.ts    # Notificaciones automáticas de eventos
│       ├── notifications.ts          # Helper para crear notificaciones
│       └── session.ts                # Gestión de sesiones y cookies
├── scripts/
│   ├── create-admin-fixed.cjs        # Script para crear usuario admin
│   └── migrate.cjs                   # Ejecutor de migraciones
├── public/                           # Archivos estáticos
│   └── logos/                        # Logos del MES
├── dev.db                            # Base de datos SQLite (desarrollo)
├── next.config.ts                    # Configuración de Next.js
├── package.json                      # Dependencias y scripts
└── tsconfig.json                     # Configuración de TypeScript
```

---

## 4. Arquitectura de la Aplicación

### Patrón de componentes

La aplicación sigue el patrón **Server Components por defecto** de Next.js App Router:

| Tipo | Cuándo usar | Ejemplo |
|------|-------------|---------|
| **Server Component** | Consultas a DB, datos estáticos | `page.tsx`, layouts |
| **Client Component** | Hooks (`useState`, `useEffect`), interactividad | `LoginForm.tsx`, `Navbar.tsx` |

### Flujo de una petición

```
Cliente → Navbar (client) → /api/* → Server Action → DB → Respuesta
```

1. El usuario interactúa con la UI
2. Se hace `fetch()` a un endpoint de `/api/`
3. El API valida la sesión con `getSession()`
4. Se consulta/modifica la DB con Drizzle ORM
5. Se devuelve la respuesta en JSON

---

## 5. Base de Datos

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Cuentas de usuario (auth) |
| `graduates` | Perfiles profesionales de egresados |
| `connections` | Solicitudes de conexión entre egresados |
| `user_posts` | Publicaciones de usuarios en el feed |
| `post_comments` | Comentarios en publicaciones |
| `post_reactions` | Reacciones (👍❤️🎉💡) en posts |
| `admin_posts` | Noticias publicadas por admins/editors |
| `events` | Eventos (webinars, encuentros) |
| `event_attendees` | Asistentes confirmados |
| `event_notification_log` | Log de notificaciones enviadas por evento |
| `groups` | Grupos/comunidades temáticas |
| `group_members` | Miembros de cada grupo |
| `group_posts` | Publicaciones dentro de grupos |
| `notifications` | Notificaciones del sistema |

### Relación users ↔ graduates

- `users` → tabla de autenticación
- `graduates` → tabla de datos profesionales
- Vinculadas por `users.graduateId` y `graduates.userId`
- Un usuario puede existir sin perfil de egresado (estado pending)

### Ejecutar migraciones

```bash
node scripts/migrate.cjs
```

Cada migración es un archivo `.sql` en `src/db/migrations/`.

---

## 6. Autenticación y Sesiones

### Flujo de registro

1. Usuario llena formulario en `/register`
2. Se crea `users` con `status: "pending"`
3. **NO** se crea sesión — usuario debe esperar aprobación
4. Admin/institución revisa en `/admin/approvals`
5. Si aprueba → `status: "approved"` → usuario puede hacer login
6. Si rechaza → `status: "rejected"` + motivo

### Sesiones

| Propiedad | Valor |
|-----------|-------|
| **Almacenamiento** | Cookie HTTP-only |
| **Duración** | 24 horas (86,400 segundos) |
| **Token** | Base64 de `{ userId, createdAt }` |
| **Validación** | Se verifica `createdAt` vs `Date.now()` en cada request |

### Archivos clave

- `src/lib/session.ts` — `getSession()`, `setSession()`, `clearSession()`
- `src/lib/auth.ts` — `hashPassword()`, `verifyPassword()`

---

## 7. Roles y Permisos

| Rol | Acceso | Función |
|-----|--------|---------|
| `user` | Normal | Egresado registrado y aprobado |
| `admin` | Total | Control completo del sistema |
| `institution` | Aprobaciones | Aprueba registros de su universidad |
| `editor` | Publicaciones | Publica noticias, convocatorias y eventos |

### Estado de usuarios

| Estado | Descripción |
|--------|-------------|
| `pending` | Recién registrado, esperando aprobación |
| `approved` | Aprobado, puede usar la plataforma |
| `rejected` | Rechazado, no puede hacer login |

---

## 8. API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| POST | `/api/auth/register` | Crear cuenta (status: pending) | ❌ |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ |
| GET | `/api/auth/me` | Obtener usuario actual | ✅ |

### Publicaciones de usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/posts` | Feed de posts | ❌ |
| POST | `/api/posts` | Crear post (3/día) | ✅ |
| DELETE | `/api/posts?id=X` | Eliminar post propio | ✅ |
| GET | `/api/posts/limit` | Verificar límite diario | ✅ |

### Comentarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/posts/[id]/comments` | Comentarios de un post |
| POST | `/api/posts/[id]/comments` | Crear comentario (10/día) |
| DELETE | `/api/posts/[id]/comments?commentId=X` | Eliminar comentario |

### Likes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/posts/[id]/like` | Dar like a un post |

### Conexiones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/connections` | Solicitudes y conteo |
| GET | `/api/connections?check=X` | Verificar estado con egresado |
| POST | `/api/connections` | Enviar solicitud |
| PUT | `/api/connections` | Aceptar/rechazar solicitud |
| DELETE | `/api/posts/[id]/comments?commentId=X` | Cancelar solicitud |

### Noticias admin

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/posts` | Lista de noticias |
| POST | `/api/admin/posts` | Crear noticia (con pinDays) |
| DELETE | `/api/admin/posts?id=X` | Eliminar noticia |

### Aprobaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/approvals?status=pending` | Usuarios pendientes |
| PUT | `/api/admin/approvals` | Aprobar/rechazar usuario |

### Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events` | Lista de eventos |
| GET | `/api/events?id=X` | Detalle con asistentes |
| POST | `/api/events` | Crear evento (admin/editor) |
| PUT | `/api/events` | RSVP (attending/maybe/declined) |
| POST | `/api/events/[id]/notify` | Notificar asistentes |

### Grupos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/groups` | Lista de grupos |
| POST | `/api/groups` | Crear grupo |
| PATCH | `/api/groups` | Editar grupo (creador) |
| PUT | `/api/groups` | Unirse/salir |
| GET/POST | `/api/groups/[id]/posts` | Posts del grupo |

### Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications` | Todas las notificaciones |
| PUT | `/api/notifications` | Marcar como leída(s) |
| DELETE | `/api/notifications?id=X` | Eliminar notificación |

---

## 9. Componentes Clave

### `Navbar.tsx`
Barra de navegación principal. **Client Component**. Maneja:
- Estado de autenticación (`fetchUser()`)
- Contador de notificaciones pendientes
- Contador de notificaciones del sistema
- Menú desplegable de usuario
- Menú hamburguesa en mobile

### `LoginForm.tsx`
Formulario de login directo en el home público. **Client Component**.
- Valida credenciales contra `/api/auth/login`
- Maneja estados: pendiente, aprobado, rechazado
- Redirige con `window.location.href = "/"` al loguearse

### `CreatePost.tsx`
Formulario para crear publicaciones. **Client Component**.
- Valida límite diario (3 posts)
- Muestra barra de progreso de uso
- Soporta URL de imagen con vista previa

### `AdminPostCard.tsx`
Tarjeta de noticia del admin. Muestra:
- Imagen (si existe) con `object-contain`
- Texto expandible (500 chars preview)
- Reacciones (👍❤️🎉💡)
- Sección de comentarios

### `PostComments.tsx`
Sección de comentarios de un post.
- Obtiene comentarios desde API
- Permite crear/eliminar comentarios
- Notifica al autor del post cuando comentan
- Límite: 10 comentarios/día por usuario

### `AutoRefresh.tsx`
Componente invisible que refresca la página cada 60 segundos para mantener datos actualizados.

---

## 10. Configuración del Entorno

### Requisitos

- Node.js 20+
- Bun 1.3+ (opcional, para ejecución más rápida)

### Instalación

```bash
# Instalar dependencias
bun install

# Ejecutar migraciones
node scripts/migrate.cjs

# Iniciar servidor de desarrollo
bun run dev
```

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo |
| `bun run build` | Compilación para producción |
| `bun run start` | Servidor de producción |
| `bun run lint` | ESLint |
| `bun run typecheck` | TypeScript check |
| `node scripts/migrate.cjs` | Ejecutar migraciones |
| `node scripts/create-admin-fixed.cjs` | Crear usuario admin |

---

## 11. Migraciones de Base de Datos

### Cómo crear una nueva migración

1. Crear archivo `src/db/migrations/00XX_nombre_descriptivo.sql`
2. Agregar las sentencias SQL necesarias
3. Actualizar `scripts/migrate.cjs` para incluir la nueva migración
4. Ejecutar `node scripts/migrate.cjs`

### Ejemplo

```sql
-- src/db/migrations/0014_nueva_funcionalidad.sql
ALTER TABLE `users` ADD COLUMN `nuevo_campo` text;
```

```javascript
// scripts/migrate.cjs
const migrations = [
  // ... existentes
  "0014_nueva_funcionalidad.sql",
];
```

### Migraciones existentes

| # | Archivo | Descripción |
|---|---------|-------------|
| 0000 | `useful_preak.sql` | Tablas iniciales |
| 0001 | `add_users_table.sql` | Tabla de usuarios |
| 0002 | `add_admin_posts_table.sql` | Noticias del admin |
| 0003 | `add_image_to_admin_posts.sql` | Imágenes en noticias |
| 0004 | `add_post_reactions.sql` | Reacciones en posts |
| 0005 | `update_connections.sql` | Índice unique en conexiones |
| 0006 | `add_user_posts.sql` | Posts de usuarios |
| 0007 | `add_post_comments.sql` | Comentarios en posts |
| 0008 | `add_notifications.sql` | Notificaciones del sistema |
| 0009 | `add_events.sql` | Eventos y asistentes |
| 0010 | `add_groups.sql` | Grupos y miembros |
| 0011 | `add_event_notification_log.sql` | Log de notificaciones de eventos |
| 0012 | `add_user_approval.sql` | Aprobación de registros |
| 0013 | `add_pinned_posts.sql` | Noticias fijadas |

---

## 12. Flujos de Trabajo

### Registro de nuevo usuario

```
1. POST /api/auth/register { username, email, password }
2. Se crea usuario con status: "pending"
3. Usuario intenta login → error 403 (pendiente)
4. Admin ve solicitud en /admin/approvals
5. Admin aprueba → status: "approved"
6. Usuario puede hacer login
```

### Crear noticia fijada

```
1. Admin va a /admin/posts/new
2. Llena título, contenido, imagen (opcional)
3. Selecciona pinDays: 1, 3, 7 o ""
4. POST /api/admin/posts
5. Si pinDays válido → pinnedUntil = now + días (en segundos)
6. Noticia aparece arriba en home y /noticias
```

### Notificaciones de eventos (automáticas)

Se ejecutan en cada carga de página (`checkAndSendEventNotifications()`):

| Trigger | Cuándo se envía |
|---------|-----------------|
| 3 días antes | Cuando `now >= eventDate - 3 días` y no se ha enviado |
| 15 min antes | Cuando `now >= eventDate - 15 min` y no se ha enviado |
| Al comenzar | Cuando `now >= eventDate` (±5 min) y no se ha enviado |
| Al terminar | Cuando `now >= eventDate + 1 hora` y no se ha enviado |

El log se guarda en `event_notification_log` para evitar duplicados.

---

## 13. Despliegue en Producción

Ver `PROTOCOLO_DESPLIEGUE.md` para instrucciones detalladas.

### Resumen rápido

```bash
# 1. En servidor Ubuntu 24.04
git clone <repo>
npm ci --production

# 2. Compilar
npm run build

# 3. Migraciones
node scripts/migrate.cjs

# 4. PM2
pm2 start ecosystem.config.js
```

### Requisitos de servidor (150k usuarios)

| Recurso | Valor |
|---------|-------|
| RAM | 16 GB |
| CPU | 8 cores |
| Disco | 200 GB NVMe |
| Ancho de banda | 3 TB/mes |

---

## 14. Solución de Problemas

### La sesión nunca expira

**Causa:** Las sesiones antiguas fueron creadas antes del fix de expiración.
**Solución:** El usuario debe hacer logout y volver a login.

### El usuario registrado no puede hacer login

**Causa:** Estado `pending`.
**Solución:** Admin debe aprobar en `/admin/approvals`.

### Las noticias fijadas no aparecen

**Causa:** `pinDays` era string en lugar de number.
**Solución:** Crear una nueva noticia con fijación (el bug ya está corregido).

### Error de TypeScript en Server/Client Components

**Causa:** Importar hooks de cliente en Server Component.
**Solución:** Mover el código que usa `useState`/`useEffect` a un componente separado con `"use client"`.

### Base de datos bloqueada

**Causa:** SQLite no soporta concurrencia alta.
**Solución:** Para >500k requests/día, migrar a PostgreSQL.

---

**Documento version:** 1.0
**Fecha:** Abril 2026
**Preparado para:** Equipo de desarrollo — Ministerio de Educación Superior, Cuba
