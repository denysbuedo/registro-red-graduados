import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const graduates = sqliteTable("graduates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  country: text("country").notNull(),
  city: text("city"),
  university: text("university").notNull(),
  career: text("career").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  currentProfession: text("current_profession").notNull(),
  currentCompany: text("current_company"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  skills: text("skills"),
  languages: text("languages"),
  interests: text("interests"),
  website: text("website"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const connections = sqliteTable("connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => graduates.id),
  receiverId: integer("receiver_id")
    .notNull()
    .references(() => graduates.id),
  status: text("status", { enum: ["pending", "accepted", "rejected"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  graduateId: integer("graduate_id")
    .notNull()
    .references(() => graduates.id),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const emailLists = sqliteTable("email_lists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  filterUniversity: text("filter_university"),
  filterCareer: text("filter_career"),
  filterCountry: text("filter_country"),
  filterYearFrom: integer("filter_year_from"),
  filterYearTo: integer("filter_year_to"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});
