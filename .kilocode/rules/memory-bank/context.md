# Active Context: Egresados Cuba - Red Internacional

## Current State

**Status**: Aplicación completa implementada

Red social para egresados internacionales de la educación superior cubana. Permite gestionar perfiles, conectar egresados por criterios de afinidad, y crear listas de distribución de correo.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Database setup with Drizzle ORM + SQLite
- [x] Schema: graduates, connections, posts, email_lists
- [x] API routes for CRUD operations
- [x] Navbar component with responsive mobile menu
- [x] GraduateCard component for listing
- [x] Home page with stats, recent graduates, activity feed
- [x] Registration form with all fields
- [x] Graduate profile page with full details
- [x] Directory page with search and multi-criteria filtering
- [x] Connections page with send/accept/reject workflow
- [x] Email distribution lists with preview and copy
- [x] 404 and error pages

## Current Structure

| File/Directory | Purpose |
|----------------|---------|
| `src/db/schema.ts` | Database schema (graduates, connections, posts, email_lists) |
| `src/db/index.ts` | Database client |
| `src/db/migrate.ts` | Migration script |
| `src/app/page.tsx` | Home page with stats and feed |
| `src/app/layout.tsx` | Root layout with Navbar |
| `src/app/egresados/registro/page.tsx` | Registration form |
| `src/app/egresados/[id]/page.tsx` | Graduate profile |
| `src/app/directorio/page.tsx` | Directory with filters |
| `src/app/conexiones/page.tsx` | Connections management |
| `src/app/listas-correo/page.tsx` | Email distribution lists |
| `src/app/api/graduates/route.ts` | Graduates API |
| `src/app/api/graduates/[id]/route.ts` | Single graduate API |
| `src/app/api/connections/route.ts` | Connections API |
| `src/app/api/posts/route.ts` | Posts API |
| `src/app/api/email-lists/route.ts` | Email lists API |
| `src/app/api/stats/route.ts` | Statistics API |
| `src/components/Navbar.tsx` | Navigation bar |
| `src/components/GraduateCard.tsx` | Graduate card component |

## Database Schema

### graduates
- id, name, email (unique), country, city, university, career, graduationYear
- currentProfession, currentCompany, bio, photoUrl, phone, linkedin
- skills, languages, interests, website, createdAt, updatedAt

### connections
- id, senderId (FK graduates), receiverId (FK graduates)
- status (pending/accepted/rejected), createdAt

### posts
- id, graduateId (FK graduates), content, createdAt

### email_lists
- id, name, description
- filterUniversity, filterCareer, filterCountry, filterYearFrom, filterYearTo
- createdAt

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| Current | Full Egresados Cuba social network implemented |
