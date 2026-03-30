export type ResponseFormat = "json" | "xml";

export interface Book {
  title: string;
  author: string;
  isbn: string;
  quantity: "Available" | "Out of stock";
  price: number;
}

export interface BookResponse {
  totalItems: number;
  items: Book[];
}

export interface BookProvider {
  getBooksByAuthor(
    authorName: string,
    limit: number,
  ): Promise<BookResponse | string>;
  getBooksByPublisher(
    authorName: string,
    limit: number,
  ): Promise<BookResponse | string>;
  formatResponse(response: Response): Promise<BookResponse | string>;
}
