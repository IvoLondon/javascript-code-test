import { XMLBuilder } from "fast-xml-parser";
import { BookProvider, Book, type ResponseFormat } from "../providers.types";
import config from "../../config";

const volumeFields =
  "totalItems,items(volumeInfo/title,volumeInfo/authors,volumeInfo/publisher, volumeInfo/industryIdentifiers, saleInfo)";

export default class GoogleBooksAPIProvider implements BookProvider {
  private format: ResponseFormat;
  private baseUrl = `https://www.googleapis.com/books/v1/volumes`;

  constructor(format: ResponseFormat = "json") {
    this.format = format;
  }

  async getBooksByAuthor(authorName: string, limit: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}?q=+inauthor:${encodeURIComponent(authorName)}&fields=${volumeFields}&maxResults=${limit}&key=${config.googleApiKey}`,
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
        `${this.baseUrl}?q=+inpublisher:${encodeURIComponent(publisherName)}&fields=${volumeFields}&maxResults=${limit}&key=${config.googleApiKey}`,
      );

      return this.formatResponse(response);
    } catch (error) {
      console.error(`getBooksByPublisher error: ${(error as Error).message}`);
      throw error;
    }
  }

  private mapItemToBook(item: any): Book {
    return {
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(", "),
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier?.toString(),
      quantity:
        item?.saleInfo?.saleability === "FOR_SALE"
          ? "Available"
          : "Out of stock",
      price: item?.saleInfo?.listPrice?.amount,
    };
  }

  async formatResponse(data: Response) {
    if (data.status !== 200) {
      throw new Error(`Request failed.  Returned status of ${data.status}`, {
        cause: data,
      });
    }

    const books = await data.json();
    const items = (books.items || []).map((item: any) =>
      this.mapItemToBook(item),
    );

    if (this.format === "xml") {
      const builder = new XMLBuilder({ format: true });
      return builder.build({
        response: {
          totalItems: books.totalItems || 0,
          count: items.length,
          books: { book: items },
        },
      });
    }

    return {
      totalItems: books.totalItems || 0,
      items,
    };
  }
}
