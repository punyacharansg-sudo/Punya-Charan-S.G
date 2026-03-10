import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Auth Routes ---
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
  });

  // --- Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // --- Business Routes ---
  app.get("/api/business", authenticate, async (req: any, res) => {
    const business = await prisma.business.findUnique({ where: { userId: req.userId } });
    res.json(business);
  });

  app.post("/api/business", authenticate, async (req: any, res) => {
    const { name, industry, location, currency, monthlyTarget } = req.body;
    const business = await prisma.business.create({
      data: { userId: req.userId, name, industry, location, currency, monthlyTarget: parseFloat(monthlyTarget) },
    });
    res.json(business);
  });

  // --- Transaction Routes ---
  app.get("/api/transactions", authenticate, async (req: any, res) => {
    const business = await prisma.business.findUnique({ where: { userId: req.userId } });
    if (!business) return res.json([]);
    const transactions = await prisma.transaction.findMany({
      where: { businessId: business.id },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  });

  app.post("/api/transactions", authenticate, async (req: any, res) => {
    const { date, salesAmount, expenseAmount, expenseCategory, notes } = req.body;
    const business = await prisma.business.findUnique({ where: { userId: req.userId } });
    if (!business) return res.status(400).json({ error: "No business found" });
    const transaction = await prisma.transaction.create({
      data: {
        businessId: business.id,
        date: new Date(date),
        salesAmount: parseFloat(salesAmount),
        expenseAmount: parseFloat(expenseAmount),
        expenseCategory,
        notes,
      },
    });
    res.json(transaction);
  });

  // --- AI Insights ---
  app.get("/api/ai/insights", authenticate, async (req: any, res) => {
    const business = await prisma.business.findUnique({ 
      where: { userId: req.userId },
      include: { transactions: { take: 30, orderBy: { date: 'desc' } } }
    });
    if (!business) return res.status(400).json({ error: "No business found" });

    const prompt = `Analyze the following financial data for a ${business.industry} business named ${business.name}.
    Transactions: ${JSON.stringify(business.transactions)}
    Monthly Revenue Target: ${business.currency} ${business.monthlyTarget}
    
    Provide:
    1. 3 key insights about current performance.
    2. 3 specific recommendations for profit optimization.
    3. A forecast for next month's revenue and a growth probability percentage.
    
    Return the response in JSON format with keys:
    "insights" (array of strings),
    "recommendations" (array of strings),
    "forecast" (object with "predictedRevenue" (number) and "growthProbability" (number)).`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(result.text));
    } catch (error) {
      res.status(500).json({ error: "AI failed to generate insights" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
