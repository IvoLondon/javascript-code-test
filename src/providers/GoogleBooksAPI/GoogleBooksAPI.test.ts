import { beforeEach, describe, expect, it, vi } from "vitest";
import GoogleBooksAPI from "./index";

describe("GoogleBooksAPI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatResponse", () => {
    it("maps JSON items to BookRow fields", async () => {
      const provider = new GoogleBooksAPI();
      const body = {
        items: [
          {
            volumeInfo: {
              title: "Test Title",
              authors: ["A", "B"],
              industryIdentifiers: [{ type: "ISBN_13", identifier: "978123" }],
            },
            saleInfo: {
              listPrice: { amount: 12.5, currencyCode: "EUR" },
            },
          },
        ],
      };
      const response = new Response(JSON.stringify(body), { status: 200 });

      const rows = await provider.formatResponse(response);

      expect(rows).toEqual([
        {
          title: "Test Title",
          author: "A, B",
          isbn: "978123",
          quantity: 12.5,
          price: "EUR",
        },
      ]);
    });

    it("throws when the response status is not 200", async () => {
      const provider = new GoogleBooksAPI();
      const response = new Response("", { status: 404 });

      await expect(provider.formatResponse(response)).rejects.toThrow(
        "Request failed.  Returned status of 404",
      );
    });
  });

  describe("getBooksByAuthor", () => {
    it("calls the API with inauthor query and returns formatted rows", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
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
      const rows = await provider.getBooksByAuthor("Jane Doe", 5);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).toContain("inauthor:Jane Doe");
      expect(url).toContain("maxResults=5");
      expect(rows).toHaveLength(1);
      expect(rows[0].title).toBe("Book");
    });

    it("returns an empty array when fetch throws", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

      const provider = new GoogleBooksAPI();
      const rows = await provider.getBooksByAuthor("any", 1);

      expect(rows).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe("getBooksByPublisher", () => {
    it("calls the API with inpublisher query", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);

      const provider = new GoogleBooksAPI();
      await provider.getBooksByPublisher("Penguin", 3);

      const url = String(fetchMock.mock.calls[0][0]);
      expect(url).toContain("inpublisher:Penguin");
      expect(url).toContain("maxResults=3");
    });
  });
});
