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
  getBooksByAuthor(authorName: string, limit: number): Promise<BookResponse>;
  getBooksByPublisher(authorName: string, limit: number): Promise<BookResponse>;
  formatResponse(response: Response): Promise<BookResponse>;
}
