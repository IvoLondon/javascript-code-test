import { Router, Request, Response } from "express";

import { getProvider } from "../../providers";
import type { ResponseFormat } from "../../providers/providers.types";

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
 *         description: Max results per page (default 10, capped at 40)
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number (default 1, minimum 1)
 *       - in: query
 *         name: providerName
 *         schema:
 *           type: string
 *         description: Book data provider (default from config)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, xml]
 *         description: Response format (default json)
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
 *                 page:
 *                   type: number
 *                 totalPages:
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
    const { author, limit, page, providerName, format } = req.query;

    if (!author) {
      res.status(400).json({ error: "Query parameter 'author' is required" });
      return;
    }

    const maxResults = Math.min(Number(limit) || 10, 40);
    const currentPage = Math.max(Math.floor(Number(page)) || 1, 1);
    const startIndex = (currentPage - 1) * maxResults;
    const resolvedFormat: ResponseFormat = format === "xml" ? "xml" : "json";
    const provider = getProvider(providerName, resolvedFormat);
    res.setHeader("X-Provider", providerName || "default");
    try {
      const result = await provider.getBooksByAuthor(author, maxResults, startIndex);

      if (typeof result === "string") {
        res.type("application/xml").send(result);
      } else {
        res.json({
          totalItems: result.totalItems,
          count: result.items.length,
          page: currentPage,
          totalPages: Math.ceil(result.totalItems / maxResults),
          books: result.items,
          correlationId: req.correlationId,
        });
      }
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
 *         description: Max results per page (default 10, capped at 40)
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number (default 1, minimum 1)
 *       - in: query
 *         name: providerName
 *         schema:
 *           type: string
 *         description: Book data provider (default from config)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, xml]
 *         description: Response format (default json)
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
 *                 page:
 *                   type: number
 *                 totalPages:
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
    const { publisher, limit, page, providerName, format } = req.query;

    if (!publisher) {
      res
        .status(400)
        .json({ error: "Query parameter 'publisher' is required" });
      return;
    }

    const maxResults = Math.min(Number(limit) || 10, 40);
    const currentPage = Math.max(Math.floor(Number(page)) || 1, 1);
    const startIndex = (currentPage - 1) * maxResults;
    const resolvedFormat: ResponseFormat = format === "xml" ? "xml" : "json";
    const provider = getProvider(providerName, resolvedFormat);
    res.setHeader("X-Provider", providerName || "default");

    try {
      const result = await provider.getBooksByPublisher(publisher, maxResults, startIndex);

      if (typeof result === "string") {
        res.type("application/xml").send(result);
      } else {
        res.json({
          totalItems: result.totalItems,
          count: result.items.length,
          page: currentPage,
          totalPages: Math.ceil(result.totalItems / maxResults),
          books: result.items,
          correlationId: req.correlationId,
        });
      }
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
