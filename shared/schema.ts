import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const STATUSES = [
  "Bookmarked",
  "Haas Network",
  "Applied",
  "Phone Screen",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export const INTEREST_LEVELS = ["High", "Medium", "Low"] as const;

export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  jobUrl: text("job_url"),
  status: text("status").notNull().default("Bookmarked"),
  interestLevel: text("interest_level").notNull().default("Medium"),
  notes: text("notes"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  haasAlumCount: integer("haas_alum_count"),
  haasRecentAlum: text("haas_recent_alum"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  status: z.enum(STATUSES).default("Bookmarked"),
  interestLevel: z.enum(INTEREST_LEVELS).default("Medium"),
  jobUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  salaryMin: z.number().int().positive("Lower salary must be a positive number").optional().nullable(),
  salaryMax: z.number().int().positive("Upper salary must be a positive number").optional().nullable(),
  haasAlumCount: z.number().int().min(0).optional().nullable(),
  haasRecentAlum: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.salaryMin != null && data.salaryMax != null) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  { message: "Upper salary must be greater than or equal to lower salary", path: ["salaryMax"] }
);

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;
