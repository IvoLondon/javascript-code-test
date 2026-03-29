import { BookProvider, Book } from "../providers.types";

const volumeFields =
  "totalItems,items(volumeInfo/title,volumeInfo/authors,volumeInfo/publisher, volumeInfo/industryIdentifiers, saleInfo)";

export default class GoogleBooksAPIProvider implements BookProvider {
  private format: "json" | "xml";
  private baseUrl = `https://www.googleapis.com/books/v1/volumes`;

  constructor(format: "json" | "xml" = "json") {
    this.format = format;
  }

  async getBooksByAuthor(authorName: string, limit: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}?q=+inauthor:${encodeURIComponent(authorName)}&fields=${volumeFields}&maxResults=${limit}`,
      );

      return this.formatResponse(response);
    } catch (error) {
      console.error(`getBooksByAuthor error: ${(error as Error).message}`);
      throw error;
    }
  }

  async getBooksByPublisher(publisherName: string, limit: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}?q=+inpublisher:${encodeURIComponent(publisherName)}&fields=${volumeFields}&maxResults=${limit}`,
      );

      return this.formatResponse(response);
    } catch (error) {
      console.error(`getBooksByPublisher error: ${(error as Error).message}`);
      throw error;
    }
  }

  async formatResponse(data: Response) {
    let result: { totalItems: number; items: Book[] } = {
      totalItems: 0,
      items: [],
    };

    if (data.status !== 200) {
      throw new Error(`Request failed.  Returned status of ${data.status}`);
    }

    const books = await data.json();

    if (this.format === "json") {
      result.items = books.items.map((item: any) => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(", "),
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
        quantity:
          item?.saleInfo?.saleability === "FOR_SALE"
            ? "Available"
            : "Out of stock",
        price: item?.saleInfo?.listPrice?.amount,
      }));
    } else if (this.format == "xml") {
      // TODO: Implement XML parsing
    }

    return {
      totalItems: books.totalItems || 0,
      items: result.items || [],
    };
  }
}
