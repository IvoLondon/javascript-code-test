import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import type { BookProvider } from "../../providers/providers.types";

import { getProvider } from "../../providers";

import booksRouter from ".";

vi.mock("../../providers", () => ({
  getProvider: vi.fn(),
}));

const mockGetProvider = getProvider as unknown as Mock;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.correlationId = "test-correlation-id";
    next();
  });
  app.use("/books", booksRouter);
  return app;
}

function mockProvider(overrides: Partial<BookProvider> = {}): BookProvider {
  return {
    getBooksByAuthor: vi.fn().mockResolvedValue({ totalItems: 0, items: [] }),
    getBooksByPublisher: vi
      .fn()
      .mockResolvedValue({ totalItems: 0, items: [] }),
    formatResponse: vi.fn().mockResolvedValue({ totalItems: 0, items: [] }),
    ...overrides,
  };
}

describe("books router", () => {
  let app: express.Express;

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();
  });

  describe("GET /books/by-author", () => {
    it("returns 400 when author query param is missing", async () => {
      const res = await request(app).get("/books/by-author");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Query parameter 'author' is required",
      });
    });

    it("returns books from the provider", async () => {
      const books = [
        {
          title: "Clean Code",
          author: "Robert Martin",
          isbn: "978-0132350884",
          quantity: "Available",
          price: 30,
        },
      ];
      const provider = mockProvider({
        getBooksByAuthor: vi
          .fn()
          .mockResolvedValue({ totalItems: 1, items: books }),
      });
      mockGetProvider.mockReturnValue(provider);

      const res = await request(app).get(
        "/books/by-author?author=Robert+Martin",
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalItems: 1,
        count: 1,
        books,
        correlationId: "test-correlation-id",
      });
    });

    it("passes the resolved limit to the provider (default 10)", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-author?author=Tolkien");

      expect(provider.getBooksByAuthor).toHaveBeenCalledWith("Tolkien", 10);
    });

    it("respects a custom limit", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-author?author=Tolkien&limit=5");

      expect(provider.getBooksByAuthor).toHaveBeenCalledWith("Tolkien", 5);
    });

    it("caps limit at 40", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-author?author=Tolkien&limit=100");

      expect(provider.getBooksByAuthor).toHaveBeenCalledWith("Tolkien", 40);
    });

    it("defaults non-numeric limit to 10", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-author?author=Tolkien&limit=abc");

      expect(provider.getBooksByAuthor).toHaveBeenCalledWith("Tolkien", 10);
    });

    it("sets X-Provider header to the given providerName", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      const res = await request(app).get(
        "/books/by-author?author=Tolkien&providerName=googleBooks",
      );

      expect(res.headers["x-provider"]).toBe("googleBooks");
    });

    it("sets X-Provider header to 'default' when providerName is omitted", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      const res = await request(app).get("/books/by-author?author=Tolkien");

      expect(res.headers["x-provider"]).toBe("default");
    });

    it("delegates to getProvider with the requested providerName", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get(
        "/books/by-author?author=Tolkien&providerName=googleBooks",
      );

      expect(mockGetProvider).toHaveBeenCalledWith("googleBooks");
    });
  });

  describe("GET /books/by-publisher", () => {
    it("returns 400 when publisher query param is missing", async () => {
      const res = await request(app).get("/books/by-publisher");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Query parameter 'publisher' is required",
      });
    });

    it("returns books from the provider", async () => {
      const books = [
        {
          title: "Node.js Design Patterns",
          author: "Mario Casciaro",
          isbn: "978-1785885587",
          quantity: "Available",
          price: 40,
        },
      ];
      const provider = mockProvider({
        getBooksByPublisher: vi
          .fn()
          .mockResolvedValue({ totalItems: 1, items: books }),
      });
      mockGetProvider.mockReturnValue(provider);

      const res = await request(app).get("/books/by-publisher?publisher=Packt");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalItems: 1,
        count: 1,
        books,
        correlationId: "test-correlation-id",
      });
    });

    it("passes the resolved limit to the provider (default 10)", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-publisher?publisher=Penguin");

      expect(provider.getBooksByPublisher).toHaveBeenCalledWith("Penguin", 10);
    });

    it("respects a custom limit", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-publisher?publisher=Penguin&limit=3");

      expect(provider.getBooksByPublisher).toHaveBeenCalledWith("Penguin", 3);
    });

    it("caps limit at 40", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-publisher?publisher=Penguin&limit=999");

      expect(provider.getBooksByPublisher).toHaveBeenCalledWith("Penguin", 40);
    });

    it("defaults non-numeric limit to 10", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get("/books/by-publisher?publisher=Penguin&limit=xyz");

      expect(provider.getBooksByPublisher).toHaveBeenCalledWith("Penguin", 10);
    });

    it("sets X-Provider header to the given providerName", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      const res = await request(app).get(
        "/books/by-publisher?publisher=Penguin&providerName=googleBooks",
      );

      expect(res.headers["x-provider"]).toBe("googleBooks");
    });

    it("sets X-Provider header to 'default' when providerName is omitted", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      const res = await request(app).get(
        "/books/by-publisher?publisher=Penguin",
      );

      expect(res.headers["x-provider"]).toBe("default");
    });

    it("delegates to getProvider with the requested providerName", async () => {
      const provider = mockProvider();
      mockGetProvider.mockReturnValue(provider);

      await request(app).get(
        "/books/by-publisher?publisher=Penguin&providerName=googleBooks",
      );

      expect(mockGetProvider).toHaveBeenCalledWith("googleBooks");
    });

    it("returns 500 with error message when the provider throws", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const provider = mockProvider({
        getBooksByPublisher: vi
          .fn()
          .mockRejectedValue(new Error("API timeout")),
      });
      mockGetProvider.mockReturnValue(provider);

      const res = await request(app).get(
        "/books/by-publisher?publisher=Penguin",
      );

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "API timeout",
        correlationId: "test-correlation-id",
      });
    });
  });
});
