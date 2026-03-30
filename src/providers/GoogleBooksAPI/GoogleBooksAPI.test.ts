import { beforeEach, describe, expect, it, vi } from "vitest";

import GoogleBooksAPI from ".";

const sampleApiBody = {
  totalItems: 1,
  items: [
    {
      volumeInfo: {
        title: "Test Title",
        authors: ["A", "B"],
        industryIdentifiers: [{ type: "ISBN_13", identifier: "978123" }],
      },
      saleInfo: {
        saleability: "FOR_SALE",
        listPrice: { amount: 12.5 },
      },
    },
  ],
};

const expectedBook = {
  title: "Test Title",
  author: "A, B",
  isbn: "978123",
  quantity: "Available",
  price: 12.5,
};

describe("GoogleBooksAPI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatResponse (json)", () => {
    it("returns a BookResponse object with mapped fields", async () => {
      const provider = new GoogleBooksAPI();
      const response = new Response(JSON.stringify(sampleApiBody), {
        status: 200,
      });

      const result = await provider.formatResponse(response);

      expect(typeof result).toBe("object");
      expect(result).toEqual({ totalItems: 1, items: [expectedBook] });
    });

    it("throws when the response status is not 200", async () => {
      const provider = new GoogleBooksAPI();
      const response = new Response("", { status: 404 });

      await expect(provider.formatResponse(response)).rejects.toThrow(
        "Request failed.  Returned status of 404",
      );
    });
  });

  describe("formatResponse (xml)", () => {
    it("returns an XML string with book data", async () => {
      const provider = new GoogleBooksAPI("xml");
      const response = new Response(JSON.stringify(sampleApiBody), {
        status: 200,
      });

      const result = await provider.formatResponse(response);

      expect(typeof result).toBe("string");
      expect(result).toContain("<response>");
      expect(result).toContain("<totalItems>1</totalItems>");
      expect(result).toContain("<count>1</count>");
      expect(result).toContain("<title>Test Title</title>");
      expect(result).toContain("<author>A, B</author>");
      expect(result).toContain("<isbn>978123</isbn>");
    });

    it("throws when the response status is not 200", async () => {
      const provider = new GoogleBooksAPI("xml");
      const response = new Response("", { status: 500 });

      await expect(provider.formatResponse(response)).rejects.toThrow(
        "Request failed.  Returned status of 500",
      );
    });
  });

  describe("getBooksByAuthor", () => {
    it("calls the API with inauthor query and returns formatted books", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            totalItems: 1,
            items: [
              {
                volumeInfo: {
                  title: "Book",
                  authors: ["X"],
                  industryIdentifiers: [{ identifier: "111" }],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const provider = new GoogleBooksAPI();
      const res = await provider.getBooksByAuthor("Jane Doe", 5, 10);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).toContain("inauthor:Jane%20Doe");
      expect(url).toContain("maxResults=5");
      expect(url).toContain("startIndex=10");
      expect(typeof res).not.toBe("string");
      const json = res as { totalItems: number; items: { title: string }[] };
      expect(json.items).toHaveLength(1);
      expect(json.items[0].title).toBe("Book");
    });

    it("throws when fetch throws", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

      const provider = new GoogleBooksAPI();
      await expect(provider.getBooksByAuthor("any", 1, 0)).rejects.toThrow(
        "network",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("getBooksByPublisher", () => {
    it("calls the API with inpublisher query", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ items: [] }), { status: 200 }),
        );
      vi.stubGlobal("fetch", fetchMock);

      const provider = new GoogleBooksAPI();
      await provider.getBooksByPublisher("Penguin", 3, 6);

      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).toContain("inpublisher:Penguin");
      expect(url).toContain("maxResults=3");
      expect(url).toContain("startIndex=6");
    });
  });
});
