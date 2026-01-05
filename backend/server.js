import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
} from "fs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(dirname(__dirname), ".env") }); // Load from root

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Data directories
const DATA_DIR = join(__dirname, "data");
const TEMPLATES_DIR = join(DATA_DIR, "templates");
const DRAFTS_DIR = join(DATA_DIR, "drafts");

// Ensure directories exist
[DATA_DIR, TEMPLATES_DIR, DRAFTS_DIR].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.ADMIN_PASS || "fallback_secret",
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
};

// Login Endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (email === adminUser && password === adminPass) {
    const accessToken = jwt.sign(
      { name: adminUser },
      process.env.ADMIN_PASS || "fallback_secret",
      { expiresIn: "12h" }
    );
    res.json({ accessToken });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Helper functions
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
};

const writeJsonFile = (filePath, data) => {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const listItems = (dir) => {
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    return files.map((f) => readJsonFile(join(dir, f))).filter(Boolean);
  } catch {
    return [];
  }
};

// ==================== STARTER TEMPLATES API ====================

// List all starter templates (from templates.json manifest)
app.get("/api/starter-templates", (req, res) => {
  try {
    const manifestPath = join(TEMPLATES_DIR, "templates.json");
    if (!existsSync(manifestPath)) {
      return res.json([]);
    }

    const manifest = readJsonFile(manifestPath);
    if (!manifest || !manifest.templates) {
      return res.json([]);
    }

    // Load HTML content for each template
    const templates = manifest.templates
      .map((template) => {
        const htmlPath = join(TEMPLATES_DIR, template.file);
        let html = "";
        try {
          html = readFileSync(htmlPath, "utf-8");
        } catch (e) {
          console.error(`Failed to read template ${template.file}:`, e.message);
        }
        return { ...template, html };
      })
      .filter((t) => t.html); // Only include templates with valid HTML

    res.json(templates);
  } catch (error) {
    console.error("Failed to load starter templates:", error);
    res.status(500).json({ error: "Failed to load templates" });
  }
});

// ==================== TEMPLATES API (User Saved) ====================

// List all user templates
app.get("/api/templates", authenticateToken, (req, res) => {
  const templates = listItems(TEMPLATES_DIR);
  res.json(
    templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  );
});

// Get single template
app.get("/api/templates/:id", (req, res) => {
  const filePath = join(TEMPLATES_DIR, `${req.params.id}.json`);
  const template = readJsonFile(filePath);
  if (template) {
    res.json(template);
  } else {
    res.status(404).json({ error: "Template not found" });
  }
});

// Create template
app.post("/api/templates", authenticateToken, (req, res) => {
  const { name, html } = req.body;
  if (!name || !html) {
    return res.status(400).json({ error: "Name and HTML are required" });
  }

  const template = {
    id: uuidv4(),
    name,
    html,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(join(TEMPLATES_DIR, `${template.id}.json`), template);
  res.status(201).json(template);
});

// Update template
app.put("/api/templates/:id", authenticateToken, (req, res) => {
  const filePath = join(TEMPLATES_DIR, `${req.params.id}.json`);
  const existing = readJsonFile(filePath);

  if (!existing) {
    return res.status(404).json({ error: "Template not found" });
  }

  const { name, html } = req.body;
  const updated = {
    ...existing,
    name: name || existing.name,
    html: html || existing.html,
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(filePath, updated);
  res.json(updated);
});

// Delete template
app.delete("/api/templates/:id", authenticateToken, (req, res) => {
  const filePath = join(TEMPLATES_DIR, `${req.params.id}.json`);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Template not found" });
  }
});

// ==================== DRAFTS API ====================

// List all drafts
app.get("/api/drafts", authenticateToken, (req, res) => {
  const drafts = listItems(DRAFTS_DIR);
  res.json(
    drafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  );
});

// Get single draft
app.get("/api/drafts/:id", (req, res) => {
  const filePath = join(DRAFTS_DIR, `${req.params.id}.json`);
  const draft = readJsonFile(filePath);
  if (draft) {
    res.json(draft);
  } else {
    res.status(404).json({ error: "Draft not found" });
  }
});

// Create draft
app.post("/api/drafts", authenticateToken, (req, res) => {
  const { name, html } = req.body;
  if (!html) {
    return res.status(400).json({ error: "HTML is required" });
  }

  const draft = {
    id: uuidv4(),
    name: name || `Draft ${new Date().toLocaleString()}`,
    html,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(join(DRAFTS_DIR, `${draft.id}.json`), draft);
  res.status(201).json(draft);
});

// Update draft
app.put("/api/drafts/:id", authenticateToken, (req, res) => {
  const filePath = join(DRAFTS_DIR, `${req.params.id}.json`);
  const existing = readJsonFile(filePath);

  if (!existing) {
    return res.status(404).json({ error: "Draft not found" });
  }

  const { name, html } = req.body;
  const updated = {
    ...existing,
    name: name || existing.name,
    html: html || existing.html,
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(filePath, updated);
  res.json(updated);
});

// Delete draft
app.delete("/api/drafts/:id", authenticateToken, (req, res) => {
  const filePath = join(DRAFTS_DIR, `${req.params.id}.json`);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Draft not found" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HTML Email Editor API running on http://localhost:${PORT}`);
});
