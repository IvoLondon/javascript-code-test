import { Router, Request, Response } from "express";

import { getProvider } from "../../providers";

import { BooksByAuthorQuery, BooksByPublisherQuery } from "./books.types";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         quantity:
 *           type: string
 *           enum: [Available, Out of stock]
 *         price:
 *           type: number
 */

/**
 * @openapi
 * /books/by-author:
 *   get:
 *     summary: Search books by author
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: author
 *         required: true
 *         schema:
 *           type: string
 *         description: Author name to search for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Max results (default 10, capped at 40)
 *       - in: query
 *         name: providerName
 *         schema:
 *           type: string
 *         description: Book data provider (default from config)
 *     responses:
 *       200:
 *         description: List of books matching the author
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: number
 *                 count:
 *                   type: number
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 correlationId:
 *                   type: string
 *       400:
 *         description: Missing required query parameter
 *       500:
 *         description: Provider error
 */
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

/**
 * @openapi
 * /books/by-publisher:
 *   get:
 *     summary: Search books by publisher
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: publisher
 *         required: true
 *         schema:
 *           type: string
 *         description: Publisher name to search for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Max results (default 10, capped at 40)
 *       - in: query
 *         name: providerName
 *         schema:
 *           type: string
 *         description: Book data provider (default from config)
 *     responses:
 *       200:
 *         description: List of books matching the publisher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: number
 *                 count:
 *                   type: number
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 correlationId:
 *                   type: string
 *       400:
 *         description: Missing required query parameter
 *       500:
 *         description: Provider error
 */
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
