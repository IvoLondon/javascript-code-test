import { Router, Request, Response } from "express";

import { getProvider } from "../../providers";

import { BooksByAuthorQuery, BooksByPublisherQuery } from "./books.types";

const router = Router();

router.get(
  "/by-author",
  async (req: Request<{}, {}, {}, BooksByAuthorQuery>, res: Response) => {
    const { author, limit, providerName } = req.query;

    if (!author) {
      res.status(400).json({ error: "Query parameter 'author' is required" });
      return;
    }

    const maxResults = Math.min(Number(limit) || 10, 40);
    const provider = getProvider(providerName);
    res.setHeader("X-Provider", providerName || "default");
    try {
      const { totalItems, items } = await provider.getBooksByAuthor(
        author,
        maxResults,
      );

      res.json({
        totalItems,
        count: items.length,
        books: items,
        correlationId: req.correlationId,
      });
    } catch (error) {
      console.error(
        `by-author error: ${(error as Error).message} - correlationId: ${req.correlationId}`,
      );
      res.status(500).json({
        error: (error as Error).message,
        correlationId: req.correlationId,
      });
    }
  },
);

router.get(
  "/by-publisher",
  async (req: Request<{}, {}, {}, BooksByPublisherQuery>, res: Response) => {
    const { publisher, limit, providerName } = req.query;

    if (!publisher) {
      res
        .status(400)
        .json({ error: "Query parameter 'publisher' is required" });
      return;
    }

    const maxResults = Math.min(Number(limit) || 10, 40);
    const provider = getProvider(providerName);
    res.setHeader("X-Provider", providerName || "default");

    try {
      const { totalItems, items } = await provider.getBooksByPublisher(
        publisher,
        maxResults,
      );

      res.json({
        totalItems,
        count: items.length,
        books: items,
        correlationId: req.correlationId,
      });
    } catch (error) {
      console.error(
        `by-publisher error: ${(error as Error).message} - correlationId: ${req.correlationId}`,
      );
      res.status(500).json({
        error: (error as Error).message,
        correlationId: req.correlationId,
      });
    }
  },
);

export default router;
