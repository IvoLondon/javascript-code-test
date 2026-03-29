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
        `${this.baseUrl}?q=+inauthor:${authorName}&fields=${volumeFields}&maxResults=${limit}`,
      );

      return this.formatResponse(response);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getBooksByPublisher(publisherName: string, limit: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}?q=+inpublisher:${publisherName}&fields=${volumeFields}&maxResults=${limit}`,
      );

      return this.formatResponse(response);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async formatResponse(data: Response) {
    let result: Book[] = [];

    if (data.status !== 200) {
      throw new Error(`Request failed.  Returned status of ${data.status}`);
    }

    const books = await data.json();

    if (this.format === "json") {
      result = books.items.map((item: any) => ({
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

    return result;
  }
}
