import crypto from "node:crypto";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import booksRouter from "./routes/books";

import config from "./config";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

const app = express();

app.use(helmet());
app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  const id =
    (req.headers["x-correlation-id"] as string) || crypto.randomUUID();
  req.correlationId = id;
  res.setHeader("X-Correlation-ID", id);
  res.setHeader("X-Server-Version", config.serverVersion);
  next();
});

morgan.token("correlationId", (req: Request) => req.correlationId);
app.use(morgan(":method :url :status :response-time ms - :correlationId"));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/books", booksRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
