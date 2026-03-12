import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema, STATUSES, INTEREST_LEVELS } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/prospects", async (_req, res) => {
    const prospects = await storage.getAllProspects();
    res.json(prospects);
  });

  app.post("/api/prospects", async (req, res) => {
    const parsed = insertProspectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors.map((e) => e.message).join(", ") });
    }
    const prospect = await storage.createProspect(parsed.data);
    res.status(201).json(prospect);
  });

  app.patch("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const existing = await storage.getProspect(id);
    if (!existing) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    const body = req.body;
    const updates: Record<string, unknown> = {};

    if (body.companyName !== undefined) updates.companyName = body.companyName;
    if (body.roleTitle !== undefined) updates.roleTitle = body.roleTitle;
    if (body.jobUrl !== undefined) updates.jobUrl = body.jobUrl;
    if (body.notes !== undefined) updates.notes = body.notes;

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(", ")}` });
      }
      updates.status = body.status;
    }

    if (body.interestLevel !== undefined || body.interest_level !== undefined) {
      const level = body.interestLevel ?? body.interest_level;
      if (!INTEREST_LEVELS.includes(level)) {
        return res.status(400).json({ message: `Interest level must be one of: ${INTEREST_LEVELS.join(", ")}` });
      }
      updates.interestLevel = level;
    }

    if (body.salaryMin !== undefined) {
      const min = body.salaryMin === null ? null : Number(body.salaryMin);
      if (min !== null && (!Number.isInteger(min) || min <= 0)) {
        return res.status(400).json({ message: "Lower salary must be a positive number" });
      }
      updates.salaryMin = min;
    }

    if (body.salaryMax !== undefined) {
      const max = body.salaryMax === null ? null : Number(body.salaryMax);
      if (max !== null && (!Number.isInteger(max) || max <= 0)) {
        return res.status(400).json({ message: "Upper salary must be a positive number" });
      }
      updates.salaryMax = max;
    }

    const resolvedMin = updates.salaryMin !== undefined ? updates.salaryMin : existing.salaryMin;
    const resolvedMax = updates.salaryMax !== undefined ? updates.salaryMax : existing.salaryMax;
    if (resolvedMin != null && resolvedMax != null && (resolvedMax as number) < (resolvedMin as number)) {
      return res.status(400).json({ message: "Upper salary must be greater than or equal to lower salary" });
    }

    if (body.haasAlumCount !== undefined) {
      updates.haasAlumCount = body.haasAlumCount === null ? null : Number(body.haasAlumCount);
    }
    if (body.haasRecentAlum !== undefined) {
      updates.haasRecentAlum = body.haasRecentAlum ?? null;
    }

    const updated = await storage.updateProspect(id, updates);
    res.json(updated);
  });

  app.delete("/api/prospects/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prospect ID" });
    }

    const deleted = await storage.deleteProspect(id);
    if (!deleted) {
      return res.status(404).json({ message: "Prospect not found" });
    }

    res.status(204).send();
  });

  return httpServer;
}
